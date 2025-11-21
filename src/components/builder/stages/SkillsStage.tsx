import { useMemo, useState, useEffect } from 'react';
import type { PriorityRank, SkillsData } from '../../../data/types';
import type { SkillSpecializationSelection } from '../../../state/characterStore';
import './skills-stage.css';

interface SkillsStageProps {
  priority: PriorityRank | null;
  data: SkillsData;
  ratings: Record<string, number>;
  onChangeRating: (skillId: string, value: number) => void;
  specializations: SkillSpecializationSelection[];
  onToggleSpecialization: (selection: SkillSpecializationSelection) => void;
  onRemoveSpecialization: (id: string) => void;
  onAddCustomSpecialization: (label: string) => void;
  backgroundSpecializations: string[];
  backgroundCustomSpecializations: string[];
  backgroundOptions: string[];
  onSetBackgroundSpecializations: (specializations: string[]) => void;
  onSetBackgroundCustomSpecializations: (customSpecs: string[]) => void;
  notes: string;
  onUpdateNotes: (notes: string) => void;
  onReset: () => void;
}

const SKILL_PRIORITY_RULES: Record<PriorityRank, { maxRank: number; points: number; specializations: number }> = {
  A: { maxRank: 5, points: 10, specializations: 2 },
  B: { maxRank: 4, points: 14, specializations: 2 },
  C: { maxRank: 3, points: 10, specializations: 1 },
  D: { maxRank: 3, points: 8, specializations: 1 },
  E: { maxRank: 2, points: 4, specializations: 0 }
};

const CUSTOM_SPECIALIZATION_LIMIT_TEXT = 'Custom options are provisional until your GM approves them.';

export function SkillsStage({
  priority,
  data,
  ratings,
  onChangeRating,
  specializations,
  onToggleSpecialization,
  onRemoveSpecialization,
  onAddCustomSpecialization,
  backgroundSpecializations,
  backgroundCustomSpecializations,
  backgroundOptions,
  onSetBackgroundSpecializations,
  onSetBackgroundCustomSpecializations,
  notes,
  onUpdateNotes,
  onReset
}: SkillsStageProps) {
  const [customLabel, setCustomLabel] = useState('');

  // Ensure backward compatibility with default values
  const safeBackgroundSpecializations = backgroundSpecializations || [];
  const safeBackgroundCustomSpecializations = backgroundCustomSpecializations || [];

  const rule = priority ? SKILL_PRIORITY_RULES[priority] : null;
  const totalPoints = useMemo(
    () => Object.values(ratings).reduce((sum, value) => sum + value, 0),
    [ratings]
  );
  const remainingPoints = rule ? Math.max(rule.points - totalPoints, 0) : 0;

  const prioritySpecializations = specializations.filter((entry) => entry.type !== 'background');
  const remainingPrioritySpecializations = rule
    ? Math.max(rule.specializations - prioritySpecializations.length, 0)
    : 0;

  const specializationMap = useMemo(() => new Map(specializations.map((entry) => [entry.id, entry])), [specializations]);

  // Auto-add background specializations to the specializations list
  useEffect(() => {
    if (!data || safeBackgroundSpecializations.length === 0) return;

    // Find all skill specializations that match background specializations
    const backgroundSpecsToAdd: SkillSpecializationSelection[] = [];

    Object.entries(data.skills).forEach(([discipline, skills]) => {
      skills.forEach((skill) => {
        const skillId = `${discipline}:${skill.id}`;
        skill.specializations.forEach((spec) => {
          // Check if this spec name matches any background specialization
          if (safeBackgroundSpecializations.includes(spec.name)) {
            const entryId = `pre:${skillId}:${spec.id ?? spec.name}`;
            // Only add if not already in the list
            if (!specializationMap.has(entryId)) {
              backgroundSpecsToAdd.push({
                id: entryId,
                label: `${skill.name} · ${spec.name}`,
                type: 'background',
                skillId,
                gmApproved: true
              });
            }
          }
        });
      });
    });

    // Add any missing background specializations
    if (backgroundSpecsToAdd.length > 0) {
      backgroundSpecsToAdd.forEach((spec) => onToggleSpecialization(spec));
    }
  }, [data, safeBackgroundSpecializations, specializationMap, onToggleSpecialization]);

  const handleRatingChange = (skillId: string, current: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(event.target.value);
    if (!rule) return;

    // Clamp to max rank for this priority
    const clamped = Math.max(0, Math.min(raw, rule.maxRank));

    // Calculate what the new total would be
    const proposedTotal = totalPoints - current + clamped;

    // Prevent exceeding the point budget
    let adjusted = clamped;
    if (proposedTotal > rule.points) {
      // Only allow spending up to remaining points
      adjusted = current + remainingPoints;
    }

    // Only update if the value actually changed
    if (adjusted !== current) {
      onChangeRating(skillId, adjusted);
    }
  };

  const addCustom = () => {
    if (!rule) return;
    const trimmed = customLabel.trim();
    if (!trimmed) return;
    if (rule.specializations === 0) return;
    if (remainingPrioritySpecializations === 0) return;
    onAddCustomSpecialization(trimmed);
    setCustomLabel('');
  };

  const handlePredefinedToggle = (skillId: string, skillName: string, specializationId: string | undefined, specializationName: string) => {
    if (!rule) return;
    const entryId = `pre:${skillId}:${specializationId ?? specializationName}`;
    if (!specializationMap.has(entryId) && rule.specializations > 0 && remainingPrioritySpecializations === 0) {
      return;
    }
    const selection: SkillSpecializationSelection = {
      id: entryId,
      label: `${skillName} · ${specializationName}`,
      type: 'predefined',
      skillId,
      gmApproved: true
    };
    onToggleSpecialization(selection);
  };

  const canAddCustom = rule ? rule.specializations > 0 && remainingPrioritySpecializations > 0 : false;

  const backgroundOptionsAvailable = backgroundOptions.filter(Boolean);

  return (
    <div className="stage stage--skills">
      <header className="stage__header">
        <div>
          <h2>Skills & Disciplines</h2>
          <p>
            Allocate your skill points, respecting the maximum rank for your priority. Claim a handful of
            specializations to spotlight signature moves—custom picks stay flagged until your GM approves them.
          </p>
        </div>
        <aside className={`skills-limit ${remainingPoints === 0 ? 'skills-limit--exhausted' : remainingPoints <= 2 ? 'skills-limit--low' : ''}`}>
          <span>Priority {priority ?? '—'}</span>
          {rule ? (
            <>
              <p className={remainingPoints === 0 ? 'text-warning' : ''}>{`${remainingPoints} of ${rule.points} skill points remaining`}</p>
              <p>Specializations: {`${Math.max(remainingPrioritySpecializations, 0)} of ${rule.specializations} remaining`}</p>
            </>
          ) : (
            <p>Assign a priority letter to unlock your allocation.</p>
          )}
        </aside>
      </header>

      <section className="skills-grid">
        {Object.entries(data.skills).flatMap(([discipline, skills]) =>
          skills.map((skill) => {
            const skillId = `${discipline}:${skill.id}`;
            const current = ratings[skillId] ?? 0;
            const maxRank = rule?.maxRank ?? 0;
            const isMaxed = current >= maxRank;
            const canIncrease = remainingPoints > 0 && !isMaxed;

            // Check if any specializations are from background
            const backgroundSpecIds = skill.specializations
              .map(s => `pre:${skillId}:${s.id ?? s.name}`)
              .filter(id => {
                const spec = specializationMap.get(id);
                return spec?.type === 'background';
              });

            return (
              <article key={skillId} className={`skills-card ${isMaxed ? 'skills-card--maxed' : ''}`}>
                <div className="skills-item__info">
                  <h4>{skill.name}</h4>
                  <p>{skill.description}</p>
                  {isMaxed && <span className="skills-maxed-badge">Max Rank</span>}
                </div>
                <label className={`skills-rating ${isMaxed ? 'skills-rating--maxed' : ''}`}>
                  <span>Rating</span>
                  <input
                    type="range"
                    min={0}
                    max={maxRank}
                    step={1}
                    value={current}
                    disabled={!rule}
                    onChange={handleRatingChange(skillId, current)}
                    className={!canIncrease && current < maxRank ? 'skills-rating__input--limited' : ''}
                  />
                  <span className="skills-rating__value">{current}</span>
                </label>
                {skill.specializations.length > 0 && (
                  <div className="skills-item__specializations">
                    <details>
                      <summary>Specializations ({skill.specializations.length} available)</summary>
                      <ul className="skills-specializations">
                        {skill.specializations.map((specialization) => {
                          const selectionId = `pre:${skillId}:${specialization.id ?? specialization.name}`;
                          const isSelected = specializationMap.has(selectionId);
                          const spec = specializationMap.get(selectionId);
                          const isBackground = spec?.type === 'background';
                          const limitReached =
                            !rule ||
                            (rule.specializations === 0 && !isSelected) ||
                            (rule.specializations > 0 && remainingPrioritySpecializations === 0 && !isSelected);
                          return (
                            <li key={selectionId}>
                              <label className={`skills-specialization__checkbox ${isSelected ? 'selected' : ''} ${isBackground ? 'background' : ''}`}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  disabled={limitReached || isBackground}
                                  onChange={() => handlePredefinedToggle(skillId, skill.name, specialization.id, specialization.name)}
                                />
                                <div className="skills-specialization__content">
                                  <strong>{specialization.name}</strong>
                                  <span>{specialization.description}</span>
                                  {isBackground && <span className="gm-tag gm-tag--background">Background</span>}
                                </div>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </details>
                  </div>
                )}
              </article>
            );
          })
        )}
      </section>

      {(safeBackgroundSpecializations.length > 0 || safeBackgroundCustomSpecializations.length > 0) && (
        <section className="skills-background">
          <h3>Background Specializations</h3>
          <p>These specializations were granted by your background (selected in the Background stage).</p>
          <ul className="skills-background__list">
            {safeBackgroundSpecializations.map((spec) => (
              <li key={spec}>
                <strong>{spec}</strong>
                <span className="gm-tag gm-tag--background">Background</span>
              </li>
            ))}
            {safeBackgroundCustomSpecializations.map((spec) => (
              <li key={spec}>
                <strong>{spec}</strong>
                <span className="gm-tag gm-tag--background">Background (Custom)</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="skills-selected">
        <h3>Selected Specializations</h3>
        {specializations.length === 0 ? (
          <p>No specializations chosen yet.</p>
        ) : (
          <ul>
            {specializations.map((entry) => (
              <li key={entry.id}>
                <div>
                  <strong>{entry.label}</strong>
                  {entry.type === 'custom' && !entry.gmApproved && <span className="gm-tag">Pending GM Approval</span>}
                </div>
                <button type="button" onClick={() => onRemoveSpecialization(entry.id)} aria-label={`Remove ${entry.label}`}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="skills-footer">
        <div>
          <h3>Custom Specialization</h3>
          <div className="skills-custom">
            <label>
              <span>Describe your custom edge</span>
              <div className="skills-custom__controls">
                <input
                  value={customLabel}
                  onChange={(event) => setCustomLabel(event.target.value)}
                  placeholder="Ex: Underworld Etiquette"
                  disabled={rule ? !canAddCustom : true}
                />
                <button type="button" onClick={addCustom} disabled={!canAddCustom || !customLabel.trim()}>
                  Add
                </button>
              </div>
            </label>
            <p className="skills-custom__hint">
              {CUSTOM_SPECIALIZATION_LIMIT_TEXT}
              {rule ? ` Slots remaining: ${Math.max(remainingPrioritySpecializations, 0)}.` : ''}
            </p>
          </div>
        </div>
        <label className="field">
          <span>Skill Notes</span>
          <textarea
            value={notes}
            onChange={(event) => onUpdateNotes(event.target.value)}
            placeholder="Record signature moves, training montages, and promised stunts."
          />
        </label>
        <div className="stage__actions">
          <button type="button" onClick={onReset} className="button button--secondary">
            Reset Skills
          </button>
        </div>
      </section>
    </div>
  );
}

function toTitleCase(value: string) {
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
