import { useMemo } from 'react';
import type { AttributesData, PriorityRank } from '../../../data/types';
import type { CharacterBuild } from '../../../state/characterStore';
import type { AttributeKey } from '../../../state/characterStore';
import './attributes-stage.css';

interface AttributesStageProps {
  priority: PriorityRank | null;
  scores: CharacterBuild['attributes']['scores'];
  onUpdateScore: (attribute: AttributeKey, value: number) => void;
  notes: string;
  onUpdateNotes: (notes: string) => void;
  data: AttributesData;
}

const ATTRIBUTE_NAME_TO_KEY: Record<string, AttributeKey> = {
  Physique: 'physique',
  Intellect: 'intellect',
  Presence: 'presence'
};

export function AttributesStage({ priority, scores, onUpdateScore, notes, onUpdateNotes, data }: AttributesStageProps) {
  const pointBuyEntry = useMemo(
    () => (priority ? data.pointBuy.find((entry) => entry.priority === priority) ?? null : null),
    [data.pointBuy, priority]
  );

  const attributeEntries = useMemo(() => {
    return Object.entries(data.definitions)
      .map(([displayName, definition]) => {
        const key = ATTRIBUTE_NAME_TO_KEY[displayName];
        if (!key) return null;
        return {
          key,
          displayName,
          ...definition
        };
      })
      .filter((entry): entry is { key: AttributeKey; displayName: string; description: string; specializations: typeof data.definitions[string]['specializations'] } => entry !== null);
  }, [data.definitions]);

  const pool = pointBuyEntry?.attributePoints ?? 0;
  const spent = (Object.values(scores) as number[]).reduce((sum, value) => sum + value, 0);
  const remaining = pool - spent;
  const specializationAllowance = pointBuyEntry?.specializations ?? 0;

  return (
    <div className="stage stage--attributes">
      <header className="stage__header">
        <div>
          <h2>Attributes</h2>
          <p>
            Only three pillars define your raw capability. Split your dice pool to show which part of their soul still
            shines and which has already been sold to the city.
          </p>
        </div>
        <aside className="attribute-pool">
          <span>Priority {priority ?? '—'}</span>
          {priority ? (
            <>
              <p>
                Pool {pool} • Remaining {remaining}
              </p>
              <p className="attribute-pool__detail">Specializations available: {specializationAllowance}</p>
            </>
          ) : (
            <p>Assign a priority letter to calculate your attribute pool.</p>
          )}
        </aside>
      </header>

      <section className="attributes-grid">
        {attributeEntries.map((attribute) => (
          <article key={attribute.key}>
            <header>
              <h3>{attribute.displayName}</h3>
              <p>{attribute.description}</p>
            </header>
            <div className="attribute-control">
              <input
                type="range"
                min={0}
                max={pool}
                value={scores[attribute.key] ?? 0}
                onChange={(event) => onUpdateScore(attribute.key, Number(event.target.value))}
              />
              <span className="attribute-value">{scores[attribute.key] ?? 0}</span>
            </div>
            {attribute.specializations?.length > 0 && (
              <div className="attribute-specializations">
                <h4>Specializations</h4>
                <ul>
                  {attribute.specializations.map((specialization) => (
                    <li key={specialization.name}>
                      <strong>{specialization.name}</strong>
                      <span>{specialization.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        ))}
      </section>

      {remaining < 0 && <p className="attribute-warning">You are overspending your pool. Reduce a score or raise your priority.</p>}

      {data.ratings?.length > 0 && (
        <section className="attribute-ratings">
          <h3>Rating Benchmarks</h3>
          <ul>
            {data.ratings.map((rating) => (
              <li key={rating.score}>
                <span className="attribute-rating__score">{rating.score}</span>
                <span>{rating.label}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <label className="field">
          <span>Attribute Notes</span>
          <textarea
            value={notes}
            onChange={(event) => onUpdateNotes(event.target.value)}
            placeholder="What scars or tells explain these strengths and weaknesses?"
          />
        </label>
      </section>
    </div>
  );
}
