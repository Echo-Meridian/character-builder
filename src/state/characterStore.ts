import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createLineageSlice, LineageSlice } from './slices/lineageSlice';
import { createResourcesSlice, ResourcesSlice } from './slices/resourcesSlice';
import { createBackgroundSlice, BackgroundSlice } from './slices/backgroundSlice';
import { createSkillsSlice, SkillsSlice } from './slices/skillsSlice';
import { createAttributesSlice, AttributesSlice } from './slices/attributesSlice';
import { createNarrativeSlice, NarrativeSlice } from './slices/narrativeSlice';
import { createMetaSlice, MetaSlice } from './slices/metaSlice';

// Re-export types for consumers
export * from './slices/types';

export type CharacterStore = MetaSlice &
  LineageSlice &
  ResourcesSlice &
  BackgroundSlice &
  SkillsSlice &
  AttributesSlice &
  NarrativeSlice;

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (...a) => ({
      ...createMetaSlice(...a),
      ...createLineageSlice(...a),
      ...createResourcesSlice(...a),
      ...createBackgroundSlice(...a),
      ...createSkillsSlice(...a),
      ...createAttributesSlice(...a),
      ...createNarrativeSlice(...a),
    }),
    {
      name: 'sidonia-character-storage-v6',
      partialize: (state) => ({
        builds: state.builds,
        activeBuildId: state.activeBuildId,
      }),
    }
  )
);
