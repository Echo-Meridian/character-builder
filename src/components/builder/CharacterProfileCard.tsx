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
      <header className="flex justify-between items-baseline mb-deco-md pb-deco-sm border-b border-sidonia-gold/20">
        <h2 className="font-display text-2xl tracking-wider uppercase text-sidonia-gold">
          Character Dossier
        </h2>
        <span className="text-label text-sidonia-muted">
          Auto-saved {new Date(updatedAt).toLocaleString()}
        </span>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-deco-md items-start">
        {/* Main Details */}
        <div className="space-y-deco-sm">
          {/* Name/Alias/CurrentProfession/WardOfResidence Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-deco-sm">
            <DecoInput
              label="Name"
              value={profile.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
            />
            <DecoInput
              label="Alias"
              value={profile.alias}
              onChange={(e) => onUpdate({ alias: e.target.value })}
            />
            <DecoInput
              label="Current Profession"
              value={profile.currentProfession}
              onChange={(e) => onUpdate({ currentProfession: e.target.value })}
            />
            <DecoInput
              label="Ward of Residence"
              value={profile.wardOfResidence}
              placeholder="Which ward do they call home?"
              onChange={(e) => onUpdate({ wardOfResidence: e.target.value })}
            />
          </div>

          {/* Backstory */}
          <div className="flex flex-col gap-1">
            <label className="text-label">Backstory</label>
            <textarea
              value={profile.backstory}
              placeholder="High-level summary you can hand to a new player or GM."
              onChange={(e) => onUpdate({ backstory: e.target.value })}
              className="min-h-[100px] bg-sidonia-black border border-sidonia-gold/50 text-sidonia-text
                       px-deco-sm py-2 font-body placeholder:text-sidonia-muted
                       focus:outline-none focus:ring-1 focus:border-sidonia-gold focus:ring-sidonia-gold/20
                       transition-all duration-300 resize-y"
            />
          </div>

          {/* Physical Description */}
          <div className="flex flex-col gap-1">
            <label className="text-label">Physical Description</label>
            <textarea
              value={profile.physicalDescription}
              placeholder="How do they carry themselves? Distinguishing features?"
              onChange={(e) => onUpdate({ physicalDescription: e.target.value })}
              className="min-h-[100px] bg-sidonia-black border border-sidonia-gold/50 text-sidonia-text
                       px-deco-sm py-2 font-body placeholder:text-sidonia-muted
                       focus:outline-none focus:ring-1 focus:border-sidonia-gold focus:ring-sidonia-gold/20
                       transition-all duration-300 resize-y"
            />
          </div>

          {/* Code */}
          <div className="flex flex-col gap-1">
            <label className="text-label">Code</label>
            <textarea
              value={profile.code}
              placeholder="What guiding principle can they not compromise?"
              onChange={(e) => onUpdate({ code: e.target.value })}
              className="min-h-[100px] bg-sidonia-black border border-sidonia-gold/50 text-sidonia-text
                       px-deco-sm py-2 font-body placeholder:text-sidonia-muted
                       focus:outline-none focus:ring-1 focus:border-sidonia-gold focus:ring-sidonia-gold/20
                       transition-all duration-300 resize-y"
            />
          </div>

          {/* Line Not Crossed / Temptation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-deco-sm">
            <div className="flex flex-col gap-1">
              <label className="text-label">Line They Will Not Cross</label>
              <textarea
                value={profile.lineNotCrossed}
                placeholder="The red line that defines them."
                onChange={(e) => onUpdate({ lineNotCrossed: e.target.value })}
                className="min-h-[100px] bg-sidonia-black border border-sidonia-gold/50 text-sidonia-text
                         px-deco-sm py-2 font-body placeholder:text-sidonia-muted
                         focus:outline-none focus:ring-1 focus:border-sidonia-gold focus:ring-sidonia-gold/20
                         transition-all duration-300 resize-y"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-label">Temptation</label>
              <textarea
                value={profile.temptation}
                placeholder="The lure that could make them fall."
                onChange={(e) => onUpdate({ temptation: e.target.value })}
                className="min-h-[100px] bg-sidonia-black border border-sidonia-gold/50 text-sidonia-text
                         px-deco-sm py-2 font-body placeholder:text-sidonia-muted
                         focus:outline-none focus:ring-1 focus:border-sidonia-gold focus:ring-sidonia-gold/20
                         transition-all duration-300 resize-y"
              />
            </div>
          </div>
        </div>

        {/* Portrait Sidebar */}
        <aside className="flex flex-col gap-deco-sm">
          <div className="relative w-full pt-[120%] rounded-lg border-2 border-dashed border-sidonia-gold/40
                        bg-sidonia-black/45 overflow-hidden">
            {profile.portraitUrl ? (
              <img
                src={profile.portraitUrl}
                alt={`${profile.name || 'Character'} portrait`}
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sidonia-muted text-sm font-body">
                Portrait Pending
              </div>
            )}
          </div>
          <DecoInput
            label="Portrait URL (optional)"
            value={profile.portraitUrl}
            placeholder="Link to artwork or leave blank"
            onChange={(e) => onUpdate({ portraitUrl: e.target.value })}
          />
        </aside>
      </div>
    </DecoCard>
  );
}
