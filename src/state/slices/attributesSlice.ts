import { StateCreator } from 'zustand';
import type { CharacterStore } from '../characterStore';
import { AttributeKey } from './types';

export interface AttributesSlice {
    setAttributeScore: (attribute: AttributeKey, value: number) => void;
    updateAttributeNotes: (notes: string) => void;
    toggleAttributeSpecialization: (attribute: AttributeKey, specialization: string) => void;
    resetAttributes: () => void;
}

export const createAttributesSlice: StateCreator<CharacterStore, [], [], AttributesSlice> = (set, get) => ({
    setAttributeScore: (attribute, value) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                attributes: {
                    ...build.attributes,
                    scores: { ...build.attributes.scores, [attribute]: value }
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    updateAttributeNotes: (notes) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                attributes: { ...build.attributes, notes }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    toggleAttributeSpecialization: (attribute, specialization) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const currentSpecs = build.attributes.specializations[attribute];
            const exists = currentSpecs.includes(specialization);
            const newSpecs = exists
                ? currentSpecs.filter((s) => s !== specialization)
                : [...currentSpecs, specialization];

            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                attributes: {
                    ...build.attributes,
                    specializations: { ...build.attributes.specializations, [attribute]: newSpecs }
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    resetAttributes: () => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                attributes: {
                    scores: { physique: 0, intellect: 0, presence: 0 },
                    specializations: { physique: [], intellect: [], presence: [] },
                    notes: ''
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    }
});
