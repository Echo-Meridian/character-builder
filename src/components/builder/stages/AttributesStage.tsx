import { useMemo } from 'react';
import type { AttributesData, AttributeSpecializationEntry, PriorityRank } from '../../../data/types';
import type { CharacterBuild, AttributeKey } from '../../../state/characterStore';
import { ATTRIBUTE_SCORE_MAX } from '../../../state/characterStore';
import './attributes-stage.css';

interface AttributesStageProps {
  priority: PriorityRank | null;
  scores: CharacterBuild['attributes']['scores'];
  onUpdateScore: (attribute: AttributeKey, value: number) => void;
  notes: string;
  onUpdateNotes: (notes: string) => void;
  data: AttributesData;
  selectedSpecializations: Record<AttributeKey, string[]>;
  onToggleSpecialization: (attribute: AttributeKey, specialization: string) => void;
  onReset: () => void;
}

const ATTRIBUTE_NAME_TO_KEY: Record<string, AttributeKey> = {
  Physique: 'physique',
  Intellect: 'intellect',
  Presence: 'presence'
};

interface AttributeView {
  key: AttributeKey;
  displayName: string;
  description: string;
  specializations: AttributeSpecializationEntry[];
}

export function AttributesStage({
  priority,
  scores,
  onUpdateScore,
  notes,
  onUpdateNotes,
  data,
  selectedSpecializations,
  onToggleSpecialization,
  onReset
}: AttributesStageProps) {
  if (!data || !Array.isArray(data.pointBuy) || !data.definitions) {
    return (
      <div className="stage stage--attributes">
        <p>Attribute data failed to load. Please refresh.</p>
      </div>
    );
  }

  const pointBuyEntry = useMemo(
    () => (priority ? data.pointBuy.find((entry) => entry.priority === priority) ?? null : null),
    [data.pointBuy, priority]
  );

  const attributeEntries = useMemo<AttributeView[]>(() => {
    return Object.entries(data.definitions)
      .map(([displayName, definition]) => {
        const key = ATTRIBUTE_NAME_TO_KEY[displayName];
        if (!key) return null;
        return {
          key,
          displayName,
          description: definition.description,
          specializations: definition.specializations ?? []
        } satisfies AttributeView;
      })
      .filter((entry): entry is AttributeView => entry !== null);
  }, [data.definitions]);

  const pool = pointBuyEntry?.attributePoints ?? 0;
  const cappedScores = useMemo(
    () =>
      (Object.entries(scores) as Array<[AttributeKey, number]>).reduce<Record<AttributeKey, number>>(
        (acc, [key, value]) => {
          acc[key] = Math.min(ATTRIBUTE_SCORE_MAX, Math.max(0, value));
          return acc;
        },
        { physique: 0, intellect: 0, presence: 0 }
      ),
    [scores]
  );
  const spent = (Object.values(cappedScores) as number[]).reduce((sum, value) => sum + value, 0);
  const remaining = Math.max(pool - spent, 0);
  const specializationAllowance = pointBuyEntry?.specializations ?? 0;
  const totalSelectedSpecializations = useMemo(
    () =>
      Object.values(selectedSpecializations).reduce((sum, list) =>
        sum + (Array.isArray(list) ? list.length : 0),
        0),
    [selectedSpecializations]
  );
  const remainingSpecializations = Math.max(specializationAllowance - totalSelectedSpecializations, 0);

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
              <p className="attribute-pool__detail">
                Specializations: {specializationAllowance > 0 ? `${remainingSpecializations} of ${specializationAllowance} remaining` : 'None available'}
              </p>
            </>
          ) : (
            <p>Assign a priority letter to calculate your attribute pool.</p>
          )}
        </aside>
      </header>

      <section className="attributes-grid">
        {attributeEntries.map((attribute) => {
          const rawValue = scores[attribute.key] ?? 0;
          const currentValue = Math.min(rawValue, ATTRIBUTE_SCORE_MAX);
          const otherSpent = spent - cappedScores[attribute.key];
          const poolHeadroom = Math.max(pool - otherSpent, 0);
          const attributeMax = Math.min(ATTRIBUTE_SCORE_MAX, poolHeadroom);
          const isMaxed = currentValue >= ATTRIBUTE_SCORE_MAX;
          const canIncrease = remaining > 0 && !isMaxed;

          return (
            <article key={attribute.key}>
              <header>
                <h3>{attribute.displayName}</h3>
                <p>{attribute.description}</p>
              </header>
              <div className="attribute-control">
                <input
                  type="range"
                  min={0}
                  max={attributeMax}
                  value={currentValue}
                  onChange={(event) => {
                    const requested = Number(event.target.value);
                    const nextValue = Math.min(attributeMax, Math.max(0, requested));
                    onUpdateScore(attribute.key, nextValue);
                  }}
                  className={!canIncrease && currentValue < ATTRIBUTE_SCORE_MAX ? 'attribute-input--limited' : ''}
                />
                <span className="attribute-value">{currentValue}</span>
              </div>
              {attribute.specializations?.length > 0 && (
                <div className="attribute-specializations">
                  <h4>Specializations</h4>
                  <ul>
                    {attribute.specializations.map((specialization) => {
                      const selections = selectedSpecializations[attribute.key] ?? [];
                      const isSelected = selections.includes(specialization.name);
                      const limitReached =
                        (specializationAllowance === 0 && !isSelected) ||
                        (specializationAllowance > 0 && remainingSpecializations === 0 && !isSelected);
                      return (
                        <li key={specialization.name}>
                          <button
                            type="button"
                            className={`attribute-specialization__toggle ${isSelected ? 'selected' : ''}`}
                            onClick={() => onToggleSpecialization(attribute.key, specialization.name)}
                            disabled={limitReached}
                          >
                            <strong>{specialization.name}</strong>
                            <span>{specialization.description}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </article>
          );
        })}
      </section>

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

      <section className="stage__footer">
        <label className="field">
          <span>Attribute Notes</span>
          <textarea
            value={notes}
            onChange={(event) => onUpdateNotes(event.target.value)}
            placeholder="What scars or tells explain these strengths and weaknesses?"
          />
        </label>
        <div className="stage__actions">
          <button type="button" onClick={onReset} className="button button--secondary">
            Reset Attributes
          </button>
        </div>
      </section>
    </div>
  );
}
