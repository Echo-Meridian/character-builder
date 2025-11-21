import { StateCreator } from 'zustand';
import type { CharacterStore } from '../characterStore';
import { ContactResourceEntry, RetainerResourceEntry, PropertyResourceEntry, GoodsResourceEntry } from './types';
import { createId } from '../../utils/id';
import { analytics } from '../../utils/analytics';

export interface ResourcesSlice {
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
    resetResources: () => void;
}

export const createResourcesSlice: StateCreator<CharacterStore, [], [], ResourcesSlice> = (set, get) => ({
    addContactResource: (payload = {}) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

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

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                resources: {
                    ...build.resources,
                    contacts: [...build.resources.contacts, entry]
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
        analytics.track('resources.contact_added', {});
    },

    updateContactResource: (id, changes) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
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
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    removeContactResource: (id) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                resources: {
                    ...build.resources,
                    contacts: build.resources.contacts.filter((entry) => entry.id !== id)
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    addRetainerResource: (payload = {}) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

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

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                resources: {
                    ...build.resources,
                    retainers: [...build.resources.retainers, entry]
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
        analytics.track('resources.retainer_added', {});
    },

    updateRetainerResource: (id, changes) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                resources: {
                    ...build.resources,
                    retainers: build.resources.retainers.map((entry) =>
                        entry.id === id
                            ? {
                                ...entry,
                                ...changes,
                                loyalty: changes.loyalty !== undefined ? Math.min(Math.max(changes.loyalty, 0), 10) : entry.loyalty,
                                competence:
                                    changes.competence !== undefined ? Math.min(Math.max(changes.competence, 0), 10) : entry.competence
                            }
                            : entry
                    )
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    removeRetainerResource: (id) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                resources: {
                    ...build.resources,
                    retainers: build.resources.retainers.filter((entry) => entry.id !== id)
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    addPropertyResource: (payload = {}) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

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

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                resources: {
                    ...build.resources,
                    properties: [...build.resources.properties, entry]
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
        analytics.track('resources.property_added', {});
    },

    updatePropertyResource: (id, changes) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                resources: {
                    ...build.resources,
                    properties: build.resources.properties.map((entry) => (entry.id === id ? { ...entry, ...changes } : entry))
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    removePropertyResource: (id) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                resources: {
                    ...build.resources,
                    properties: build.resources.properties.filter((entry) => entry.id !== id)
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    addGoodsResource: (payload = {}) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        const entry: GoodsResourceEntry = {
            id: createId('goods'),
            name: payload.name ?? '',
            description: payload.description ?? '',
            gmApproved: payload.gmApproved ?? false,
            backgroundSynergy: payload.backgroundSynergy ?? false,
            specialization: payload.specialization ?? null,
            quality: Math.min(Math.max(payload.quality ?? 0, 0), 10)
        };

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                resources: {
                    ...build.resources,
                    goods: [...build.resources.goods, entry]
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
        analytics.track('resources.goods_added', {});
    },

    updateGoodsResource: (id, changes) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
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
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    removeGoodsResource: (id) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                resources: {
                    ...build.resources,
                    goods: build.resources.goods.filter((entry) => entry.id !== id)
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    setResourceLiquid: (value) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                resources: { ...build.resources, liquid: value }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    updateResourceNotes: (notes) => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                resources: { ...build.resources, notes }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    },

    resetResources: () => {
        const { activeBuildId, builds } = get();
        if (!activeBuildId || !builds[activeBuildId]) return;

        set((state) => {
            const build = state.builds[activeBuildId];
            const updatedBuild = {
                ...build,
                updatedAt: new Date().toISOString(),
                resources: {
                    contacts: [],
                    retainers: [],
                    properties: [],
                    goods: [],
                    liquid: 0,
                    notes: ''
                }
            };
            return { ...state, builds: { ...state.builds, [activeBuildId]: updatedBuild } };
        });
    }
});
