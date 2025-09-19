import type { CharacterStage } from '../../state/characterStore';
import { STAGES } from '../../state/characterStore';
import './stage-navigation.css';

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
    <nav className="stage-navigation" aria-label="Character builder stages">
      <div className="stage-navigation__progress">
        <div className="stage-navigation__progress-bar" style={{ width: `${completion}%` }} />
      </div>
      <ul>
        {STAGES.map((stage) => {
          const details = STAGE_DETAILS[stage];
          const index = STAGES.indexOf(stage);
          const status = index === currentIndex ? 'current' : index < currentIndex ? 'completed' : 'upcoming';
          return (
            <li key={stage} className={`stage-navigation__item ${status}`}>
              <button type="button" onClick={() => onNavigate(stage)}>
                <span className="stage-navigation__label">{details.label}</span>
                <span className="stage-navigation__description">{details.description}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
