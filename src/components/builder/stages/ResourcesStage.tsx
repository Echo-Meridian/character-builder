import type { ResourceCostsData, ResourceSystem } from '../../../data/types';
import type { PriorityRank } from '../../../data/types';
import './resources-stage.css';

interface ResourcesStageProps {
  priority: PriorityRank | null;
  system: ResourceSystem;
  costs: ResourceCostsData;
  allocations: Record<'contacts' | 'retainers' | 'properties' | 'liquid', number>;
  onAllocationChange: (key: 'contacts' | 'retainers' | 'properties' | 'liquid', value: number) => void;
  notes: string;
  onUpdateNotes: (notes: string) => void;
}

const allocationLabels: Record<'contacts' | 'retainers' | 'properties' | 'liquid', string> = {
  contacts: 'Contacts & Networks',
  retainers: 'Retainers & Staff',
  properties: 'Property Holdings',
  liquid: 'Liquid Assets'
};

export function ResourcesStage({ priority, system, costs, allocations, onAllocationChange, notes, onUpdateNotes }: ResourcesStageProps) {
  const priorityDetails = priority ? system.resourcePoints[priority] : null;
  const totalSpent = Object.values(allocations).reduce((sum, value) => sum + value, 0);
  const available = priorityDetails?.points ?? 0;

  return (
    <div className="stage stage--resources">
      <header className="stage__header">
        <div>
          <h2>Resources</h2>
          <p>
            Resources track what you can call in favors for: cash, property, contacts, retainers. Assign points to build
            your personal web. When you change the priority letter, totals adjust instantly.
          </p>
        </div>
        <aside className="resource-summary">
          <span className="resource-summary__label">Priority {priority ?? '—'}</span>
          {priorityDetails ? (
            <div>
              <span className="resource-summary__value">{available} Points</span>
              <p>
                Quality ≤ {priorityDetails.maxQuality} • Combined holdings ≤ {priorityDetails.maxCombined} • Specializations {priorityDetails.specializations}
              </p>
            </div>
          ) : (
            <p>Assign a priority to unlock your pool.</p>) }
        </aside>
      </header>

      <section className="resource-allocations">
        {Object.entries(allocationLabels).map(([key, label]) => {
          const allocationKey = key as 'contacts' | 'retainers' | 'properties' | 'liquid';
          return (
            <label key={allocationKey} className="resource-field">
              <span>{label}</span>
              <input
                type="number"
                min={0}
                value={allocations[allocationKey] ?? 0}
                onChange={(event) => onAllocationChange(allocationKey, Number(event.target.value))}
              />
            </label>
          );
        })}
      </section>

      <section className="resource-ledger">
        <p>
          <strong>{totalSpent}</strong> resource points allocated of <strong>{available}</strong> available.
          {totalSpent > available && <span className="resource-ledger__warning">You are overspending. Trim or raise your priority.</span>}
        </p>
      </section>

      <section className="resource-data">
        <article>
          <h3>Contacts</h3>
          <p>{costs.contacts.baseCost.description}</p>
          <p className="example">Example: {costs.contacts.baseCost.example}</p>
          <div className="scale">
            <h4>Reach</h4>
            <ul>
              {Object.entries(system.contacts.reachScale).map(([value, label]) => (
                <li key={value}>
                  <span className="scale__value">{value}</span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
            <h4>Influence</h4>
            <ul>
              {Object.entries(system.contacts.influenceScale).map(([value, label]) => (
                <li key={value}>
                  <span className="scale__value">{value}</span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
        <article>
          <h3>Retainers</h3>
          <p>{costs.retainers.baseCost.description}</p>
          <p className="example">Example: {costs.retainers.baseCost.example}</p>
          <div className="scale">
            <h4>Competence</h4>
            <ul>
              {Object.entries(system.retainers.competenceScale).map(([value, label]) => (
                <li key={value}>
                  <span className="scale__value">{value}</span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
            <h4>Loyalty</h4>
            <ul>
              {Object.entries(system.retainers.loyaltyScale).map(([value, label]) => (
                <li key={value}>
                  <span className="scale__value">{value}</span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
        <article>
          <h3>Properties</h3>
          <p>Tenure and zoning combine to establish cost and permitted activity.</p>
          <div className="properties-grid">
            <div>
              <h4>Tenure Options</h4>
              <ul>
                {Object.entries(system.properties.tenure).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}</strong>
                    {value.costMultiplier && <span> x{value.costMultiplier}</span>}
                    {value.description && <p>{value.description}</p>}
                    {value.special && <p className="special">Special access only</p>}
                    {costs.properties.tenure[key]?.cost && <p>{costs.properties.tenure[key]?.cost}</p>}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Zoning</h4>
              <ul>
                {Object.entries(system.properties.zoning).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}</strong>
                    <span>{typeof value.baseCost === 'number' ? `Base cost ${value.baseCost}` : value.baseCost}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </section>

      <section>
        <label className="field">
          <span>Resource Stories</span>
          <textarea
            value={notes}
            onChange={(event) => onUpdateNotes(event.target.value)}
            placeholder="Record fronts, debts, and the price of your holdings."
          />
        </label>
      </section>
    </div>
  );
}
