import { useMemo, useState } from 'react';
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
  backgroundSpecialization: string | null;
  backgroundOptions: string[];
  onSetBackgroundSpecialization: (option: string | null) => void;
  notes: string;
  onUpdateNotes: (notes: string) => void;
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
  backgroundSpecialization,
  backgroundOptions,
  onSetBackgroundSpecialization,
  notes,
  onUpdateNotes
}: SkillsStageProps) {
  const [customLabel, setCustomLabel] = useState('');

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

  const handleRatingChange = (skillId: string, current: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(event.target.value);
    if (!rule) return;
    const clamped = Math.max(0, Math.min(raw, rule.maxRank));
    const proposedTotal = totalPoints - current + clamped;
    let adjusted = clamped;
    if (proposedTotal > rule.points) {
      const overflow = proposedTotal - rule.points;
      adjusted = Math.max(0, clamped - overflow);
    }
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
        <aside className="skills-limit">
          <span>Priority {priority ?? '—'}</span>
          {rule ? (
            <>
              <p>{`${remainingPoints} of ${rule.points} skill points remaining`}</p>
              <p>Specializations: {`${Math.max(remainingPrioritySpecializations, 0)} of ${rule.specializations} remaining`}</p>
            </>
          ) : (
            <p>Assign a priority letter to unlock your allocation.</p>
          )}
        </aside>
      </header>

      <section className="skills-grid">
        {Object.entries(data.skills).map(([discipline, skills]) => (
          <article key={discipline} className="skills-discipline">
            <header>
              <h3>{toTitleCase(discipline)}</h3>
              <p>{skills.length} core skills</p>
            </header>
            <ul>
              {skills.map((skill) => {
                const skillId = `${discipline}:${skill.id}`;
                const current = ratings[skillId] ?? 0;
                const maxRank = rule?.maxRank ?? 0;
                return (
                  <li key={skillId}>
                    <div className="skills-item__header">
                      <label className="skills-rating">
                        <span>Rating</span>
                        <input
                          type="range"
                          min={0}
                          max={maxRank}
                          step={1}
                          value={current}
                          disabled={!rule}
                          onChange={handleRatingChange(skillId, current)}
                        />
                        <span className="skills-rating__value">{current}</span>
                      </label>
                      <div>
                        <h4>{skill.name}</h4>
                        <p>{skill.description}</p>
                      </div>
                    </div>
                    {skill.specializations.length > 0 && (
                      <details>
                        <summary>Specializations</summary>
                        <ul className="skills-specializations">
                          {skill.specializations.map((specialization) => {
                            const selectionId = `pre:${skillId}:${specialization.id ?? specialization.name}`;
                            const isSelected = specializationMap.has(selectionId);
                            const limitReached =
                              !rule ||
                              (rule.specializations === 0 && !isSelected) ||
                              (rule.specializations > 0 && remainingPrioritySpecializations === 0 && !isSelected);
                            return (
                              <li key={selectionId}>
                                <button
                                  type="button"
                                  className={`skills-specialization__toggle ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handlePredefinedToggle(skillId, skill.name, specialization.id, specialization.name)}
                                  disabled={limitReached}
                                >
                                  <strong>{specialization.name}</strong>
                                  <span>{specialization.description}</span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </details>
                    )}
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </section>

      {backgroundOptionsAvailable.length > 0 && (
        <section className="skills-background">
          <h3>Background Specialization</h3>
          <p>Select one of the options granted by your background.</p>
          <div className="skills-background__options">
            {backgroundOptionsAvailable.map((option) => (
              <label key={option} className="skills-background__option">
                <input
                  type="radio"
                  name="background-specialization"
                  value={option}
                  checked={backgroundSpecialization === option}
                  onChange={() => onSetBackgroundSpecialization(option)}
                />
                <span>{option}</span>
              </label>
            ))}
            <button type="button" className="skills-background__clear" onClick={() => onSetBackgroundSpecialization(null)}>
              Clear Background Choice
            </button>
          </div>
        </section>
      )}

      <section className="skills-selected">
        <h3>Selected Specializations</h3>
        {specializations.length === 0 && !backgroundSpecialization ? (
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
            {backgroundSpecialization && (
              <li>
                <div>
                  <strong>{backgroundSpecialization}</strong>
                  <span className="gm-tag gm-tag--background">Background</span>
                </div>
                <button type="button" onClick={() => onSetBackgroundSpecialization(null)} aria-label="Clear background specialization">
                  Remove
                </button>
              </li>
            )}
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
