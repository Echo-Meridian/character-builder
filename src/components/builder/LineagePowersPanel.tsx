import type { LineageKey, PriorityRank, RawLineagePowerData } from '../../data/types';
import './lineage-powers.css';

interface LineagePowersPanelProps {
  lineage: LineageKey | null;
  powerData?: RawLineagePowerData;
  gmEnabled: boolean;
  lineagePriority: PriorityRank | null;
}

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

export function LineagePowersPanel({ lineage, powerData, gmEnabled, lineagePriority }: LineagePowersPanelProps) {
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

  if (lineage === 'neosapien' && isNeoSapienData(powerData)) {
    return (
      <section className="lineage-powers-panel">
        <header>
          <h3>Augment Catalog</h3>
          <p>Slot-based upgrades ranging from street scraps to imperial artistry.</p>
        </header>
        <div className="lineage-powers-grid">
          {powerData.powers.map((power) => (
            <article key={power.id ?? power.name} className="lineage-power-card">
              <header>
                <h4>{power.name}</h4>
                {power.category && <span className="badge">{power.category}</span>}
              </header>
              <div className="lineage-power-card__body">
                {Object.entries(power.grades ?? {}).map(([gradeKey, grade]) => (
                  <section key={gradeKey} className="lineage-power-grade">
                    <div className="lineage-power-grade__header">
                      <span className="badge badge--grade">{grade.name ?? gradeKey}</span>
                      <div className="lineage-power-grade__meta">
                        {typeof grade.tier === 'number' && <span>Tier {grade.tier}</span>}
                        {typeof grade.slots === 'number' && <span>{grade.slots} Slot{grade.slots === 1 ? '' : 's'}</span>}
                        {typeof grade.permanentCorruption === 'number' && <span>{grade.permanentCorruption} Permanent Corruption</span>}
                      </div>
                    </div>
                    {renderDescription(grade.description, gmEnabled)}
                  </section>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (lineage === 'chimera' && isChimeraData(powerData)) {
    return (
      <section className="lineage-powers-panel">
        <header>
          <h3>Mutation Catalogue</h3>
          <p>Spend mutation points to embrace the city's wild ecologies.</p>
        </header>
        <div className="lineage-powers-grid">
          {powerData.powers.map((power) => (
            <article key={power.id ?? power.name} className="lineage-power-card">
              <header>
                <h4>{power.name}</h4>
                {power.category && <span className="badge">{power.category}</span>}
              </header>
              <div className="lineage-power-card__body">
                {Object.entries(power.tiers ?? {}).map(([tierKey, tier]) => (
                  <section key={tierKey} className="lineage-power-grade">
                    <div className="lineage-power-grade__header">
                      <span className="badge badge--grade">{tier.name ?? tierKey}</span>
                      <div className="lineage-power-grade__meta">
                        {typeof tier.tier === 'number' && <span>Tier {tier.tier}</span>}
                        {typeof tier.mutationPoints === 'number' && <span>{tier.mutationPoints} Mutation Pts</span>}
                        {typeof tier.permanentCorruption === 'number' && <span>{tier.permanentCorruption} Permanent Corruption</span>}
                      </div>
                    </div>
                    {renderDescription(tier.description, gmEnabled)}
                  </section>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (lineage === 'sorcery' && isSorceryData(powerData)) {
    const { spheres } = powerData;
    return (
      <section className="lineage-powers-panel">
        <header>
          <h3>Sphere Library</h3>
          <p>Primary and secondary spheres unlock ritual moves and narrative permissions.</p>
        </header>
        <div className="lineage-powers-columns">
          {['primary', 'secondary'].map((tier) => {
            const sphereGroup = spheres?.[tier as keyof typeof spheres];
            if (!sphereGroup) return null;
            return (
              <div key={tier} className="sphere-column">
                <h4 className="sphere-column__heading">{tier === 'primary' ? 'Primary Spheres' : 'Secondary Spheres'}</h4>
                {Object.values(sphereGroup).map((sphere) => (
                  <article key={sphere.id ?? sphere.name} className="sphere-card">
                    <header>
                      <h5>{sphere.name}</h5>
                    </header>
                    <ul className="power-list">
                      {sphere.moves?.map((move) => (
                        <li key={move.id ?? move.name}>
                          <div>
                            <strong>{move.name}</strong>
                            {move.type && <span className="badge badge--type">{move.type}</span>}
                          </div>
                          {renderDescription(move.description, gmEnabled)}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (lineage === 'esper' && isEsperData(powerData)) {
    const archetypes = powerData.esper_archetypes ?? {};
    const frameworkRaw = powerData.mentalist_framework ?? {};
    const frameworkDetails = isRecord(frameworkRaw) ? extractFrameworkDetails(frameworkRaw) : null;
    const showBaseArchetypes = lineagePriority !== 'C';
    return (
      <section className="lineage-powers-panel">
        <header>
          <h3>Esper / Mentalist Evolutions</h3>
          <p>Baseline talents and branching focuses define your psionic expression.</p>
        </header>
        {showBaseArchetypes && (
          <div className="lineage-powers-grid">
            {Object.values(archetypes).map((archetype) => (
              <article key={archetype.id ?? archetype.name} className="lineage-power-card">
                <header>
                  <h4>{archetype.name}</h4>
                </header>
                {archetype.philosophy && <p className="power-description__detail">{archetype.philosophy}</p>}
                {archetype.baseline_moves && archetype.baseline_moves.length > 0 && (
                  <section className="lineage-power-subsection">
                    <h5>Baseline Moves</h5>
                    <ul className="power-list">
                      {archetype.baseline_moves.map((move) => (
                        <li key={move.id ?? move.name}>
                          <div>
                            <strong>{move.name}</strong>
                            {move.type && <span className="badge badge--type">{move.type}</span>}
                          </div>
                          {move.description && <p>{move.description}</p>}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {archetype.focuses && (
                  <section className="lineage-power-subsection">
                    <h5>Focus Paths</h5>
                    <div className="focus-grid">
                      {Object.values(archetype.focuses).map((focus) => (
                        <div key={focus.id ?? focus.name} className="focus-card">
                          <h6>{focus.name}</h6>
                          {focus.philosophy && <p>{focus.philosophy}</p>}
                          {focus.moves && (
                            <ul className="power-list">
                              {focus.moves.map((move) => (
                                <li key={move.id ?? move.name}>
                                  <strong>{move.name}</strong>
                                  {move.description && <p>{move.description}</p>}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </article>
            ))}
          </div>
        )}
        {!showBaseArchetypes && (
          <p className="lineage-note">Priority C Espers begin as Mentalists. Choose from the paths below.</p>
        )}
        {frameworkDetails && (
          <article className="lineage-power-card framework">
            <header>
              <h4>Mentalist Framework</h4>
            </header>
            {frameworkDetails.description && <p>{frameworkDetails.description}</p>}
            {frameworkDetails.foundationalChoices && frameworkDetails.foundationalChoices.length > 0 && (
              <section className="lineage-power-subsection">
                <h5>Foundational Choices</h5>
                <ul className="power-list">
                  {frameworkDetails.foundationalChoices.map((choice, index) => (
                    <li key={index}>{choice}</li>
                  ))}
                </ul>
              </section>
            )}
            {frameworkDetails.paths && (
              <section className="lineage-power-subsection">
                <h5>Paths</h5>
                <div className="focus-grid">
                  {Object.entries(frameworkDetails.paths).map(([pathName, pathData]) => (
                    <div key={pathName} className="focus-card">
                      <h6>{pathName}</h6>
                      {pathData.description && <p>{pathData.description}</p>}
                      {pathData.moves && (
                        <ul className="power-list">
                          {pathData.moves.map((move, index) => (
                            <li key={index}>{move}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </article>
        )}
      </section>
    );
  }

  if (lineage === 'automata' && isAutomataData(powerData)) {
    return (
      <section className="lineage-powers-panel">
        <header>
          <h3>Chassis & Branches</h3>
          <p>Choose a chassis, explore its branches, and escalate from basic to imperial protocols.</p>
        </header>
        <div className="chassis-grid">
          {Object.values(powerData.chassis).map((chassis) => (
            <article key={chassis.id ?? chassis.name} className="lineage-power-card">
              <header>
                <h4>{chassis.name}</h4>
              </header>
              {chassis.branches && (
                <div className="branch-grid">
                  {Object.values(chassis.branches).map((branch) => (
                    <div key={branch.id ?? branch.name} className="branch-card">
                      <header>
                        <h5>{branch.name}</h5>
                        {branch.focus && <p>{branch.focus}</p>}
                      </header>
                      {renderCapabilities(branch.general_capabilities, gmEnabled)}
                      {branch.models && (
                        <section className="lineage-power-subsection">
                          <h6>Models</h6>
                          <div className="model-grid">
                            {Object.values(branch.models).map((model) => (
                              <div key={model.name} className={`model-card${model.available === false ? ' model-card--locked' : ''}`}>
                                <div className="model-card__header">
                                  <strong>{model.name}</strong>
                                  {model.tier && <span className="badge badge--tier">{model.tier}</span>}
                                  {model.available === false && <span className="badge badge--locked">Locked</span>}
                                </div>
                                {renderCapabilities(model.augments, gmEnabled)}
                                {renderCapabilities(model.moves, gmEnabled)}
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </article>
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
