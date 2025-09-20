import clsx from 'clsx';
import type { PriorityRank, ResourceCostsData, ResourceSystem } from '../../../data/types';
import type {
  ContactResourceEntry,
  GoodsResourceEntry,
  PropertyResourceEntry,
  RetainerResourceEntry
} from '../../../state/characterStore';
import './resources-stage.css';

interface ResourcesStageProps {
  priority: PriorityRank | null;
  system: ResourceSystem;
  costs: ResourceCostsData;
  contacts: ContactResourceEntry[];
  retainers: RetainerResourceEntry[];
  properties: PropertyResourceEntry[];
  goods: GoodsResourceEntry[];
  liquid: number;
  onAddContact: () => void;
  onUpdateContact: (id: string, changes: Partial<ContactResourceEntry>) => void;
  onRemoveContact: (id: string) => void;
  onAddRetainer: () => void;
  onUpdateRetainer: (id: string, changes: Partial<RetainerResourceEntry>) => void;
  onRemoveRetainer: (id: string) => void;
  onAddProperty: () => void;
  onUpdateProperty: (id: string, changes: Partial<PropertyResourceEntry>) => void;
  onRemoveProperty: (id: string) => void;
  onAddGoods: () => void;
  onUpdateGoods: (id: string, changes: Partial<GoodsResourceEntry>) => void;
  onRemoveGoods: (id: string) => void;
  onUpdateLiquid: (value: number) => void;
  notes: string;
  onUpdateNotes: (notes: string) => void;
}

interface PropertyRatingResult {
  value: number;
  requiresApproval: boolean;
  note?: string | null;
}

const parseCapValue = (value: number | string | undefined): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }
  return Number.POSITIVE_INFINITY;
};

const sanitizeNumber = (value: number): number => (Number.isFinite(value) ? value : 0);

const contactCost = (entry: ContactResourceEntry): number => sanitizeNumber(entry.reach) + sanitizeNumber(entry.influence);

const retainerCost = (entry: RetainerResourceEntry): number => sanitizeNumber(entry.loyalty) + sanitizeNumber(entry.competence);

const goodsCost = (entry: GoodsResourceEntry): number => sanitizeNumber(entry.quality);

const getCombinedCap = (maxCombined: number, fallback: number): number =>
  Number.isFinite(maxCombined) ? maxCombined : fallback;

const getTenureRating = (
  tenure: string,
  system: ResourceSystem,
  costs: ResourceCostsData,
  fallbackCap: number
): PropertyRatingResult => {
  if (!tenure) {
    return { value: 0, requiresApproval: false };
  }

  const costEntry = costs.properties.tenure?.[tenure];
  const systemEntry = system.properties.tenure?.[tenure];

  if (costEntry?.cost) {
    return { value: fallbackCap, requiresApproval: true, note: costEntry.cost };
  }

  const rawMultiplier =
    typeof costEntry?.multiplier === 'number'
      ? costEntry.multiplier
      : typeof systemEntry?.costMultiplier === 'number'
      ? systemEntry.costMultiplier
      : null;

  if (typeof rawMultiplier === 'number' && Number.isFinite(rawMultiplier) && rawMultiplier > 0) {
    return {
      value: Math.max(1, Math.round(rawMultiplier)),
      requiresApproval: Boolean(systemEntry?.special)
    };
  }

  return { value: 0, requiresApproval: true };
};

const getZoningRating = (
  zoning: string,
  system: ResourceSystem,
  costs: ResourceCostsData,
  fallbackCap: number
): PropertyRatingResult => {
  if (!zoning) {
    return { value: 0, requiresApproval: false };
  }

  const costEntry = costs.properties.zoning?.[zoning];
  const systemEntry = system.properties.zoning?.[zoning];

  const rawBase =
    typeof costEntry?.baseCost === 'number'
      ? costEntry.baseCost
      : typeof systemEntry?.baseCost === 'number'
      ? systemEntry.baseCost
      : null;

  if (typeof rawBase === 'number' && Number.isFinite(rawBase) && rawBase > 0) {
    return { value: rawBase, requiresApproval: false };
  }

  const note =
    typeof costEntry?.baseCost === 'string'
      ? costEntry.baseCost
      : typeof systemEntry?.baseCost === 'string'
      ? systemEntry.baseCost
      : null;

  return { value: fallbackCap, requiresApproval: true, note };
};

export function ResourcesStage({
  priority,
  system,
  costs,
  contacts,
  retainers,
  properties,
  goods,
  liquid,
  onAddContact,
  onUpdateContact,
  onRemoveContact,
  onAddRetainer,
  onUpdateRetainer,
  onRemoveRetainer,
  onAddProperty,
  onUpdateProperty,
  onRemoveProperty,
  onAddGoods,
  onUpdateGoods,
  onRemoveGoods,
  onUpdateLiquid,
  notes,
  onUpdateNotes
}: ResourcesStageProps) {
  const priorityDetails = priority ? system.resourcePoints[priority] : null;
  const available = priorityDetails?.points ?? 0;
  const maxQuality = parseCapValue(priorityDetails?.maxQuality);
  const maxCombined = parseCapValue(priorityDetails?.maxCombined);
  const specializationLimit = priorityDetails?.specializations ?? 0;
  const combinedFallback = getCombinedCap(maxCombined, priorityDetails?.points ?? 10);

  const contactList = Array.isArray(contacts) ? contacts : [];
  const retainerList = Array.isArray(retainers) ? retainers : [];
  const propertyList = Array.isArray(properties) ? properties : [];
  const goodsList = Array.isArray(goods) ? goods : [];

  const contactSummaries = contactList.map((entry) => {
    const cost = contactCost(entry);
    const issues: string[] = [];
    if (Number.isFinite(maxQuality) && entry.reach > maxQuality) {
      issues.push(`Reach exceeds max quality ${maxQuality}`);
    }
    if (Number.isFinite(maxQuality) && entry.influence > maxQuality) {
      issues.push(`Influence exceeds max quality ${maxQuality}`);
    }
    if (Number.isFinite(maxCombined) && cost > maxCombined) {
      issues.push(`Total reach + influence exceeds combined maximum ${maxCombined}`);
    }
    return { entry, cost, issues };
  });

  const retainerSummaries = retainerList.map((entry) => {
    const cost = retainerCost(entry);
    const issues: string[] = [];
    if (Number.isFinite(maxQuality) && entry.competence > maxQuality) {
      issues.push(`Competence exceeds max quality ${maxQuality}`);
    }
    if (Number.isFinite(maxQuality) && entry.loyalty > maxQuality) {
      issues.push(`Loyalty exceeds max quality ${maxQuality}`);
    }
    if (Number.isFinite(maxCombined) && cost > maxCombined) {
      issues.push(`Total loyalty + competence exceeds combined maximum ${maxCombined}`);
    }
    return { entry, cost, issues };
  });

  const propertySummaries = propertyList.map((entry) => {
    const tenureRating = getTenureRating(entry.tenure, system, costs, combinedFallback);
    const zoningRating = getZoningRating(entry.zoning, system, costs, combinedFallback);
    const cost = tenureRating.value + zoningRating.value;
    const issues: string[] = [];

    if (tenureRating.requiresApproval || zoningRating.requiresApproval) {
      issues.push('Selection requires GM approval.');
    }
    if (tenureRating.note) {
      issues.push(tenureRating.note);
    }
    if (zoningRating.note) {
      issues.push(zoningRating.note);
    }
    if (Number.isFinite(maxQuality) && tenureRating.value > maxQuality) {
      issues.push(`Tenure rating exceeds max quality ${maxQuality}`);
    }
    if (Number.isFinite(maxQuality) && zoningRating.value > maxQuality) {
      issues.push(`Zoning rating exceeds max quality ${maxQuality}`);
    }
    if (Number.isFinite(maxCombined) && cost > maxCombined) {
      issues.push(`Total tenure + zoning exceeds combined maximum ${maxCombined}`);
    }

    return { entry, cost, issues, tenureValue: tenureRating.value, zoningValue: zoningRating.value };
  });

  const goodsSummaries = goodsList.map((entry) => {
    const cost = goodsCost(entry);
    const issues: string[] = [];
    if (Number.isFinite(maxQuality) && entry.quality > maxQuality) {
      issues.push(`Quality exceeds max quality ${maxQuality}`);
    }
    if (Number.isFinite(maxCombined) && entry.quality > maxCombined) {
      issues.push(`Quality exceeds combined maximum ${maxCombined}`);
    }
    return { entry, cost, issues };
  });

  const totalSpent =
    contactSummaries.reduce((sum, item) => sum + item.cost, 0) +
    retainerSummaries.reduce((sum, item) => sum + item.cost, 0) +
    propertySummaries.reduce((sum, item) => sum + item.cost, 0) +
    goodsSummaries.reduce((sum, item) => sum + item.cost, 0) +
    sanitizeNumber(liquid);

  const remaining = available - totalSpent;
  const overspent = priorityDetails ? remaining < 0 : totalSpent > 0;
  const specializationsUsed =
    contactSummaries.filter(({ entry }) => Boolean(entry.specialization)).length +
    retainerSummaries.filter(({ entry }) => Boolean(entry.specialization)).length +
    propertySummaries.filter(({ entry }) => Boolean(entry.specialization)).length +
    goodsSummaries.filter(({ entry }) => Boolean(entry.specialization)).length;
  const specializationRemaining = specializationLimit - specializationsUsed;
  const specializationOver = specializationRemaining < 0;

  const contactSpecializations = system.contacts?.specializations ?? [];
  const retainerSpecializations = system.retainers?.specializations ?? [];
  const propertySpecializations = system.properties?.specializations ?? [];
  const goodsSpecializations = system.goods?.specializations ?? [];

  return (
    <div className="stage stage--resources">
      <header className="stage__header">
        <div>
          <h2>Resources</h2>
          <p>
            Spend your Resource Points to define the allies, havens, and gear that keep you alive. Balance reach and
            quality carefully &mdash; every edge requires upkeep and trust.
          </p>
        </div>
        <aside className="resource-summary">
          <span className="resource-summary__label">Priority {priority ?? '—'}</span>
          {priorityDetails ? (
            <dl>
              <div>
                <dt>Available Points</dt>
                <dd>{available}</dd>
              </div>
              <div className={clsx({ 'resource-summary__warning': overspent })}>
                <dt>Spent</dt>
                <dd>{totalSpent}</dd>
              </div>
              <div className={clsx({ 'resource-summary__warning': overspent })}>
                <dt>Remaining</dt>
                <dd>{Math.max(0, remaining)}</dd>
              </div>
              <div>
                <dt>Quality Cap</dt>
                <dd>{Number.isFinite(maxQuality) ? maxQuality : '—'}</dd>
              </div>
              <div>
                <dt>Combined Cap</dt>
                <dd>{Number.isFinite(maxCombined) ? maxCombined : '—'}</dd>
              </div>
              <div className={clsx({ 'resource-summary__warning': specializationOver })}>
                <dt>Specializations</dt>
                <dd>
                  {specializationsUsed} / {specializationLimit}
                </dd>
              </div>
            </dl>
          ) : (
            <p>Assign a resources priority to unlock your pool.</p>
          )}
        </aside>
      </header>

      <div className={clsx('resource-ledger', { 'resource-ledger--warning': overspent })}>
        <strong>{totalSpent}</strong> resource points allocated{priorityDetails ? ` of ${available}` : ''}.
        {overspent && (
          <span className="resource-ledger__warning">
            You are overspending. Adjust your assets or raise your priority.
          </span>
        )}
      </div>

      <div className={clsx('resource-ledger', { 'resource-ledger--warning': specializationOver })}>
        Specializations used: <strong>{specializationsUsed}</strong> of {specializationLimit}.
        {specializationOver && (
          <span className="resource-ledger__warning">Only one specialization per asset until the limit is raised.</span>
        )}
      </div>

      <div className="resource-grid">
        <section className="resource-section">
          <header className="resource-section__header">
            <h3>Contacts</h3>
            <button type="button" onClick={onAddContact}>
              Add Contact
            </button>
          </header>
          {contactSummaries.length === 0 ? (
            <p className="resource-section__empty">No contacts recorded. Add a fixer, broker, or confidant.</p>
          ) : (
            contactSummaries.map(({ entry, cost, issues }) => {
              const requiresApproval = !entry.gmApproved;
              return (
                <article key={entry.id} className={clsx('resource-card', { 'resource-card--flagged': requiresApproval })}>
                  <header className="resource-card__header">
                    <input
                      className="resource-card__title"
                      value={entry.name}
                      onChange={(event) => onUpdateContact(entry.id, { name: event.target.value })}
                      placeholder="Contact name"
                    />
                    <span className="resource-card__cost">Cost {cost}</span>
                  </header>
                  <label className="resource-card__field">
                    <span>Profile</span>
                    <textarea
                      value={entry.description}
                      onChange={(event) => onUpdateContact(entry.id, { description: event.target.value })}
                      placeholder="Why does this person answer your call?"
                    />
                  </label>
                  <div className="resource-card__grid">
                    <label>
                      <span>Reach</span>
                      <input
                        type="number"
                        min={0}
                        max={Number.isFinite(maxQuality) ? maxQuality : undefined}
                        value={entry.reach}
                        onChange={(event) =>
                          onUpdateContact(entry.id, { reach: Number(event.target.value) || 0 })
                        }
                      />
                    </label>
                    <label>
                      <span>Influence</span>
                      <input
                        type="number"
                        min={0}
                        max={Number.isFinite(maxQuality) ? maxQuality : undefined}
                        value={entry.influence}
                        onChange={(event) =>
                          onUpdateContact(entry.id, { influence: Number(event.target.value) || 0 })
                        }
                      />
                    </label>
                    <label>
                      <span>Specialization</span>
                      <select
                        value={entry.specialization ?? ''}
                        onChange={(event) =>
                          onUpdateContact(entry.id, {
                            specialization: event.target.value ? event.target.value : null
                          })
                        }
                      >
                        <option value="">None</option>
                        {contactSpecializations.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {issues.length > 0 && (
                    <ul className="resource-card__issues">
                      {issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  )}
                  <footer className="resource-card__footer">
                    <button type="button" onClick={() => onRemoveContact(entry.id)} className="link">
                      Remove Contact
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateContact(entry.id, { gmApproved: !entry.gmApproved })}
                      className={clsx('badge', { 'badge--attention': requiresApproval })}
                    >
                      {entry.gmApproved ? 'GM Approved' : 'GM Approval Required'}
                    </button>
                  </footer>
                </article>
              );
            })
          )}
        </section>

        <section className="resource-section">
          <header className="resource-section__header">
            <h3>Retainers</h3>
            <button type="button" onClick={onAddRetainer}>
              Add Retainer
            </button>
          </header>
          {retainerSummaries.length === 0 ? (
            <p className="resource-section__empty">No retainers enlisted. Secure a loyal operator.</p>
          ) : (
            retainerSummaries.map(({ entry, cost, issues }) => {
              const requiresApproval = !entry.gmApproved;
              return (
                <article key={entry.id} className={clsx('resource-card', { 'resource-card--flagged': requiresApproval })}>
                  <header className="resource-card__header">
                    <input
                      className="resource-card__title"
                      value={entry.name}
                      onChange={(event) => onUpdateRetainer(entry.id, { name: event.target.value })}
                      placeholder="Retainer name"
                    />
                    <span className="resource-card__cost">Cost {cost}</span>
                  </header>
                  <label className="resource-card__field">
                    <span>Role</span>
                    <textarea
                      value={entry.description}
                      onChange={(event) => onUpdateRetainer(entry.id, { description: event.target.value })}
                      placeholder="What do they handle for you?"
                    />
                  </label>
                  <div className="resource-card__grid">
                    <label>
                      <span>Competence</span>
                      <input
                        type="number"
                        min={0}
                        max={Number.isFinite(maxQuality) ? maxQuality : undefined}
                        value={entry.competence}
                        onChange={(event) =>
                          onUpdateRetainer(entry.id, { competence: Number(event.target.value) || 0 })
                        }
                      />
                    </label>
                    <label>
                      <span>Loyalty</span>
                      <input
                        type="number"
                        min={0}
                        max={Number.isFinite(maxQuality) ? maxQuality : undefined}
                        value={entry.loyalty}
                        onChange={(event) =>
                          onUpdateRetainer(entry.id, { loyalty: Number(event.target.value) || 0 })
                        }
                      />
                    </label>
                    <label>
                      <span>Specialization</span>
                      <select
                        value={entry.specialization ?? ''}
                        onChange={(event) =>
                          onUpdateRetainer(entry.id, {
                            specialization: event.target.value ? event.target.value : null
                          })
                        }
                      >
                        <option value="">None</option>
                        {retainerSpecializations.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {issues.length > 0 && (
                    <ul className="resource-card__issues">
                      {issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  )}
                  <footer className="resource-card__footer">
                    <button type="button" onClick={() => onRemoveRetainer(entry.id)} className="link">
                      Remove Retainer
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateRetainer(entry.id, { gmApproved: !entry.gmApproved })}
                      className={clsx('badge', { 'badge--attention': requiresApproval })}
                    >
                      {entry.gmApproved ? 'GM Approved' : 'GM Approval Required'}
                    </button>
                  </footer>
                </article>
              );
            })
          )}
        </section>

        <section className="resource-section">
          <header className="resource-section__header">
            <h3>Properties</h3>
            <button type="button" onClick={onAddProperty}>
              Add Property
            </button>
          </header>
          {propertySummaries.length === 0 ? (
            <p className="resource-section__empty">No safehouses or fronts secured. Stake your claim.</p>
          ) : (
            propertySummaries.map(({ entry, cost, issues, tenureValue, zoningValue }) => {
              const requiresApproval = !entry.gmApproved;
              return (
                <article key={entry.id} className={clsx('resource-card', { 'resource-card--flagged': requiresApproval })}>
                  <header className="resource-card__header">
                    <input
                      className="resource-card__title"
                      value={entry.name}
                      onChange={(event) => onUpdateProperty(entry.id, { name: event.target.value })}
                      placeholder="Property name"
                    />
                    <span className="resource-card__cost">Cost {cost}</span>
                  </header>
                  <label className="resource-card__field">
                    <span>Description</span>
                    <textarea
                      value={entry.description}
                      onChange={(event) => onUpdateProperty(entry.id, { description: event.target.value })}
                      placeholder="What makes this space yours?"
                    />
                  </label>
                  <div className="resource-card__grid resource-card__grid--wide">
                    <label>
                      <span>Tenure</span>
                      <select
                        value={entry.tenure}
                        onChange={(event) => onUpdateProperty(entry.id, { tenure: event.target.value })}
                      >
                        <option value="">Select tenure</option>
                        {Object.keys(system.properties.tenure).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <small>{tenureValue ? `Value ${tenureValue}` : 'Pick a claim type'}</small>
                    </label>
                    <label>
                      <span>Zoning</span>
                      <select
                        value={entry.zoning}
                        onChange={(event) => onUpdateProperty(entry.id, { zoning: event.target.value })}
                      >
                        <option value="">Select function</option>
                        {Object.keys(system.properties.zoning).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <small>{zoningValue ? `Value ${zoningValue}` : 'Pick a function'}</small>
                    </label>
                    <label>
                      <span>Ward</span>
                      <input
                        value={entry.ward}
                        onChange={(event) => onUpdateProperty(entry.id, { ward: event.target.value })}
                        placeholder="Ward or district"
                      />
                    </label>
                    <label>
                      <span>Specialization</span>
                      <select
                        value={entry.specialization ?? ''}
                        onChange={(event) =>
                          onUpdateProperty(entry.id, {
                            specialization: event.target.value ? event.target.value : null
                          })
                        }
                      >
                        <option value="">None</option>
                        {propertySpecializations.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {issues.length > 0 && (
                    <ul className="resource-card__issues">
                      {issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  )}
                  <footer className="resource-card__footer">
                    <button type="button" onClick={() => onRemoveProperty(entry.id)} className="link">
                      Remove Property
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateProperty(entry.id, { gmApproved: !entry.gmApproved })}
                      className={clsx('badge', { 'badge--attention': requiresApproval })}
                    >
                      {entry.gmApproved ? 'GM Approved' : 'GM Approval Required'}
                    </button>
                  </footer>
                </article>
              );
            })
          )}
        </section>

        <section className="resource-section">
          <header className="resource-section__header">
            <h3>Goods &amp; Stockpiles</h3>
            <button type="button" onClick={onAddGoods}>
              Add Goods
            </button>
          </header>
          {goodsSummaries.length === 0 ? (
            <p className="resource-section__empty">No caches documented. Set aside kit or contraband.</p>
          ) : (
            goodsSummaries.map(({ entry, cost, issues }) => {
              const requiresApproval = !entry.gmApproved;
              return (
                <article key={entry.id} className={clsx('resource-card', { 'resource-card--flagged': requiresApproval })}>
                  <header className="resource-card__header">
                    <input
                      className="resource-card__title"
                      value={entry.name}
                      onChange={(event) => onUpdateGoods(entry.id, { name: event.target.value })}
                      placeholder="Goods cache"
                    />
                    <span className="resource-card__cost">Cost {cost}</span>
                  </header>
                  <label className="resource-card__field">
                    <span>Contents</span>
                    <textarea
                      value={entry.description}
                      onChange={(event) => onUpdateGoods(entry.id, { description: event.target.value })}
                      placeholder="Describe the stash, weaponry, or leverage."
                    />
                  </label>
                  <div className="resource-card__grid">
                    <label>
                      <span>Quality</span>
                      <input
                        type="number"
                        min={0}
                        max={Number.isFinite(maxQuality) ? maxQuality : undefined}
                        value={entry.quality}
                        onChange={(event) =>
                          onUpdateGoods(entry.id, { quality: Number(event.target.value) || 0 })
                        }
                      />
                    </label>
                    <label>
                      <span>Specialization</span>
                      <select
                        value={entry.specialization ?? ''}
                        onChange={(event) =>
                          onUpdateGoods(entry.id, {
                            specialization: event.target.value ? event.target.value : null
                          })
                        }
                      >
                        <option value="">None</option>
                        {goodsSpecializations.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {issues.length > 0 && (
                    <ul className="resource-card__issues">
                      {issues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  )}
                  <footer className="resource-card__footer">
                    <button type="button" onClick={() => onRemoveGoods(entry.id)} className="link">
                      Remove Goods
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateGoods(entry.id, { gmApproved: !entry.gmApproved })}
                      className={clsx('badge', { 'badge--attention': requiresApproval })}
                    >
                      {entry.gmApproved ? 'GM Approved' : 'GM Approval Required'}
                    </button>
                  </footer>
                </article>
              );
            })
          )}
        </section>
      </div>

      <section className="resource-liquid">
        <label>
          <span>Liquid Assets</span>
          <input
            type="number"
            min={0}
            value={liquid}
            onChange={(event) => onUpdateLiquid(Number(event.target.value) || 0)}
          />
        </label>
        <p>Reserve unassigned points for cash, favors, or future acquisitions.</p>
      </section>

      <section>
        <label className="field">
          <span>Resource Stories</span>
          <textarea
            value={notes}
            onChange={(event) => onUpdateNotes(event.target.value)}
            placeholder="Record fronts, debts, leverage, and the strings attached to each asset."
          />
        </label>
      </section>

      <section className="resource-reference">
        <article>
          <h4>Contact Scales</h4>
          <div className="resource-reference__grid">
            <div>
              <h5>Reach</h5>
              <ul>
                {Object.entries(system.contacts.reachScale).map(([rating, label]) => (
                  <li key={rating}>
                    <span className="scale__value">{rating}</span>
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5>Influence</h5>
              <ul>
                {Object.entries(system.contacts.influenceScale).map(([rating, label]) => (
                  <li key={rating}>
                    <span className="scale__value">{rating}</span>
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>

        <article>
          <h4>Retainer Scales</h4>
          <div className="resource-reference__grid">
            <div>
              <h5>Competence</h5>
              <ul>
                {Object.entries(system.retainers.competenceScale).map(([rating, label]) => (
                  <li key={rating}>
                    <span className="scale__value">{rating}</span>
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5>Loyalty</h5>
              <ul>
                {Object.entries(system.retainers.loyaltyScale).map(([rating, label]) => (
                  <li key={rating}>
                    <span className="scale__value">{rating}</span>
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>

        <article>
          <h4>Tenure Reference</h4>
          <ul className="resource-reference__list">
            {Object.entries(system.properties.tenure).map(([key, value]) => (
              <li key={key}>
                <strong>{key}</strong>
                {value.description && <span> &mdash; {value.description}</span>}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
