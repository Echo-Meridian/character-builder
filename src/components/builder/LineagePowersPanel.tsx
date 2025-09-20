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

interface EsperFocus {
  id?: string;
  name?: string;
  path?: string;
  philosophy?: string;
  moves?: Array<{ id?: string; name?: string; description?: string }>;
}

interface EsperArchetype {
  id?: string;
  name?: string;
  philosophy?: string;
  baseline_moves?: Array<{ id?: string; name?: string; type?: string; description?: string }>;
  focuses?: Record<string, EsperFocus>;
}

interface EsperData extends RawLineagePowerData {
  esper_archetypes?: Record<string, EsperArchetype>;
  mentalist_framework?: Record<string, unknown>;
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

function extractFrameworkDetails(framework: UnknownRecord) {
  const description = typeof framework.description === 'string' ? framework.description : undefined;

  const foundationalChoices = Array.isArray(framework.foundational_choices)
    ? (framework.foundational_choices as unknown[]).filter((entry): entry is string => typeof entry === 'string')
    : undefined;

  let paths: Record<string, { description?: string; moves?: string[] }> | undefined;
  if (isRecord(framework.paths)) {
    paths = Object.entries(framework.paths).reduce<Record<string, { description?: string; moves?: string[] }>>((acc, [key, value]) => {
      if (!isRecord(value)) return acc;
      const pathDescription = typeof value.description === 'string' ? value.description : undefined;
      const moves = Array.isArray(value.moves)
        ? (value.moves as unknown[]).filter((entry): entry is string => typeof entry === 'string')
        : undefined;
      acc[key] = { description: pathDescription, moves };
      return acc;
    }, {});
    if (Object.keys(paths).length === 0) {
      paths = undefined;
    }
  }

  return {
    description,
    foundationalChoices,
    paths
  };
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
    const frameworkRaw = powerData.mentalist_framework ?? {};
    const frameworkDetails = isRecord(frameworkRaw) ? extractFrameworkDetails(frameworkRaw) : null;
    const baseAllowed = lineagePriority !== 'C';
    const mentalistAllowed = lineagePriority === 'A' || lineagePriority === 'C';
    const esperNote = lineagePriority ? ESPER_NOTES[lineagePriority] : undefined;
    const depthLimit = lineagePriority ? ESPER_DEPTH_LIMIT[lineagePriority] : 0;

    const baseSelections = selectionsForLineage.filter((entry) => entry.kind === 'esper-archetype');
    const currentEsperRoot = baseSelections[0]?.meta?.root ?? null;
    const currentEsperCategory = baseSelections[0]?.meta?.category ?? null;

    const archetypeCount = baseSelections.length;
    const focusCount = selectionsForLineage.filter((entry) => entry.kind === 'esper-focus').length;
    const frameworkChoiceCount = selectionsForLineage.filter((entry) => entry.kind === 'esper-framework-choice').length;
    const frameworkPathCount = selectionsForLineage.filter((entry) => entry.kind === 'esper-framework-path').length;

    const handleArchetypeToggle = (selection: LineagePowerSelection) => {
      const isSelected = selectedIds.has(selection.id);
      const category = selection.meta?.category;
      if (category === 'esper-base' && !baseAllowed) {
        return;
      }
      if (category === 'esper-mentalist' && !mentalistAllowed) {
        return;
      }
      onClearSelections();
      if (!isSelected) {
        onToggleSelection(selection);
      }
    };

    const handleFocusToggle = (selection: LineagePowerSelection) => {
      const root = selection.meta?.root;
      const depth = selection.meta?.depth ?? 0;
      if (!root || !currentEsperRoot || root !== currentEsperRoot) {
        return;
      }
      if (depth > depthLimit) {
        return;
      }
      onToggleSelection(selection);
    };

    const isRootSelected = (root: string) => currentEsperRoot === root;
    const isDepthAllowed = (depth: number) => depth <= depthLimit;

    const renderEsperFocusNode = (
      focus: UnknownRecord,
      path: string[],
      depth: number,
      rootId: string
    ): JSX.Element => {
      const focusName = typeof focus.name === 'string' ? focus.name : path[path.length - 1];
      const focusId = typeof focus.id === 'string' ? focus.id : path.join('-');
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
      const disabled = !isRootSelected(rootId) || !isDepthAllowed(depth);
      const toggleClass = `power-toggle${isSelected ? ' power-toggle--active' : ''}`;
      const cardClass = `focus-card${isSelected ? ' focus-card--selected' : ''}`;
      const moveEntries = Array.isArray(focus.moves) ? (focus.moves as unknown[]) : [];
      const augmentEntries = Array.isArray(focus.augments) ? (focus.augments as unknown[]) : [];
      const mutationEntries = Array.isArray(focus.mutations) ? (focus.mutations as unknown[]) : [];
      const traumaEntries = Array.isArray(focus.trauma_mutations) ? (focus.trauma_mutations as unknown[]) : [];
      const childFocuses = isRecord(focus.focuses) ? (focus.focuses as Record<string, unknown>) : undefined;

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
          {typeof focus.philosophy === 'string' && <p>{focus.philosophy}</p>}
      {moveEntries.length > 0 && (
        <section className="lineage-power-subsection">
          <h5>Signature Moves</h5>
          <ul className="power-list">
            {moveEntries.map((move, index) => {
              const moveRecord = move as UnknownRecord;
              const moveId =
                typeof moveRecord.id === 'string' && moveRecord.id.length > 0
                  ? moveRecord.id
                  : `${focusId}-move-${index}`;
              const moveName =
                typeof moveRecord.name === 'string' && moveRecord.name.length > 0
                  ? moveRecord.name
                  : `Move ${index + 1}`;
              return (
                <li key={moveId} className="power-list__item">
                  <strong>{moveName}</strong>
                  {typeof moveRecord.description === 'string' && <p>{moveRecord.description}</p>}
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {augmentEntries.length > 0 && (
        <section className="lineage-power-subsection">
          <h5>Augments</h5>
          <ul className="power-list">
            {augmentEntries.map((augment, index) => {
              const augmentRecord = augment as UnknownRecord;
              const augmentId =
                typeof augmentRecord.id === 'string' && augmentRecord.id.length > 0
                  ? augmentRecord.id
                  : `${focusId}-augment-${index}`;
              const augmentName =
                typeof augmentRecord.name === 'string' && augmentRecord.name.length > 0
                  ? augmentRecord.name
                  : `Augment ${index + 1}`;
              return (
                <li key={augmentId} className="power-list__item">
                  <strong>{augmentName}</strong>
                  {typeof augmentRecord.description === 'string' && <p>{augmentRecord.description}</p>}
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {mutationEntries.length > 0 && (
        <section className="lineage-power-subsection">
          <h5>Mutations</h5>
          <ul className="power-list">
            {mutationEntries.map((mutation, index) => {
              const mutationRecord = mutation as UnknownRecord;
              const mutationId =
                typeof mutationRecord.id === 'string' && mutationRecord.id.length > 0
                  ? mutationRecord.id
                  : `${focusId}-mutation-${index}`;
              const mutationName =
                typeof mutationRecord.name === 'string' && mutationRecord.name.length > 0
                  ? mutationRecord.name
                  : `Mutation ${index + 1}`;
              return (
                <li key={mutationId} className="power-list__item">
                  <strong>{mutationName}</strong>
                  {typeof mutationRecord.description === 'string' && <p>{mutationRecord.description}</p>}
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {traumaEntries.length > 0 && (
        <section className="lineage-power-subsection">
          <h5>Trauma Mutations</h5>
          <ul className="power-list">
            {traumaEntries.map((mutation, index) => {
              const mutationRecord = mutation as UnknownRecord;
              const mutationId =
                typeof mutationRecord.id === 'string' && mutationRecord.id.length > 0
                  ? mutationRecord.id
                  : `${focusId}-trauma-${index}`;
              const mutationName =
                typeof mutationRecord.name === 'string' && mutationRecord.name.length > 0
                  ? mutationRecord.name
                  : `Mutation ${index + 1}`;
              return (
                <li key={mutationId} className="power-list__item">
                  <strong>{mutationName}</strong>
                  {typeof mutationRecord.description === 'string' && <p>{mutationRecord.description}</p>}
                </li>
              );
            })}
          </ul>
        </section>
      )}
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
          {Array.isArray(archetype.baseline_moves) && archetype.baseline_moves.length > 0 && (
            <section className="lineage-power-subsection">
              <h5>Baseline Moves</h5>
              <ul className="power-list">
                {archetype.baseline_moves.map((move, index) => {
                  const moveId = typeof move?.id === 'string' && move.id.length > 0 ? move.id : `${rootId}-baseline-${index}`;
                  const moveName = typeof move?.name === 'string' && move.name.length > 0 ? move.name : `Move ${index + 1}`;
                  return (
                    <li key={moveId} className="power-list__item">
                      <div>
                        <strong>{moveName}</strong>
                        {typeof move?.type === 'string' && <span className="badge badge--type">{move.type}</span>}
                      </div>
                      {typeof move?.description === 'string' && <p>{move.description}</p>}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
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

    const renderMentalistPath = (pathName: string, pathData: UnknownRecord) => {
      const rootId = typeof pathData.id === 'string' ? pathData.id : slugify(pathName);
      const selection: LineagePowerSelection = {
        id: rootId,
        lineage: 'esper',
        label: `Mentalist Path — ${pathName}`,
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
      const pathMoves = Array.isArray(pathData.moves) ? (pathData.moves as unknown[]) : [];
      const pathTrauma = Array.isArray(pathData.trauma_mutations) ? (pathData.trauma_mutations as unknown[]) : [];
      const childFocuses = isRecord(pathData.focuses) ? (pathData.focuses as Record<string, unknown>) : undefined;

      return (
        <details key={rootId} className={cardClass} open={isSelected}>
          <summary>
            <div className="lineage-power-card__summary">
              <h4>{pathName}</h4>
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
          {typeof pathData.description === 'string' && <p>{pathData.description}</p>}
          {pathMoves.length > 0 && (
            <section className="lineage-power-subsection">
              <h5>Signature Moves</h5>
              <ul className="power-list">
                {pathMoves.map((move, index) => {
                  const moveRecord = move as UnknownRecord;
                  const moveId =
                    typeof moveRecord.id === 'string' && moveRecord.id.length > 0
                      ? moveRecord.id
                      : `${rootId}-move-${index}`;
                  const moveLabel =
                    typeof moveRecord.name === 'string' && moveRecord.name.length > 0
                      ? moveRecord.name
                      : `Move ${index + 1}`;
                  return (
                    <li key={moveId} className="power-list__item">
                      {moveLabel}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
          {pathTrauma.length > 0 && (
            <section className="lineage-power-subsection">
              <h5>Trauma Mutations</h5>
              <ul className="power-list">
                {pathTrauma.map((mutation, index) => {
                  const mutationRecord = mutation as UnknownRecord;
                  const mutationId =
                    typeof mutationRecord.id === 'string' && mutationRecord.id.length > 0
                      ? mutationRecord.id
                      : `${rootId}-trauma-${index}`;
                  const mutationName =
                    typeof mutationRecord.name === 'string' && mutationRecord.name.length > 0
                      ? mutationRecord.name
                      : `Mutation ${index + 1}`;
                  return (
                    <li key={mutationId} className="power-list__item">
                      <strong>{mutationName}</strong>
                      {typeof mutationRecord.description === 'string' && <p>{mutationRecord.description}</p>}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
          {childFocuses && (
            <section className="lineage-power-subsection">
              <h5>Advanced Paths</h5>
              <div className="focus-grid">
                {Object.values(childFocuses).map((focus) => {
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
        {mentalistAllowed && frameworkDetails && (
          <article className="lineage-power-card framework">
            <header>
              <h4>Mentalist Framework</h4>
            </header>
            {frameworkDetails.description && <p>{frameworkDetails.description}</p>}
            {frameworkDetails.foundationalChoices && frameworkDetails.foundationalChoices.length > 0 && (
              <section className="lineage-power-subsection">
                <h5>Foundational Choices</h5>
              <ul className="power-list">
                {frameworkDetails.foundationalChoices.map((choice, index) => {
                  const mentalistRoot = currentEsperCategory === 'esper-mentalist' && currentEsperRoot ? currentEsperRoot : 'mentalist';
                  const choiceLabel = typeof choice === 'string' ? choice : String(choice);
                  const choiceId = `${mentalistRoot}-choice-${index}`;
                  const selection: LineagePowerSelection = {
                    id: choiceId,
                    lineage: 'esper',
                    label: `Framework Choice — ${choiceLabel}`,
                    kind: 'esper-framework-choice',
                    meta: {
                      root: mentalistRoot,
                      parent: mentalistRoot,
                      path: [mentalistRoot, `choice-${index}`],
                        depth: 1,
                        category: 'esper-mentalist'
                      }
                    };
                    const isSelected = selectedIds.has(selection.id);
                    const disabled = mentalistRoot === 'mentalist' || !isDepthAllowed(1);
                    const toggleClass = `power-toggle${isSelected ? ' power-toggle--active' : ''}`;
                    const itemClass = `power-list__item${isSelected ? ' power-list__item--selected' : ''}`;
                    return (
                      <li key={choiceId} className={itemClass}>
                        <div className="power-list__header">
                          <span>{choiceLabel}</span>
                          <button
                            type="button"
                            className={toggleClass}
                            disabled={disabled && !isSelected}
                            onClick={() => {
                              if (!disabled || isSelected) {
                                handleFocusToggle(selection);
                              }
                            }}
                          >
                            {isSelected ? 'Selected' : 'Add'}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
            {frameworkDetails.paths && (
              <section className="lineage-power-subsection">
                <h5>Paths</h5>
                <div className="lineage-powers-grid lineage-powers-grid--tall">
                  {Object.entries(frameworkDetails.paths).map(([pathName, pathData]) => renderMentalistPath(pathName, pathData))}
                </div>
              </section>
            )}
          </article>
        )}
        {!mentalistAllowed && frameworkDetails && lineagePriority !== null && (
          <p className="lineage-note">Mentalist paths unlock at Priority A or C.</p>
        )}
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
