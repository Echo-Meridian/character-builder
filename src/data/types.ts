export type PriorityRank = 'A' | 'B' | 'C' | 'D' | 'E';

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

export interface BackgroundFormula {
  specialization: string;
  synergy: string;
  synergyExamples: string;
  wardAccess: string;
  narrativeScope: Record<PriorityRank, string>;
}

export interface BackgroundsData {
  backgrounds: {
    formula: BackgroundFormula;
  };
}

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
  designDocs: DesignDocument[];
}
