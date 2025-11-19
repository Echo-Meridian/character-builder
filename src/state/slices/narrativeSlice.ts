import { StateCreator } from 'zustand';
import type { CharacterStore } from '../characterStore';
import { CharacterBuild, BodyLocationKey } from './types';

export interface NarrativeSlice {
    updateProfile: (changes: Partial<CharacterBuild['profile']>) => void;
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

export const createNarrativeSlice: StateCreator<CharacterStore, [], [], NarrativeSlice> = (set, get) => ({
    updateProfile: (changes) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                profile: { ...build.profile, ...changes }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    adjustExperience: (delta) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                advancement: {
                    ...build.advancement,
                    experience: Math.max(0, build.advancement.experience + delta)
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    setExperience: (value) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                advancement: {
                    ...build.advancement,
                    experience: Math.max(0, value)
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    updateAdvancement: (changes) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                advancement: { ...build.advancement, ...changes }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    adjustCorruption: (delta) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                corruption: {
                    ...build.corruption,
                    current: Math.max(0, build.corruption.current + delta)
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    setCorruption: (value) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                corruption: {
                    ...build.corruption,
                    current: Math.max(0, value)
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    updateCorruptionNotes: (notes) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                corruption: { ...build.corruption, notes }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    adjustHealth: (location, delta) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const loc = build.health[location];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                health: {
                    ...build.health,
                    [location]: {
                        ...loc,
                        current: Math.min(Math.max(0, loc.current + delta), loc.max)
                    }
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    setHealth: (location, value) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const loc = build.health[location];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                health: {
                    ...build.health,
                    [location]: {
                        ...loc,
                        current: Math.min(Math.max(0, value), loc.max)
                    }
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    updateHealthScar: (location, scar) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                health: {
                    ...build.health,
                    [location]: { ...build.health[location], scar }
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    addRelationship: (name) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                narrative: {
                    ...build.narrative,
                    relationships: [...build.narrative.relationships, name]
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    removeRelationship: (name) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                narrative: {
                    ...build.narrative,
                    relationships: build.narrative.relationships.filter((r) => r !== name)
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    updateAnchors: (text) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                narrative: { ...build.narrative, anchors: text }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    updateNarrativeNotes: (notes) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                narrative: { ...build.narrative, notes }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    updateGmNotes: (notes) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                gmNotes: notes
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    }
});
