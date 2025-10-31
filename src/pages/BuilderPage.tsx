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
  const toggleLineagePower = useCharacterStore((state) => state.toggleLineagePower);
  const clearLineagePowers = useCharacterStore((state) => state.clearLineagePowers);
  const updateResourceNotes = useCharacterStore((state) => state.updateResourceNotes);
  const updateBackground = useCharacterStore((state) => state.updateBackground);
  const addContactResource = useCharacterStore((state) => state.addContactResource);
  const updateContactResource = useCharacterStore((state) => state.updateContactResource);
  const removeContactResource = useCharacterStore((state) => state.removeContactResource);
  const addRetainerResource = useCharacterStore((state) => state.addRetainerResource);
  const updateRetainerResource = useCharacterStore((state) => state.updateRetainerResource);
  const removeRetainerResource = useCharacterStore((state) => state.removeRetainerResource);
  const addPropertyResource = useCharacterStore((state) => state.addPropertyResource);
  const updatePropertyResource = useCharacterStore((state) => state.updatePropertyResource);
  const removePropertyResource = useCharacterStore((state) => state.removePropertyResource);
  const addGoodsResource = useCharacterStore((state) => state.addGoodsResource);
  const updateGoodsResource = useCharacterStore((state) => state.updateGoodsResource);
  const removeGoodsResource = useCharacterStore((state) => state.removeGoodsResource);
  const setResourceLiquid = useCharacterStore((state) => state.setResourceLiquid);
  const setSkillRating = useCharacterStore((state) => state.setSkillRating);
  const toggleSkillSpecialization = useCharacterStore((state) => state.toggleSkillSpecialization);
  const removeSkillSpecialization = useCharacterStore((state) => state.removeSkillSpecialization);
  const addCustomSkillSpecialization = useCharacterStore((state) => state.addCustomSkillSpecialization);
  const setBackgroundSkillSpecialization = useCharacterStore((state) => state.setBackgroundSkillSpecialization);
  const updateSkillNotes = useCharacterStore((state) => state.updateSkillNotes);
  const setAttributeScore = useCharacterStore((state) => state.setAttributeScore);
  const updateAttributeNotes = useCharacterStore((state) => state.updateAttributeNotes);
  const toggleAttributeSpecialization = useCharacterStore((state) => state.toggleAttributeSpecialization);
  const resetActiveBuild = useCharacterStore((state) => state.resetActiveBuild);
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

  const lineagePowers = Array.isArray(build.lineage.powers) ? build.lineage.powers : [];
  const selectedPowerSet = build.lineage.key ? data.powerSets?.[build.lineage.key] : undefined;
  const backgroundTemplate = build.background.title ? data.backgrounds[build.background.title] : undefined;
  const backgroundSkillOptions = Array.isArray(backgroundTemplate?.skillSpecializationOptions)
    ? backgroundTemplate!.skillSpecializationOptions
    : [];

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
          powers={lineagePowers}
          onTogglePower={toggleLineagePower}
          onClearPowers={clearLineagePowers}
        />
      );
      break;
    case 'resources':
      stageContent = (
        <ResourcesStage
          priority={build.priorities.resources}
          system={data.resources}
          costs={data.resourceCosts}
          contacts={build.resources.contacts}
          retainers={build.resources.retainers}
          properties={build.resources.properties}
          goods={build.resources.goods}
          liquid={build.resources.liquid}
          onAddContact={addContactResource}
          onUpdateContact={updateContactResource}
          onRemoveContact={removeContactResource}
          onAddRetainer={addRetainerResource}
          onUpdateRetainer={updateRetainerResource}
          onRemoveRetainer={removeRetainerResource}
          onAddProperty={addPropertyResource}
          onUpdateProperty={updatePropertyResource}
          onRemoveProperty={removePropertyResource}
          onAddGoods={addGoodsResource}
          onUpdateGoods={updateGoodsResource}
          onRemoveGoods={removeGoodsResource}
          onUpdateLiquid={setResourceLiquid}
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
          ratings={build.skills.ratings}
          onChangeRating={setSkillRating}
          specializations={build.skills.specializations}
          onToggleSpecialization={toggleSkillSpecialization}
          onRemoveSpecialization={removeSkillSpecialization}
          onAddCustomSpecialization={addCustomSkillSpecialization}
          backgroundSpecialization={build.skills.backgroundSpecialization}
          backgroundOptions={backgroundSkillOptions}
          onSetBackgroundSpecialization={setBackgroundSkillSpecialization}
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
          selectedSpecializations={build.attributes.specializations}
          onToggleSpecialization={toggleAttributeSpecialization}
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
    <div
      className="min-h-screen px-deco-md py-deco-lg space-y-deco-lg relative"
      style={builderStyle}
    >
      {/* Lineage-specific background glow */}
      {lineageDefinition && (
        <div
          className="absolute inset-0 opacity-40 pointer-events-none -z-10"
          style={{
            background: lineageDefinition.aesthetic.glow ||
              'radial-gradient(circle at 10% 10%, rgba(212, 175, 55, 0.1), transparent 65%)'
          }}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-deco-lg">
        <div className="mb-deco-xl">
          <CharacterProfileCard build={build} onUpdate={updateProfile} />
        </div>

        <div className="flex justify-end mb-deco-lg">
          <button
            type="button"
            onClick={resetActiveBuild}
            className="px-deco-md py-2 rounded-full border-2 border-sidonia-gold/60
                     bg-sidonia-dark text-sidonia-text hover:border-sidonia-gold
                     font-body text-xs uppercase tracking-wider transition-all duration-300
                     hover:bg-sidonia-gold/5"
          >
            Reset Character
          </button>
        </div>

        <div className="mb-deco-xl">
          <StageNavigation current={build.stage} onNavigate={setStage} />
        </div>

        <div className="stage">
          {stageContent}
        </div>
      </div>
    </div>
  );
}
