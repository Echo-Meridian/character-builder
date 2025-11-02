import type { PriorityRank } from '../../data/types';
import type { PriorityCategory } from '../../state/characterStore';
import { PRIORITY_CATEGORIES } from '../../state/characterStore';
import './priority-matrix.css';

const RANKS: PriorityRank[] = ['A', 'B', 'C', 'D', 'E'];

const CATEGORY_DETAILS: Record<PriorityCategory, { title: string; intro: string; detail: string }> = {
  lineage: {
    title: 'Lineage',
    intro: 'What are you? Determines the supernatural path and aesthetic layer.',
    detail: 'Higher priority unlocks stronger chassis, spheres, mutation points, or Esper templates. Lower priority keeps you closer to human but limits your edge.'
  },
  resources: {
    title: 'Resources',
    intro: 'What do you own? Contacts, territories, retainers, liquid wealth.',
    detail: 'Priority sets your Resource Points pool and maximum quality. Use it to buy properties, networks, and gear. Higher ranks unlock elite holdings.'
  },
  background: {
    title: 'Background',
    intro: 'Who were you? Establishes influence, narrative permissions, and synergies.',
    detail: 'Higher priority backgrounds stretch across the city, offering automatic specializations and better resource synergies.'
  },
  skills: {
    title: 'Skills',
    intro: 'What do you know? Disciplines and specializations that show lived experience.',
    detail: 'Priority sets how many disciplines you master. Focus areas gain bonus dice and teach players where they shine.'
  },
  attributes: {
    title: 'Attributes',
    intro: 'What is innate? Only three pillars define your core capability.',
    detail: 'Allocate attribute dice based on priority. The higher the rank, the sharper your raw edge.'
  }
};

interface PriorityMatrixProps {
  priorities: Record<PriorityCategory, PriorityRank | null>;
  onSelect: (category: PriorityCategory, rank: PriorityRank) => void;
  onClear?: (category: PriorityCategory) => void;
}

export function PriorityMatrix({ priorities, onSelect, onClear }: PriorityMatrixProps) {
  const usedRanks = new Set(
    (Object.values(priorities).filter(Boolean) as PriorityRank[]).map((value) => value)
  );

  return (
    <section className="priority-matrix" aria-label="Priority assignment grid">
      <header className="priority-matrix__header">
        <div>
          <h2>Priority Grid</h2>
          <p>
            Assign each letter exactly once. Sidonia rewards focus and makes you pay for it elsewhere. Tap a letter to
            slot it into a category; tap the category badge to clear it.
          </p>
        </div>
        <ul className="priority-matrix__legend">
          {RANKS.map((rank) => (
            <li key={rank} className={usedRanks.has(rank) ? 'used' : ''}>
              <span className="priority-matrix__rank">{rank}</span>
              <span className="priority-matrix__tag">
                {rank === 'A' && 'Signature move'}
                {rank === 'B' && 'Favored'}
                {rank === 'C' && 'Balanced'}
                {rank === 'D' && 'Compromised'}
                {rank === 'E' && 'Sacrifice'}
              </span>
            </li>
          ))}
        </ul>
      </header>
      <div className="priority-matrix__grid" role="table">
        {PRIORITY_CATEGORIES.map((category) => {
          const detail = CATEGORY_DETAILS[category];
          const selected = priorities[category];
          return (
            <article key={category} className="priority-matrix__row" role="row">
              <div className="priority-matrix__info" role="cell">
                <button
                  type="button"
                  className={`priority-matrix__category ${selected ? 'has-selection' : ''}`}
                  onClick={() => onClear?.(category)}
                >
                  <span className="priority-matrix__category-title">{detail.title}</span>
                  <span className="priority-matrix__selection">{selected ?? '—'}</span>
                </button>
                <p className="priority-matrix__intro">{detail.intro}</p>
                <details>
                  <summary>Why it matters</summary>
                  <p>{detail.detail}</p>
                </details>
              </div>
              <div className="priority-matrix__choices" role="cell">
                {RANKS.map((rank) => {
                  const isSelected = selected === rank;
                  const disabled = !isSelected && usedRanks.has(rank);
                  return (
                    <button
                      key={rank}
                      type="button"
                      className={`priority-matrix__choice ${isSelected ? 'selected' : ''}`}
                      disabled={disabled}
                      onClick={() => onSelect(category, rank)}
                    >
                      {rank}
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
