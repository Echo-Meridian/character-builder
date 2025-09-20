import {
  BackgroundsData,
  CharacterBuilderData,
  DesignDocument,
  DesignDocumentMeta,
  LegalData,
  LineageKey,
  AttributesData,
  RawLineagePowerData,
  ResourceCostsData,
  ResourceSystem,
  SkillsData
} from './types';

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON from ${path}: ${(error as Error).message}`);
  }
}

async function fetchMarkdown(path: string): Promise<string> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`);
  }
  return await response.text();
}

const POWER_SCHEMA_FILES: Record<string, string> = {
  automata: '/data/Sidonia-Powers-Schema-Automata.Json',
  chimera: '/data/Sidonia-Powers-Schema-Chimera.Json',
  espers: '/data/Sidonia-Powers-Schema-Espers.Json',
  neosapiens: '/data/Sidonia-Powers-Schema-NeoSapiens.Json',
  sorcery: '/data/Sidonia-Powers-Schema-Sorcery.Json'
};

const POWER_SET_FILES: Record<LineageKey, string> = {
  automata: '/data/powers-automata.json',
  chimera: '/data/powers-chimera.json',
  esper: '/data/powers-espers.json',
  neosapien: '/data/powers-neosapien.json',
  sorcery: '/data/powers-sorcery.json'
};

const DESIGN_DOC_FILES: DesignDocumentMeta[] = [
  { id: 'lineage-architecture', title: 'Lineage Architecture', path: '/content/lineage-architecture.md' },
  { id: 'design-philosophy', title: 'Sidonia Design Philosophy', path: '/content/sidonia-design-philosophy.md' },
  { id: 'resources-system', title: 'Resources System Overview', path: '/content/sidonia-resources-system.md' }
];

export async function loadCharacterBuilderData(): Promise<CharacterBuilderData> {
  const [backgrounds, skills, resources, resourceCosts, legal, powerSchemasEntries, powerSets, attributes, designDocs] = await Promise.all([
    fetchJson<BackgroundsData>('/data/backgrounds.json'),
    fetchJson<SkillsData>('/data/Sidonia-Skills.Json'),
    fetchJson<ResourceSystem>('/data/resources-system.json'),
    fetchJson<ResourceCostsData>('/data/resource-costs.json'),
    fetchJson<LegalData>('/data/legal.json'),
    loadPowerSchemas(),
    loadPowerSets(),
    fetchJson<AttributesData>('/data/attributes.json'),
    loadDesignDocs()
  ]);

  return {
    backgrounds,
    skills,
    resources,
    resourceCosts,
    legal,
    powerSchemas: powerSchemasEntries,
    powerSets,
    attributes,
    designDocs
  };
}

async function loadPowerSchemas(): Promise<Record<string, unknown>> {
  const entries = await Promise.all(
    Object.entries(POWER_SCHEMA_FILES).map(async ([key, path]) => {
      const data = await fetchJson(path);
      return [key, data] as const;
    })
  );
  return Object.fromEntries(entries);
}

async function loadPowerSets(): Promise<Partial<Record<LineageKey, RawLineagePowerData>>> {
  const requests = Object.entries(POWER_SET_FILES).map(async ([key, path]) => {
    const lineage = key as LineageKey;
    const data = await fetchJson<RawLineagePowerData>(path);
    return [lineage, normalizePowerSet(lineage, data)] as const;
  });

  const settled = await Promise.allSettled(requests);
  const entries: Array<readonly [LineageKey, RawLineagePowerData]> = [];
  settled.forEach((result) => {
    if (result.status === 'fulfilled') {
      entries.push(result.value);
    } else {
      // eslint-disable-next-line no-console
      console.warn('[sidonia] Failed to load lineage power data:', result.reason);
    }
  });
  return Object.fromEntries(entries);
}

function normalizePowerSet(lineage: LineageKey, data: RawLineagePowerData): RawLineagePowerData {
  const normalized: RawLineagePowerData = { ...data };
  if (!('lineage' in normalized)) {
    normalized.lineage = lineage;
  }
  normalized.lineageId = lineage;
  return normalized;
}

async function loadDesignDocs(): Promise<DesignDocument[]> {
  const entries = await Promise.all(
    DESIGN_DOC_FILES.map(async (docMeta) => {
      const markdown = await fetchMarkdown(docMeta.path);
      return { ...docMeta, content: markdown } satisfies DesignDocument;
    })
  );
  return entries;
}

export type LoadedDesignDocument = Awaited<ReturnType<typeof loadDesignDocs>>[number];
