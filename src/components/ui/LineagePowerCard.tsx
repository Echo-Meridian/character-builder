import { clsx } from 'clsx';
import type { LineageKey } from '../../data/types';

interface LineagePowerCardProps {
  children: React.ReactNode;
  lineage?: LineageKey;
  selected?: boolean;
  className?: string;
}

// Lineage-specific accent colors from the style guide
const LINEAGE_COLORS: Record<LineageKey, { border: string; glow: string; text: string }> = {
  neosapien: {
    border: 'border-lineage-neosapien',
    glow: 'shadow-lineage-neosapien/30',
    text: 'text-lineage-neosapien'
  },
  sorcery: {
    border: 'border-lineage-sorcerer',
    glow: 'shadow-lineage-sorcerer/30',
    text: 'text-lineage-sorcerer'
  },
  chimera: {
    border: 'border-lineage-chimera',
    glow: 'shadow-lineage-chimera/30',
    text: 'text-lineage-chimera'
  },
  automata: {
    border: 'border-lineage-automata',
    glow: 'shadow-lineage-automata/30',
    text: 'text-lineage-automata'
  },
  esper: {
    border: 'border-lineage-esper',
    glow: 'shadow-lineage-esper/30',
    text: 'text-lineage-esper'
  }
};

export function LineagePowerCard({ children, lineage, selected, className }: LineagePowerCardProps) {
  const colors = lineage ? LINEAGE_COLORS[lineage] : null;

  return (
    <div
      className={clsx(
        'relative bg-sidonia-dark/90 border-2 rounded-lg p-deco-sm',
        'transition-all duration-300',
        selected && colors
          ? `${colors.border} shadow-lg ${colors.glow}`
          : 'border-sidonia-gold/20 hover:border-sidonia-gold/40',
        className
      )}
    >
      {children}
    </div>
  );
}

export function LineagePowerToggle({
  selected,
  lineage,
  onClick,
  children,
  disabled,
  variant = 'default'
}: {
  selected: boolean;
  lineage?: LineageKey;
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'radio' | 'clear' | 'primary';
}) {
  const colors = lineage ? LINEAGE_COLORS[lineage] : null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'px-deco-sm py-1.5 rounded-full font-display text-xs uppercase tracking-wider',
        'border-2 transition-all duration-300',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variant === 'clear' && 'bg-corruption-dark/20 border-corruption-red text-corruption-red hover:bg-corruption-red/20',
        variant === 'primary' && 'bg-sidonia-gold/10 border-sidonia-gold text-sidonia-gold hover:bg-sidonia-gold/20',
        variant === 'radio' && selected && colors && `bg-${colors.border}/10 ${colors.border} ${colors.text}`,
        variant === 'radio' && !selected && 'bg-sidonia-black/50 border-sidonia-muted/30 text-sidonia-muted hover:border-sidonia-muted/60',
        variant === 'default' && selected && colors && `bg-${colors.border}/10 ${colors.border} ${colors.text} shadow-md ${colors.glow}`,
        variant === 'default' && !selected && 'bg-sidonia-black/50 border-sidonia-gold/30 text-sidonia-text hover:border-sidonia-gold/60 hover:bg-sidonia-gold/5'
      )}
    >
      {children}
    </button>
  );
}
