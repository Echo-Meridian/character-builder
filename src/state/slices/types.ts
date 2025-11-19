import type { PriorityRank, LineageKey } from '../../data/types';
export type { PriorityRank, LineageKey };

export type PriorityCategory = 'lineage' | 'resources' | 'background' | 'skills' | 'attributes';
export const PRIORITY_CATEGORIES: PriorityCategory[] = ['lineage', 'background', 'resources', 'skills', 'attributes'];

export type CharacterStage =
    | 'priorities'
    | 'lineage'
    | 'background'
    | 'resources'
    | 'skills'
    | 'attributes'
    | 'narrative';

export const STAGES: CharacterStage[] = ['priorities', 'lineage', 'background', 'resources', 'skills', 'attributes', 'narrative'];

export const LINEAGES: LineageKey[] = ['neosapien', 'sorcery', 'esper', 'chimera', 'automata'];

export type AttributeKey = 'physique' | 'intellect' | 'presence';
export const ATTRIBUTE_SCORE_MAX = 5;

export interface SkillSpecializationSelection {
    id: string;
    label: string;
    type: 'predefined' | 'custom' | 'background';
    skillId?: string | null;
    gmApproved: boolean;
}

export type LineagePowerKind =
    | 'neosapien-augment'
    | 'chimera-mutation'
    | 'sorcery-sphere-primary'
    | 'sorcery-sphere-secondary'
    | 'sorcery-move'
    | 'esper-archetype'
    | 'esper-focus'
    | 'esper-framework-choice'
    | 'esper-framework-path'
    | 'automata-capability'
    | 'automata-model'
    | 'automata-package';

export interface LineagePowerMeta {
    slots?: number;
    mutationPoints?: number;
    permanentCorruption?: number;
    sphere?: string;
    moveType?: string;
    branch?: string;
    chassis?: string;
    category?: string;
    tierLabel?: string;
    root?: string;
    parent?: string;
    path?: string[];
    depth?: number;
    archetype?: string;
}

export interface LineagePowerSelection {
    id: string;
    lineage: LineageKey;
    label: string;
    kind: LineagePowerKind;
    meta?: LineagePowerMeta;
}

export interface BaseResourceEntry {
    id: string;
    name: string;
    description: string;
    gmApproved: boolean;
    backgroundSynergy: boolean;
}

export interface ContactResourceEntry extends BaseResourceEntry {
    specialization: string | null;
    reach: number;
    influence: number;
}

export interface RetainerResourceEntry extends BaseResourceEntry {
    specialization: string | null;
    loyalty: number;
    competence: number;
}

export interface PropertyResourceEntry extends BaseResourceEntry {
    tenure: string;
    zoning: string;
    ward: string;
    specialization: string | null;
}

export interface GoodsResourceEntry extends BaseResourceEntry {
    specialization: string | null;
    quality: number;
}

export type BodyLocationKey = 'head' | 'torso' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg';
export const BODY_LOCATIONS: Record<BodyLocationKey, string> = {
    head: 'Head',
    torso: 'Torso',
    leftArm: 'Left Arm',
    rightArm: 'Right Arm',
    leftLeg: 'Left Leg',
    rightLeg: 'Right Leg'
};

export interface CharacterProfile {
    name: string;
    concept: string;
    alias: string;
    currentProfession: string;
    wardOfResidence: string;
    backstory: string;
    physicalDescription: string;
    code: string;
    lineNotCrossed: string;
    temptation: string;
    portraitUrl: string;
}

export interface CharacterBuild {
    id: string;
    label: string;
    createdAt: string;
    updatedAt: string;
    stage: CharacterStage;
    profile: CharacterProfile;
    priorities: Record<PriorityCategory, PriorityRank | null>;
    lineage: {
        key: LineageKey | null;
        notes: string;
        revealMechanics: boolean;
        powers: LineagePowerSelection[];
    };
    resources: {
        contacts: ContactResourceEntry[];
        retainers: RetainerResourceEntry[];
        properties: PropertyResourceEntry[];
        goods: GoodsResourceEntry[];
        liquid: number;
        notes: string;
    };
    background: {
        title: string;
        tierNotes: string;
        contacts: string;
    };
    skills: {
        ratings: Record<string, number>;
        specializations: SkillSpecializationSelection[];
        backgroundSpecializations: string[];
        backgroundCustomSpecializations: string[];
        notes: string;
    };
    attributes: {
        scores: Record<AttributeKey, number>;
        notes: string;
        specializations: Record<AttributeKey, string[]>;
    };
    corruption: {
        current: number;
        warning: number;
        notes: string;
    };
    advancement: {
        experience: number;
        track: string;
        milestones: string;
    };
    health: Record<BodyLocationKey, { current: number; max: number; scar: string }>;
    narrative: {
        relationships: string[];
        anchors: string;
        notes: string;
    };
    gmNotes: string;
}

// Helper to ensure data integrity
export const ensureLineagePowersArray = (value: unknown): LineagePowerSelection[] => {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter((entry): entry is LineagePowerSelection => {
        if (!entry || typeof entry !== 'object') {
            return false;
        }
        const candidate = entry as Partial<LineagePowerSelection>;
        return typeof candidate.id === 'string' && typeof candidate.lineage === 'string';
    });
};
