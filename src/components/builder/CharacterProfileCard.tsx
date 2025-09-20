import type { CharacterBuild, CharacterProfile } from '../../state/characterStore';
import './character-profile-card.css';

interface CharacterProfileCardProps {
  build: CharacterBuild | null;
  onUpdate: (changes: Partial<CharacterProfile>) => void;
}

export function CharacterProfileCard({ build, onUpdate }: CharacterProfileCardProps) {
  if (!build) {
    return null;
  }

  const { profile, updatedAt } = build;

  return (
    <section className="profile-card">
      <header>
        <h2>Character Dossier</h2>
        <span className="profile-card__timestamp">Auto-saved {new Date(updatedAt).toLocaleString()}</span>
      </header>
      <div className="profile-card__layout">
        <div className="profile-card__details">
          <div className="profile-card__grid">
            <label className="field">
              <span>Name</span>
              <input value={profile.name} onChange={(event) => onUpdate({ name: event.target.value })} />
            </label>
            <label className="field">
              <span>Alias</span>
              <input value={profile.alias} onChange={(event) => onUpdate({ alias: event.target.value })} />
            </label>
            <label className="field">
              <span>Pronouns</span>
              <input value={profile.pronouns} onChange={(event) => onUpdate({ pronouns: event.target.value })} />
            </label>
            <label className="field">
              <span>Concept</span>
              <input
                value={profile.concept}
                placeholder="Ex: Disgraced sorcerer moonlighting as a fixer"
                onChange={(event) => onUpdate({ concept: event.target.value })}
              />
            </label>
          </div>

          <label className="field profile-card__summary">
            <span>Summary</span>
            <textarea
              value={profile.summary}
              placeholder="High-level summary you can hand to a new player or GM."
              onChange={(event) => onUpdate({ summary: event.target.value })}
            />
          </label>

          <label className="field profile-card__textarea">
            <span>Physical Description</span>
            <textarea
              value={profile.physicalDescription}
              placeholder="How do they carry themselves? Distinguishing features?"
              onChange={(event) => onUpdate({ physicalDescription: event.target.value })}
            />
          </label>

          <label className="field profile-card__textarea">
            <span>Code</span>
            <textarea
              value={profile.code}
              placeholder="What guiding principle can they not compromise?"
              onChange={(event) => onUpdate({ code: event.target.value })}
            />
          </label>

          <div className="profile-card__duo">
            <label className="field profile-card__textarea">
              <span>Line They Will Not Cross</span>
              <textarea
                value={profile.lineNotCrossed}
                placeholder="The red line that defines them."
                onChange={(event) => onUpdate({ lineNotCrossed: event.target.value })}
              />
            </label>
            <label className="field profile-card__textarea">
              <span>Temptation</span>
              <textarea
                value={profile.temptation}
                placeholder="The lure that could make them fall."
                onChange={(event) => onUpdate({ temptation: event.target.value })}
              />
            </label>
          </div>
        </div>

        <aside className="profile-card__portrait">
          <div className="profile-card__portrait-frame">
            {profile.portraitUrl ? (
              <img src={profile.portraitUrl} alt={`${profile.name || 'Character'} portrait`} />
            ) : (
              <span>Portrait Pending</span>
            )}
          </div>
          <label className="field">
            <span>Portrait URL (optional)</span>
            <input
              value={profile.portraitUrl}
              onChange={(event) => onUpdate({ portraitUrl: event.target.value })}
              placeholder="Link to artwork or leave blank"
            />
          </label>
        </aside>
      </div>
    </section>
  );
}
