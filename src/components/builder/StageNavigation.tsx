import { clsx } from 'clsx';
import type { CharacterStage } from '../../state/characterStore';
import { STAGES } from '../../state/characterStore';

const STAGE_DETAILS: Record<CharacterStage, { label: string; description: string }> = {
  priorities: {
    label: 'Priorities',
    description: 'Assign each letter to a pillar to set your fate.'
  },
  lineage: {
    label: 'Lineage',
    description: 'Choose what you are and reveal the aesthetic.'
  },
  resources: {
    label: 'Resources',
    description: 'Distribute wealth, favors, and territory.'
  },
  background: {
    label: 'Background',
    description: 'Capture the story that forged you.'
  },
  skills: {
    label: 'Skills',
    description: 'Highlight expertise and specializations.'
  },
  attributes: {
    label: 'Attributes',
    description: 'Split your innate edge across three pillars.'
  },
  narrative: {
    label: 'Narrative',
    description: 'Track corruption, wounds, and relationships.'
  }
};

interface StageNavigationProps {
  current: CharacterStage;
  onNavigate: (stage: CharacterStage) => void;
}

export function StageNavigation({ current, onNavigate }: StageNavigationProps) {
  const currentIndex = STAGES.indexOf(current);
  const completion = Math.round(((currentIndex + 1) / STAGES.length) * 100);

  return (
    <nav className="flex flex-col gap-deco-sm mb-deco-md" aria-label="Character builder stages">
      {/* Progress Bar */}
      <div className="h-1.5 rounded-full bg-sidonia-dark/50 overflow-hidden border border-sidonia-gold/20">
        <div
          className="h-full bg-gradient-to-r from-sidonia-gold to-sidonia-brass transition-all duration-500 ease-out"
          style={{ width: `${completion}%` }}
        />
      </div>

      {/* Stage Buttons */}
      <ul className="flex flex-wrap gap-3 list-none p-0 m-0">
        {STAGES.map((stage) => {
          const details = STAGE_DETAILS[stage];
          const index = STAGES.indexOf(stage);
          const isCurrent = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <li key={stage} className="flex-1 min-w-[180px]">
              <button
                type="button"
                onClick={() => onNavigate(stage)}
                className={clsx(
                  'w-full px-deco-sm py-3 rounded-lg border-2 text-left',
                  'flex flex-col gap-1 transition-all duration-300',
                  'bg-sidonia-dark/75 backdrop-blur-sm',
                  // Current state
                  isCurrent && 'border-sidonia-gold shadow-lg shadow-sidonia-gold/20 -translate-y-0.5',
                  // Completed state
                  isCompleted && 'border-sidonia-gold/40 hover:border-sidonia-gold/60',
                  // Upcoming state
                  isUpcoming && 'border-sidonia-muted/30 hover:border-sidonia-muted/50',
                  // General hover
                  'hover:bg-sidonia-dark'
                )}
              >
                <span className={clsx(
                  'font-display text-sm tracking-wider uppercase',
                  isCurrent && 'text-sidonia-gold',
                  isCompleted && 'text-sidonia-brass',
                  isUpcoming && 'text-sidonia-muted'
                )}>
                  {details.label}
                </span>
                <span className="text-xs text-sidonia-text/70 font-body">
                  {details.description}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
