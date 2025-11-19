import { StateCreator } from 'zustand';
import type { CharacterStore } from '../characterStore';
import type { LineageKey, PriorityRank } from '../../data/types';
import { LineagePowerSelection, ensureLineagePowersArray } from './types';
import { analytics } from '../../utils/analytics';

export interface LineageSlice {
    selectLineage: (key: LineageKey | null) => void;
    toggleLineageReveal: () => void;
    updateLineageNotes: (notes: string) => void;
    toggleLineagePower: (selection: LineagePowerSelection) => void;
    clearLineagePowers: () => void;
}

const ESPER_DEPTH_LIMIT: Record<PriorityRank, number> = {
    A: 3,
    B: 2,
    C: 2,
    D: 1,
    E: 0
};

const getEsperDepthLimit = (priority: PriorityRank | null): number => (priority ? ESPER_DEPTH_LIMIT[priority] : 0);

export const createLineageSlice: StateCreator<CharacterStore, [], [], LineageSlice> = (set, get) => ({
    selectLineage: (key) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const sameLineage = build.lineage.key === key && key !== null;
            const currentPowers = ensureLineagePowersArray(build.lineage.powers);

            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                lineage: {
                    ...build.lineage,
                    key,
                    // Reset reveal when switching lineages
                    revealMechanics: key ? build.lineage.revealMechanics : false,
                    powers: sameLineage ? currentPowers : []
                }
            };

            return {
                ...state,
                builds: {
                    ...state.builds,
                    [activeBuildId]: updatedBuild
                }
            };
        });
        analytics.track('lineage.selected', { lineage: key });
    },

    toggleLineageReveal: () => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                lineage: {
                    ...build.lineage,
                    revealMechanics: !build.lineage.revealMechanics
                }
            };

            return {
                ...state,
                builds: {
                    ...state.builds,
                    [activeBuildId]: updatedBuild
                }
            };
        });
        analytics.track('lineage.reveal_toggled', {});
    },

    updateLineageNotes: (notes) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                lineage: { ...build.lineage, notes }
            };

            return {
                ...state,
                builds: {
                    ...state.builds,
                    [activeBuildId]: updatedBuild
                }
            };
        });
    },

    toggleLineagePower: (selection) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            if (!build.lineage.key || build.lineage.key !== selection.lineage) {
                return state;
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
            } else {
                // ADDING POWER LOGIC
                if (isEsper) {
                    const meta = selection.meta ?? {};
                    const category = meta.category;

                    // Allow foundational choices (polarity/scope) without validation
                    if (selection.kind === 'esper-framework-choice') {
                        // No validation needed for foundational selections
                    } else if (selection.kind === 'esper-archetype') {
                        if (category === 'esper-base' && lineagePriority === 'C') {
                            return state;
                        }
                        if (category === 'esper-mentalist' && !(lineagePriority === 'A' || lineagePriority === 'C')) {
                            return state;
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
                                return state;
                            }
                            const depthLimit = getEsperDepthLimit(lineagePriority);
                            const depth = meta.depth ?? 0;
                            if (depth > depthLimit) {
                                return state;
                            }
                            const hasBase = powers.some(
                                (entry) => entry.kind === 'esper-archetype' && entry.meta?.root === root
                            );
                            if (!hasBase) {
                                return state;
                            }
                        }
                    }
                }

                // VALIDATION: Prevent exceeding limits before adding selection

                // NeoSapien slot validation
                if (selection.lineage === 'neosapien') {
                    const SLOT_LIMITS: Record<PriorityRank, number> = { A: 9, B: 7, C: 6, D: 4, E: 2 };
                    const slotLimit = lineagePriority ? SLOT_LIMITS[lineagePriority as PriorityRank] : 0;
                    const currentSlots = powers.reduce((sum, entry) => sum + (entry.meta?.slots ?? 0), 0);
                    const newSlots = selection.meta?.slots ?? 0;
                    if (slotLimit > 0 && currentSlots + newSlots > slotLimit) {
                        return state; // Block selection - would exceed limit
                    }
                }

                // Chimera mutation point validation
                if (selection.lineage === 'chimera') {
                    const MUTATION_LIMITS: Record<PriorityRank, number> = { A: 7, B: 5, C: 4, D: 3, E: 2 };
                    const mutationLimit = lineagePriority ? MUTATION_LIMITS[lineagePriority as PriorityRank] : 0;
                    const currentPoints = powers.reduce((sum, entry) => sum + (entry.meta?.mutationPoints ?? 0), 0);
                    const newPoints = selection.meta?.mutationPoints ?? 0;
                    if (mutationLimit > 0 && currentPoints + newPoints > mutationLimit) {
                        return state; // Block selection - would exceed limit
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
                    const limits = lineagePriority ? SORCERY_LIMITS[lineagePriority as PriorityRank] : { primary: 0, secondary: 0, moves: 0 };

                    const primaryCount = powers.filter((entry) => entry.kind === 'sorcery-sphere-primary').length;
                    const secondaryCount = powers.filter((entry) => entry.kind === 'sorcery-sphere-secondary').length;
                    const moveCount = powers.filter((entry) => entry.kind === 'sorcery-move').length;

                    if (selection.kind === 'sorcery-sphere-primary' && primaryCount >= limits.primary) {
                        return state; // Block selection - would exceed primary sphere limit
                    }
                    if (selection.kind === 'sorcery-sphere-secondary' && secondaryCount >= limits.secondary) {
                        return state; // Block selection - would exceed secondary sphere limit
                    }
                    if (selection.kind === 'sorcery-move' && moveCount >= limits.moves) {
                        return state; // Block selection - would exceed move limit
                    }
                }

                powers = [...powers, selection];
            }

            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                lineage: {
                    ...build.lineage,
                    powers
                }
            };

            return {
                ...state,
                builds: {
                    ...state.builds,
                    [activeBuildId]: updatedBuild
                }
            };
        });
        analytics.track('lineage.power_toggled', { id: selection.id, lineage: selection.lineage });
    },

    clearLineagePowers: () => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                lineage: {
                    ...build.lineage,
                    powers: []
                }
            };

            return {
                ...state,
                builds: {
                    ...state.builds,
                    [activeBuildId]: updatedBuild
                }
            };
        });
        analytics.track('lineage.powers_cleared', {});
    }
});
