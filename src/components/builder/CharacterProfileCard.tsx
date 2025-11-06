import { DecoCard } from '../ui/DecoCard';
import { DecoInput } from '../ui/DecoInput';
import type { CharacterBuild, CharacterProfile } from '../../state/characterStore';

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
    <DecoCard>
      {/* Header */}
      <header className="flex justify-between items-baseline mb-deco-md pb-deco-sm border-b border-sidonia-gold/60">
        <h2 className="font-display text-2xl tracking-wider uppercase text-sidonia-gold">
          Character Identity
        </h2>
        <span className="text-label text-sidonia-muted">
          Auto-saved {new Date(updatedAt).toLocaleString()}
        </span>
      </header>

      {/* Name and Concept Only */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-deco-md">
        <DecoInput
          label="Name"
          value={profile.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="What do they call themselves?"
        />
        <div className="flex flex-col gap-1">
          <label className="text-label">Concept</label>
          <input
            type="text"
            value={profile.concept}
            placeholder="Ex: Vengeful corporate spy, Corrupted street medic, etc."
            onChange={(e) => onUpdate({ concept: e.target.value })}
            className="bg-sidonia-black border-2 border-sidonia-gold/60 text-sidonia-text
                     px-deco-sm py-2 font-body placeholder:text-sidonia-muted rounded
                     focus:outline-none focus:ring-1 focus:border-sidonia-gold focus:ring-sidonia-gold/20
                     transition-all duration-300"
          />
          <p className="text-xs text-sidonia-muted mt-1 italic">
            A one-line vision for your character. This will help guide your build decisions.
          </p>
        </div>
      </div>
    </DecoCard>
  );
}
