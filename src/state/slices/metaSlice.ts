import { StateCreator } from 'zustand';
import type { CharacterStore } from '../characterStore';
import { CharacterBuild, CharacterProfile, PriorityCategory, PriorityRank, AttributeKey, CharacterStage, STAGES } from './types';
import { analytics } from '../../utils/analytics';

export interface MetaSlice {
    builds: Record<string, CharacterBuild>;
    activeBuildId: string | null;
    createBuild: (label?: string) => string;
    ensureActiveBuild: () => string;
    setActiveBuild: (id: string) => void;
    archiveBuild: (id: string) => void;
    renameBuild: (id: string, label: string) => void;
    duplicateBuild: (id: string) => string | null;
    resetActiveBuild: () => void;
    assignPriority: (category: PriorityCategory, rank: PriorityRank | null) => void;
    setStage: (stage: CharacterStage) => void;
    nextStage: () => void;
    previousStage: () => void;
}

const createEmptyProfile = (): CharacterProfile => ({
    name: '',
    concept: '',
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
    const copy = JSON.parse(JSON.stringify(source));
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

export const createMetaSlice: StateCreator<CharacterStore, [], [], MetaSlice> = (set, get) => ({
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
        const { activeBuildId, builds } = get();
        if (activeBuildId && builds[activeBuildId]) {
            return activeBuildId;
        }
        // If no active build or invalid ID, create new one
        // But first check if there are ANY builds to recover
        const buildIds = Object.keys(builds);
        if (buildIds.length > 0) {
            const lastBuild = buildIds[buildIds.length - 1];
            set({ activeBuildId: lastBuild });
            return lastBuild;
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
            if (!activeId) return state;
            const existing = state.builds[activeId];
            if (!existing) return state;

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

    assignPriority: (category, rank) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
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

            const updatedBuild = {
                ...build,
                updatedAt: nowIso(),
                priorities: updated
            };

            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
        analytics.track(rank ? 'priority.assigned' : 'priority.cleared', { category, rank });
    },

    setStage: (stage) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = { ...build, stage };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
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
    }
});
