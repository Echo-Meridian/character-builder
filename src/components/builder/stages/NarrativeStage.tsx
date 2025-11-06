import { useState } from 'react';
import type { CharacterBuild, CharacterProfile, BodyLocationKey } from '../../../state/characterStore';
import { BODY_LOCATIONS } from '../../../state/characterStore';
import './narrative-stage.css';

interface NarrativeStageProps {
  profile: CharacterProfile;
  onUpdateProfile: (changes: Partial<CharacterProfile>) => void;
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
  profile,
  onUpdateProfile,
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
          <h2>Narrative & Character Dossier</h2>
          <p>
            Now that you know who your character is mechanically, bring them to life with narrative details, relationships, and the scars they carry.
          </p>
        </div>
      </header>

      {/* Character Dossier Section */}
      <section className="dossier-panel">
        <h3>Character Dossier</h3>
        <p className="section-description">Complete the narrative picture of your character.</p>

        <div className="dossier-grid">
          {/* Portrait Sidebar */}
          <aside className="dossier-portrait">
            <div className="portrait-frame">
              {profile.portraitUrl ? (
                <img
                  src={profile.portraitUrl}
                  alt={`${profile.name || 'Character'} portrait`}
                  className="portrait-image"
                />
              ) : (
                <div className="portrait-placeholder">
                  Portrait Pending
                </div>
              )}
            </div>
            <label className="field">
              <span>Portrait URL (optional)</span>
              <input
                type="text"
                value={profile.portraitUrl}
                placeholder="Link to artwork or leave blank"
                onChange={(e) => onUpdateProfile({ portraitUrl: e.target.value })}
              />
            </label>
          </aside>

          {/* Dossier Fields */}
          <div className="dossier-fields">
            <div className="field-row">
              <label className="field">
                <span>Alias</span>
                <input
                  type="text"
                  value={profile.alias}
                  placeholder="Street name, nickname, or title"
                  onChange={(e) => onUpdateProfile({ alias: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Current Profession</span>
                <input
                  type="text"
                  value={profile.currentProfession}
                  placeholder="How they make ends meet"
                  onChange={(e) => onUpdateProfile({ currentProfession: e.target.value })}
                />
              </label>
            </div>

            <label className="field">
              <span>Ward of Residence</span>
              <input
                type="text"
                value={profile.wardOfResidence}
                placeholder="Which ward do they call home?"
                onChange={(e) => onUpdateProfile({ wardOfResidence: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Backstory</span>
              <textarea
                value={profile.backstory}
                placeholder="High-level summary you can hand to a new player or GM."
                onChange={(e) => onUpdateProfile({ backstory: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Physical Description</span>
              <textarea
                value={profile.physicalDescription}
                placeholder="How do they carry themselves? Distinguishing features?"
                onChange={(e) => onUpdateProfile({ physicalDescription: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Code</span>
              <textarea
                value={profile.code}
                placeholder="What guiding principle can they not compromise?"
                onChange={(e) => onUpdateProfile({ code: e.target.value })}
              />
            </label>

            <div className="field-row">
              <label className="field">
                <span>Line They Will Not Cross</span>
                <textarea
                  value={profile.lineNotCrossed}
                  placeholder="The red line that defines them."
                  onChange={(e) => onUpdateProfile({ lineNotCrossed: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Temptation</span>
                <textarea
                  value={profile.temptation}
                  placeholder="The lure that could make them fall."
                  onChange={(e) => onUpdateProfile({ temptation: e.target.value })}
                />
              </label>
            </div>
          </div>
        </div>
      </section>

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
