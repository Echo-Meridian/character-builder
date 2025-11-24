export type PriorityRank = 'A' | 'B' | 'C' | 'D' | 'E';
export type LineageKey = 'neosapien' | 'sorcery' | 'esper' | 'chimera' | 'automata';

export interface ResourcePointsEntry {
  points: number;
  maxQuality: number | string;
  maxCombined: number | string;
  specializations: number;
}

export interface ResourceSystem {
  resourcePoints: Record<PriorityRank, ResourcePointsEntry>;
  properties: {
    tenure: Record<string, { costMultiplier?: number; description?: string; special?: boolean }>;
    zoning: Record<string, { baseCost: number | string }>;
    specializations: string[];
  };
  contacts: {
    specializations: string[];
    reachScale: Record<string, string>;
    influenceScale: Record<string, string>;
  };
  retainers: {
    specializations: string[];
    competenceScale: Record<string, string>;
    loyaltyScale: Record<string, string>;
  };
  goods: {
    specializations: string[];
  };
}

export interface ResourceCostsData {
  contacts: {
    baseCost: {
      description: string;
      example: string;
    };
  };
  retainers: {
    baseCost: {
      description: string;
      example: string;
    };
  };
  properties: {
    tenure: Record<string, { multiplier?: number; cost?: string }>;
    zoning: Record<string, { baseCost: number | string }>;
  };
}

export interface BackgroundProfession {
  priority: PriorityRank;
  title: string;
  description: string;
}

export interface BackgroundEntry {
  description: string;
  skillSpecializationOptions?: string[];
  resourceSynergyExamples?: string[];
  professions?: BackgroundProfession[];
}

export type BackgroundsData = Record<string, BackgroundEntry>;

export interface AttributePointBuyEntry {
  priority: PriorityRank;
  attributePoints: number;
  specializations: number;
}

export interface AttributeRatingEntry {
  score: number;
  label: string;
}

export interface AttributeSpecializationEntry {
  name: string;
  description: string;
}

export interface AttributeDefinitionEntry {
  description: string;
  specializations: AttributeSpecializationEntry[];
}

export interface AttributesData {
  pointBuy: AttributePointBuyEntry[];
  ratings: AttributeRatingEntry[];
  definitions: Record<string, AttributeDefinitionEntry>;
}

export type CharacterSheetStructure = Record<string, unknown>;

export interface SkillSpecialization {
  id: string;
  name: string;
  description: string;
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  specializations: SkillSpecialization[];
}

export interface SkillsByDiscipline {
  [discipline: string]: SkillDefinition[];
}

export interface SkillsData {
  skills: SkillsByDiscipline;
}

export interface LegalNotice {
  text: string;
  license: string;
  licenseUrl: string;
  display: {
    footer: boolean;
    aboutPage: boolean;
    exportedCharacters: boolean;
  };
}

export interface LegalData {
  copyright: LegalNotice;
}

export interface DesignDocumentMeta {
  id: string;
  title: string;
  path: string;
}

export interface DesignDocument extends DesignDocumentMeta {
  content: string;
}

export interface CharacterBuilderData {
  backgrounds: BackgroundsData;
  skills: SkillsData;
  resources: ResourceSystem;
  resourceCosts: ResourceCostsData;
  legal: LegalData;
  powerSchemas: Record<string, unknown>;
  powerSets: Partial<Record<LineageKey, RawLineagePowerData>>;
  attributes: AttributesData;
  characterSheet: CharacterSheetStructure;
  designDocs: DesignDocument[];
}

export interface BasePower {
  id: string;
  name: string;
  type: string;
  lineage: string;
  archetype?: string;
  path?: string;
  tags: string[];
  description: {
    short: string;
    player: string;
  };
  metadata?: {
    source: string;
    version: string;
  };
}

export interface StandardEsperPower extends BasePower {
  tier: number;
  effects: string;
  flaws?: string;
}

export interface MentalistPower extends BasePower {
  isMentalist: true;
  evolutionStage?: number;
  tier?: number;
  mentalistPolarity?: string;
  mentalistScope?: string;
  grantedBy?: string;
  rollStat?: string;
  range?: string;
  duration?: string;
  effects: string | any[];
  flaws?: string | any[];
}

export type EsperPower = StandardEsperPower | MentalistPower;

export interface EsperPowerData {
  lineage: 'esper';
  note?: string;
  powers: EsperPower[];
}

export type RawLineagePowerData = Record<string, unknown>;
