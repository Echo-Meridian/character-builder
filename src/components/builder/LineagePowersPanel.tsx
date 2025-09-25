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
  A: 3,
  B: 2,
  C: 2,
  D: 1,
  E: 0
};

const ESPER_NOTES: Record<PriorityRank, string> = {
  A: 'Priority A: Access to both Esper archetypes and full Mentalist framework.',
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

interface NeoSapienGrade {
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
  grades: Record<string, NeoSapienGrade>;
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
  tiers: Record<string, ChimeraTier>;
}

interface ChimeraData extends RawLineagePowerData {
  powers: ChimeraPower[];
}

interface SorceryMove {
  id?: string;
  name?: string;
  type?: string;
  description?: PowerDescription;
}

interface SorcerySphere {
  id?: string;
  name?: string;
  type?: string;
  moves: SorceryMove[];
}

interface SorceryData extends RawLineagePowerData {
  spheres: {
    primary?: Record<string, SorcerySphere>;
    secondary?: Record<string, SorcerySphere>;
  };
}

interface EsperAbility {
  id?: string;
  name?: string;
  type?: string;
  description?: string;
  cost?: string;
  duration?: string;
  scope?: string;
}

interface EsperFocus {
  id?: string;
  name?: string;
  path?: string;
  philosophy?: string;
  abilities?: EsperAbility[];
  focuses?: Record<string, EsperFocus>;
}

interface EsperArchetype {
  id?: string;
  name?: string;
  philosophy?: string;
  abilities?: EsperAbility[];
  focuses?: Record<string, EsperFocus>;
}

interface MentalistData {
  mentalist_archetypes?: Record<string, unknown>;
  trauma_mutations?: Record<string, unknown>;
}

interface EsperData extends RawLineagePowerData {
  esper_archetypes?: Record<string, EsperArchetype>;
  mentalist_data?: MentalistData;
}

interface AutomataCapability {
  type?: string;
  name?: string;
  description?: string;
  cost?: number;
}

interface AutomataModel {
  tier?: string;
  name?: string;
  available?: boolean;
  augments?: AutomataCapability[];
  moves?: AutomataCapability[];
}

interface AutomataBranch {
  id?: string;
  name?: string;
  focus?: string;
  general_capabilities?: AutomataCapability[];
  models?: Record<string, AutomataModel>;
}

interface AutomataChassis {
  id?: string;
  name?: string;
  branches?: Record<string, AutomataBranch>;
}

interface AutomataData extends RawLineagePowerData {
  chassis: Record<string, AutomataChassis>;
}

function isNeoSapienData(value: RawLineagePowerData): value is NeoSapienData {
  const maybe = value as Partial<NeoSapienData>;
  return Array.isArray(maybe.powers) && maybe.powers.some((power) => power && typeof power === 'object' && 'grades' in power);
}

function isChimeraData(value: RawLineagePowerData): value is ChimeraData {
  const maybe = value as Partial<ChimeraData>;
  return Array.isArray(maybe.powers) && maybe.powers.some((power) => power && typeof power === 'object' && 'tiers' in power);
}

function isSorceryData(value: RawLineagePowerData): value is SorceryData {
  const maybe = value as Partial<SorceryData>;
  return typeof maybe.spheres === 'object' && maybe.spheres !== null;
}

function isEsperData(value: RawLineagePowerData): value is EsperData {
  const maybe = value as Partial<EsperData>;
  return typeof maybe.esper_archetypes === 'object' && maybe.esper_archetypes !== null;
}

function isAutomataData(value: RawLineagePowerData): value is AutomataData {
  const maybe = value as Partial<AutomataData>;
  return typeof maybe.chassis === 'object' && maybe.chassis !== null;
}

function renderDescription(description: PowerDescription | undefined, gmEnabled: boolean) {
  if (!description) return null;
  return (
    <div className="power-description">
      {description.short && <p>{description.short}</p>}
      {gmEnabled && description.player && <p className="power-description__detail">{description.player}</p>}
      {gmEnabled && description.flaw && <p className="power-description__detail flaw">Flaw: {description.flaw}</p>}
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

function renderCapabilities(capabilities: AutomataCapability[] | undefined, gmEnabled: boolean) {
  if (!capabilities || capabilities.length === 0) return null;
  return (
    <ul className="power-list">
      {capabilities.map((entry, index) => (
        <li key={`${entry.name}-${index}`}>
          <div>
            <strong>{entry.name}</strong>
            {entry.type && <span className="badge badge--type">{entry.type}</span>}
            {typeof entry.cost === 'number' && <span className="badge badge--cost">Cost {entry.cost}</span>}
          </div>
          {entry.description && <p>{entry.description}</p>}
        </li>
      ))}
    </ul>
  );
}

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
            return (
              <article key={power.id ?? power.name} className="lineage-power-card">
                <header>
                  <h4>{power.name}</h4>
                  {power.category && <span className="badge">{power.category}</span>}
                </header>
                <div className="lineage-power-card__body">
                {Object.entries(power.grades ?? {}).map(([gradeKey, grade]) => {
                  const gradeLabel = grade.name ?? gradeKey;
                  const gradeId = grade.id ?? `${rootId}-${slugify(gradeKey)}`;
                  const selection: LineagePowerSelection = {
                    id: gradeId,
                    lineage: 'neosapien',
                    label: `${power.name} — ${gradeLabel}`,
                    kind: 'neosapien-augment',
                    meta: {
                      root: rootId,
                      parent: rootId,
                      path: [rootId, gradeKey],
                      depth: 1,
                      slots: typeof grade.slots === 'number' ? grade.slots : undefined,
                      permanentCorruption:
                        typeof grade.permanentCorruption === 'number' ? grade.permanentCorruption : undefined,
                      category: power.category,
                      tierLabel: gradeLabel
                    }
                  };
                  const isSelected = selectedIds.has(selection.id);
                  const gradeClass = `lineage-power-grade${isSelected ? ' lineage-power-grade--selected' : ''}`;
                  const toggleClass = `power-toggle${isSelected ? ' power-toggle--active' : ''}`;
                  return (
                    <section key={gradeId} className={gradeClass}>
                      <div className="lineage-power-grade__header">
                        <span className="badge badge--grade">{gradeLabel}</span>
                        <div className="lineage-power-grade__meta">
                          {typeof grade.tier === 'number' && <span>Tier {grade.tier}</span>}
                          {typeof grade.slots === 'number' && <span>{grade.slots} Slot{grade.slots === 1 ? '' : 's'}</span>}
                          {typeof grade.permanentCorruption === 'number' && (
                            <span>{grade.permanentCorruption} Permanent Corruption</span>
                          )}
                        </div>
                        <button type="button" className={toggleClass} onClick={() => onToggleSelection(selection)}>
                          {isSelected ? 'Selected' : 'Add'}
                        </button>
                      </div>
                      {renderDescription(grade.description, gmEnabled)}
                    </section>
                  );
                })}
                </div>
              </article>
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
        <div className="lineage-powers-grid">
          {powerData.powers.map((power) => {
            const rootId = power.id ?? slugify(power.name ?? 'mutation');
            return (
              <article key={power.id ?? power.name} className="lineage-power-card">
                <header>
                  <h4>{power.name}</h4>
                  {power.category && <span className="badge">{power.category}</span>}
                </header>
                <div className="lineage-power-card__body">
                {Object.entries(power.tiers ?? {}).map(([tierKey, tier]) => {
                  const tierLabel = tier.name ?? tierKey;
                  const tierId = tier.id ?? `${rootId}-${slugify(tierKey)}`;
                  const selection: LineagePowerSelection = {
                    id: tierId,
                    lineage: 'chimera',
                    label: `${power.name} — ${tierLabel}`,
                    kind: 'chimera-mutation',
                    meta: {
                      root: rootId,
                      parent: rootId,
                      path: [rootId, tierKey],
                      depth: 1,
                      mutationPoints: typeof tier.mutationPoints === 'number' ? tier.mutationPoints : undefined,
                      permanentCorruption:
                        typeof tier.permanentCorruption === 'number' ? tier.permanentCorruption : undefined,
                      category: power.category,
                      tierLabel
                    }
                  };
                  const isSelected = selectedIds.has(selection.id);
                  const tierClass = `lineage-power-grade${isSelected ? ' lineage-power-grade--selected' : ''}`;
                  const toggleClass = `power-toggle${isSelected ? ' power-toggle--active' : ''}`;
                  return (
                    <section key={tierId} className={tierClass}>
                      <div className="lineage-power-grade__header">
                        <span className="badge badge--grade">{tierLabel}</span>
                        <div className="lineage-power-grade__meta">
                          {typeof tier.tier === 'number' && <span>Tier {tier.tier}</span>}
                          {typeof tier.mutationPoints === 'number' && <span>{tier.mutationPoints} Mutation Pts</span>}
                          {typeof tier.permanentCorruption === 'number' && (
                            <span>{tier.permanentCorruption} Permanent Corruption</span>
                          )}
                        </div>
                        <button type="button" className={toggleClass} onClick={() => onToggleSelection(selection)}>
                          {isSelected ? 'Selected' : 'Add'}
                        </button>
                      </div>
                      {renderDescription(tier.description, gmEnabled)}
                    </section>
                  );
                })}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  if (lineage === 'sorcery' && isSorceryData(powerData)) {
    const { spheres } = powerData;
    const limits = getPriorityValue(SORCERY_LIMITS, lineagePriority, {
      primary: 0,
      secondary: 0,
      moves: 0
    });
    const primaryCount = selectionsForLineage.filter((entry) => entry.kind === 'sorcery-sphere-primary').length;
    const secondaryCount = selectionsForLineage.filter((entry) => entry.kind === 'sorcery-sphere-secondary').length;
    const moveCount = selectionsForLineage.filter((entry) => entry.kind === 'sorcery-move').length;
    const summaryNote = lineagePriority ? SORCERY_LIMITS[lineagePriority].note : undefined;
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
            const sphereGroup = spheres?.[tier as keyof typeof spheres];
            if (!sphereGroup) return null;
            return (
              <div key={tier} className="sphere-column">
                <h4 className="sphere-column__heading">{tier === 'primary' ? 'Primary Spheres' : 'Secondary Spheres'}</h4>
                {Object.values(sphereGroup).map((sphere, index) => {
                  const sphereName = sphere.name ?? `Sphere ${index + 1}`;
                  const sphereId = sphere.id ?? `${tier}-${slugify(sphereName)}`;
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
                  return (
                    <details key={sphereId} className={cardClass} open={isSelected}>
                      <summary>
                        <div className="sphere-card__summary">
                          <h5>{sphereName}</h5>
                          <button
                            type="button"
                            className={toggleClass}
                            onClick={(event) => {
                              event.preventDefault();
                              onToggleSelection(selection);
                            }}
                          >
                            {isSelected ? 'Selected' : 'Add'}
                          </button>
                        </div>
                      </summary>
                      <ul className="power-list">
                        {sphere.moves?.map((move, moveIndex) => {
                          const moveId = move.id ?? `${sphereId}-move-${moveIndex}`;
                          const moveSelection: LineagePowerSelection = {
                            id: moveId,
                            lineage: 'sorcery',
                            label: `${move.name ?? 'Move'} (${sphereName})`,
                            kind: 'sorcery-move',
                            meta: {
                              moveType: move.type,
                              sphere: sphereName,
                              root: sphereId,
                              parent: sphereId,
                              path: [sphereId, moveId],
                              depth: 1
                            }
                          };
                          const moveSelected = selectedIds.has(moveSelection.id);
                          const moveItemClass = `power-list__item${moveSelected ? ' power-list__item--selected' : ''}`;
                          const moveToggleClass = `power-toggle${moveSelected ? ' power-toggle--active' : ''}`;
                          return (
                            <li key={moveId} className={moveItemClass}>
                              <div className="power-list__header">
                                <div>
                                  <strong>{move.name}</strong>
                                  {move.type && <span className="badge badge--type">{move.type}</span>}
                                </div>
                                <button
                                  type="button"
                                  className={moveToggleClass}
                                  onClick={() => onToggleSelection(moveSelection)}
                                >
                                  {moveSelected ? 'Selected' : 'Add'}
                                </button>
                              </div>
                              {renderDescription(move.description as PowerDescription | undefined, gmEnabled)}
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

  if (lineage === 'esper' && isEsperData(powerData)) {
    const archetypes = (powerData.esper_archetypes ?? {}) as Record<string, EsperArchetype>;
    const mentalistData = powerData.mentalist_data;
    const mentalistArchetypesRaw =
      mentalistData && isRecord(mentalistData.mentalist_archetypes)
        ? (mentalistData.mentalist_archetypes as Record<string, unknown>)
        : {};
    const foundationalAugmentsRaw = (() => {
      const candidate = (mentalistArchetypesRaw as { foundational_augments?: unknown }).foundational_augments;
      return isRecord(candidate) ? (candidate as Record<string, unknown>) : undefined;
    })();
    const mentalistPathEntries = Object.entries(mentalistArchetypesRaw).reduce<Array<[string, UnknownRecord]>>(
      (acc, [key, value]) => {
        if (key === 'foundational_augments') return acc;
        if (isRecord(value)) {
          acc.push([key, value as UnknownRecord]);
        }
        return acc;
      },
      []
    );
    const baseAllowed = lineagePriority !== 'C';
    const mentalistAllowed = lineagePriority === 'A' || lineagePriority === 'C';
    const esperNote = lineagePriority ? ESPER_NOTES[lineagePriority] : undefined;
    const depthLimit = lineagePriority ? ESPER_DEPTH_LIMIT[lineagePriority] : 0;

    const baseSelection = selectionsForLineage.find(
      (entry) => entry.kind === 'esper-archetype' && entry.meta?.category === 'esper-base'
    );
    const mentalistSelection = selectionsForLineage.find(
      (entry) => entry.kind === 'esper-archetype' && entry.meta?.category === 'esper-mentalist'
    );
    const baseRoot = baseSelection?.meta?.root ?? null;
    const mentalistRoot = mentalistSelection?.meta?.root ?? null;

    const archetypeCount = selectionsForLineage.filter(
      (entry) => entry.kind === 'esper-archetype' && entry.meta?.category === 'esper-base'
    ).length;
    const focusCount = selectionsForLineage.filter((entry) => entry.kind === 'esper-focus').length;
    const frameworkChoiceCount = selectionsForLineage.filter((entry) => entry.kind === 'esper-framework-choice').length;
    const frameworkPathCount = selectionsForLineage.filter((entry) => entry.kind === 'esper-framework-path').length;

    const handleArchetypeToggle = (selection: LineagePowerSelection) => {
      const isSelected = selectedIds.has(selection.id);
      const category = selection.meta?.category;
      if (category === 'esper-base' && !baseAllowed) return;
      if (category === 'esper-mentalist' && !mentalistAllowed) return;

      if (isSelected) {
        onToggleSelection(selection);
        return;
      }

      selectionsForLineage
        .filter((entry) => entry.kind === 'esper-archetype' && entry.meta?.category === category)
        .forEach((entry) => onToggleSelection(entry));

      onToggleSelection(selection);
    };

    const handleFocusToggle = (selection: LineagePowerSelection) => {
      const root = selection.meta?.root;
      if (!root || (root !== baseRoot && root !== mentalistRoot)) {
        return;
      }

      const depth = selection.meta?.depth ?? 0;
      if (depth > depthLimit) {
        return;
      }

      const parentId = selection.meta?.parent;
      if (depth > 0 && (!parentId || !selectionMap.has(parentId))) {
        return;
      }

      const alreadySelected = selectedIds.has(selection.id);
      if (alreadySelected) {
        onToggleSelection(selection);
        return;
      }

      const selectionPath = selection.meta?.path ?? [selection.id];

      const conflicts = selectionsForLineage.filter((entry) => {
        if (entry.id === selection.id) return false;
        if (entry.meta?.root !== root) return false;
        const entryPath = entry.meta?.path ?? [entry.id];
        const entryDepth = entry.meta?.depth ?? 0;

        if (entryDepth < depth) {
          return false;
        }

        if (entryDepth === depth) {
          if (entryPath.length <= depth || selectionPath.length <= depth) return false;
          return entryPath[depth] !== selectionPath[depth];
        }

    const sharesPrefix = selectionPath.every((value, index) => entryPath[index] === value);
    return !sharesPrefix;
  });

  conflicts.forEach((entry) => onToggleSelection(entry));
  onToggleSelection(selection);
};

const getFrameworkGroupKey = (entry: LineagePowerSelection) => entry.meta?.path?.[2] ?? null;

const clearFrameworkPathSelections = (root: string, groupKeys: string[]) => {
  if (groupKeys.length === 0) return;
  const targets = new Set(groupKeys);
  selectionsForLineage
    .filter(
      (entry) =>
        entry.kind === 'esper-framework-path' &&
        entry.meta?.root === root &&
        targets.has(getFrameworkGroupKey(entry) ?? '')
    )
    .forEach((entry) => onToggleSelection(entry));
};

const handleFrameworkChoiceToggle = (selection: LineagePowerSelection, groupKey: string) => {
  const root = selection.meta?.root;
  const depth = selection.meta?.depth ?? 0;
  if (!root || !isRootSelected(root) || !isDepthAllowed(root, depth)) {
    const isSelected = selectedIds.has(selection.id);
    if (isSelected) {
      onToggleSelection(selection);
    }
    return;
  }

  const isSelected = selectedIds.has(selection.id);
  const conflicts = selectionsForLineage.filter(
    (entry) =>
      entry.id !== selection.id &&
      entry.kind === 'esper-framework-choice' &&
      entry.meta?.root === root &&
      getFrameworkGroupKey(entry) === groupKey
  );

  const polarity = groupKey === 'polarity' ? inferPolarityFromSelection(selection) : null;
  const scope = groupKey === 'scope' ? inferScopeFromSelection(selection) : null;

  if (isSelected) {
    if (groupKey === 'polarity') {
      clearFrameworkPathSelections(root, [
        ...POLARITY_FRAMEWORK_GROUPS.receiver,
        ...POLARITY_FRAMEWORK_GROUPS.influencer
      ]);
    }
    if (groupKey === 'scope') {
      clearFrameworkPathSelections(root, [...SCOPE_FRAMEWORK_GROUPS.aural, ...SCOPE_FRAMEWORK_GROUPS.targeted]);
    }
    onToggleSelection(selection);
    return;
  }

  conflicts.forEach((entry) => onToggleSelection(entry));

  if (groupKey === 'polarity') {
    const groupsToClear = polarity
      ? POLARITY_FRAMEWORK_GROUPS[polarity === 'receiver' ? 'influencer' : 'receiver']
      : [...POLARITY_FRAMEWORK_GROUPS.receiver, ...POLARITY_FRAMEWORK_GROUPS.influencer];
    clearFrameworkPathSelections(root, groupsToClear);
  }

  if (groupKey === 'scope') {
    const groupsToClear = scope
      ? SCOPE_FRAMEWORK_GROUPS[scope === 'aural' ? 'targeted' : 'aural']
      : [...SCOPE_FRAMEWORK_GROUPS.aural, ...SCOPE_FRAMEWORK_GROUPS.targeted];
    clearFrameworkPathSelections(root, groupsToClear);
  }

  onToggleSelection(selection);
};

const handleFrameworkPathToggle = (selection: LineagePowerSelection, groupKey: string, canToggle: boolean) => {
  if (!canToggle) return;

  const root = selection.meta?.root;
  const depth = selection.meta?.depth ?? 0;
  if (!root || !isRootSelected(root) || !isDepthAllowed(root, depth)) {
    return;
  }

  const isSelected = selectedIds.has(selection.id);
  if (isSelected) {
    onToggleSelection(selection);
    return;
  }

  selectionsForLineage
    .filter(
      (entry) =>
        entry.id !== selection.id &&
        entry.kind === 'esper-framework-path' &&
        entry.meta?.root === root &&
        getFrameworkGroupKey(entry) === groupKey
    )
    .forEach((entry) => onToggleSelection(entry));

  onToggleSelection(selection);
};

    const isRootSelected = (root: string) => root === baseRoot || root === mentalistRoot;
    const isDepthAllowed = (root: string, depth: number) => depth <= depthLimit;

    const renderEsperFocusNode = (
      focus: UnknownRecord,
      path: string[],
      depth: number,
      rootId: string
    ): JSX.Element => {
      const focusName = typeof focus.name === 'string' && focus.name.length > 0 ? focus.name : path[path.length - 1];
      const focusId = typeof focus.id === 'string' && focus.id.length > 0 ? focus.id : path.join('-');
      const focusPath = typeof focus.path === 'string' && focus.path.length > 0 ? focus.path : undefined;
      const selection: LineagePowerSelection = {
        id: focusId,
        lineage: 'esper',
        label: `Focus — ${focusName}`,
        kind: 'esper-focus',
        meta: {
          root: rootId,
          parent: path[path.length - 2] ?? rootId,
          path,
          depth
        }
      };
      const isSelected = selectedIds.has(selection.id);
      const disabled = !isRootSelected(rootId) || !isDepthAllowed(rootId, depth);
      const toggleClass = `power-toggle${isSelected ? ' power-toggle--active' : ''}`;
      const cardClass = `focus-card${isSelected ? ' focus-card--selected' : ''}`;
      const abilityRecords = normalizeAbilityCollection((focus as { abilities?: unknown }).abilities);
      const abilityEntries = createAbilityEntries(abilityRecords, `${focusId}-ability`);
      const abilityGroups = groupAbilities(abilityEntries);
      const childFocusesRaw = (focus as { focuses?: unknown }).focuses;
      const childFocuses = isRecord(childFocusesRaw) ? (childFocusesRaw as Record<string, unknown>) : undefined;

      return (
        <details key={focusId} className={cardClass} open={isSelected}>
          <summary>
            <div className="focus-card__summary">
              <h6>{focusName}</h6>
              <button
                type="button"
                className={toggleClass}
                disabled={disabled}
                onClick={(event) => {
                  event.preventDefault();
                  if (!disabled) {
                    handleFocusToggle(selection);
                  }
                }}
              >
                {isSelected ? 'Selected' : 'Add'}
              </button>
            </div>
          </summary>
          {focusPath && <p className="power-description__detail">{focusPath}</p>}
          {typeof focus.philosophy === 'string' && <p>{focus.philosophy}</p>}
          {renderAbilitySection('Signature Moves', abilityGroups.moves)}
          {renderAbilitySection('Augments', abilityGroups.augments)}
          {renderAbilitySection('Psionic Abilities', abilityGroups.other)}
          {childFocuses && (
            <section className="lineage-power-subsection">
              <h5>Advanced Paths</h5>
              <div className="focus-grid">
                {Object.values(childFocuses).map((child) => {
                  const childRecord = child as UnknownRecord;
                  const childName = typeof childRecord.name === 'string' ? childRecord.name : `Focus ${depth + 1}`;
                  const childId =
                    typeof childRecord.id === 'string' && childRecord.id.length > 0
                      ? childRecord.id
                      : slugify(childName);
                  return renderEsperFocusNode(childRecord, [...path, childId], depth + 1, rootId);
                })}
              </div>
            </section>
          )}
        </details>
      );
    };

    const renderArchetypeCard = (archetype: EsperArchetype) => {
      const archetypeName = typeof archetype.name === 'string' ? archetype.name : 'Archetype';
      const rootId = typeof archetype.id === 'string' ? archetype.id : slugify(archetypeName);
      const abilityRecords = normalizeAbilityCollection((archetype as { abilities?: unknown }).abilities);
      const abilityEntries = createAbilityEntries(abilityRecords, `${rootId}-ability`);
      const abilityGroups = groupAbilities(abilityEntries);
      const selection: LineagePowerSelection = {
        id: rootId,
        lineage: 'esper',
        label: `Archetype — ${archetypeName}`,
        kind: 'esper-archetype',
        meta: {
          root: rootId,
          path: [rootId],
          depth: 0,
          category: 'esper-base'
        }
      };
      const isSelected = selectedIds.has(selection.id);
      const toggleClass = `power-toggle${isSelected ? ' power-toggle--active' : ''}`;
      const disabled = !baseAllowed;
      const cardClass = `lineage-power-card${isSelected ? ' lineage-power-card--selected' : ''}`;

      return (
        <details key={rootId} className={cardClass} open={isSelected}>
          <summary>
            <div className="lineage-power-card__summary">
              <h4>{archetypeName}</h4>
              <button
                type="button"
                className={toggleClass}
                disabled={disabled && !isSelected}
                onClick={(event) => {
                  event.preventDefault();
                  if (!disabled || isSelected) {
                    handleArchetypeToggle(selection);
                  }
                }}
              >
                {isSelected ? 'Selected' : 'Add'}
              </button>
            </div>
          </summary>
          {typeof archetype.philosophy === 'string' && <p className="power-description__detail">{archetype.philosophy}</p>}
          {renderAbilitySection('Baseline Moves', abilityGroups.moves)}
          {renderAbilitySection('Baseline Augments', abilityGroups.augments)}
          {renderAbilitySection('Baseline Abilities', abilityGroups.other)}
          {archetype.focuses && (
            <section className="lineage-power-subsection">
              <h5>Focus Paths</h5>
              <div className="focus-grid">
                {Object.values(archetype.focuses).map((focus) => {
                  const focusRecord = focus as UnknownRecord;
                  const focusName = typeof focusRecord.name === 'string' ? focusRecord.name : 'Focus';
                  const focusId =
                    typeof focusRecord.id === 'string' && focusRecord.id.length > 0
                      ? focusRecord.id
                      : slugify(`${rootId}-${focusName}`);
                  return renderEsperFocusNode(focusRecord, [rootId, focusId], 1, rootId);
                })}
              </div>
            </section>
          )}
        </details>
      );
    };

    const renderMentalistPath = (pathKey: string, pathData: UnknownRecord) => {
      const rootId = typeof pathData.id === 'string' && pathData.id.length > 0 ? pathData.id : slugify(pathKey);
      const pathLabel = typeof pathData.name === 'string' && pathData.name.length > 0 ? pathData.name : toTitleCase(pathKey);
      const philosophy = typeof pathData.philosophy === 'string' ? pathData.philosophy : undefined;
      const naturalLean = typeof pathData.natural_lean === 'string' ? pathData.natural_lean : undefined;
      const powerSelectionsRaw = isRecord((pathData as { power_selections?: unknown }).power_selections)
        ? ((pathData as { power_selections?: unknown }).power_selections as Record<string, unknown>)
        : undefined;
      const choiceCollection = powerSelectionsRaw
        ? Object.entries(powerSelectionsRaw).reduce<MentalistChoiceCollection>((acc, [key, value]) => {
            const normalizedKey = key.toLowerCase();
            const abilities = createAbilityEntries(normalizeAbilityCollection(value), `${rootId}-${normalizedKey}`);
            if (abilities.length === 0) {
              return acc;
            }
            const labelKey = normalizedKey.replace(/_/g, ' ');
            const group: MentalistChoiceGroup = {
              key: normalizedKey,
              label: toTitleCase(labelKey),
              abilities
            };
            const polarity = POLARITY_KEY_TO_TYPE[normalizedKey];
            if (polarity) {
              acc.polarity[polarity] = group;
              return acc;
            }
            const scopeDescriptor = SCOPE_KEY_TO_DESCRIPTOR[normalizedKey];
            if (scopeDescriptor) {
              const { scope, polarity: scopePolarity } = scopeDescriptor;
              acc.scope[scope][scopePolarity] = group;
              return acc;
            }
            acc.general.push(group);
            return acc;
          }, createEmptyChoiceCollection())
        : createEmptyChoiceCollection();
      const pathPowers = createAbilityEntries(
        normalizeAbilityCollection((pathData as { powers?: unknown }).powers),
        `${rootId}-power`
      );
      const coreMechanicsRaw = isRecord((pathData as { core_mechanics?: unknown }).core_mechanics)
        ? ((pathData as { core_mechanics?: unknown }).core_mechanics as Record<string, unknown>)
        : undefined;
      const coreMechanics = coreMechanicsRaw
        ? Object.entries(coreMechanicsRaw).reduce<
            Array<{ key: string; name: string; description?: string; outcomes: OutcomeEntry[] }>
          >((acc, [key, value]) => {
            if (!isRecord(value)) {
              return acc;
            }
            const name = typeof value.name === 'string' && value.name.length > 0 ? value.name : toTitleCase(key);
            const description = typeof value.description === 'string' ? value.description : undefined;
            const outcomes = mapOutcomeEntries((value as { outcomes?: unknown }).outcomes);
            acc.push({ key, name, description, outcomes });
            return acc;
          }, [])
        : [];
      const consequenceTablesRaw = isRecord((pathData as { consequence_tables?: unknown }).consequence_tables)
        ? ((pathData as { consequence_tables?: unknown }).consequence_tables as Record<string, unknown>)
        : undefined;
      const consequenceTables = consequenceTablesRaw
        ? Object.entries(consequenceTablesRaw).reduce<
            Array<{ key: string; label: string; entries: ConsequenceEntry[] }>
          >((acc, [key, tableValue]) => {
            const entries = mapConsequenceEntries(tableValue, `${rootId}-${key}`);
            if (entries.length === 0) {
              return acc;
            }
            acc.push({ key, label: toTitleCase(key), entries });
            return acc;
          }, [])
        : [];
      const childFocuses = isRecord((pathData as { focuses?: unknown }).focuses)
        ? ((pathData as { focuses?: unknown }).focuses as Record<string, unknown>)
        : undefined;
      const frameworkChoiceSelections = selectionsForLineage.filter(
        (entry) => entry.kind === 'esper-framework-choice' && entry.meta?.root === rootId
      );
      const polaritySelection = frameworkChoiceSelections.find((entry) => getFrameworkGroupKey(entry) === 'polarity');
      const scopeSelection = frameworkChoiceSelections.find((entry) => getFrameworkGroupKey(entry) === 'scope');
      const selectedPolarity = inferPolarityFromSelection(polaritySelection);
      const selectedScope = inferScopeFromSelection(scopeSelection);
      const isMetaMindPath = pathKey.toLowerCase() === 'meta-mind' || rootId === 'meta-mind';

      const translateTerminology = (value: string): string => {
        if (!isMetaMindPath) return value;
        return value
          .replace(/Receiver/gi, 'Instanced')
          .replace(/Influencer/gi, 'Persistent')
          .replace(/Aural/gi, 'Systemic')
          .replace(/Targeted/gi, 'Discrete');
      };

      const renderChoiceGroup = (
        group: MentalistChoiceGroup,
        options: { enabled: boolean; requirement?: string }
      ) => {
        if (!group || group.abilities.length === 0) return null;
        const { enabled, requirement } = options;
        const label = translateTerminology(group.label);
        const requirementLabel = requirement ? translateTerminology(requirement) : undefined;
        return (
          <div key={`${rootId}-${group.key}`} className="lineage-choice-group">
            <h6>{label}</h6>
            {requirementLabel && <p className="power-description__detail">{requirementLabel}</p>}
            <ul className="power-list">
              {group.abilities.map((ability, index) => {
                const fallbackId = `${rootId}-${group.key}-${index}`;
                const abilityId = ability.id || fallbackId;
                const choiceSelection: LineagePowerSelection = {
                  id: abilityId,
                  lineage: 'esper',
                  label: `Framework Power — ${ability.name}`,
                  kind: 'esper-framework-path',
                  meta: {
                    root: rootId,
                    parent: rootId,
                    path: [rootId, 'framework', group.key, abilityId],
                    depth: 2,
                    category: 'esper-mentalist'
                  }
                };
                const isSelected = selectedIds.has(choiceSelection.id);
                const canToggle = enabled || isSelected;
                const itemClass = `power-list__item${isSelected ? ' power-list__item--selected' : ''}`;
                const toggleClass = `power-toggle${isSelected ? ' power-toggle--active' : ''}`;
                return (
                  <li key={abilityId} className={itemClass}>
                    <div className="power-list__header">
                      <div>
                        <strong>{ability.name}</strong>
                        {ability.type && <span className="badge badge--type">{toTitleCase(ability.type)}</span>}
                        {ability.cost && <span className="badge badge--cost">{ability.cost}</span>}
                        {ability.duration && <span className="badge">{translateTerminology(ability.duration)}</span>}
                        {ability.scope && <span className="badge">{translateTerminology(ability.scope)}</span>}
                      </div>
                      <button
                        type="button"
                        className={toggleClass}
                        disabled={!canToggle}
                        onClick={() => handleFrameworkPathToggle(choiceSelection, group.key, canToggle)}
                      >
                        {isSelected ? 'Selected' : 'Add'}
                      </button>
                    </div>
                    {ability.description && <p>{ability.description}</p>}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      };

      const polarityGroups = (['receiver', 'influencer'] as PolarityType[]) // order matters
        .map((polarity) => {
          const group = choiceCollection.polarity[polarity];
          if (!group) return null;
          const isActive = selectedPolarity === polarity;
          const requirement = isActive
            ? undefined
            : GROUP_REQUIREMENTS[group.key] ?? `Requires ${toTitleCase(polarity)} configuration.`;
          return renderChoiceGroup(group, { enabled: isActive, requirement });
        })
        .filter((element): element is JSX.Element => element !== null);

      const scopeGroups = (['aural', 'targeted'] as ScopeType[])
        .map((scope) => {
          const scopeEntry = choiceCollection.scope[scope];
          const entries = (['receiver', 'influencer'] as PolarityType[]) // matches polarity selection mapping
            .map((polarity) => {
              const group = scopeEntry?.[polarity];
              if (!group) return null;
              const isActive = selectedPolarity === polarity && selectedScope === scope;
              const requirement = isActive
                ? undefined
                : GROUP_REQUIREMENTS[group.key] ??
                  `Requires ${toTitleCase(scope)} scope and ${toTitleCase(polarity)} configuration.`;
              return renderChoiceGroup(group, { enabled: isActive, requirement });
            })
            .filter((element): element is JSX.Element => element !== null);
          if (entries.length === 0) return null;
          return (
            <div key={`${rootId}-scope-${scope}`} className="lineage-choice-scope">
              <p className="lineage-choice-scope__label">{translateTerminology(`${toTitleCase(scope)} Options`)}</p>
              {entries}
            </div>
          );
        })
        .filter((element): element is JSX.Element => element !== null);

      const generalGroups = choiceCollection.general
        .map((group) => renderChoiceGroup(group, { enabled: true }))
        .filter((element): element is JSX.Element => element !== null);

      const selection: LineagePowerSelection = {
        id: rootId,
        lineage: 'esper',
        label: `Mentalist Path — ${pathLabel}`,
        kind: 'esper-archetype',
        meta: {
          root: rootId,
          path: [rootId],
          depth: 0,
          category: 'esper-mentalist'
        }
      };
      const isSelected = selectedIds.has(selection.id);
      const toggleClass = `power-toggle${isSelected ? ' power-toggle--active' : ''}`;
      const disabled = !mentalistAllowed;
      const cardClass = `lineage-power-card${isSelected ? ' lineage-power-card--selected' : ''}`;

      return (
        <details key={rootId} className={cardClass} open={isSelected}>
          <summary>
            <div className="lineage-power-card__summary">
              <h4>{pathLabel}</h4>
              <button
                type="button"
                className={toggleClass}
                disabled={disabled && !isSelected}
                onClick={(event) => {
                  event.preventDefault();
                  if (!disabled || isSelected) {
                    handleArchetypeToggle(selection);
                  }
                }}
              >
                {isSelected ? 'Selected' : 'Add'}
              </button>
            </div>
          </summary>
          {naturalLean && <p className="power-description__detail">Natural Lean: {naturalLean}</p>}
          {philosophy && <p>{philosophy}</p>}
          {(polarityGroups.length > 0 || scopeGroups.length > 0 || generalGroups.length > 0) && (
            <section className="lineage-power-subsection">
              <h5>{isMetaMindPath ? 'Cognitive Framework' : 'Power Selections'}</h5>
              {polarityGroups.length > 0 && (
                <div className="lineage-choice-section">
                  <h6>{isMetaMindPath ? 'Mode Selection' : 'Polarity Selection'}</h6>
                  {polarityGroups}
                </div>
              )}
              {scopeGroups.length > 0 && (
                <div className="lineage-choice-section">
                  <h6>{isMetaMindPath ? 'Expression Range' : 'Scope Selection'}</h6>
                  {scopeGroups}
                </div>
              )}
              {generalGroups.length > 0 && (
                <div className="lineage-choice-section">
                  <h6>{isMetaMindPath ? 'Additional Routines' : 'Additional Powers'}</h6>
                  {generalGroups}
                </div>
              )}
            </section>
          )}
          {renderAbilitySection('Path Powers', pathPowers, 'h5', `${rootId}-powers`)}
          {coreMechanics.length > 0 && (
            <section className="lineage-power-subsection">
              <h5>Core Mechanics</h5>
              <ul className="power-list">
                {coreMechanics.map((mechanic) => (
                  <li key={mechanic.key} className="power-list__item">
                    <strong>{mechanic.name}</strong>
                    {mechanic.description && <p>{mechanic.description}</p>}
                    {mechanic.outcomes.length > 0 && (
                      <ul className="power-description__outcomes">
                        {mechanic.outcomes.map((outcome) => (
                          <li key={outcome.label}>
                            <strong>{outcome.label}</strong>
                            <span>{outcome.result}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {consequenceTables.length > 0 && (
            <section className="lineage-power-subsection">
              <h5>Consequence Tables</h5>
              <div className="focus-grid">
                {consequenceTables.map((table) => (
                  <div key={table.key} className="focus-card">
                    <h6>{table.label}</h6>
                    <ul className="power-description__outcomes">
                      {table.entries.map((entry) => (
                        <li key={entry.id}>
                          {typeof entry.roll === 'number' && <strong>Roll {entry.roll}</strong>}
                          {entry.result && <span>{entry.result}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}
          {childFocuses && (
            <section className="lineage-power-subsection">
              <h5>Advanced Paths</h5>
              <div className="focus-grid">
                {Object.values(childFocuses).map((focus) => {
                  const focusRecord = focus as UnknownRecord;
                  const childName = typeof focusRecord.name === 'string' ? focusRecord.name : 'Focus';
                  const focusId =
                    typeof focusRecord.id === 'string' && focusRecord.id.length > 0
                      ? focusRecord.id
                      : slugify(`${rootId}-${childName}`);
                  return renderEsperFocusNode(focusRecord, [rootId, focusId], 1, rootId);
                })}
              </div>
            </section>
          )}
        </details>
      );
    };

    return (
      <section className="lineage-powers-panel">
        <header>
          <h3>Esper / Mentalist Evolutions</h3>
          <p>Baseline talents and branching focuses define your psionic expression.</p>
        </header>
        <aside className="lineage-power-summary">
          <div>
            <span>Archetypes Selected</span>
            <strong>{archetypeCount}</strong>
          </div>
          <div>
            <span>Focus Paths</span>
            <strong>{focusCount}</strong>
          </div>
          <div>
            <span>Framework Choices</span>
            <strong>{frameworkChoiceCount + frameworkPathCount}</strong>
          </div>
          {esperNote && <p className="lineage-power-summary__note">{esperNote}</p>}
          {selectionsForLineage.length > 0 && (
            <button type="button" className="power-toggle power-toggle--clear" onClick={onClearSelections}>
              Clear selections
            </button>
          )}
        </aside>
        {baseAllowed && (
          <div className="lineage-powers-grid lineage-powers-grid--tall">
            {Object.values(archetypes).map((archetype) => renderArchetypeCard(archetype))}
          </div>
        )}
        {!baseAllowed && <p className="lineage-note">Priority C Espers begin as Mentalists. Select a path below.</p>}
        {(() => {
          const foundationalAugmentGroups = foundationalAugmentsRaw
            ? Object.entries(foundationalAugmentsRaw).reduce<
                Array<{ key: string; label: string; abilities: AbilityEntry[] }>
              >((acc, [categoryKey, value]) => {
                const abilities = createAbilityEntries(
                  normalizeAbilityCollection(value),
                  `${(mentalistRoot ?? 'mentalist')}-${categoryKey}`
                );
                if (abilities.length > 0) {
                  acc.push({ key: categoryKey, label: toTitleCase(categoryKey), abilities });
                }
                return acc;
              }, [])
            : [];
          const hasMentalistData = foundationalAugmentGroups.length > 0 || mentalistPathEntries.length > 0;
          if (!mentalistAllowed || !hasMentalistData) {
            return (
              !mentalistAllowed && hasMentalistData && lineagePriority !== null && (
                <p className="lineage-note">Mentalist paths unlock at Priority A or C.</p>
              )
            );
          }

          return (
            <article className="lineage-power-card framework">
              <header>
                <h4>Mentalist Framework</h4>
              </header>
              {foundationalAugmentGroups.length > 0 && (() => {
                const rootKey = mentalistRoot ?? 'mentalist';
                const polarityGroup = foundationalAugmentGroups.find((group) => group.key === 'polarity');
                const scopeGroup = foundationalAugmentGroups.find((group) => group.key === 'scope');
                const remainingGroups = foundationalAugmentGroups.filter(
                  (group) => group.key !== 'polarity' && group.key !== 'scope'
                );

                const renderFoundationalList = (
                  group: { key: string; label: string; abilities: AbilityEntry[] },
                  title?: string
                ) => (
                  <div key={group.key} className="lineage-choice-section">
                    <h6>{title ?? group.label}</h6>
                    <ul className="power-list">
                      {group.abilities.map((ability, index) => {
                        const fallbackId = `${rootKey}-${group.key}-${index}`;
                        const abilityId = ability.id || fallbackId;
                        const selection: LineagePowerSelection = {
                          id: abilityId,
                          lineage: 'esper',
                          label: `Foundational Augment — ${ability.name}`,
                          kind: 'esper-framework-choice',
                          meta: {
                            root: rootKey,
                            parent: rootKey,
                            path: [rootKey, 'foundational', group.key, abilityId],
                            depth: 1,
                            category: 'esper-mentalist'
                          }
                        };
                        const isSelected = selectedIds.has(selection.id);
                        const disabled = !isRootSelected(rootKey) || !isDepthAllowed(rootKey, 1);
                        const itemClass = `power-list__item${isSelected ? ' power-list__item--selected' : ''}`;
                        const toggleClass = `power-toggle${isSelected ? ' power-toggle--active' : ''}`;
                        return (
                          <li key={abilityId} className={itemClass}>
                            <div className="power-list__header">
                              <div>
                                <strong>{ability.name}</strong>
                                {ability.type && <span className="badge badge--type">{toTitleCase(ability.type)}</span>}
                                {ability.cost && <span className="badge badge--cost">{ability.cost}</span>}
                                {ability.duration && <span className="badge">{ability.duration}</span>}
                                {ability.scope && <span className="badge">{ability.scope}</span>}
                              </div>
                              <button
                                type="button"
                                className={toggleClass}
                                disabled={disabled && !isSelected}
                                onClick={() => {
                                  if (!disabled || isSelected) {
                                    handleFrameworkChoiceToggle(selection, group.key);
                                  }
                                }}
                              >
                                {isSelected ? 'Selected' : 'Add'}
                              </button>
                            </div>
                            {ability.description && <p>{ability.description}</p>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );

                return (
                  <section className="lineage-power-subsection">
                    <h5>Foundational Augments</h5>
                    {polarityGroup && renderFoundationalList(polarityGroup, 'Polarity Configuration')}
                    {scopeGroup && renderFoundationalList(scopeGroup, 'Scope Configuration')}
                    {remainingGroups.map((group) => renderFoundationalList(group))}
                  </section>
                );
              })()}
              {mentalistPathEntries.length > 0 && (
                <section className="lineage-power-subsection">
                  <h5>Paths</h5>
                  <div className="lineage-powers-grid lineage-powers-grid--tall">
                    {mentalistPathEntries.map(([pathKey, pathRecord]) =>
                      renderMentalistPath(pathKey, pathRecord)
                    )}
                  </div>
                </section>
              )}
            </article>
          );
        })()}
      </section>
    );
  }

  if (lineage === 'automata' && isAutomataData(powerData)) {
    const capabilityCount = selectionsForLineage.filter((entry) => entry.kind === 'automata-capability').length;
    const modelCount = selectionsForLineage.filter((entry) => entry.kind === 'automata-model').length;
    return (
      <section className="lineage-powers-panel">
        <header>
          <h3>Chassis & Branches</h3>
          <p>Choose a chassis, explore its branches, and escalate from basic to imperial protocols.</p>
        </header>
        <aside className="lineage-power-summary">
          <div>
            <span>Capabilities</span>
            <strong>{capabilityCount}</strong>
          </div>
          <div>
            <span>Models</span>
            <strong>{modelCount}</strong>
          </div>
          {selectionsForLineage.length > 0 && (
            <button type="button" className="power-toggle power-toggle--clear" onClick={onClearSelections}>
              Clear selections
            </button>
          )}
        </aside>
        <div className="chassis-grid">
          {Object.values(powerData.chassis).map((chassis) => (
            <details key={chassis.id ?? chassis.name} className="lineage-power-card" open>
              <summary>
                <div className="lineage-power-card__summary">
                  <h4>{chassis.name}</h4>
                </div>
              </summary>
              {chassis.branches && (
                <div className="branch-grid">
                  {Object.values(chassis.branches).map((branch) => {
                    const branchName = branch.name ?? 'Branch';
                    const branchId = branch.id ?? `${chassis.id ?? slugify(chassis.name ?? 'chassis')}-${slugify(branchName)}`;
                    const branchCapabilities = branch.general_capabilities ?? [];
                    return (
                      <details key={branchId} className="branch-card" open>
                        <summary>
                          <div className="branch-card__summary">
                            <h5>{branchName}</h5>
                            {branch.focus && <span>{branch.focus}</span>}
                          </div>
                        </summary>
                        {branchCapabilities.length > 0 && (
                          <section className="lineage-power-subsection">
                            <h6>General Capabilities</h6>
                            <ul className="power-list">
                              {branchCapabilities.map((capability, index) => {
                                const capabilityName = capability.name ?? 'Capability';
                                const capabilityId = `${branchId}-cap-${index}-${slugify(capabilityName)}`;
                                const capabilitySelection: LineagePowerSelection = {
                                  id: capabilityId,
                                  lineage: 'automata',
                                  label: `Capability — ${capabilityName}`,
                                  kind: 'automata-capability',
                                  meta: {
                                    branch: branchName,
                                    chassis: chassis.name,
                                    category: capability.type
                                  }
                                };
                                const capabilitySelected = selectedIds.has(capabilitySelection.id);
                                const capabilityItemClass = `power-list__item${capabilitySelected ? ' power-list__item--selected' : ''}`;
                                const capabilityToggleClass = `power-toggle${capabilitySelected ? ' power-toggle--active' : ''}`;
                                return (
                                  <li key={capabilityId} className={capabilityItemClass}>
                                    <div className="power-list__header">
                                      <div>
                                        <strong>{capabilityName}</strong>
                                        {capability.type && <span className="badge badge--type">{capability.type}</span>}
                                        {typeof capability.cost === 'number' && (
                                          <span className="badge badge--cost">Cost {capability.cost}</span>
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        className={capabilityToggleClass}
                                        onClick={() => onToggleSelection(capabilitySelection)}
                                      >
                                        {capabilitySelected ? 'Selected' : 'Add'}
                                      </button>
                                    </div>
                                    {capability.description && <p>{capability.description}</p>}
                                  </li>
                                );
                              })}
                            </ul>
                          </section>
                        )}
                        {branch.models && (
                          <section className="lineage-power-subsection">
                            <h6>Models</h6>
                            <div className="model-grid">
                              {Object.values(branch.models).map((model) => {
                                const modelName = model.name ?? 'Model';
                                const modelId = `${branchId}-model-${slugify(modelName)}`;
                                const modelSelection: LineagePowerSelection = {
                                  id: modelId,
                                  lineage: 'automata',
                                  label: `Model — ${modelName}`,
                                  kind: 'automata-model',
                                  meta: {
                                    branch: branchName,
                                    chassis: chassis.name,
                                    category: model.tier
                                  }
                                };
                                const modelSelected = selectedIds.has(modelSelection.id);
                                const modelClass = `model-card${model.available === false ? ' model-card--locked' : ''}${modelSelected ? ' model-card--selected' : ''}`;
                                const modelToggleClass = `power-toggle${modelSelected ? ' power-toggle--active' : ''}`;
                                return (
                                  <div key={modelId} className={modelClass}>
                                    <div className="model-card__header">
                                      <strong>{modelName}</strong>
                                      {model.tier && <span className="badge badge--tier">{model.tier}</span>}
                                      {model.available === false && <span className="badge badge--locked">Locked</span>}
                                      <button
                                        type="button"
                                        className={modelToggleClass}
                                        onClick={() => onToggleSelection(modelSelection)}
                                      >
                                        {modelSelected ? 'Selected' : 'Add'}
                                      </button>
                                    </div>
                                    {renderCapabilities(model.augments, gmEnabled)}
                                    {renderCapabilities(model.moves, gmEnabled)}
                                  </div>
                                );
                              })}
                            </div>
                          </section>
                        )}
                      </details>
                    );
                  })}
                </div>
              )}
            </details>
          ))}
        </div>
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
