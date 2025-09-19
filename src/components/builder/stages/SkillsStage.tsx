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

export function SkillsStage({ priority, data, focus, onUpdateFocus, notes, onUpdateNotes }: SkillsStageProps) {
  const limit = priority ? PRIORITY_TO_FOCUS_LIMIT[priority] : 0;

  const toggleFocus = (skillId: string) => {
    const exists = focus.includes(skillId);
    if (exists) {
      onUpdateFocus(focus.filter((entry) => entry !== skillId));
      return;
    }
    if (limit && focus.length >= limit) return;
    onUpdateFocus([...focus, skillId]);
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
                <li key={entry}>{formatSkillId(entry)}</li>
              ))}
            </ul>
          )}
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
  const [discipline, skill] = value.split(':');
  return `${toTitleCase(discipline)} · ${toTitleCase(skill.replace(/-/g, ' '))}`;
}
