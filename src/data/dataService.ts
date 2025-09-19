import {
  BackgroundsData,
  CharacterBuilderData,
  DesignDocument,
  DesignDocumentMeta,
  LegalData,
  ResourceCostsData,
  ResourceSystem,
  SkillsData
} from './types';

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
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

const DESIGN_DOC_FILES: DesignDocumentMeta[] = [
  { id: 'lineage-architecture', title: 'Lineage Architecture', path: '/content/lineage-architecture.md' },
  { id: 'design-philosophy', title: 'Sidonia Design Philosophy', path: '/content/sidonia-design-philosophy.md' },
  { id: 'resources-system', title: 'Resources System Overview', path: '/content/sidonia-resources-system.md' }
];

export async function loadCharacterBuilderData(): Promise<CharacterBuilderData> {
  const [backgrounds, skills, resources, resourceCosts, legal, powerSchemasEntries, designDocs] = await Promise.all([
    fetchJson<BackgroundsData>('/data/backgrounds.json'),
    fetchJson<SkillsData>('/data/Sidonia-Skills.Json'),
    fetchJson<ResourceSystem>('/data/resources-system.json'),
    fetchJson<ResourceCostsData>('/data/resource-costs.json'),
    fetchJson<LegalData>('/data/legal.json'),
    loadPowerSchemas(),
    loadDesignDocs()
  ]);

  return {
    backgrounds,
    skills,
    resources,
    resourceCosts,
    legal,
    powerSchemas: powerSchemasEntries,
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
