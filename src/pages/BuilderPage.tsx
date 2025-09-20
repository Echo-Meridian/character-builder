import { useEffect, useMemo, type ReactNode } from 'react';
import { useCharacterData } from '../data/DataContext';
import { getLineageDefinition } from '../data/lineages';
import { CharacterProfileCard } from '../components/builder/CharacterProfileCard';
import { StageNavigation } from '../components/builder/StageNavigation';
import { PriorityStage } from '../components/builder/stages/PriorityStage';
import { LineageStage } from '../components/builder/stages/LineageStage';
import { ResourcesStage } from '../components/builder/stages/ResourcesStage';
import { BackgroundStage } from '../components/builder/stages/BackgroundStage';
import { SkillsStage } from '../components/builder/stages/SkillsStage';
import { AttributesStage } from '../components/builder/stages/AttributesStage';
import { NarrativeStage } from '../components/builder/stages/NarrativeStage';
import {
  useCharacterStore,
  type PriorityCategory,
  type AttributeKey,
  type BodyLocationKey
} from '../state/characterStore';
import { useSessionStore } from '../state/sessionStore';
import type { LineageKey, PriorityRank } from '../data/types';
import '../styles/builder.css';

export function BuilderPage() {
  const { data } = useCharacterData();
  const ensureActiveBuild = useCharacterStore((state) => state.ensureActiveBuild);
  const build = useCharacterStore((state) => (state.activeBuildId ? state.builds[state.activeBuildId] : null));

  const setStage = useCharacterStore((state) => state.setStage);
  const updateProfile = useCharacterStore((state) => state.updateProfile);
  const assignPriority = useCharacterStore((state) => state.assignPriority);
  const selectLineage = useCharacterStore((state) => state.selectLineage);
  const toggleLineageReveal = useCharacterStore((state) => state.toggleLineageReveal);
  const updateLineageNotes = useCharacterStore((state) => state.updateLineageNotes);
  const setResourceAllocation = useCharacterStore((state) => state.setResourceAllocation);
  const updateResourceNotes = useCharacterStore((state) => state.updateResourceNotes);
  const updateBackground = useCharacterStore((state) => state.updateBackground);
  const setSkillFocus = useCharacterStore((state) => state.setSkillFocus);
  const updateSkillNotes = useCharacterStore((state) => state.updateSkillNotes);
  const setAttributeScore = useCharacterStore((state) => state.setAttributeScore);
  const updateAttributeNotes = useCharacterStore((state) => state.updateAttributeNotes);
  const adjustExperience = useCharacterStore((state) => state.adjustExperience);
  const setExperience = useCharacterStore((state) => state.setExperience);
  const updateAdvancement = useCharacterStore((state) => state.updateAdvancement);
  const adjustCorruption = useCharacterStore((state) => state.adjustCorruption);
  const setCorruption = useCharacterStore((state) => state.setCorruption);
  const updateCorruptionNotes = useCharacterStore((state) => state.updateCorruptionNotes);
  const adjustHealth = useCharacterStore((state) => state.adjustHealth);
  const setHealth = useCharacterStore((state) => state.setHealth);
  const updateHealthScar = useCharacterStore((state) => state.updateHealthScar);
  const addRelationship = useCharacterStore((state) => state.addRelationship);
  const removeRelationship = useCharacterStore((state) => state.removeRelationship);
  const updateAnchors = useCharacterStore((state) => state.updateAnchors);
  const updateNarrativeNotes = useCharacterStore((state) => state.updateNarrativeNotes);
  const gmUnlocked = useSessionStore((state) => state.gmUnlocked);

  useEffect(() => {
    ensureActiveBuild();
  }, [ensureActiveBuild]);

  const lineageDefinition = useMemo(() => getLineageDefinition(build?.lineage.key ?? null), [build?.lineage.key]);

  if (!data || !build) {
    return null;
  }

  const selectedPowerSet = build.lineage.key ? data.powerSets?.[build.lineage.key] : undefined;

  const handlePrioritySelect = (category: PriorityCategory, rank: PriorityRank) => assignPriority(category, rank);
  const handlePriorityClear = (category: PriorityCategory) => assignPriority(category, null);

  let stageContent: ReactNode;

  switch (build.stage) {
    case 'priorities':
      stageContent = (
        <PriorityStage priorities={build.priorities} onSelect={handlePrioritySelect} onClear={handlePriorityClear} />
      );
      break;
    case 'lineage':
      stageContent = (
        <LineageStage
          priorities={build.priorities}
          selected={build.lineage.key}
          onSelect={(key: LineageKey) => selectLineage(key)}
          canReveal={gmUnlocked}
          revealMechanics={build.lineage.revealMechanics}
          onToggleReveal={toggleLineageReveal}
          notes={build.lineage.notes}
          onUpdateNotes={updateLineageNotes}
          powerSet={selectedPowerSet}
        />
      );
      break;
    case 'resources':
      stageContent = (
        <ResourcesStage
          priority={build.priorities.resources}
          system={data.resources}
          costs={data.resourceCosts}
          allocations={build.resources.allocations}
          onAllocationChange={setResourceAllocation}
          notes={build.resources.notes}
          onUpdateNotes={updateResourceNotes}
        />
      );
      break;
    case 'background':
      stageContent = (
        <BackgroundStage
          priority={build.priorities.background}
          background={build.background}
          onUpdate={updateBackground}
          data={data.backgrounds}
        />
      );
      break;
    case 'skills':
      stageContent = (
        <SkillsStage
          priority={build.priorities.skills}
          data={data.skills}
          focus={build.skills.focus}
          onUpdateFocus={setSkillFocus}
          notes={build.skills.notes}
          onUpdateNotes={updateSkillNotes}
        />
      );
      break;
    case 'attributes':
      stageContent = (
        <AttributesStage
          priority={build.priorities.attributes}
          scores={build.attributes.scores}
          onUpdateScore={(attribute: AttributeKey, value: number) => setAttributeScore(attribute, value)}
          notes={build.attributes.notes}
          onUpdateNotes={updateAttributeNotes}
          data={data.attributes}
        />
      );
      break;
    case 'narrative':
      stageContent = (
        <NarrativeStage
          corruption={build.corruption}
          onAdjustCorruption={adjustCorruption}
          onSetCorruption={setCorruption}
          onUpdateCorruptionNotes={updateCorruptionNotes}
          advancement={build.advancement}
          onAdjustExperience={adjustExperience}
          onSetExperience={setExperience}
          onUpdateAdvancement={updateAdvancement}
          health={build.health}
          onAdjustHealth={(location: BodyLocationKey, delta: number) => adjustHealth(location, delta)}
          onSetHealth={(location: BodyLocationKey, value: number) => setHealth(location, value)}
          onUpdateScar={(location: BodyLocationKey, scar: string) => updateHealthScar(location, scar)}
          narrative={build.narrative}
          onAddRelationship={addRelationship}
          onRemoveRelationship={removeRelationship}
          onUpdateAnchors={updateAnchors}
          onUpdateNarrativeNotes={updateNarrativeNotes}
        />
      );
      break;
    default:
      stageContent = null;
  }

  const builderStyle: React.CSSProperties | undefined = lineageDefinition
    ? {
        '--lineage-accent': lineageDefinition.aesthetic.accent,
        '--lineage-glow': lineageDefinition.aesthetic.glow
      } as React.CSSProperties
    : undefined;

  return (
    <div className="builder-screen" style={builderStyle}>
      <CharacterProfileCard build={build} onUpdate={updateProfile} />
      <StageNavigation current={build.stage} onNavigate={setStage} />
      {stageContent}
    </div>
  );
}
