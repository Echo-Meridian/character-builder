import { useState } from 'react';
import type { CharacterBuild, BodyLocationKey } from '../../../state/characterStore';
import { BODY_LOCATIONS } from '../../../state/characterStore';
import './narrative-stage.css';

interface NarrativeStageProps {
  corruption: CharacterBuild['corruption'];
  onAdjustCorruption: (delta: number) => void;
  onSetCorruption: (value: number) => void;
  onUpdateCorruptionNotes: (notes: string) => void;
  advancement: CharacterBuild['advancement'];
  onAdjustExperience: (delta: number) => void;
  onSetExperience: (value: number) => void;
  onUpdateAdvancement: (changes: Partial<CharacterBuild['advancement']>) => void;
  health: CharacterBuild['health'];
  onAdjustHealth: (location: BodyLocationKey, delta: number) => void;
  onSetHealth: (location: BodyLocationKey, value: number) => void;
  onUpdateScar: (location: BodyLocationKey, scar: string) => void;
  narrative: CharacterBuild['narrative'];
  onAddRelationship: (name: string) => void;
  onRemoveRelationship: (name: string) => void;
  onUpdateAnchors: (text: string) => void;
  onUpdateNarrativeNotes: (text: string) => void;
}

export function NarrativeStage({
  corruption,
  onAdjustCorruption,
  onSetCorruption,
  onUpdateCorruptionNotes,
  advancement,
  onAdjustExperience,
  onSetExperience,
  onUpdateAdvancement,
  health,
  onAdjustHealth,
  onSetHealth,
  onUpdateScar,
  narrative,
  onAddRelationship,
  onRemoveRelationship,
  onUpdateAnchors,
  onUpdateNarrativeNotes
}: NarrativeStageProps) {
  const [relationshipInput, setRelationshipInput] = useState('');

  const submitRelationship = () => {
    if (!relationshipInput.trim()) return;
    onAddRelationship(relationshipInput.trim());
    setRelationshipInput('');
  };

  return (
    <div className="stage stage--narrative">
      <header className="stage__header">
        <div>
          <h2>Narrative, Corruption & Wounds</h2>
          <p>
            Record the scars the city has already carved. Corruption is front-and-center for players, while hidden notes
            can foreshadow GM complications.
          </p>
        </div>
      </header>

      <section className="advancement-panel">
        <div className="experience-meter">
          <div className="experience-value">{advancement.experience}</div>
          <span>Experience</span>
          <div className="experience-controls">
            <button type="button" onClick={() => onAdjustExperience(-1)}>-1</button>
            <button type="button" onClick={() => onSetExperience(0)}>Reset</button>
            <button type="button" onClick={() => onAdjustExperience(1)}>+1</button>
          </div>
        </div>
        <label className="field">
          <span>Advancement Track</span>
          <textarea
            value={advancement.track}
            onChange={(event) => onUpdateAdvancement({ track: event.target.value })}
            placeholder="What does advancement look like for this character? Training regimens, resources, oaths."
          />
        </label>
        <label className="field">
          <span>Milestones</span>
          <textarea
            value={advancement.milestones}
            onChange={(event) => onUpdateAdvancement({ milestones: event.target.value })}
            placeholder="Log beats completed, debts paid, or corruption bargains accepted."
          />
        </label>
      </section>

      <section className="corruption-panel">
        <div className="corruption-meter">
          <div className="corruption-value">{corruption.current}</div>
          <span>Threshold {corruption.warning}</span>
          <div className="corruption-controls">
            <button type="button" onClick={() => onAdjustCorruption(-1)}>-1</button>
            <button type="button" onClick={() => onSetCorruption(0)}>Reset</button>
            <button type="button" onClick={() => onAdjustCorruption(1)}>+1</button>
          </div>
        </div>
        <label className="field">
          <span>Corruption Notes</span>
          <textarea
            value={corruption.notes}
            onChange={(event) => onUpdateCorruptionNotes(event.target.value)}
            placeholder="Describe what corruption looks like for this character."
          />
        </label>
      </section>

      <section className="health-grid">
        <h3>Health by Body Location</h3>
        <div className="health-cards">
          {(Object.keys(BODY_LOCATIONS) as BodyLocationKey[]).map((location) => {
            const entry = health[location];
            const displayLabel = BODY_LOCATIONS[location];
            return (
              <article key={location}>
                <header>
                  <h4>{displayLabel}</h4>
                  <span>{entry.current} / {entry.max}</span>
                </header>
                <div className="health-controls">
                  <button type="button" onClick={() => onAdjustHealth(location, -1)}>-</button>
                  <input
                    type="number"
                    min={0}
                    max={entry.max}
                    value={entry.current}
                    onChange={(event) => onSetHealth(location, Number(event.target.value))}
                  />
                  <button type="button" onClick={() => onAdjustHealth(location, 1)}>+</button>
                </div>
                <label>
                  <span>Scars & Notes</span>
                  <textarea
                    value={entry.scar}
                    onChange={(event) => onUpdateScar(location, event.target.value)}
                    placeholder="Visible injuries, lingering trauma, prosthetics."
                  />
                </label>
              </article>
            );
          })}
        </div>
      </section>

      <section className="relationships-panel">
        <div className="relationships-list">
          <h3>Relationships</h3>
          <div className="relationship-input">
            <input
              value={relationshipInput}
              onChange={(event) => setRelationshipInput(event.target.value)}
              placeholder="Name · why they matter · leverage"
            />
            <button type="button" onClick={submitRelationship}>Add</button>
          </div>
          {narrative.relationships.length === 0 ? (
            <p>No relationships logged yet.</p>
          ) : (
            <ul>
              {narrative.relationships.map((relationship) => (
                <li key={relationship}>
                  <span>{relationship}</span>
                  <button type="button" onClick={() => onRemoveRelationship(relationship)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="anchors">
          <label className="field">
            <span>Anchors</span>
            <textarea
              value={narrative.anchors}
              onChange={(event) => onUpdateAnchors(event.target.value)}
              placeholder="What keeps them tethered to humanity?"
            />
          </label>
          <label className="field">
            <span>Other Notes</span>
            <textarea
              value={narrative.notes}
              onChange={(event) => onUpdateNarrativeNotes(event.target.value)}
              placeholder="Foreshadow upcoming arcs, unresolved debts, or metaphysical tells."
            />
          </label>
        </div>
      </section>
    </div>
  );
}
