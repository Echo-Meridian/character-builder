import { useMemo, useState } from 'react';
import type { SkillsData } from '../../../data/types';
import type { PriorityRank } from '../../../data/types';
import './skills-stage.css';

interface SkillsStageProps {
  priority: PriorityRank | null;
  data: SkillsData;
  focus: string[];
  onUpdateFocus: (nextFocus: string[]) => void;
  notes: string;
  onUpdateNotes: (notes: string) => void;
}

const PRIORITY_TO_FOCUS_LIMIT: Record<PriorityRank, number> = {
  A: 6,
  B: 5,
  C: 4,
  D: 3,
  E: 2
};

const CUSTOM_SPECIALIZATION_PREFIX = 'custom::';

export function SkillsStage({ priority, data, focus, onUpdateFocus, notes, onUpdateNotes }: SkillsStageProps) {
  const limit = priority ? PRIORITY_TO_FOCUS_LIMIT[priority] : 0;
  const [customLabel, setCustomLabel] = useState('');

  const availableSlots = useMemo(() => {
    if (!limit) return Infinity;
    return Math.max(limit - focus.length, 0);
  }, [limit, focus.length]);

  const toggleFocus = (skillId: string) => {
    const exists = focus.includes(skillId);
    if (exists) {
      onUpdateFocus(focus.filter((entry) => entry !== skillId));
      return;
    }
    if (limit && focus.length >= limit) return;
    onUpdateFocus([...focus, skillId]);
  };

  const addCustomSpecialization = () => {
    const trimmed = customLabel.trim();
    if (!trimmed) return;
    const id = `${CUSTOM_SPECIALIZATION_PREFIX}${trimmed}`;
    if (focus.includes(id)) {
      setCustomLabel('');
      return;
    }
    if (limit && focus.length >= limit) return;
    onUpdateFocus([...focus, id]);
    setCustomLabel('');
  };

  const removeFocus = (id: string) => {
    onUpdateFocus(focus.filter((entry) => entry !== id));
  };

  return (
    <div className="stage stage--skills">
      <header className="stage__header">
        <div>
          <h2>Skills & Disciplines</h2>
          <p>
            Skills reveal what you practiced before the dice hit the table. Mark your focus abilities to help the GM
            spotlight your expertise. Specializations unlock as narrative permissions first, mechanical bonuses second.
          </p>
        </div>
        <aside className="skills-limit">
          <span>Priority {priority ?? '—'}</span>
          {priority ? <p>Select up to {limit} focus skills.</p> : <p>Assign a priority letter to establish your mastery cap.</p>}
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
                const id = `${discipline}:${skill.id}`;
                const isFocused = focus.includes(id);
                return (
                  <li key={id} className={isFocused ? 'focused' : ''}>
                    <div className="skills-item__header">
                      <button type="button" onClick={() => toggleFocus(id)} disabled={!isFocused && limit > 0 && focus.length >= limit}>
                        {isFocused ? 'Focused' : 'Focus'}
                      </button>
                      <div>
                        <h4>{skill.name}</h4>
                        <p>{skill.description}</p>
                      </div>
                    </div>
                    <details>
                      <summary>Specializations</summary>
                      <ul className="skills-specializations">
                        {skill.specializations.map((specialization) => (
                          <li key={specialization.id}>
                            <strong>{specialization.name}</strong>
                            <span>{specialization.description}</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </section>

      <section className="skills-footer">
        <div>
          <h3>Focus Tracker</h3>
          {focus.length === 0 ? (
            <p>No skills marked yet. Highlight a few so we know where to spotlight you.</p>
          ) : (
            <ul className="focus-pills">
              {focus.map((entry) => (
                <li key={entry} className={entry.startsWith(CUSTOM_SPECIALIZATION_PREFIX) ? 'focus-pills__custom' : ''}>
                  <span>{formatSkillId(entry)}</span>
                  {entry.startsWith(CUSTOM_SPECIALIZATION_PREFIX) && <span className="gm-tag">Pending GM Approval</span>}
                  <button type="button" onClick={() => removeFocus(entry)} aria-label="Remove focus">
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="skills-custom">
            <label>
              <span>Custom Specialization</span>
              <div className="skills-custom__controls">
                <input
                  value={customLabel}
                  onChange={(event) => setCustomLabel(event.target.value)}
                  placeholder="Ex: Underworld Etiquette"
                  disabled={availableSlots === 0}
                />
                <button
                  type="button"
                  onClick={addCustomSpecialization}
                  disabled={availableSlots === 0 || !customLabel.trim()}
                >
                  Add
                </button>
              </div>
            </label>
            <p className="skills-custom__hint">Custom options are provisional until your GM approves them.</p>
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

function formatSkillId(value: string) {
  if (value.startsWith(CUSTOM_SPECIALIZATION_PREFIX)) {
    return `Custom · ${value.slice(CUSTOM_SPECIALIZATION_PREFIX.length)}`;
  }
  const [discipline, skill] = value.split(':');
  return `${toTitleCase(discipline)} · ${toTitleCase(skill.replace(/-/g, ' '))}`;
}
