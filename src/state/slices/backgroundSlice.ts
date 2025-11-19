import { StateCreator } from 'zustand';
import type { CharacterStore } from '../characterStore';
import { CharacterBuild } from './types';

export interface BackgroundSlice {
    updateBackground: (changes: Partial<CharacterBuild['background']>) => void;
}

export const createBackgroundSlice: StateCreator<CharacterStore, [], [], BackgroundSlice> = (set, get) => ({
    updateBackground: (changes) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                background: { ...build.background, ...changes }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    }
});
