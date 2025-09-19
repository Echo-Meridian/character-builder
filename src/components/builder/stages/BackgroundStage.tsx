import type { BackgroundsData } from '../../../data/types';
import type { PriorityRank } from '../../../data/types';
import type { CharacterBuild } from '../../../state/characterStore';
import './background-stage.css';

interface BackgroundStageProps {
  priority: PriorityRank | null;
  background: CharacterBuild['background'];
  onUpdate: (changes: Partial<CharacterBuild['background']>) => void;
  data: BackgroundsData;
}

export function BackgroundStage({ priority, background, onUpdate, data }: BackgroundStageProps) {
  const narrativeScope = priority ? data.backgrounds.formula.narrativeScope[priority] : null;

  return (
    <div className="stage stage--background">
      <header className="stage__header">
        <div>
          <h2>Background</h2>
          <p>
            Backgrounds tell the table who you were before the Long Night took hold. Use the narrative scope guidance to
            outline your reach and obligations.
          </p>
        </div>
        <aside className="background-callout">
          <span className="background-callout__label">Priority {priority ?? '—'}</span>
          <p>{narrativeScope ?? 'Assign a priority to unlock your narrative reach.'}</p>
        </aside>
      </header>

      <section className="background-form">
        <label className="field">
          <span>Background Title</span>
          <input
            value={background.title}
            placeholder="Ex: Harrowed Detective of Ward 13"
            onChange={(event) => onUpdate({ title: event.target.value })}
          />
        </label>
        <label className="field">
          <span>Background Details</span>
          <textarea
            value={background.tierNotes}
            placeholder="What power structure do you belong to? Who do you owe? How far does your influence reach?"
            onChange={(event) => onUpdate({ tierNotes: event.target.value })}
          />
        </label>
        <label className="field">
          <span>Contacts Born From This Life</span>
          <textarea
            value={background.contacts}
            placeholder="List guaranteed contacts, safehouses, or automatic skill specializations."
            onChange={(event) => onUpdate({ contacts: event.target.value })}
          />
        </label>
      </section>

      <section className="background-guidance">
        <article>
          <h3>Formula</h3>
          <ul>
            <li>{data.backgrounds.formula.specialization}</li>
            <li>{data.backgrounds.formula.synergy}</li>
            <li>{data.backgrounds.formula.wardAccess}</li>
          </ul>
          <p className="example">Synergy prompts: {data.backgrounds.formula.synergyExamples}</p>
        </article>
        <article>
          <h3>Narrative Scope</h3>
          <ul>
            {Object.entries(data.backgrounds.formula.narrativeScope).map(([rank, description]) => (
              <li key={rank} className={rank === priority ? 'active' : ''}>
                <span className="rank">{rank}</span>
                <p>{description}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
