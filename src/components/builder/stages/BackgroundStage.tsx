import { useMemo } from 'react';
import type { BackgroundEntry, BackgroundsData, BackgroundProfession, PriorityRank } from '../../../data/types';
import type { CharacterBuild } from '../../../state/characterStore';
import './background-stage.css';

interface BackgroundStageProps {
  priority: PriorityRank | null;
  background: CharacterBuild['background'];
  onUpdate: (changes: Partial<CharacterBuild['background']>) => void;
  data: BackgroundsData;
}

export function BackgroundStage({ priority, background, onUpdate, data }: BackgroundStageProps) {
  const entries = useMemo(() => Object.entries(data), [data]);
  const selectedEntry: BackgroundEntry | undefined = background.title && data[background.title] ? data[background.title] : undefined;
  const professionByPriority = useMemo(() => {
    if (!selectedEntry?.professions) return new Map<PriorityRank, BackgroundProfession>();
    return new Map(selectedEntry.professions.map((profession) => [profession.priority, profession]));
  }, [selectedEntry?.professions]);

  const highlightedProfession = priority ? professionByPriority.get(priority) : undefined;
  const calloutTitle = background.title || 'Choose a background';
  const calloutDescription = highlightedProfession?.description || selectedEntry?.description || 'Select a background below to load its story, talents, and contacts.';

  const skillTags = selectedEntry?.skillSpecializationOptions ?? [];
  const resourceTags = selectedEntry?.resourceSynergyExamples ?? [];

  const handleAdoptBackground = (name: string) => {
    const entry = data[name];
    const updates: Partial<CharacterBuild['background']> = { title: name };
    if (entry) {
      if (!background.tierNotes && entry.description) {
        updates.tierNotes = entry.description;
      }
      if (!background.contacts && entry.resourceSynergyExamples?.length) {
        updates.contacts = entry.resourceSynergyExamples.join('\n');
      }
    }
    onUpdate(updates);
  };

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
          <div className="background-callout__header">
            <span className="background-callout__label">Priority {priority ?? '—'}</span>
            <h3>{calloutTitle}</h3>
          </div>
          <p className="background-callout__body">{calloutDescription}</p>
          {(skillTags.length > 0 || resourceTags.length > 0) && (
            <div className="background-callout__tags">
              {skillTags.length > 0 && (
                <div>
                  <span className="background-callout__tag-label">Signature Skills</span>
                  <ul>
                    {skillTags.map((entry) => (
                      <li key={entry}>{entry}</li>
                    ))}
                  </ul>
                </div>
              )}
              {resourceTags.length > 0 && (
                <div>
                  <span className="background-callout__tag-label">Resource Synergies</span>
                  <ul>
                    {resourceTags.map((entry) => (
                      <li key={entry}>{entry}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
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

      <section className="background-catalog">
        {entries.map(([name, entry]) => {
          const isActive = name === background.title;
          return (
            <article key={name} className={`background-card ${isActive ? 'active' : ''}`}>
              <header className="background-card__header">
                <div>
                  <h3>{name}</h3>
                  <p>{entry.description}</p>
                </div>
                <button type="button" onClick={() => handleAdoptBackground(name)}>
                  {isActive ? 'Selected' : 'Adopt Background'}
                </button>
              </header>

              {(entry.skillSpecializationOptions?.length ?? 0) > 0 && (
                <section className="background-card__section">
                  <h4>Skill Specializations</h4>
                  <ul>
                    {entry.skillSpecializationOptions!.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </section>
              )}

              {(entry.resourceSynergyExamples?.length ?? 0) > 0 && (
                <section className="background-card__section">
                  <h4>Resource Synergies</h4>
                  <ul>
                    {entry.resourceSynergyExamples!.map((resource) => (
                      <li key={resource}>{resource}</li>
                    ))}
                  </ul>
                </section>
              )}

              {(entry.professions?.length ?? 0) > 0 && (
                <section className="background-card__section">
                  <h4>Profession Ladder</h4>
                  <div className="background-card__professions">
                    {entry.professions!.map((profession) => (
                      <div
                        key={`${profession.priority}-${profession.title}`}
                        className={`background-card__profession ${profession.priority === priority ? 'highlight' : ''}`}
                      >
                        <div className="background-card__profession-header">
                          <span className="badge">{profession.priority}</span>
                          <strong>{profession.title}</strong>
                        </div>
                        <p>{profession.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
