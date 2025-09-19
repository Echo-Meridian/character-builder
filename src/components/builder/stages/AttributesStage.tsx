import { ATTRIBUTES, type AttributeKey } from '../../../state/characterStore';
import type { PriorityRank } from '../../../data/types';
import type { CharacterBuild } from '../../../state/characterStore';
import './attributes-stage.css';

interface AttributesStageProps {
  priority: PriorityRank | null;
  scores: CharacterBuild['attributes']['scores'];
  onUpdateScore: (attribute: AttributeKey, value: number) => void;
  notes: string;
  onUpdateNotes: (notes: string) => void;
}

const PRIORITY_TO_POOL: Record<PriorityRank, number> = {
  A: 12,
  B: 11,
  C: 10,
  D: 9,
  E: 8
};

export function AttributesStage({ priority, scores, onUpdateScore, notes, onUpdateNotes }: AttributesStageProps) {
  const pool = priority ? PRIORITY_TO_POOL[priority] : 0;
  const spent = (Object.values(scores) as number[]).reduce((sum, value) => sum + value, 0);
  const remaining = pool - spent;

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
            <p>
              Pool {pool} • Remaining {remaining}
            </p>
          ) : (
            <p>Assign a priority letter to calculate your attribute pool.</p>
          )}
        </aside>
      </header>

      <section className="attributes-grid">
        {(Object.entries(ATTRIBUTES) as Array<[AttributeKey, { label: string; description: string }]>)
          .map(([key, meta]) => (
            <article key={key}>
              <header>
                <h3>{meta.label}</h3>
                <p>{meta.description}</p>
              </header>
              <div className="attribute-control">
                <input
                  type="range"
                  min={0}
                  max={pool}
                  value={scores[key] ?? 0}
                  onChange={(event) => onUpdateScore(key, Number(event.target.value))}
                />
                <span className="attribute-value">{scores[key] ?? 0}</span>
              </div>
            </article>
          ))}
      </section>

      {remaining < 0 && <p className="attribute-warning">You are overspending your pool. Reduce a score or raise your priority.</p>}

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
