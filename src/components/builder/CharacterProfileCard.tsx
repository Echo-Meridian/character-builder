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
      <div className="profile-card__grid">
        <label className="field">
          <span>Name</span>
          <input value={profile.name} onChange={(event) => onUpdate({ name: event.target.value })} />
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
        <label className="field profile-card__summary">
          <span>Summary</span>
          <textarea
            value={profile.summary}
            placeholder="High-level summary you can hand to a new player or GM."
            onChange={(event) => onUpdate({ summary: event.target.value })}
          />
        </label>
      </div>
    </section>
  );
}
