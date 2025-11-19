import { StateCreator } from 'zustand';
import type { CharacterStore } from '../characterStore';
import { SkillSpecializationSelection } from './types';
import { createId } from '../../utils/id';
import { analytics } from '../../utils/analytics';

export interface SkillsSlice {
    setSkillRating: (skillId: string, value: number) => void;
    toggleSkillSpecialization: (selection: SkillSpecializationSelection) => void;
    removeSkillSpecialization: (id: string) => void;
    addCustomSkillSpecialization: (label: string) => void;
    markSkillSpecializationApproved: (id: string, gmApproved: boolean) => void;
    setBackgroundSkillSpecializations: (specializations: string[]) => void;
    setBackgroundCustomSpecializations: (customSpecs: string[]) => void;
    updateSkillNotes: (notes: string) => void;
}

export const createSkillsSlice: StateCreator<CharacterStore, [], [], SkillsSlice> = (set, get) => ({
    setSkillRating: (skillId, value) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                skills: {
                    ...build.skills,
                    ratings: { ...build.skills.ratings, [skillId]: value }
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
        analytics.track('skills.rating_set', { skillId, value });
    },

    toggleSkillSpecialization: (selection) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const exists = build.skills.specializations.some((s) => s.id === selection.id);
            let newSpecs;

            if (exists) {
                newSpecs = build.skills.specializations.filter((s) => s.id !== selection.id);
            } else {
                newSpecs = [...build.skills.specializations, selection];
            }

            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                skills: {
                    ...build.skills,
                    specializations: newSpecs
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
        analytics.track('skills.spec_toggled', { id: selection.id });
    },

    removeSkillSpecialization: (id) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                skills: {
                    ...build.skills,
                    specializations: build.skills.specializations.filter((s) => s.id !== id)
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    addCustomSkillSpecialization: (label) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        const selection: SkillSpecializationSelection = {
            id: createId('spec'),
            label,
            type: 'custom',
            skillId: null,
            gmApproved: false
        };

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                skills: {
                    ...build.skills,
                    specializations: [...build.skills.specializations, selection]
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
        analytics.track('skills.custom_spec_added', {});
    },

    markSkillSpecializationApproved: (id, gmApproved) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                skills: {
                    ...build.skills,
                    specializations: build.skills.specializations.map((s) => (s.id === id ? { ...s, gmApproved } : s))
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    setBackgroundSkillSpecializations: (specializations) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                skills: {
                    ...build.skills,
                    backgroundSpecializations: specializations
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    setBackgroundCustomSpecializations: (customSpecs) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                skills: {
                    ...build.skills,
                    backgroundCustomSpecializations: customSpecs
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    updateSkillNotes: (notes) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                skills: { ...build.skills, notes }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    }
});
