import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PriorityRank, LineageKey } from '../data/types';
import { analytics } from '../utils/analytics';

export type PriorityCategory = 'lineage' | 'resources' | 'background' | 'skills' | 'attributes';
export const PRIORITY_CATEGORIES: PriorityCategory[] = ['lineage', 'resources', 'background', 'skills', 'attributes'];

export type CharacterStage =
  | 'priorities'
  | 'lineage'
  | 'resources'
  | 'background'
  | 'skills'
  | 'attributes'
  | 'narrative';

export const STAGES: CharacterStage[] = ['priorities', 'lineage', 'resources', 'background', 'skills', 'attributes', 'narrative'];

export const LINEAGES: LineageKey[] = ['neosapien', 'sorcery', 'esper', 'chimera', 'automata'];

export type AttributeKey = 'physique' | 'intellect' | 'presence';

export interface SkillSpecializationSelection {
  id: string;
  label: string;
  type: 'predefined' | 'custom' | 'background';
  skillId?: string | null;
  gmApproved: boolean;
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
  pronouns: string;
  concept: string;
  summary: string;
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
  };
  resources: {
    allocations: Record<'contacts' | 'retainers' | 'properties' | 'liquid', number>;
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
    backgroundSpecialization: string | null;
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
  setResourceAllocation: (key: 'contacts' | 'retainers' | 'properties' | 'liquid', value: number) => void;
  updateResourceNotes: (notes: string) => void;
  updateBackground: (changes: Partial<CharacterBuild['background']>) => void;
  setSkillRating: (skillId: string, value: number) => void;
  toggleSkillSpecialization: (selection: SkillSpecializationSelection) => void;
  removeSkillSpecialization: (id: string) => void;
  addCustomSkillSpecialization: (label: string) => void;
  markSkillSpecializationApproved: (id: string, gmApproved: boolean) => void;
  setBackgroundSkillSpecialization: (option: string | null) => void;
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

const createEmptyProfile = (): CharacterProfile => ({
  name: '',
  pronouns: '',
  concept: '',
  summary: ''
});

const nowIso = () => new Date().toISOString();

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
      revealMechanics: false
    },
    resources: {
      allocations: {
        contacts: 0,
        retainers: 0,
        properties: 0,
        liquid: 0
      },
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
      backgroundSpecialization: null,
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
        withActive(set, (build) => ({
          ...build,
          lineage: {
            ...build.lineage,
            key,
            // Reset reveal when switching lineages
            revealMechanics: key ? build.lineage.revealMechanics : false
          }
        }));
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
      setResourceAllocation: (key, value) => {
        withActive(set, (build) => ({
          ...build,
          resources: {
            ...build.resources,
            allocations: {
              ...build.resources.allocations,
              [key]: Math.max(0, value)
            }
          }
        }));
        analytics.track('resources.allocated', { key, value });
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
              ? { ...build.skills, backgroundSpecialization: null }
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
      setBackgroundSkillSpecialization: (option) => {
        withActive(set, (build) => ({
          ...build,
          skills: { ...build.skills, backgroundSpecialization: option }
        }));
        analytics.track('skills.background_specialization', { option });
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
              [attribute]: Math.max(0, value)
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
      version: 3,
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

        const upgradeSkills = (skills: unknown): CharacterBuild['skills'] => {
          const legacy = (skills ?? {}) as Partial<CharacterBuild['skills']> & {
            focus?: unknown;
          };
          if (legacy.ratings && legacy.specializations && legacy.backgroundSpecialization !== undefined) {
            return {
              ratings: legacy.ratings,
              specializations: Array.isArray(legacy.specializations) ? legacy.specializations : [],
              backgroundSpecialization: legacy.backgroundSpecialization ?? null,
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
            backgroundSpecialization: null,
            notes: typeof legacy.notes === 'string' ? legacy.notes : ''
          } satisfies CharacterBuild['skills'];
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

            const upgradedBuild: CharacterBuild = {
              ...(build as CharacterBuild),
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
