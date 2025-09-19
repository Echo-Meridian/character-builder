import type { PriorityRank } from '../../../data/types';
import type { PriorityCategory } from '../../../state/characterStore';
import { PriorityMatrix } from '../PriorityMatrix';

interface PriorityStageProps {
  priorities: Record<PriorityCategory, PriorityRank | null>;
  onSelect: (category: PriorityCategory, rank: PriorityRank) => void;
  onClear: (category: PriorityCategory) => void;
}

export function PriorityStage({ priorities, onSelect, onClear }: PriorityStageProps) {
  const assigned = Object.values(priorities).filter(Boolean).length;
  const complete = assigned === Object.keys(priorities).length;

  return (
    <div className="stage stage--priorities">
      <PriorityMatrix priorities={priorities} onSelect={onSelect} onClear={onClear} />
      <footer className="stage__footer">
        <p>
          {complete
            ? 'Every letter is spoken for. Advance to Lineage to let the city brand you.'
            : 'You still have letters to place. Each sacrifice reveals a different facet of Sidonia.'}
        </p>
      </footer>
    </div>
  );
}
