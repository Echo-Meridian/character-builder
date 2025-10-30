import { useMemo } from 'react';
import type { LineageKey, PriorityRank, RawLineagePowerData } from '../../data/types';
import type { LineagePowerSelection } from '../../state/characterStore';
import './lineage-powers.css';

interface LineagePowersPanelProps {
  lineage: LineageKey | null;
  powerData?: RawLineagePowerData;
  gmEnabled: boolean;
  lineagePriority: PriorityRank | null;
  selections: LineagePowerSelection[];
  onToggleSelection: (selection: LineagePowerSelection) => void;
  onClearSelections: () => void;
}

const NEOSAPIEN_SLOT_LIMIT: Record<PriorityRank, number> = {
  A: 9,
  B: 7,
  C: 6,
  D: 4,
  E: 2
};

const CHIMERA_MUTATION_LIMIT: Record<PriorityRank, number> = {
  A: 7,
  B: 5,
  C: 4,
  D: 3,
  E: 2
};

const SORCERY_LIMITS: Record<PriorityRank, { primary: number; secondary: number; moves: number; note?: string }> = {
  A: { primary: 1, secondary: 2, moves: 5 },
  B: { primary: 1, secondary: 1, moves: 4 },
  C: {
    primary: 1,
    secondary: 2,
    moves: 3,
    note: 'Priority C may exchange the primary sphere for a second secondary sphere.'
  },
  D: { primary: 0, secondary: 1, moves: 2 },
  E: { primary: 0, secondary: 1, moves: 1 }
};

const ESPER_DEPTH_LIMIT: Record<PriorityRank, number> = {
  A: 0, // Priority A gets Esper archetype + full Mentalist (no Esper evolution)
  B: 2,
  C: 2, // Mentalist only (Esper depth not relevant)
  D: 1,
  E: 0
};

const ESPER_NOTES: Record<PriorityRank, string> = {
  A: 'Priority A: Choose one Esper archetype (base only) and one Mentalist archetype with full framework.',
  B: 'Priority B: Esper prodigy – evolve two steps beyond the baseline.',
  C: 'Priority C: Begin as a Mentalist. Select framework paths to define focus.',
  D: 'Priority D: Gifted Esper – evolve one step beyond baseline talents.',
  E: 'Priority E: Base Esper talents unlocked.'
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const getPriorityValue = <T,>(record: Record<PriorityRank, T>, priority: PriorityRank | null, fallback: T): T =>
  priority ? record[priority] : fallback;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

interface PowerDescription {
  short?: string;
  player?: string;
  flaw?: string;
  gm?: string;
  outcomes?: Record<string, string>;
  cost?: string;
  [key: string]: unknown;
}

interface NeoSapienTier {
  id?: string;
  name?: string;
  tier?: number;
  slots?: number;
  permanentCorruption?: number;
  description?: PowerDescription;
}

interface NeoSapienPower {
  id?: string;
  name?: string;
  type?: string;
  category?: string;
  tiers: Record<string, NeoSapienTier>;
}

interface NeoSapienData extends RawLineagePowerData {
  powers: NeoSapienPower[];
}

interface ChimeraTier {
  id?: string;
  name?: string;
  tier?: number;
  mutationPoints?: number;
  permanentCorruption?: number;
  description?: PowerDescription;
}

interface ChimeraPower {
  id?: string;
  name?: string;
  category?: string;
  tags?: string[];
  tiers: Record<string, ChimeraTier>;
}

interface ChimeraData extends RawLineagePowerData {
  powers: ChimeraPower[];
}

// New unified power structure
interface UnifiedPower {
  type?: string;
  id?: string;
  name?: string;
  lineage?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  description?: PowerDescription;
  outcomes?: Record<string, string>;
  effects?: unknown[];
  flaws?: unknown[];
  // Sorcery-specific
  sphere?: string;
  sphereTier?: string;
  moveType?: string;
  rollStat?: string;
  // Esper-specific
  archetype?: string;
  path?: string;
  evolutionStage?: number;
  permanentCorruption?: number;
  // Automata-specific
  chassis?: string;
  branch?: string;
  augmentLevel?: string;
  cost?: number;
}

interface SorceryData extends RawLineagePowerData {
  powers: UnifiedPower[];
}

interface EsperData extends RawLineagePowerData {
  powers: UnifiedPower[];
}

interface AutomataData extends RawLineagePowerData {
  powers: UnifiedPower[];
}

function isNeoSapienData(value: RawLineagePowerData): value is NeoSapienData {
  const maybe = value as Partial<NeoSapienData>;
  return Array.isArray(maybe.powers) && maybe.powers.some((power) => power && typeof power === 'object' && 'tiers' in power);
}

function isChimeraData(value: RawLineagePowerData): value is ChimeraData {
  const maybe = value as Partial<ChimeraData>;
  return Array.isArray(maybe.powers) && maybe.powers.some((power) => power && typeof power === 'object' && 'tiers' in power);
}

function isSorceryData(value: RawLineagePowerData): value is SorceryData {
  const maybe = value as Partial<SorceryData>;
  return Array.isArray(maybe.powers) && maybe.powers.some((power) => power && typeof power === 'object' && 'sphere' in power);
}

function isEsperData(value: RawLineagePowerData): value is EsperData {
  const maybe = value as Partial<EsperData>;
  return Array.isArray(maybe.powers) && maybe.powers.some((power) => power && typeof power === 'object' && 'archetype' in power);
}

function isAutomataData(value: RawLineagePowerData): value is AutomataData {
  const maybe = value as Partial<AutomataData>;
  return Array.isArray(maybe.powers) && maybe.powers.some((power) => power && typeof power === 'object' && 'chassis' in power);
}

function renderDescription(description: PowerDescription | undefined, gmEnabled: boolean) {
  if (!description) return null;
  return (
    <div className="power-description">
      {description.short && <p>{description.short}</p>}
      {gmEnabled && description.player && <p className="power-description__detail">{description.player}</p>}
      {description.flaw && <p className="power-description__detail power-description__flaw">Flaw: {description.flaw}</p>}
      {description.outcomes && (
        <ul className="power-description__outcomes">
          {Object.entries(description.outcomes).map(([key, value]) => (
            <li key={key}>
              <strong>{key}</strong>
              <span>{value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// renderCapabilities function removed - no longer needed with simplified Automata rendering

interface AbilityEntry {
  id: string;
  name: string;
  type?: string;
  description?: string;
  cost?: string;
  duration?: string;
  scope?: string;
}

interface AbilityGroups {
  moves: AbilityEntry[];
  augments: AbilityEntry[];
  other: AbilityEntry[];
}

interface OutcomeEntry {
  label: string;
  result: string;
}

interface ConsequenceEntry {
  id: string;
  roll?: number;
  result?: string;
}

const toTitleCase = (value: string) =>
  value
    .split(/[-_\s]/)
    .filter((segment) => segment.length > 0)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

function normalizeAbilityCollection(value: unknown): UnknownRecord[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is UnknownRecord => isRecord(entry));
  }
  if (isRecord(value)) {
    return [value];
  }
  return [];
}

function createAbilityEntries(records: UnknownRecord[], baseId: string): AbilityEntry[] {
  return records.map((record, index) => {
    const fallbackId = `${baseId}-${index}`;
    const id = typeof record.id === 'string' && record.id.length > 0 ? record.id : fallbackId;
    const name = typeof record.name === 'string' && record.name.length > 0 ? record.name : `Ability ${index + 1}`;
    const type = typeof record.type === 'string' && record.type.length > 0 ? record.type : undefined;
    const description = typeof record.description === 'string' && record.description.length > 0 ? record.description : undefined;
    const cost = typeof record.cost === 'string' && record.cost.length > 0 ? record.cost : undefined;
    const duration = typeof record.duration === 'string' && record.duration.length > 0 ? record.duration : undefined;
    const scope = typeof record.scope === 'string' && record.scope.length > 0 ? record.scope : undefined;
    return { id, name, type, description, cost, duration, scope } satisfies AbilityEntry;
  });
}

function groupAbilities(entries: AbilityEntry[]): AbilityGroups {
  return entries.reduce<AbilityGroups>(
    (acc, entry) => {
      const type = entry.type?.toLowerCase();
      if (type === 'move') {
        acc.moves.push(entry);
      } else if (type === 'augment') {
        acc.augments.push(entry);
      } else {
        acc.other.push(entry);
      }
      return acc;
    },
    { moves: [], augments: [], other: [] }
  );
}

type PolarityType = 'receiver' | 'influencer';
type ScopeType = 'aural' | 'targeted';

const POLARITY_KEY_TO_TYPE: Partial<Record<string, PolarityType>> = {
  receiver_all: 'receiver',
  influencer_all: 'influencer'
};

const SCOPE_KEY_TO_DESCRIPTOR: Partial<Record<string, { scope: ScopeType; polarity: PolarityType }>> = {
  aural_receiver: { scope: 'aural', polarity: 'receiver' },
  aural_influencer: { scope: 'aural', polarity: 'influencer' },
  targeted_receiver: { scope: 'targeted', polarity: 'receiver' },
  targeted_influencer: { scope: 'targeted', polarity: 'influencer' }
};

const POLARITY_FRAMEWORK_GROUPS: Record<PolarityType, string[]> = {
  receiver: ['receiver_all', 'aural_receiver', 'targeted_receiver'],
  influencer: ['influencer_all', 'aural_influencer', 'targeted_influencer']
};

const SCOPE_FRAMEWORK_GROUPS: Record<ScopeType, string[]> = {
  aural: ['aural_receiver', 'aural_influencer'],
  targeted: ['targeted_receiver', 'targeted_influencer']
};

const GROUP_REQUIREMENTS: Record<string, string> = {
  receiver_all: 'Requires Receiver configuration.',
  influencer_all: 'Requires Influencer configuration.',
  aural_receiver: 'Requires Receiver configuration and Aural scope.',
  aural_influencer: 'Requires Influencer configuration and Aural scope.',
  targeted_receiver: 'Requires Receiver configuration and Targeted scope.',
  targeted_influencer: 'Requires Influencer configuration and Targeted scope.'
};

interface MentalistChoiceGroup {
  key: string;
  label: string;
  abilities: AbilityEntry[];
}

interface MentalistChoiceCollection {
  general: MentalistChoiceGroup[];
  polarity: Partial<Record<PolarityType, MentalistChoiceGroup>>;
  scope: Record<ScopeType, Partial<Record<PolarityType, MentalistChoiceGroup>>>;
}

const createEmptyChoiceCollection = (): MentalistChoiceCollection => ({
  general: [],
  polarity: {},
  scope: {
    aural: {},
    targeted: {}
  }
});

const inferPolarityFromSelection = (selection: LineagePowerSelection | undefined): PolarityType | null => {
  if (!selection) return null;
  const candidates = [selection.meta?.path?.[3], selection.id, selection.label]
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.toLowerCase());
  if (candidates.some((value) => value.includes('receiver'))) {
    return 'receiver';
  }
  if (candidates.some((value) => value.includes('influencer'))) {
    return 'influencer';
  }
  return null;
};

const inferScopeFromSelection = (selection: LineagePowerSelection | undefined): ScopeType | null => {
  if (!selection) return null;
  const candidates = [selection.meta?.path?.[3], selection.id, selection.label]
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.toLowerCase());
  if (candidates.some((value) => value.includes('aural'))) {
    return 'aural';
  }
  if (candidates.some((value) => value.includes('targeted'))) {
    return 'targeted';
  }
  return null;
};

function renderAbilitySection(
  title: string,
  abilities: AbilityEntry[],
  headingLevel: 'h4' | 'h5' | 'h6' = 'h5',
  key?: string
) {
  if (abilities.length === 0) return null;
  const HeadingTag = headingLevel;
  return (
    <section className="lineage-power-subsection" key={key}>
      <HeadingTag>{title}</HeadingTag>
      <ul className="power-list">
        {abilities.map((ability) => (
          <li key={ability.id} className="power-list__item">
            <div>
              <strong>{ability.name}</strong>
              {ability.type && <span className="badge badge--type">{toTitleCase(ability.type)}</span>}
              {ability.cost && <span className="badge badge--cost">{ability.cost}</span>}
              {ability.duration && <span className="badge">{ability.duration}</span>}
              {ability.scope && <span className="badge">{ability.scope}</span>}
            </div>
            {ability.description && <p>{ability.description}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function mapOutcomeEntries(raw: unknown): OutcomeEntry[] {
  if (!isRecord(raw)) return [];
  return Object.entries(raw)
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
    .map(([label, result]) => ({ label, result }));
}

function mapConsequenceEntries(raw: unknown, baseId: string): ConsequenceEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((entry): entry is UnknownRecord => isRecord(entry))
    .map((entry, index) => {
      const fallbackId = `${baseId}-${index}`;
      const roll = typeof entry.roll === 'number' ? entry.roll : undefined;
      const result = typeof entry.result === 'string' ? entry.result : undefined;
      const id = typeof entry.id === 'string' && entry.id.length > 0 ? entry.id : fallbackId;
      return { id, roll, result } satisfies ConsequenceEntry;
    });
}

export function LineagePowersPanel({
  lineage,
  powerData,
  gmEnabled,
  lineagePriority,
  selections,
  onToggleSelection,
  onClearSelections
}: LineagePowersPanelProps) {
  if (!lineage) {
    return (
      <section className="lineage-powers-panel">
        <h3>Lineage Powers</h3>
        <p>Select a lineage to preview its signature powers, moves, and upgrades.</p>
      </section>
    );
  }

  if (!powerData) {
    return (
      <section className="lineage-powers-panel">
        <h3>Lineage Powers</h3>
        <p>Power data for this lineage is not yet available.</p>
      </section>
    );
  }

  const selectionsForLineage = selections.filter((entry) => entry.lineage === lineage);
  const selectionMap = useMemo(
    () => new Map<string, LineagePowerSelection>(selectionsForLineage.map((entry) => [entry.id, entry])),
    [selectionsForLineage]
  );
  const selectedIds = new Set(selectionsForLineage.map((entry) => entry.id));

  if (lineage === 'neosapien' && isNeoSapienData(powerData)) {
    const slotLimit = getPriorityValue(NEOSAPIEN_SLOT_LIMIT, lineagePriority, 0);
    const slotsUsed = selectionsForLineage.reduce((sum, entry) => sum + (entry.meta?.slots ?? 0), 0);
    const corruptionTotal = selectionsForLineage.reduce((sum, entry) => sum + (entry.meta?.permanentCorruption ?? 0), 0);
    const slotWarning = slotLimit > 0 && slotsUsed > slotLimit;

    // Handle tier selection with radio button behavior
    const handleNeoSapienTierSelection = (selection: LineagePowerSelection) => {
      const isSelected = selectedIds.has(selection.id);
      const rootId = selection.meta?.root;

      if (!isSelected && rootId) {
        // Deselect other tiers of the same power before selecting this one
        const otherTiersSelected = selectionsForLineage.filter(
          (entry) => entry.meta?.root === rootId && entry.id !== selection.id
        );
        otherTiersSelected.forEach((entry) => {
          onToggleSelection(entry);
        });
      }

      // Toggle the clicked tier
      onToggleSelection(selection);
    };

    return (
      <section className="lineage-powers-panel">
        <header>
          <h3>Augment Catalog</h3>
          <p>Slot-based upgrades ranging from street scraps to imperial artistry.</p>
        </header>
        <aside className="lineage-power-summary">
          <div>
            <span>Slots Used</span>
            <strong>
              {slotsUsed}
              {slotLimit ? ` / ${slotLimit}` : ''}
            </strong>
          </div>
          <div>
            <span>Permanent Corruption</span>
            <strong>{corruptionTotal}</strong>
          </div>
          {slotWarning && <p className="lineage-power-summary__warning">Slot budget exceeded. Adjust selections or raise lineage priority.</p>}
          {selectionsForLineage.length > 0 && (
            <button type="button" className="power-toggle power-toggle--clear" onClick={onClearSelections}>
              Clear selections
            </button>
          )}
        </aside>
        <div className="lineage-powers-grid">
          {powerData.powers.map((power) => {
            const rootId = power.id ?? slugify(power.name ?? 'augment');
            const shortDesc = power.tiers?.tier1?.description?.short ??
                             Object.values(power.tiers ?? {})[0]?.description?.short ??
                             'No description available';

            // Check if any tier of this power is selected
            const anyTierSelected = selectionsForLineage.some((entry) => entry.meta?.root === rootId);

            return (
              <details key={power.id ?? power.name} className={`lineage-power-card${anyTierSelected ? ' lineage-power-card--has-selection' : ''}`} open={anyTierSelected}>
                <summary>
                  <div className="lineage-power-card__summary">
                    <h4>{power.name}</h4>
                    <p className="lineage-power-card__short-desc">{shortDesc}</p>
                  </div>
                </summary>
                <div className="lineage-power-card__body">
                {Object.entries(power.tiers ?? {}).map(([tierKey, tier]) => {
                  const tierId = tier.id ?? `${rootId}-${slugify(tierKey)}`;
                  const tierNum = tier.tier ?? 1;
                  // NeoSapien costs: Slots = tier, Corruption = tier (1,2,3 pattern for both)
                  const selection: LineagePowerSelection = {
                    id: tierId,
                    lineage: 'neosapien',
                    label: `${power.name} — Tier ${tierNum}`,
                    kind: 'neosapien-augment',
                    meta: {
                      root: rootId,
                      parent: rootId,
                      path: [rootId, tierKey],
                      depth: 1,
                      slots: tierNum,
                      permanentCorruption: tierNum,
                      category: power.category,
                      tierLabel: `Tier ${tierNum}`
                    }
                  };
                  const isSelected = selectedIds.has(selection.id);
                  const tierClass = `lineage-power-tier${isSelected ? ' lineage-power-tier--selected' : ''}`;
                  const buttonClass = `power-toggle power-toggle--radio${isSelected ? ' power-toggle--active' : ''}`;

                  return (
                    <div key={tierId} className={tierClass}>
                      <div className="lineage-power-tier__header">
                        <div className="lineage-power-tier__info">
                          <span className="badge badge--tier">Tier {tierNum}</span>
                          <span className="lineage-power-tier__cost">
                            {tierNum} Slot{tierNum === 1 ? '' : 's'} · {tierNum} Corruption
                          </span>
                        </div>
                        <button
                          type="button"
                          className={buttonClass}
                          onClick={() => handleNeoSapienTierSelection(selection)}
                          aria-label={isSelected ? `Deselect Tier ${tierNum}` : `Select Tier ${tierNum}`}
                        >
                          {isSelected ? '●' : '○'}
                        </button>
                      </div>
                      {renderDescription(tier.description, gmEnabled)}
                    </div>
                  );
                })}
                </div>
              </details>
            );
          })}
        </div>
      </section>
    );
  }

  if (lineage === 'chimera' && isChimeraData(powerData)) {
    const mutationLimit = getPriorityValue(CHIMERA_MUTATION_LIMIT, lineagePriority, 0);
    const mutationUsed = selectionsForLineage.reduce((sum, entry) => sum + (entry.meta?.mutationPoints ?? 0), 0);
    const corruptionTotal = selectionsForLineage.reduce((sum, entry) => sum + (entry.meta?.permanentCorruption ?? 0), 0);
    const mutationWarning = mutationLimit > 0 && mutationUsed > mutationLimit;

    // Separate core mutations (all Chimera have these) from selectable mutations
    const coreMutations = powerData.powers.filter((power) => power.tags?.includes('core'));
    const selectableMutations = powerData.powers.filter((power) => !power.tags?.includes('core'));

    // Handle tier selection with radio button behavior
    const handleChimeraTierSelection = (selection: LineagePowerSelection) => {
      const isSelected = selectedIds.has(selection.id);
      const rootId = selection.meta?.root;

      if (!isSelected && rootId) {
        // Deselect other tiers of the same power before selecting this one
        const otherTiersSelected = selectionsForLineage.filter(
          (entry) => entry.meta?.root === rootId && entry.id !== selection.id
        );
        otherTiersSelected.forEach((entry) => {
          onToggleSelection(entry);
        });
      }

      // Toggle the clicked tier
      onToggleSelection(selection);
    };

    return (
      <section className="lineage-powers-panel">
        <header>
          <h3>Mutation Catalogue</h3>
          <p>Spend mutation points to embrace the city's wild ecologies.</p>
        </header>
        <aside className="lineage-power-summary">
          <div>
            <span>Mutation Points</span>
            <strong>
              {mutationUsed}
              {mutationLimit ? ` / ${mutationLimit}` : ''}
            </strong>
          </div>
          <div>
            <span>Permanent Corruption</span>
            <strong>{corruptionTotal}</strong>
          </div>
          {mutationWarning && <p className="lineage-power-summary__warning">Mutation budget exceeded. Remove selections or adjust priority.</p>}
          {selectionsForLineage.length > 0 && (
            <button type="button" className="power-toggle power-toggle--clear" onClick={onClearSelections}>
              Clear selections
            </button>
          )}
        </aside>

        {coreMutations.length > 0 && (
          <section className="lineage-core-mutations">
            <h4>Core Mutations — All Chimera Possess These</h4>
            <div className="lineage-core-mutations-list">
              {coreMutations.map((power) => {
                const shortDesc = power.tiers?.tier1?.description?.short ??
                                 Object.values(power.tiers ?? {})[0]?.description?.short ??
                                 'Core mutation';
                return (
                  <div key={power.id ?? power.name} className="core-mutation-card">
                    <h5>{power.name}</h5>
                    <p>{shortDesc}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="lineage-powers-grid">
          {selectableMutations.map((power) => {
            const rootId = power.id ?? slugify(power.name ?? 'mutation');
            const shortDesc = power.tiers?.tier1?.description?.short ??
                             Object.values(power.tiers ?? {})[0]?.description?.short ??
                             'No description available';

            // Check if any tier of this power is selected
            const anyTierSelected = selectionsForLineage.some((entry) => entry.meta?.root === rootId);

            return (
              <details key={power.id ?? power.name} className={`lineage-power-card${anyTierSelected ? ' lineage-power-card--has-selection' : ''}`} open={anyTierSelected}>
                <summary>
                  <div className="lineage-power-card__summary">
                    <h4>{power.name}</h4>
                    <p className="lineage-power-card__short-desc">{shortDesc}</p>
                  </div>
                </summary>
                <div className="lineage-power-card__body">
                {Object.entries(power.tiers ?? {}).map(([tierKey, tier]) => {
                  const tierId = tier.id ?? `${rootId}-${slugify(tierKey)}`;
                  const tierNum = tier.tier ?? 1;
                  // Chimera costs: MP = tier, Corruption = tier (1,2,3 pattern for both)
                  const selection: LineagePowerSelection = {
                    id: tierId,
                    lineage: 'chimera',
                    label: `${power.name} — Tier ${tierNum}`,
                    kind: 'chimera-mutation',
                    meta: {
                      root: rootId,
                      parent: rootId,
                      path: [rootId, tierKey],
                      depth: 1,
                      mutationPoints: tierNum,
                      permanentCorruption: tierNum,
                      category: power.category,
                      tierLabel: `Tier ${tierNum}`
                    }
                  };
                  const isSelected = selectedIds.has(selection.id);
                  const tierClass = `lineage-power-tier${isSelected ? ' lineage-power-tier--selected' : ''}`;
                  const buttonClass = `power-toggle power-toggle--radio${isSelected ? ' power-toggle--active' : ''}`;

                  return (
                    <div key={tierId} className={tierClass}>
                      <div className="lineage-power-tier__header">
                        <div className="lineage-power-tier__info">
                          <span className="badge badge--tier">Tier {tierNum}</span>
                          <span className="lineage-power-tier__cost">
                            {tierNum} MP · {tierNum} Corruption
                          </span>
                        </div>
                        <button
                          type="button"
                          className={buttonClass}
                          onClick={() => handleChimeraTierSelection(selection)}
                          aria-label={isSelected ? `Deselect Tier ${tierNum}` : `Select Tier ${tierNum}`}
                        >
                          {isSelected ? '●' : '○'}
                        </button>
                      </div>
                      {renderDescription(tier.description, gmEnabled)}
                    </div>
                  );
                })}
                </div>
              </details>
            );
          })}
        </div>
      </section>
    );
  }

  if (lineage === 'sorcery' && isSorceryData(powerData)) {
    const limits = getPriorityValue(SORCERY_LIMITS, lineagePriority, {
      primary: 0,
      secondary: 0,
      moves: 0
    });
    const primaryCount = selectionsForLineage.filter((entry) => entry.kind === 'sorcery-sphere-primary').length;
    const secondaryCount = selectionsForLineage.filter((entry) => entry.kind === 'sorcery-sphere-secondary').length;
    const moveCount = selectionsForLineage.filter((entry) => entry.kind === 'sorcery-move').length;
    const summaryNote = lineagePriority ? SORCERY_LIMITS[lineagePriority].note : undefined;

    // Track which spheres are selected
    const selectedSpheres = new Set(
      selectionsForLineage
        .filter((entry) => entry.kind === 'sorcery-sphere-primary' || entry.kind === 'sorcery-sphere-secondary')
        .map((entry) => entry.meta?.sphere)
        .filter((s): s is string => !!s)
    );

    // Handle sphere selection/deselection with cascade
    const handleSphereToggle = (selection: LineagePowerSelection) => {
      const isSelected = selectedIds.has(selection.id);
      const sphereName = selection.meta?.sphere;

      // If deselecting a sphere, also deselect all its moves
      if (isSelected && sphereName) {
        const movesInSphere = selectionsForLineage.filter(
          (entry) => entry.kind === 'sorcery-move' && entry.meta?.sphere === sphereName
        );
        movesInSphere.forEach((move) => {
          onToggleSelection(move);
        });
      }

      // Toggle the sphere itself
      onToggleSelection(selection);
    };

    // Sphere descriptions (TODO: Move these to JSON metadata)
    const sphereDescriptions: Record<string, string> = {
      'Creation': 'Manifest matter and energy from the Aether, bringing the unreal into reality.',
      'Destruction': 'Unmake and dissolve, returning solid form to primordial chaos.',
      'Transformation': 'Reshape existing matter, altering form and substance through will.',
      'Mind': 'Touch thoughts, memories, and the psyche of sentient beings.',
      'Time': 'Glimpse past and future, or stretch and compress the flow of moments.',
      'Space': 'Bend distance, fold reality, and traverse the impossible.',
      'Life': 'Mend flesh, accelerate growth, or drain vitality from the living.',
      'Death': 'Command spirits, commune with the departed, and channel entropic energies.',
      'Fate': 'Perceive probabilities, nudge destiny, and read the threads of chance.',
      'Protection': 'Weave wards and barriers against physical and supernatural threats.'
    };

    // Group powers by sphere and tier
    const spheresByTier = powerData.powers.reduce<Record<string, Record<string, UnifiedPower[]>>>((acc, power) => {
      const tier = power.sphereTier ?? 'unknown';
      const sphere = power.sphere ?? 'Unknown Sphere';
      if (!acc[tier]) acc[tier] = {};
      if (!acc[tier][sphere]) acc[tier][sphere] = [];
      acc[tier][sphere].push(power);
      return acc;
    }, {});

    return (
      <section className="lineage-powers-panel">
        <header>
          <h3>Sphere Library</h3>
          <p>Primary and secondary spheres unlock ritual moves and narrative permissions.</p>
        </header>
        <aside className="lineage-power-summary">
          <div>
            <span>Primary Spheres</span>
            <strong>
              {primaryCount}
              {limits.primary ? ` / ${limits.primary}` : ''}
            </strong>
          </div>
          <div>
            <span>Secondary Spheres</span>
            <strong>
              {secondaryCount}
              {limits.secondary ? ` / ${limits.secondary}` : ''}
            </strong>
          </div>
          <div>
            <span>Moves</span>
            <strong>
              {moveCount}
              {limits.moves ? ` / ${limits.moves}` : ''}
            </strong>
          </div>
          {summaryNote && <p className="lineage-power-summary__note">{summaryNote}</p>}
          {selectionsForLineage.length > 0 && (
            <button type="button" className="power-toggle power-toggle--clear" onClick={onClearSelections}>
              Clear selections
            </button>
          )}
        </aside>
        <div className="lineage-powers-columns">
          {['primary', 'secondary'].map((tier) => {
            const spheresInTier = spheresByTier[tier] ?? {};
            if (Object.keys(spheresInTier).length === 0) return null;
            return (
              <div key={tier} className="sphere-column">
                <h4 className="sphere-column__heading">{tier === 'primary' ? 'Primary Spheres' : 'Secondary Spheres'}</h4>
                {Object.entries(spheresInTier).map(([sphereName, powers]) => {
                  const sphereId = `${tier}-${slugify(sphereName)}`;
                  const kind = tier === 'primary' ? 'sorcery-sphere-primary' : 'sorcery-sphere-secondary';
                  const selection: LineagePowerSelection = {
                    id: sphereId,
                    lineage: 'sorcery',
                    label: `${tier === 'primary' ? 'Primary' : 'Secondary'} Sphere — ${sphereName}`,
                    kind,
                    meta: {
                      sphere: sphereName,
                      root: sphereId,
                      path: [sphereId],
                      depth: 0,
                      tierLabel: tier === 'primary' ? 'Primary Sphere' : 'Secondary Sphere'
                    }
                  };
                  const isSelected = selectedIds.has(selection.id);
                  const cardClass = `sphere-card${isSelected ? ' sphere-card--selected' : ''}`;
                  const toggleClass = `power-toggle${isSelected ? ' power-toggle--active' : ''}`;
                  const sphereDesc = sphereDescriptions[sphereName] || 'A sphere of sorcerous power.';
                  const sphereIsSelected = selectedSpheres.has(sphereName);
                  return (
                    <details key={sphereId} className={cardClass} open={isSelected}>
                      <summary>
                        <div className="sphere-card__summary">
                          <div>
                            <h5>{sphereName}</h5>
                            <p className="sphere-card__description">{sphereDesc}</p>
                          </div>
                          <button
                            type="button"
                            className={toggleClass}
                            onClick={(event) => {
                              event.preventDefault();
                              handleSphereToggle(selection);
                            }}
                          >
                            {isSelected ? 'Selected' : 'Select Sphere'}
                          </button>
                        </div>
                      </summary>
                      {!sphereIsSelected && (
                        <p className="sphere-prerequisite-message">Select this sphere to unlock its moves.</p>
                      )}
                      <ul className="power-list">
                        {powers.map((power) => {
                          const moveId = power.id ?? slugify(power.name ?? 'move');
                          const moveSelection: LineagePowerSelection = {
                            id: moveId,
                            lineage: 'sorcery',
                            label: `${power.name ?? 'Move'} (${sphereName})`,
                            kind: 'sorcery-move',
                            meta: {
                              moveType: power.moveType,
                              sphere: sphereName,
                              root: sphereId,
                              parent: sphereId,
                              path: [sphereId, moveId],
                              depth: 1
                            }
                          };
                          const moveSelected = selectedIds.has(moveSelection.id);
                          const moveDisabled = !sphereIsSelected;
                          const moveItemClass = `power-list__item${moveSelected ? ' power-list__item--selected' : ''}${moveDisabled ? ' power-list__item--disabled' : ''}`;
                          const moveToggleClass = `power-toggle${moveSelected ? ' power-toggle--active' : ''}`;
                          return (
                            <li key={moveId} className={moveItemClass}>
                              <div className="power-list__header">
                                <div>
                                  <strong>{power.name}</strong>
                                  {power.moveType && <span className="badge badge--type">{power.moveType}</span>}
                                </div>
                                <button
                                  type="button"
                                  className={moveToggleClass}
                                  onClick={() => {
                                    if (!moveDisabled) {
                                      onToggleSelection(moveSelection);
                                    }
                                  }}
                                  disabled={moveDisabled}
                                  title={moveDisabled ? 'Select the sphere first' : undefined}
                                >
                                  {moveSelected ? 'Selected' : 'Add'}
                                </button>
                              </div>
                              {renderDescription(power.description, gmEnabled)}
                              {power.outcomes && Object.keys(power.outcomes).length > 0 && (
                                <div className="power-outcomes">
                                  {Object.entries(power.outcomes).map(([roll, outcome]) => (
                                    <div key={roll}>
                                      <strong>{roll}:</strong> {outcome}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </details>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  // ESPER SECTION - Evolution tree and Mentalist selection system
  if (lineage === 'esper' && isEsperData(powerData)) {
    const esperNote = lineagePriority ? ESPER_NOTES[lineagePriority] : undefined;
    const depthLimit = lineagePriority ? ESPER_DEPTH_LIMIT[lineagePriority] : 0;

    // Separate Esper powers from Mentalist powers
    const ESPER_ARCHETYPES = ['sentinel', 'median', 'weaver', 'summoner', 'linker'];
    const MENTALIST_ARCHETYPES = ['empath', 'mesmer', 'siren', 'dreamer', 'meta-mind'];

    const esperPowers = powerData.powers.filter(p => ESPER_ARCHETYPES.includes(p.archetype ?? ''));
    const mentalistPowers = powerData.powers.filter(p => MENTALIST_ARCHETYPES.includes(p.archetype ?? '') || p.archetype === 'foundational');

    // Check if Priority A (can have both Esper and Mentalist)
    const canHaveBoth = lineagePriority === 'A';

    // Helper function to get all powers for a given path (cumulative)
    const getPowersForPath = (pathString: string): UnifiedPower[] => {
      const pathParts = pathString.split('.');
      const archetype = pathParts[0];

      // Get all powers that are part of this path (including parent paths)
      return esperPowers.filter(power => {
        const powerPath = power.path ?? '';
        // Include if power's path is a prefix of or equal to the selected path
        return powerPath === archetype || pathString.startsWith(powerPath + '.') || powerPath === pathString;
      }).sort((a, b) => (a.evolutionStage ?? 0) - (b.evolutionStage ?? 0));
    };

    // Check if a path is currently selected
    // Find the MOST EVOLVED selection (highest depth) - not just the first match
    const esperPathSelections = selectionsForLineage.filter(s =>
      (s.kind === 'esper-archetype' || s.kind === 'esper-focus' || s.kind === 'esper-framework-path') &&
      ESPER_ARCHETYPES.includes(s.meta?.archetype ?? '')
    );
    const selectedEsperPathSelection = esperPathSelections.sort((a, b) => {
      const depthA = a.meta?.depth ?? 0;
      const depthB = b.meta?.depth ?? 0;
      return depthB - depthA; // Sort descending - highest depth first
    })[0];
    const selectedEsperPath = selectedEsperPathSelection?.meta?.path?.join('.');
    const selectedArchetype = selectedEsperPath?.split('.')[0];

    // Handler for path selection
    const handlePathSelection = (pathString: string, stage: number) => {
      const pathParts = pathString.split('.');
      const newArchetype = pathParts[0];

      // Create new selection
      const newSelection: LineagePowerSelection = {
        id: `esper-path-${pathString}`,
        lineage: 'esper',
        label: `${pathString.split('.').pop()?.replace(/-/g, ' ')} (Evolution Stage ${stage})`,
        kind: stage === 0 ? 'esper-archetype' : stage === 1 ? 'esper-focus' : 'esper-framework-path',
        meta: {
          archetype: newArchetype,
          path: pathParts,
          depth: stage,
          root: newArchetype  // The base archetype is the root
        }
      };

      // Clear old selections first
      if (!selectedEsperPath || selectedArchetype !== newArchetype) {
        // Changing archetype - clear all Esper selections
        selectionsForLineage
          .filter(s => s.kind === 'esper-archetype' || s.kind === 'esper-focus' || s.kind === 'esper-framework-path')
          .forEach(s => onToggleSelection(s));
      } else if (stage > 0) {
        // Evolving within same tree
        // Only clear evolution selections (esper-focus, esper-framework-path), NOT the base archetype
        selectionsForLineage
          .filter(s =>
            (s.kind === 'esper-focus' || s.kind === 'esper-framework-path') &&
            s.meta?.root === newArchetype
          )
          .forEach(s => onToggleSelection(s));
      }

      // Add new selection
      onToggleSelection(newSelection);
    };

    // Render Esper evolution tree
    const renderEsperSection = () => {
      // If a path is selected, show all powers for that path
      if (selectedEsperPath) {
        const powersForPath = getPowersForPath(selectedEsperPath);
        const currentStage = selectedEsperPath.split('.').length - 1;

        return (
          <div className="esper-evolution-section">
            <h4>Esper Evolution Path</h4>
            <p className="section-description">
              Selected: {selectedEsperPath.split('.').map(p => p.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(' → ')}
            </p>
            <button type="button" className="power-toggle power-toggle--clear" onClick={onClearSelections}>
              Change Path
            </button>

            <div className="lineage-power-card">
              <h5>All Powers for This Path ({powersForPath.length} total)</h5>
              <ul className="power-list">
                {powersForPath.map(power => {
                  const powerId = power.id ?? slugify(power.name ?? 'power');
                  return (
                    <li key={powerId} className="power-list__item power-list__item--granted">
                      <div className="power-list__header">
                        <div>
                          <strong>{power.name}</strong>
                          <span className="badge">Stage {power.evolutionStage}</span>
                          <span className="badge">{power.moveType}</span>
                        </div>
                      </div>
                      {renderDescription(power.description, gmEnabled)}
                    </li>
                  );
                })}
              </ul>

              {/* Show available next evolution if not at depth limit */}
              {currentStage < depthLimit && (
                <div className="evolution-options">
                  <h6>Available Evolutions</h6>
                  {(() => {
                    const nextStagePaths = new Set(
                      esperPowers
                        .filter(p => {
                          const pPath = p.path ?? '';
                          const pStage = p.evolutionStage ?? 0;
                          return pStage === currentStage + 1 && pPath.startsWith(selectedEsperPath + '.');
                        })
                        .map(p => p.path ?? '')
                    );

                    return Array.from(nextStagePaths).map(nextPath => {
                      const pathName = nextPath.split('.').pop() ?? '';
                      const powersCount = getPowersForPath(nextPath).length;
                      return (
                        <button
                          key={nextPath}
                          type="button"
                          className="power-toggle"
                          onClick={() => handlePathSelection(nextPath, currentStage + 1)}
                        >
                          Evolve to {pathName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} (+{powersCount - powersForPath.length} powers)
                        </button>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </div>
        );
      }

      // No path selected yet - show archetype selection
      const powersByArchetype = esperPowers.reduce<Record<string, UnifiedPower[]>>((acc, power) => {
        const archetype = power.archetype ?? 'Unknown';
        if (!acc[archetype]) acc[archetype] = [];
        acc[archetype].push(power);
        return acc;
      }, {});

      return (
        <div className="esper-evolution-section">
          <h4>Choose Esper Archetype</h4>
          <p className="section-description">Select a starting archetype. You can evolve further based on your priority.</p>
          <div className="lineage-powers-grid">
            {Object.entries(powersByArchetype).map(([archetype, powers]) => {
              const baseArchetypePowers = powers.filter(p => p.evolutionStage === 0);
              const basePowerCount = baseArchetypePowers.length;

              return (
                <div key={archetype} className="lineage-power-card">
                  <h5>{archetype.charAt(0).toUpperCase() + archetype.slice(1)}</h5>
                  <p className="archetype-description">
                    {basePowerCount} base {basePowerCount === 1 ? 'power' : 'powers'}
                  </p>

                  {/* Show base powers preview */}
                  <details className="power-preview">
                    <summary>View Base Powers</summary>
                    <ul className="power-list">
                      {baseArchetypePowers.map(power => (
                        <li key={power.id} className="power-list__item">
                          <strong>{power.name}</strong> ({power.moveType})
                          {power.description?.short && <p className="power-description__short">{power.description.short}</p>}
                        </li>
                      ))}
                    </ul>
                  </details>

                  <button
                    type="button"
                    className="power-toggle power-toggle--primary"
                    onClick={() => handlePathSelection(archetype, 0)}
                  >
                    Select {archetype.charAt(0).toUpperCase() + archetype.slice(1)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    // Get selected Mentalist configuration
    const selectedMentalistArchetype = selectionsForLineage.find(s =>
      s.kind === 'esper-archetype' && MENTALIST_ARCHETYPES.includes(s.meta?.archetype ?? '')
    )?.meta?.archetype;

    const selectedPolarity = selectionsForLineage.find(s =>
      s.kind === 'esper-framework-choice' && (s.id === 'receiver-configuration' || s.id === 'influencer-configuration')
    );

    const selectedScope = selectionsForLineage.find(s =>
      s.kind === 'esper-framework-choice' && (s.id === 'targeted-scope' || s.id === 'aural-scope')
    );


    // Determine if Mentalist section should be shown based on priority
    // Priority A: Both Esper and Mentalist
    // Priority C: Mentalist only
    // Priority D: Esper only (no Mentalist)
    // Priority E: Esper only (no Mentalist)
    const showMentalist = canHaveBoth || lineagePriority === 'C' || (selectedMentalistArchetype !== undefined);
    const showEsper = !lineagePriority || lineagePriority !== 'C'; // Priority C is Mentalist only

    // Render Mentalist selection system
    const renderMentalistSection = () => {
      // Get foundational powers
      const foundationalPowers = mentalistPowers.filter(p => p.archetype === 'foundational');
      const polarityPowers = foundationalPowers.filter(p => p.path?.includes('polarity'));
      const scopePowers = foundationalPowers.filter(p => p.path?.includes('scope'));

      // If archetype selected, show configuration flow
      if (selectedMentalistArchetype) {
        const archetypePowers = mentalistPowers.filter(p => p.archetype === selectedMentalistArchetype);
        const isMeta = selectedMentalistArchetype === 'meta-mind';


        // Get automatically granted powers based on selections
        const grantedPowers: UnifiedPower[] = [];

        // Step 1: Polarity grants "_all" power
        if (selectedPolarity) {
          const polarityType = selectedPolarity.id === 'receiver-configuration' ? 'receiver' :
                              selectedPolarity.id === 'influencer-configuration' ? 'influencer' : '';

          const allPower = archetypePowers.find(p =>
            p.path?.includes('_all') && p.path?.includes(polarityType)
          );
          if (allPower) grantedPowers.push(allPower);
        }

        // Step 2: Polarity + Scope combination
        if (selectedPolarity && selectedScope) {
          const polarityType = selectedPolarity.id === 'receiver-configuration' ? 'receiver' :
                              selectedPolarity.id === 'influencer-configuration' ? 'influencer' : '';
          const scopeType = selectedScope.id === 'targeted-scope' ? 'targeted' :
                           selectedScope.id === 'aural-scope' ? 'aural' : '';

          // Find matching combination powers
          const comboPowers = archetypePowers.filter(p =>
            !p.path?.includes('_all') &&
            p.path?.includes(scopeType) &&
            p.path?.includes(polarityType)
          );

          // If only one power matches, grant it automatically
          // If multiple, player must choose (will be handled by showing selection buttons)
          if (comboPowers.length === 1) {
            grantedPowers.push(comboPowers[0]);
          }
        }

        return (
          <div className="mentalist-selection-section">
            <h4>Mentalist: {selectedMentalistArchetype.charAt(0).toUpperCase() + selectedMentalistArchetype.slice(1)}</h4>
            <button type="button" className="power-toggle power-toggle--clear" onClick={onClearSelections}>
              Change Archetype
            </button>

            {/* Show granted foundational powers */}
            {(selectedPolarity || selectedScope) && (
              <div className="lineage-power-card">
                <h5>Foundational Configuration</h5>
                <ul className="power-list">
                  {selectedPolarity && (
                    <li className="power-list__item power-list__item--granted">
                      <strong>{polarityPowers.find(p => p.id === selectedPolarity.id)?.name}</strong>
                    </li>
                  )}
                  {selectedScope && (
                    <li className="power-list__item power-list__item--granted">
                      <strong>{scopePowers.find(p => p.id === selectedScope.id)?.name}</strong>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Show granted archetype powers */}
            {grantedPowers.length > 0 && (
              <div className="lineage-power-card">
                <h5>Granted Powers</h5>
                <ul className="power-list">
                  {grantedPowers.map(power => (
                    <li key={power.id} className="power-list__item power-list__item--granted">
                      <div className="power-list__header">
                        <div>
                          <strong>{power.name}</strong>
                          <span className="badge">{power.moveType}</span>
                        </div>
                      </div>
                      {renderDescription(power.description, gmEnabled)}
                      {power.permanentCorruption !== undefined && (
                        <p className="power-cost">Corruption: {power.permanentCorruption}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Configuration selection */}
            {!selectedPolarity && (
              <div className="lineage-power-card">
                <h5>Step 1: Choose {isMeta ? 'Temporal Configuration' : 'Polarity'}</h5>
                <p className="foundation-description">
                  {isMeta ? 'Instanced (temporary) or Persistent (lasting)' : 'Receiver (pull/perceive) or Influencer (push/project)'}
                </p>
                <div className="mentalist-foundation">
                  {polarityPowers.map(power => {
                    // For now, Meta-Mind not fully supported - skip instanced/persistent
                    // Only show receiver/influencer
                    const isRelevant = power.id === 'receiver-configuration' || power.id === 'influencer-configuration';

                    if (!isRelevant) return null;

                    const powerId = power.id ?? slugify(power.name ?? 'power');
                    const selection: LineagePowerSelection = {
                      id: powerId,
                      lineage: 'esper',
                      label: power.name ?? 'Unknown Power',
                      kind: 'esper-framework-choice',
                      meta: { archetype: 'foundational' }
                    };

                    return (
                      <button
                        key={powerId}
                        type="button"
                        className="power-toggle power-toggle--primary"
                        onClick={() => onToggleSelection(selection)}
                      >
                        {power.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedPolarity && !selectedScope && (
              <div className="lineage-power-card">
                <h5>Step 2: Choose {isMeta ? 'Change Scope' : 'Scope'}</h5>
                <p className="foundation-description">
                  {isMeta ? 'Discrete (specific) or Systemic (broad)' : 'Targeted (individual) or Aural (area/group)'}
                </p>
                <div className="mentalist-foundation">
                  {scopePowers.map(power => {
                    // For now, Meta-Mind not fully supported - skip discrete/systemic
                    // Only show targeted/aural
                    const isRelevant = power.id === 'targeted-scope' || power.id === 'aural-scope';

                    if (!isRelevant) return null;

                    const powerId = power.id ?? slugify(power.name ?? 'power');
                    const selection: LineagePowerSelection = {
                      id: powerId,
                      lineage: 'esper',
                      label: power.name ?? 'Unknown Power',
                      kind: 'esper-framework-choice',
                      meta: { archetype: 'foundational' }
                    };

                    return (
                      <button
                        key={powerId}
                        type="button"
                        className="power-toggle power-toggle--primary"
                        onClick={() => onToggleSelection(selection)}
                      >
                        {power.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Power selection (if multiple powers available for combination) */}
            {selectedPolarity && selectedScope && (() => {
              const polarityType = selectedPolarity.id === 'receiver-configuration' ? 'receiver' :
                                  selectedPolarity.id === 'influencer-configuration' ? 'influencer' : '';
              const scopeType = selectedScope.id === 'targeted-scope' ? 'targeted' :
                               selectedScope.id === 'aural-scope' ? 'aural' : '';

              const comboPowers = archetypePowers.filter(p =>
                !p.path?.includes('_all') &&
                p.path?.includes(scopeType) &&
                p.path?.includes(polarityType)
              );

              if (comboPowers.length > 1) {
                // Player must choose one
                const selectedComboPower = selectionsForLineage.find(s =>
                  s.kind === 'esper-focus' && comboPowers.some(cp => cp.id === s.id)
                );

                return (
                  <div className="lineage-power-card">
                    <h5>Step 3: Choose Power</h5>
                    <p className="foundation-description">Multiple powers available - select one</p>
                    <div className="lineage-powers-grid">
                      {comboPowers.map(power => {
                        const powerId = power.id ?? slugify(power.name ?? 'power');
                        const selection: LineagePowerSelection = {
                          id: powerId,
                          lineage: 'esper',
                          label: power.name ?? 'Unknown Power',
                          kind: 'esper-focus',
                          meta: { archetype: selectedMentalistArchetype }
                        };
                        const isSelected = selectedComboPower?.id === powerId;

                        return (
                          <div key={powerId} className="lineage-power-card">
                            <h6>{power.name}</h6>
                            <span className="badge">{power.moveType}</span>
                            {renderDescription(power.description, gmEnabled)}
                            <button
                              type="button"
                              className={`power-toggle${isSelected ? ' power-toggle--active' : ''}`}
                              onClick={() => {
                                // Deselect other combo powers first
                                if (selectedComboPower && selectedComboPower.id !== powerId) {
                                  onToggleSelection(selectedComboPower);
                                }
                                onToggleSelection(selection);
                              }}
                            >
                              {isSelected ? 'Selected' : 'Select'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        );
      }

      // No archetype selected - show archetype choices
      const powersByArchetype = mentalistPowers
        .filter(p => p.archetype !== 'foundational')
        .reduce<Record<string, UnifiedPower[]>>((acc, power) => {
          const archetype = power.archetype ?? 'Unknown';
          if (!acc[archetype]) acc[archetype] = [];
          acc[archetype].push(power);
          return acc;
        }, {});

      return (
        <div className="mentalist-selection-section">
          <h4>Choose Mentalist Archetype</h4>
          <p className="section-description">Select an archetype to begin configuring your Mentalist powers.</p>
          <div className="lineage-powers-grid">
            {Object.entries(powersByArchetype).map(([archetype, powers]) => {
              const polarityPowers = powers.filter(p => p.path?.includes('_all'));
              const comboPowers = powers.filter(p => !p.path?.includes('_all'));
              const totalPowers = polarityPowers.length + comboPowers.length;

              return (
                <div key={archetype} className="lineage-power-card">
                  <h5>{archetype.charAt(0).toUpperCase() + archetype.slice(1)}</h5>
                  <p className="archetype-description">
                    {totalPowers} {totalPowers === 1 ? 'power' : 'powers'} available
                  </p>
                  <button
                    type="button"
                    className="power-toggle power-toggle--primary"
                    onClick={() => {
                      const selection: LineagePowerSelection = {
                        id: `mentalist-${archetype}`,
                        lineage: 'esper',
                        label: archetype,
                        kind: 'esper-archetype',
                        meta: { archetype }
                      };
                      onToggleSelection(selection);
                    }}
                  >
                    Select {archetype.charAt(0).toUpperCase() + archetype.slice(1)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    return (
      <section className="lineage-powers-panel">
        <header>
          <h3>Esper & Mentalist Powers</h3>
          <p>Innate psionic abilities - evolution-based or selection-based systems.</p>
        </header>
        <aside className="lineage-power-summary">
          <div>
            <span>Evolution Depth</span>
            <strong>{depthLimit}</strong>
          </div>
          <div>
            <span>Powers Selected</span>
            <strong>{selectionsForLineage.length}</strong>
          </div>
          {esperNote && <p className="lineage-power-summary__note">{esperNote}</p>}
          {selectionsForLineage.length > 0 && (
            <button type="button" className="power-toggle power-toggle--clear" onClick={onClearSelections}>
              Clear selections
            </button>
          )}
        </aside>
        {showEsper && renderEsperSection()}
        {showMentalist && renderMentalistSection()}
      </section>
    );
  }

  // AUTOMATA SECTION - Package selection system
  if (lineage === 'automata' && isAutomataData(powerData)) {
    // Priority determines available quality levels
    const QUALITY_BY_PRIORITY: Record<string, { worker: string[]; soldier: string[]; overseer: string[] }> = {
      A: { worker: [], soldier: ['imperial'], overseer: ['imperial'] },
      B: { worker: [], soldier: ['advanced'], overseer: ['advanced'] },
      C: { worker: [], soldier: ['basic'], overseer: ['basic'] },
      D: { worker: ['advanced'], soldier: [], overseer: [] },
      E: { worker: ['basic'], soldier: [], overseer: [] }
    };

    const availableQualities = lineagePriority ? QUALITY_BY_PRIORITY[lineagePriority] : { worker: [], soldier: [], overseer: [] };

    // Get unique chassis/branch combinations
    const chassisBranchMap = powerData.powers.reduce<Record<string, Set<string>>>((acc, power) => {
      const chassis = power.chassis ?? 'unknown';
      const branch = power.branch ?? 'unknown';
      if (!acc[chassis]) acc[chassis] = new Set();
      acc[chassis].add(branch);
      return acc;
    }, {});

    // Check if player has selected a chassis/branch combo
    const selectedCombo = selectionsForLineage.find((s) => s.kind === 'automata-package');
    const selectedChassis = selectedCombo?.meta?.chassis;
    const selectedBranch = selectedCombo?.meta?.branch;
    const selectedQuality = selectedCombo?.meta?.category;

    // Get powers for a specific chassis/branch/quality combo
    const getPowersForCombo = (chassis: string, branch: string, quality: string): UnifiedPower[] => {
      return powerData.powers.filter((p) => {
        if (p.chassis !== chassis) return false;
        // Include general chassis powers OR branch-specific powers
        if (p.augmentLevel === 'general') return true;
        if (p.branch !== branch) return false;
        // Include powers up to and including the quality level
        const levels = ['basic', 'advanced', 'imperial'];
        const qualityIndex = levels.indexOf(quality);
        const powerIndex = levels.indexOf(p.augmentLevel ?? '');
        return powerIndex >= 0 && powerIndex <= qualityIndex;
      });
    };

    return (
      <section className="lineage-powers-panel">
        <header>
          <h3>Automata Configuration</h3>
          <p>Choose your chassis, branch, and quality level. You automatically receive ALL powers for that configuration.</p>
        </header>
        <aside className="lineage-power-summary">
          {selectedCombo && (
            <>
              <div>
                <span>Selected Configuration</span>
                <strong>{selectedQuality?.toUpperCase()} {selectedBranch?.toUpperCase()} ({selectedChassis?.toUpperCase()})</strong>
              </div>
              <button type="button" className="power-toggle power-toggle--clear" onClick={onClearSelections}>
                Clear selection
              </button>
            </>
          )}
          {!selectedCombo && (
            <p>Select a chassis/branch configuration below. Priority {lineagePriority ?? '—'} determines available quality levels.</p>
          )}
        </aside>

        {!selectedCombo && (
          <div className="automata-selection-grid">
            {Object.entries(chassisBranchMap).map(([chassis, branches]) => {
              const availableLevels = availableQualities[chassis as keyof typeof availableQualities] || [];
              if (availableLevels.length === 0) return null;

              return (
                <div key={chassis} className="automata-chassis-section">
                  <h4>{chassis.charAt(0).toUpperCase() + chassis.slice(1)} Chassis</h4>
                  {Array.from(branches).map((branch) => {
                    return availableLevels.map((quality) => {
                      const comboId = `${chassis}-${branch}-${quality}`;
                      const powers = getPowersForCombo(chassis, branch, quality);
                      const selection: LineagePowerSelection = {
                        id: comboId,
                        lineage: 'automata',
                        label: `${quality.toUpperCase()} ${branch} (${chassis})`,
                        kind: 'automata-package',
                        meta: {
                          chassis,
                          branch,
                          category: quality
                        }
                      };

                      return (
                        <details key={comboId} className="automata-package-card">
                          <summary>
                            <div className="automata-package-summary">
                              <div>
                                <h5>{quality.toUpperCase()} {branch.charAt(0).toUpperCase() + branch.slice(1)}</h5>
                                <p className="automata-package-count">{powers.length} powers included</p>
                              </div>
                              <button
                                type="button"
                                className="power-toggle"
                                onClick={(e) => {
                                  e.preventDefault();
                                  onToggleSelection(selection);
                                }}
                              >
                                Select This Configuration
                              </button>
                            </div>
                          </summary>
                          <div className="automata-package-details">
                            <p className="automata-package-note">Selecting this configuration grants you ALL of these powers automatically:</p>
                            <ul className="power-list">
                              {powers.map((power) => (
                                <li key={power.id} className="power-list__item">
                                  <div>
                                    <strong>{power.name}</strong>
                                    <span className="badge badge--type">{power.augmentLevel}</span>
                                    {power.moveType && <span className="badge">{power.moveType}</span>}
                                  </div>
                                  {renderDescription(power.description, gmEnabled)}
                                  {power.outcomes && Object.keys(power.outcomes).length > 0 && (
                                    <div className="power-outcomes">
                                      {Object.entries(power.outcomes).map(([roll, outcome]) => (
                                        <div key={roll}>
                                          <strong>{roll}:</strong> {outcome}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </details>
                      );
                    });
                  })}
                </div>
              );
            })}
          </div>
        )}

        {selectedCombo && selectedChassis && selectedBranch && selectedQuality && (
          <div className="automata-selected-powers">
            <h4>Your Powers</h4>
            <p>As a {selectedQuality.toUpperCase()} {selectedBranch} ({selectedChassis}), you have these capabilities:</p>
            <ul className="power-list">
              {getPowersForCombo(selectedChassis, selectedBranch, selectedQuality).map((power) => (
                <li key={power.id} className="power-list__item">
                  <div>
                    <strong>{power.name}</strong>
                    <span className="badge badge--type">{power.augmentLevel}</span>
                    {power.moveType && <span className="badge">{power.moveType}</span>}
                  </div>
                  {renderDescription(power.description, gmEnabled)}
                  {power.outcomes && Object.keys(power.outcomes).length > 0 && (
                    <div className="power-outcomes">
                      {Object.entries(power.outcomes).map(([roll, outcome]) => (
                        <div key={roll}>
                          <strong>{roll}:</strong> {outcome}
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="lineage-powers-panel">
      <h3>Lineage Powers</h3>
      <p>Power data structure for this lineage is not recognized. Check the source files for updates.</p>
    </section>
  );
}
