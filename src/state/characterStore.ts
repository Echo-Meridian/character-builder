import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PriorityRank, LineageKey } from '../data/types';
import { analytics } from '../utils/analytics';

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

const ensureLineagePowersArray = (value: unknown): LineagePowerSelection[] => {
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

interface BaseResourceEntry {
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

export interface CharacterStore {
  builds: Record<string, CharacterBuild>;
  activeBuildId: string | null;
  createBuild: (label?: string) => string;
  ensureActiveBuild: () => string;
  setActiveBuild: (id: string) => void;
  archiveBuild: (id: string) => void;
  renameBuild: (id: string, label: string) => void;
  duplicateBuild: (id: string) => string | null;
  resetActiveBuild: () => void;
  updateProfile: (changes: Partial<CharacterProfile>) => void;
  assignPriority: (category: PriorityCategory, rank: PriorityRank | null) => void;
  setStage: (stage: CharacterStage) => void;
  nextStage: () => void;
  previousStage: () => void;
  selectLineage: (key: LineageKey | null) => void;
  toggleLineageReveal: () => void;
  updateLineageNotes: (notes: string) => void;
  toggleLineagePower: (selection: LineagePowerSelection) => void;
  clearLineagePowers: () => void;
  addContactResource: (payload?: Partial<Omit<ContactResourceEntry, 'id'>>) => void;
  updateContactResource: (id: string, changes: Partial<ContactResourceEntry>) => void;
  removeContactResource: (id: string) => void;
  addRetainerResource: (payload?: Partial<Omit<RetainerResourceEntry, 'id'>>) => void;
  updateRetainerResource: (id: string, changes: Partial<RetainerResourceEntry>) => void;
  removeRetainerResource: (id: string) => void;
  addPropertyResource: (payload?: Partial<Omit<PropertyResourceEntry, 'id'>>) => void;
  updatePropertyResource: (id: string, changes: Partial<PropertyResourceEntry>) => void;
  removePropertyResource: (id: string) => void;
  addGoodsResource: (payload?: Partial<Omit<GoodsResourceEntry, 'id'>>) => void;
  updateGoodsResource: (id: string, changes: Partial<GoodsResourceEntry>) => void;
  removeGoodsResource: (id: string) => void;
  setResourceLiquid: (value: number) => void;
  updateResourceNotes: (notes: string) => void;
  updateBackground: (changes: Partial<CharacterBuild['background']>) => void;
  setSkillRating: (skillId: string, value: number) => void;
  toggleSkillSpecialization: (selection: SkillSpecializationSelection) => void;
  removeSkillSpecialization: (id: string) => void;
  addCustomSkillSpecialization: (label: string) => void;
  markSkillSpecializationApproved: (id: string, gmApproved: boolean) => void;
  setBackgroundSkillSpecializations: (specializations: string[]) => void;
  setBackgroundCustomSpecializations: (customSpecs: string[]) => void;
  updateSkillNotes: (notes: string) => void;
  setAttributeScore: (attribute: AttributeKey, value: number) => void;
  updateAttributeNotes: (notes: string) => void;
  toggleAttributeSpecialization: (attribute: AttributeKey, specialization: string) => void;
  adjustExperience: (delta: number) => void;
  setExperience: (value: number) => void;
  updateAdvancement: (changes: Partial<CharacterBuild['advancement']>) => void;
  adjustCorruption: (delta: number) => void;
  setCorruption: (value: number) => void;
  updateCorruptionNotes: (notes: string) => void;
  adjustHealth: (location: BodyLocationKey, delta: number) => void;
  setHealth: (location: BodyLocationKey, value: number) => void;
  updateHealthScar: (location: BodyLocationKey, scar: string) => void;
  addRelationship: (name: string) => void;
  removeRelationship: (name: string) => void;
  updateAnchors: (text: string) => void;
  updateNarrativeNotes: (notes: string) => void;
  updateGmNotes: (notes: string) => void;
}

const emptyPriorities = (): Record<PriorityCategory, PriorityRank | null> => ({
  lineage: null,
  resources: null,
  background: null,
  skills: null,
  attributes: null
});

const defaultAttributes = (): Record<AttributeKey, number> => ({
  physique: 0,
  intellect: 0,
  presence: 0
});

const defaultAttributeSpecializations = (): Record<AttributeKey, string[]> => ({
  physique: [],
  intellect: [],
  presence: []
});

const defaultHealth = (): CharacterBuild['health'] => ({
  head: { current: 3, max: 3, scar: '' },
  torso: { current: 5, max: 5, scar: '' },
  leftArm: { current: 4, max: 4, scar: '' },
  rightArm: { current: 4, max: 4, scar: '' },
  leftLeg: { current: 4, max: 4, scar: '' },
  rightLeg: { current: 4, max: 4, scar: '' }
});

const ESPER_DEPTH_LIMIT: Record<PriorityRank, number> = {
  A: 3,
  B: 2,
  C: 2,
  D: 1,
  E: 0
};

const getEsperDepthLimit = (priority: PriorityRank | null): number => (priority ? ESPER_DEPTH_LIMIT[priority] : 0);

const createEmptyProfile = (): CharacterProfile => ({
  name: '',
  alias: '',
  currentProfession: '',
  wardOfResidence: '',
  backstory: '',
  physicalDescription: '',
  code: '',
  lineNotCrossed: '',
  temptation: '',
  portraitUrl: ''
});

const nowIso = () => new Date().toISOString();

const createId = (prefix: string) =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

const makeBuild = (label?: string): CharacterBuild => {
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sidonia-${Math.random().toString(36).slice(2, 9)}`;
  const timestamp = nowIso();
  return {
    id,
    label: label || 'Unbound Persona',
    createdAt: timestamp,
    updatedAt: timestamp,
    stage: 'priorities',
    profile: createEmptyProfile(),
    priorities: emptyPriorities(),
    lineage: {
      key: null,
      notes: '',
      revealMechanics: false,
      powers: []
    },
    resources: {
      contacts: [],
      retainers: [],
      properties: [],
      goods: [],
      liquid: 0,
      notes: ''
    },
    background: {
      title: '',
      tierNotes: '',
      contacts: ''
    },
    skills: {
      ratings: {},
      specializations: [],
      backgroundSpecializations: [],
      backgroundCustomSpecializations: [],
      notes: ''
    },
    attributes: {
      scores: defaultAttributes(),
      notes: '',
      specializations: defaultAttributeSpecializations()
    },
    corruption: {
      current: 0,
      warning: 6,
      notes: ''
    },
    advancement: {
      experience: 0,
      track: '',
      milestones: ''
    },
    health: defaultHealth(),
    narrative: {
      relationships: [],
      anchors: '',
      notes: ''
    },
    gmNotes: ''
  };
};

const duplicateFrom = (source: CharacterBuild): CharacterBuild => {
  const copy = deepClone(source);
  const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sidonia-${Math.random().toString(36).slice(2, 9)}`;
  const timestamp = nowIso();
  return {
    ...copy,
    id,
    label: `${source.label} (Copy)`,
    createdAt: timestamp,
    updatedAt: timestamp
  };
};

const deepClone = <T,>(value: T): T => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

const withActive = (
  set: (fn: (state: CharacterStore) => CharacterStore) => void,
  updater: (build: CharacterBuild) => CharacterBuild
) => {
  set((state) => {
    const activeId = state.activeBuildId;
    if (!activeId) {
      return state;
    }
    const current = state.builds[activeId];
    if (!current) {
      return state;
    }
    const updated = updater(current);
    updated.updatedAt = nowIso();
    return {
      ...state,
      builds: {
        ...state.builds,
        [activeId]: updated
      }
    };
  });
};

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set, get) => ({
      builds: {},
      activeBuildId: null,
      createBuild: (label) => {
        const build = makeBuild(label);
        set((state) => ({
          builds: { ...state.builds, [build.id]: build },
          activeBuildId: build.id
        }));
        return build.id;
      },
      ensureActiveBuild: () => {
        const { activeBuildId } = get();
        if (activeBuildId && get().builds[activeBuildId]) {
          return activeBuildId;
        }
        return get().createBuild();
      },
      setActiveBuild: (id) => {
        if (!get().builds[id]) {
          return;
        }
        set({ activeBuildId: id });
      },
      archiveBuild: (id) => {
        set((state) => {
          const { [id]: _, ...rest } = state.builds;
          return {
            builds: rest,
            activeBuildId: state.activeBuildId === id ? null : state.activeBuildId
          };
        });
      },
      renameBuild: (id, label) => {
        set((state) => {
          const build = state.builds[id];
          if (!build) return state;
          return {
            ...state,
            builds: {
              ...state.builds,
              [id]: { ...build, label, updatedAt: nowIso() }
            }
          };
        });
      },
      duplicateBuild: (id) => {
        const { builds } = get();
        const source = builds[id];
        if (!source) return null;
        const duplicate = duplicateFrom(source);
        set((state) => ({
          builds: { ...state.builds, [duplicate.id]: duplicate },
          activeBuildId: duplicate.id
        }));
        analytics.track('build.duplicated', {});
        return duplicate.id;
      },
      resetActiveBuild: () => {
        set((state) => {
          const activeId = state.activeBuildId;
          if (!activeId) {
            return state;
          }
          const existing = state.builds[activeId];
          if (!existing) {
            return state;
          }
          const fresh = makeBuild(existing.label);
          const resetBuild: CharacterBuild = {
            ...fresh,
            id: activeId,
            createdAt: existing.createdAt,
            updatedAt: nowIso()
          };
          analytics.track('build.reset', {});
          return {
            ...state,
            builds: {
              ...state.builds,
              [activeId]: resetBuild
            }
          };
        });
      },
      updateProfile: (changes) => {
        withActive(set, (build) => ({
          ...build,
          profile: { ...build.profile, ...changes }
        }));
      },
      assignPriority: (category, rank) => {
        withActive(set, (build) => {
          const updated = { ...build.priorities };
          // Remove the rank from other categories to maintain uniqueness
          if (rank) {
            (Object.keys(updated) as PriorityCategory[]).forEach((key) => {
              if (key !== category && updated[key] === rank) {
                updated[key] = null;
              }
            });
          }
          updated[category] = rank;
          return {
            ...build,
            priorities: updated
          };
        });
        analytics.track(rank ? 'priority.assigned' : 'priority.cleared', { category, rank });
      },
      setStage: (stage) => {
        withActive(set, (build) => ({ ...build, stage }));
        analytics.track('stage.changed', { stage });
      },
      nextStage: () => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId) return;
        const build = builds[activeBuildId];
        if (!build) return;
        const currentIndex = STAGES.indexOf(build.stage);
        const next = STAGES[Math.min(currentIndex + 1, STAGES.length - 1)];
        get().setStage(next);
      },
      previousStage: () => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId) return;
        const build = builds[activeBuildId];
        if (!build) return;
        const currentIndex = STAGES.indexOf(build.stage);
        const prev = STAGES[Math.max(currentIndex - 1, 0)];
        get().setStage(prev);
      },
      selectLineage: (key) => {
        withActive(set, (build) => {
          const sameLineage = build.lineage.key === key && key !== null;
          const currentPowers = ensureLineagePowersArray(build.lineage.powers);
          return {
            ...build,
            lineage: {
              ...build.lineage,
              key,
              // Reset reveal when switching lineages
              revealMechanics: key ? build.lineage.revealMechanics : false,
              powers: sameLineage ? currentPowers : []
            }
          };
        });
        analytics.track('lineage.selected', { lineage: key });
      },
      toggleLineageReveal: () => {
        withActive(set, (build) => ({
          ...build,
          lineage: {
            ...build.lineage,
            revealMechanics: !build.lineage.revealMechanics
          }
        }));
        analytics.track('lineage.reveal_toggled', {});
      },
      updateLineageNotes: (notes) => {
        withActive(set, (build) => ({
          ...build,
          lineage: { ...build.lineage, notes }
        }));
      },
      toggleLineagePower: (selection) => {
        withActive(set, (build) => {
          if (!build.lineage.key || build.lineage.key !== selection.lineage) {
            return build;
          }
          const currentPowers = ensureLineagePowersArray(build.lineage.powers);
          const isEsper = selection.lineage === 'esper';
          const exists = currentPowers.some((entry) => entry.id === selection.id);
          const lineagePriority = build.priorities.lineage ?? null;
          let powers = currentPowers;

          if (exists) {
            powers = powers.filter((entry) => entry.id !== selection.id);
            if (isEsper && selection.meta?.root) {
              if (selection.kind === 'esper-archetype') {
                powers = powers.filter((entry) => entry.meta?.root !== selection.meta?.root);
              } else if (selection.meta?.path) {
                const targetPath = selection.meta.path.join('/');
                powers = powers.filter((entry) => {
                  const entryPath = entry.meta?.path?.join('/') ?? '';
                  return entry.meta?.root !== selection.meta?.root || !entryPath.startsWith(`${targetPath}/`);
                });
              }
            }
            return {
              ...build,
              lineage: {
                ...build.lineage,
                powers
              }
            };
          }

          if (isEsper) {
            const meta = selection.meta ?? {};
            const category = meta.category;

            // Allow foundational choices (polarity/scope) without validation
            if (selection.kind === 'esper-framework-choice') {
              // No validation needed for foundational selections
            } else if (selection.kind === 'esper-archetype') {
              if (category === 'esper-base' && lineagePriority === 'C') {
                return build;
              }
              if (category === 'esper-mentalist' && !(lineagePriority === 'A' || lineagePriority === 'C')) {
                return build;
              }

              // For Priority A: allow both Esper and Mentalist archetypes
              // Only clear selections from the same subsystem
              const ESPER_ARCHETYPES = ['sentinel', 'median', 'weaver', 'summoner', 'linker'];
              const MENTALIST_ARCHETYPES = ['empath', 'mesmer', 'siren', 'dreamer', 'meta-mind'];
              const selectedArchetype = meta.archetype;
              const isEsperArchetype = ESPER_ARCHETYPES.includes(selectedArchetype || '');
              const isMentalistArchetype = MENTALIST_ARCHETYPES.includes(selectedArchetype || '');

              if (lineagePriority === 'A') {
                // Priority A: Keep selections from the other subsystem
                if (isEsperArchetype) {
                  // Selecting Esper archetype - only clear other Esper selections
                  powers = powers.filter((entry) =>
                    !ESPER_ARCHETYPES.includes(entry.meta?.archetype || '') &&
                    entry.kind !== 'esper-focus' &&
                    entry.kind !== 'esper-framework-path'
                  );
                } else if (isMentalistArchetype) {
                  // Selecting Mentalist archetype - only clear other Mentalist selections
                  powers = powers.filter((entry) =>
                    !MENTALIST_ARCHETYPES.includes(entry.meta?.archetype || '') &&
                    entry.kind !== 'esper-framework-choice'
                  );
                }
              } else {
                // Other priorities: clear all Esper selections (original behavior)
                powers = powers.filter((entry) => entry.lineage !== 'esper');
              }
            } else {
              // Check if this is a Mentalist combo power (esper-focus with mentalist archetype)
              const MENTALIST_ARCHETYPES = ['empath', 'mesmer', 'siren', 'dreamer', 'meta-mind'];
              const isMentalistPower = selection.kind === 'esper-focus' &&
                MENTALIST_ARCHETYPES.includes(meta.archetype || '');

              if (!isMentalistPower) {
                // Only apply Esper evolution validation to non-Mentalist powers
                const root = meta.root;
                if (!root) {
                  return build;
                }
                const depthLimit = getEsperDepthLimit(lineagePriority);
                const depth = meta.depth ?? 0;
                if (depth > depthLimit) {
                  return build;
                }
                const hasBase = powers.some(
                  (entry) => entry.kind === 'esper-archetype' && entry.meta?.root === root
                );
                if (!hasBase) {
                  return build;
                }
              }
            }
          }

          // VALIDATION: Prevent exceeding limits before adding selection

          // NeoSapien slot validation
          if (selection.lineage === 'neosapien') {
            const SLOT_LIMITS: Record<PriorityRank, number> = { A: 9, B: 7, C: 6, D: 4, E: 2 };
            const slotLimit = lineagePriority ? SLOT_LIMITS[lineagePriority] : 0;
            const currentSlots = powers.reduce((sum, entry) => sum + (entry.meta?.slots ?? 0), 0);
            const newSlots = selection.meta?.slots ?? 0;
            if (slotLimit > 0 && currentSlots + newSlots > slotLimit) {
              return build; // Block selection - would exceed limit
            }
          }

          // Chimera mutation point validation
          if (selection.lineage === 'chimera') {
            const MUTATION_LIMITS: Record<PriorityRank, number> = { A: 7, B: 5, C: 4, D: 3, E: 2 };
            const mutationLimit = lineagePriority ? MUTATION_LIMITS[lineagePriority] : 0;
            const currentPoints = powers.reduce((sum, entry) => sum + (entry.meta?.mutationPoints ?? 0), 0);
            const newPoints = selection.meta?.mutationPoints ?? 0;
            if (mutationLimit > 0 && currentPoints + newPoints > mutationLimit) {
              return build; // Block selection - would exceed limit
            }
          }

          // Sorcery sphere/move validation
          if (selection.lineage === 'sorcery') {
            const SORCERY_LIMITS: Record<PriorityRank, { primary: number; secondary: number; moves: number }> = {
              A: { primary: 1, secondary: 2, moves: 5 },
              B: { primary: 1, secondary: 1, moves: 4 },
              C: { primary: 1, secondary: 2, moves: 3 },
              D: { primary: 0, secondary: 1, moves: 2 },
              E: { primary: 0, secondary: 1, moves: 1 }
            };
            const limits = lineagePriority ? SORCERY_LIMITS[lineagePriority] : { primary: 0, secondary: 0, moves: 0 };

            const primaryCount = powers.filter((entry) => entry.kind === 'sorcery-sphere-primary').length;
            const secondaryCount = powers.filter((entry) => entry.kind === 'sorcery-sphere-secondary').length;
            const moveCount = powers.filter((entry) => entry.kind === 'sorcery-move').length;

            if (selection.kind === 'sorcery-sphere-primary' && primaryCount >= limits.primary) {
              return build; // Block selection - would exceed primary sphere limit
            }
            if (selection.kind === 'sorcery-sphere-secondary' && secondaryCount >= limits.secondary) {
              return build; // Block selection - would exceed secondary sphere limit
            }
            if (selection.kind === 'sorcery-move' && moveCount >= limits.moves) {
              return build; // Block selection - would exceed move limit
            }
          }

          powers = [...powers, selection];
          return {
            ...build,
            lineage: {
              ...build.lineage,
              powers
            }
          };
        });
        analytics.track('lineage.power_toggled', { id: selection.id, lineage: selection.lineage });
      },
      clearLineagePowers: () => {
        withActive(set, (build) => ({
          ...build,
          lineage: {
            ...build.lineage,
            powers: []
          }
        }));
        analytics.track('lineage.powers_cleared', {});
      },
      addContactResource: (payload: Partial<Omit<ContactResourceEntry, 'id'>> = {}) => {
        const entry: ContactResourceEntry = {
          id: createId('contact'),
          name: payload.name ?? '',
          description: payload.description ?? '',
          gmApproved: payload.gmApproved ?? false,
          backgroundSynergy: payload.backgroundSynergy ?? false,
          specialization: payload.specialization ?? null,
          reach: Math.min(Math.max(payload.reach ?? 0, 0), 10),
          influence: Math.min(Math.max(payload.influence ?? 0, 0), 10)
        };
        withActive(set, (build) => ({
          ...build,
          resources: {
            ...build.resources,
            contacts: [...build.resources.contacts, entry]
          }
        }));
        analytics.track('resources.contact_added', {});
      },
      updateContactResource: (id, changes) => {
        withActive(set, (build) => ({
          ...build,
          resources: {
            ...build.resources,
            contacts: build.resources.contacts.map((entry) =>
              entry.id === id
                ? {
                    ...entry,
                    ...changes,
                    reach: changes.reach !== undefined ? Math.min(Math.max(changes.reach, 0), 10) : entry.reach,
                    influence:
                      changes.influence !== undefined ? Math.min(Math.max(changes.influence, 0), 10) : entry.influence
                  }
                : entry
            )
          }
        }));
      },
      removeContactResource: (id) => {
        withActive(set, (build) => ({
          ...build,
          resources: {
            ...build.resources,
            contacts: build.resources.contacts.filter((entry) => entry.id !== id)
          }
        }));
      },
      addRetainerResource: (payload: Partial<Omit<RetainerResourceEntry, 'id'>> = {}) => {
        const entry: RetainerResourceEntry = {
          id: createId('retainer'),
          name: payload.name ?? '',
          description: payload.description ?? '',
          gmApproved: payload.gmApproved ?? false,
          backgroundSynergy: payload.backgroundSynergy ?? false,
          specialization: payload.specialization ?? null,
          loyalty: Math.min(Math.max(payload.loyalty ?? 0, 0), 10),
          competence: Math.min(Math.max(payload.competence ?? 0, 0), 10)
        };
        withActive(set, (build) => ({
          ...build,
          resources: {
            ...build.resources,
            retainers: [...build.resources.retainers, entry]
          }
        }));
        analytics.track('resources.retainer_added', {});
      },
      updateRetainerResource: (id, changes) => {
        withActive(set, (build) => ({
          ...build,
          resources: {
            ...build.resources,
            retainers: build.resources.retainers.map((entry) =>
              entry.id === id
                ? {
                    ...entry,
                    ...changes,
                    loyalty: changes.loyalty !== undefined ? Math.min(Math.max(changes.loyalty, 0), 10) : entry.loyalty,
                    competence:
                      changes.competence !== undefined
                        ? Math.min(Math.max(changes.competence, 0), 10)
                        : entry.competence
                  }
                : entry
            )
          }
        }));
      },
      removeRetainerResource: (id) => {
        withActive(set, (build) => ({
          ...build,
          resources: {
            ...build.resources,
            retainers: build.resources.retainers.filter((entry) => entry.id !== id)
          }
        }));
      },
      addPropertyResource: (payload: Partial<Omit<PropertyResourceEntry, 'id'>> = {}) => {
        const entry: PropertyResourceEntry = {
          id: createId('property'),
          name: payload.name ?? '',
          description: payload.description ?? '',
          gmApproved: payload.gmApproved ?? false,
          backgroundSynergy: payload.backgroundSynergy ?? false,
          tenure: payload.tenure ?? '',
          zoning: payload.zoning ?? '',
          ward: payload.ward ?? '',
          specialization: payload.specialization ?? null
        };
        withActive(set, (build) => ({
          ...build,
          resources: {
            ...build.resources,
            properties: [...build.resources.properties, entry]
          }
        }));
        analytics.track('resources.property_added', {});
      },
      updatePropertyResource: (id, changes) => {
        withActive(set, (build) => ({
          ...build,
          resources: {
            ...build.resources,
            properties: build.resources.properties.map((entry) =>
              entry.id === id
                ? {
                    ...entry,
                    ...changes
                  }
                : entry
            )
          }
        }));
      },
      removePropertyResource: (id) => {
        withActive(set, (build) => ({
          ...build,
          resources: {
            ...build.resources,
            properties: build.resources.properties.filter((entry) => entry.id !== id)
          }
        }));
      },
      addGoodsResource: (payload: Partial<Omit<GoodsResourceEntry, 'id'>> = {}) => {
        const entry: GoodsResourceEntry = {
          id: createId('goods'),
          name: payload.name ?? '',
          description: payload.description ?? '',
          gmApproved: payload.gmApproved ?? false,
          backgroundSynergy: payload.backgroundSynergy ?? false,
          specialization: payload.specialization ?? null,
          quality: Math.min(Math.max(payload.quality ?? 0, 0), 10)
        };
        withActive(set, (build) => ({
          ...build,
          resources: {
            ...build.resources,
            goods: [...build.resources.goods, entry]
          }
        }));
        analytics.track('resources.goods_added', {});
      },
      updateGoodsResource: (id, changes) => {
        withActive(set, (build) => ({
          ...build,
          resources: {
            ...build.resources,
            goods: build.resources.goods.map((entry) =>
              entry.id === id
                ? {
                    ...entry,
                    ...changes,
                    quality: changes.quality !== undefined ? Math.min(Math.max(changes.quality, 0), 10) : entry.quality
                  }
                : entry
            )
          }
        }));
      },
      removeGoodsResource: (id) => {
        withActive(set, (build) => ({
          ...build,
          resources: {
            ...build.resources,
            goods: build.resources.goods.filter((entry) => entry.id !== id)
          }
        }));
      },
      setResourceLiquid: (value) => {
        withActive(set, (build) => ({
          ...build,
          resources: {
            ...build.resources,
            liquid: Math.max(0, value)
          }
        }));
        analytics.track('resources.liquid_set', { value });
      },
      updateResourceNotes: (notes) => {
        withActive(set, (build) => ({
          ...build,
          resources: { ...build.resources, notes }
        }));
      },
      updateBackground: (changes) => {
        withActive(set, (build) => {
          const updatedBackground = { ...build.background, ...changes };
          const backgroundChanged =
            typeof changes.title === 'string' && changes.title !== build.background.title;
          return {
            ...build,
            background: updatedBackground,
            skills: backgroundChanged
              ? { ...build.skills, backgroundSpecializations: [], backgroundCustomSpecializations: [] }
              : build.skills
          };
        });
      },
      setSkillRating: (skillId, value) => {
        withActive(set, (build) => ({
          ...build,
          skills: {
            ...build.skills,
            ratings: {
              ...build.skills.ratings,
              [skillId]: Math.max(0, value)
            }
          }
        }));
        analytics.track('skills.rating_set', { skillId, value });
      },
      toggleSkillSpecialization: (selection) => {
        withActive(set, (build) => {
          const exists = build.skills.specializations.some((entry) => entry.id === selection.id);
          const specializations = exists
            ? build.skills.specializations.filter((entry) => entry.id !== selection.id)
            : [...build.skills.specializations, selection];
          return {
            ...build,
            skills: {
              ...build.skills,
              specializations
            }
          };
        });
        analytics.track('skills.specialization_toggled', { id: selection.id, type: selection.type });
      },
      removeSkillSpecialization: (id) => {
        withActive(set, (build) => ({
          ...build,
          skills: {
            ...build.skills,
            specializations: build.skills.specializations.filter((entry) => entry.id !== id)
          }
        }));
      },
      addCustomSkillSpecialization: (label) => {
        const trimmed = label.trim();
        if (!trimmed) return;
        const selection: SkillSpecializationSelection = {
          id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          label: trimmed,
          type: 'custom',
          gmApproved: false
        };
        withActive(set, (build) => ({
          ...build,
          skills: {
            ...build.skills,
            specializations: [...build.skills.specializations, selection]
          }
        }));
        analytics.track('skills.custom_added', {});
      },
      markSkillSpecializationApproved: (id, gmApproved) => {
        withActive(set, (build) => ({
          ...build,
          skills: {
            ...build.skills,
            specializations: build.skills.specializations.map((entry) =>
              entry.id === id ? { ...entry, gmApproved } : entry
            )
          }
        }));
      },
      setBackgroundSkillSpecializations: (specializations: string[]) => {
        withActive(set, (build) => ({
          ...build,
          skills: { ...build.skills, backgroundSpecializations: specializations }
        }));
        analytics.track('skills.background_specializations', { count: specializations.length });
      },
      setBackgroundCustomSpecializations: (customSpecs: string[]) => {
        withActive(set, (build) => ({
          ...build,
          skills: { ...build.skills, backgroundCustomSpecializations: customSpecs }
        }));
        analytics.track('skills.background_custom_specializations', { count: customSpecs.length });
      },
      updateSkillNotes: (notes) => {
        withActive(set, (build) => ({
          ...build,
          skills: { ...build.skills, notes }
        }));
      },
      setAttributeScore: (attribute, value) => {
        withActive(set, (build) => ({
          ...build,
          attributes: {
            ...build.attributes,
            scores: {
              ...build.attributes.scores,
              [attribute]: Math.min(ATTRIBUTE_SCORE_MAX, Math.max(0, value))
            }
          }
        }));
        analytics.track('attributes.updated', { attribute, value });
      },
      updateAttributeNotes: (notes) => {
        withActive(set, (build) => ({
          ...build,
          attributes: { ...build.attributes, notes }
        }));
      },
      toggleAttributeSpecialization: (attribute, specialization) => {
        withActive(set, (build) => {
          const specializations = build.attributes.specializations ?? defaultAttributeSpecializations();
          const current = specializations[attribute] ?? [];
          const exists = current.includes(specialization);
          const updatedList = exists ? current.filter((entry) => entry !== specialization) : [...current, specialization];
          return {
            ...build,
            attributes: {
              ...build.attributes,
              specializations: {
                ...specializations,
                [attribute]: updatedList
              }
            }
          };
        });
        analytics.track('attributes.specialization_toggled', { attribute, specialization });
      },
      adjustExperience: (delta) => {
        withActive(set, (build) => ({
          ...build,
          advancement: {
            ...build.advancement,
            experience: Math.max(0, build.advancement.experience + delta)
          }
        }));
        analytics.track('advancement.adjusted', { delta });
      },
      setExperience: (value) => {
        withActive(set, (build) => ({
          ...build,
          advancement: {
            ...build.advancement,
            experience: Math.max(0, value)
          }
        }));
        analytics.track('advancement.set', { value });
      },
      updateAdvancement: (changes) => {
        withActive(set, (build) => ({
          ...build,
          advancement: { ...build.advancement, ...changes }
        }));
      },
      adjustCorruption: (delta) => {
        withActive(set, (build) => ({
          ...build,
          corruption: {
            ...build.corruption,
            current: Math.max(0, build.corruption.current + delta)
          }
        }));
        analytics.track('corruption.adjusted', { delta });
      },
      setCorruption: (value) => {
        withActive(set, (build) => ({
          ...build,
          corruption: {
            ...build.corruption,
            current: Math.max(0, value)
          }
        }));
        analytics.track('corruption.set', { value });
      },
      updateCorruptionNotes: (notes) => {
        withActive(set, (build) => ({
          ...build,
          corruption: { ...build.corruption, notes }
        }));
      },
      adjustHealth: (location, delta) => {
        withActive(set, (build) => {
          const current = build.health[location];
          const nextValue = Math.max(0, Math.min(current.max, current.current + delta));
          return {
            ...build,
            health: {
              ...build.health,
              [location]: { ...current, current: nextValue }
            }
          };
        });
        analytics.track('health.adjusted', { location, delta });
      },
      setHealth: (location, value) => {
        withActive(set, (build) => {
          const current = build.health[location];
          return {
            ...build,
            health: {
              ...build.health,
              [location]: {
                ...current,
                current: Math.max(0, Math.min(current.max, value))
              }
            }
          };
        });
        analytics.track('health.set', { location, value });
      },
      updateHealthScar: (location, scar) => {
        withActive(set, (build) => ({
          ...build,
          health: {
            ...build.health,
            [location]: {
              ...build.health[location],
              scar
            }
          }
        }));
      },
      addRelationship: (name) => {
        if (!name.trim()) return;
        withActive(set, (build) => ({
          ...build,
          narrative: {
            ...build.narrative,
            relationships: Array.from(new Set([...build.narrative.relationships, name.trim()]))
          }
        }));
        analytics.track('relationship.added', {});
      },
      removeRelationship: (name) => {
        withActive(set, (build) => ({
          ...build,
          narrative: {
            ...build.narrative,
            relationships: build.narrative.relationships.filter((entry) => entry !== name)
          }
        }));
        analytics.track('relationship.removed', {});
      },
      updateAnchors: (text) => {
        withActive(set, (build) => ({
          ...build,
          narrative: { ...build.narrative, anchors: text }
        }));
      },
      updateNarrativeNotes: (notes) => {
        withActive(set, (build) => ({
          ...build,
          narrative: { ...build.narrative, notes }
        }));
      },
      updateGmNotes: (notes) => {
        withActive(set, (build) => ({
          ...build,
          gmNotes: notes
        }));
      }
    }),
    {
      name: 'sidonia-character-builder',
      version: 7,
      migrate: (state, version) => {
        if (!state || typeof state !== 'object') {
          return state;
        }

        const mapLegacyAttributeKey = (scores: Record<string, number> | undefined): Record<AttributeKey, number> => {
          const legacy = scores ?? {};
          return {
            physique:
              typeof legacy.physique === 'number'
                ? legacy.physique
                : typeof legacy.grit === 'number'
                ? legacy.grit
                : 0,
            intellect:
              typeof legacy.intellect === 'number'
                ? legacy.intellect
                : typeof legacy.guile === 'number'
                ? legacy.guile
                : 0,
            presence:
              typeof legacy.presence === 'number'
                ? legacy.presence
                : typeof legacy.gravitas === 'number'
                ? legacy.gravitas
                : 0
          };
        };

        const normalizeAttributeSpecializations = (
          specializations: Record<string, string[]> | undefined
        ): Record<AttributeKey, string[]> => {
          const source = specializations ?? {};
          return {
            physique: Array.isArray(source.physique) ? source.physique : [],
            intellect: Array.isArray(source.intellect) ? source.intellect : [],
            presence: Array.isArray(source.presence) ? source.presence : []
          };
        };

        const upgradeProfile = (profile: unknown): CharacterProfile => {
          const legacy = (profile ?? {}) as Partial<CharacterProfile> & Record<string, unknown>;
          return {
            name: typeof legacy.name === 'string' ? legacy.name : '',
            alias: typeof legacy.alias === 'string' ? legacy.alias : '',
            // Migrate old "pronouns" field to "currentProfession"
            currentProfession: typeof legacy.currentProfession === 'string'
              ? legacy.currentProfession
              : typeof legacy.pronouns === 'string' ? legacy.pronouns : '',
            // Migrate old "concept" field to "wardOfResidence"
            wardOfResidence: typeof legacy.wardOfResidence === 'string'
              ? legacy.wardOfResidence
              : typeof legacy.concept === 'string' ? legacy.concept : '',
            // Migrate old "summary" field to "backstory"
            backstory: typeof legacy.backstory === 'string'
              ? legacy.backstory
              : typeof legacy.summary === 'string' ? legacy.summary : '',
            physicalDescription:
              typeof legacy.physicalDescription === 'string' ? legacy.physicalDescription : '',
            code: typeof legacy.code === 'string' ? legacy.code : '',
            lineNotCrossed:
              typeof legacy.lineNotCrossed === 'string' ? legacy.lineNotCrossed : '',
            temptation: typeof legacy.temptation === 'string' ? legacy.temptation : '',
            portraitUrl: typeof legacy.portraitUrl === 'string' ? legacy.portraitUrl : ''
          } satisfies CharacterProfile;
        };

        const upgradeSkills = (skills: unknown): CharacterBuild['skills'] => {
          const legacy = (skills ?? {}) as Partial<CharacterBuild['skills']> & {
            focus?: unknown;
            backgroundSpecialization?: string | null;
            backgroundCustomSpecialization?: string;
          };
          if (legacy.ratings && legacy.specializations) {
            // Migrate old backgroundSpecialization to new array format
            const migratedSpecializations =
              legacy.backgroundSpecialization && typeof legacy.backgroundSpecialization === 'string'
                ? [legacy.backgroundSpecialization]
                : (legacy as any).backgroundSpecializations ?? [];

            // Migrate old single backgroundCustomSpecialization to array
            const migratedCustomSpecs = [];
            if (legacy.backgroundCustomSpecialization && typeof legacy.backgroundCustomSpecialization === 'string') {
              migratedCustomSpecs.push(legacy.backgroundCustomSpecialization);
            } else if (Array.isArray((legacy as any).backgroundCustomSpecializations)) {
              migratedCustomSpecs.push(...(legacy as any).backgroundCustomSpecializations);
            }

            return {
              ratings: legacy.ratings,
              specializations: Array.isArray(legacy.specializations) ? legacy.specializations : [],
              backgroundSpecializations: Array.isArray(migratedSpecializations) ? migratedSpecializations : [],
              backgroundCustomSpecializations: migratedCustomSpecs,
              notes: typeof legacy.notes === 'string' ? legacy.notes : ''
            } satisfies CharacterBuild['skills'];
          }

          const legacyFocus = Array.isArray(legacy.focus) ? (legacy.focus as string[]) : [];
          const ratings = legacyFocus.reduce<Record<string, number>>((acc, id) => {
            acc[id] = 1;
            return acc;
          }, {});

          return {
            ratings,
            specializations: [],
            backgroundSpecializations: [],
            backgroundCustomSpecializations: [],
            notes: typeof legacy.notes === 'string' ? legacy.notes : ''
          } satisfies CharacterBuild['skills'];
        };

        const upgradeLineage = (lineage: unknown): CharacterBuild['lineage'] => {
          const legacy = (lineage ?? {}) as Partial<CharacterBuild['lineage']> & {
            powers?: unknown;
          };
          const powers = ensureLineagePowersArray(legacy.powers);
          return {
            key: (legacy.key ?? null) as LineageKey | null,
            notes: typeof legacy.notes === 'string' ? legacy.notes : '',
            revealMechanics: Boolean(legacy.revealMechanics),
            powers
          } satisfies CharacterBuild['lineage'];
        };

        const upgradeResources = (resources: unknown): CharacterBuild['resources'] => {
          const legacy = (resources ?? {}) as Partial<CharacterBuild['resources']> & {
            allocations?: Record<string, number>;
          };

          const ensureContact = (entry: Partial<ContactResourceEntry> & { notes?: string }, index: number): ContactResourceEntry => ({
            id: entry.id ?? createId(`contact-${index}`),
            name: entry.name ?? '',
            description: entry.description ?? entry.notes ?? '',
            gmApproved: entry.gmApproved ?? false,
            backgroundSynergy: entry.backgroundSynergy ?? false,
            specialization: entry.specialization ?? null,
            reach: typeof entry.reach === 'number' ? entry.reach : 0,
            influence: typeof entry.influence === 'number' ? entry.influence : 0
          });

          const ensureRetainer = (
            entry: Partial<RetainerResourceEntry> & { notes?: string },
            index: number
          ): RetainerResourceEntry => ({
            id: entry.id ?? createId(`retainer-${index}`),
            name: entry.name ?? '',
            description: entry.description ?? entry.notes ?? '',
            gmApproved: entry.gmApproved ?? false,
            backgroundSynergy: entry.backgroundSynergy ?? false,
            specialization: entry.specialization ?? null,
            loyalty: typeof entry.loyalty === 'number' ? entry.loyalty : 0,
            competence: typeof entry.competence === 'number' ? entry.competence : 0
          });

          const ensureProperty = (
            entry: Partial<PropertyResourceEntry> & { notes?: string },
            index: number
          ): PropertyResourceEntry => ({
            id: entry.id ?? createId(`property-${index}`),
            name: entry.name ?? '',
            description: entry.description ?? entry.notes ?? '',
            gmApproved: entry.gmApproved ?? false,
            backgroundSynergy: entry.backgroundSynergy ?? false,
            tenure: entry.tenure ?? '',
            zoning: entry.zoning ?? '',
            ward: entry.ward ?? '',
            specialization: entry.specialization ?? null
          });

          const ensureGoods = (
            entry: Partial<GoodsResourceEntry> & { notes?: string },
            index: number
          ): GoodsResourceEntry => ({
            id: entry.id ?? createId(`goods-${index}`),
            name: entry.name ?? '',
            description: entry.description ?? entry.notes ?? '',
            gmApproved: entry.gmApproved ?? false,
            backgroundSynergy: entry.backgroundSynergy ?? false,
            specialization: entry.specialization ?? null,
            quality: typeof entry.quality === 'number' ? entry.quality : 0
          });

          const contacts = Array.isArray(legacy.contacts)
            ? legacy.contacts.map((entry, index) => ensureContact(entry, index))
            : [];
          const retainers = Array.isArray(legacy.retainers)
            ? legacy.retainers.map((entry, index) => ensureRetainer(entry, index))
            : [];
          const properties = Array.isArray(legacy.properties)
            ? legacy.properties.map((entry, index) => ensureProperty(entry, index))
            : [];
          const goods = Array.isArray((legacy as any).goods)
            ? ((legacy as any).goods as Array<Partial<GoodsResourceEntry>>).map((entry, index) =>
                ensureGoods(entry, index)
              )
            : [];

          const liquid = typeof legacy.liquid === 'number'
            ? legacy.liquid
            : typeof legacy.allocations?.liquid === 'number'
            ? legacy.allocations.liquid
            : 0;

          return {
            contacts,
            retainers,
            properties,
            goods,
            liquid,
            notes: typeof legacy.notes === 'string' ? legacy.notes : ''
          } satisfies CharacterBuild['resources'];
        };

        const upgradedBuilds = Object.fromEntries(
          Object.entries(((state as CharacterStore).builds ?? {}) as Record<string, unknown>).map(([id, rawBuild]) => {
            const build = rawBuild as Partial<CharacterBuild> & { attributes?: any; skills?: any };
            const upgradedAttributes: CharacterBuild['attributes'] = {
              scores: mapLegacyAttributeKey(build.attributes?.scores as Record<string, number> | undefined),
              notes: typeof build.attributes?.notes === 'string' ? build.attributes.notes : '',
              specializations: normalizeAttributeSpecializations(
                build.attributes?.specializations as Record<string, string[]> | undefined
              )
            };

            const upgradedSkills = upgradeSkills(build.skills);
            const upgradedLineage = upgradeLineage(build.lineage);
            const upgradedResources = upgradeResources(build.resources);

            const upgradedBuild: CharacterBuild = {
              ...(build as CharacterBuild),
              profile: upgradeProfile(build.profile),
              lineage: upgradedLineage,
              resources: upgradedResources,
              skills: upgradedSkills,
              attributes: upgradedAttributes
            };

            return [id, upgradedBuild];
          })
        );

        return {
          ...(state as CharacterStore),
          builds: upgradedBuilds
        } satisfies CharacterStore;
      }
    }
  )
);
