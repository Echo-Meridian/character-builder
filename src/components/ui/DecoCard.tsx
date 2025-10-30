import React from 'react';
import { clsx } from 'clsx';

export interface DecoCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  lineage?: 'neosapien' | 'sorcerer' | 'chimera' | 'automata' | 'esper';
  corrupted?: boolean;
}

export const DecoCard: React.FC<DecoCardProps> = ({
  children,
  className,
  title,
  lineage,
  corrupted = false,
}) => {
  const borderColor = lineage ? `border-lineage-${lineage}/30` : 'border-sidonia-gold/30';
  const cornerColor = lineage ? `border-lineage-${lineage}` : 'border-sidonia-gold';

  return (
    <div
      className={clsx(
        // Base card styling
        'relative bg-sidonia-dark border-2 p-deco-md overflow-hidden',
        borderColor,
        // Corner decorations (top-left)
        'before:absolute before:top-0 before:left-0',
        'before:w-deco-md before:h-deco-md',
        'before:border-t-2 before:border-l-2',
        `before:${cornerColor}`,
        // Corner decorations (bottom-right)
        'after:absolute after:bottom-0 after:right-0',
        'after:w-deco-md after:h-deco-md',
        'after:border-b-2 after:border-r-2',
        `after:${cornerColor}`,
        // Corruption effects
        corrupted && 'corruption-medium',
        className
      )}
    >
      {title && (
        <h2
          className={clsx(
            'font-display text-2xl tracking-[0.2em] uppercase text-center mb-deco-sm relative',
            lineage ? `text-lineage-${lineage}` : 'text-sidonia-gold',
            // Underline decoration
            'after:content-[""] after:absolute after:bottom-0 after:left-1/2',
            'after:transform after:-translate-x-1/2',
            'after:w-16 after:h-px',
            lineage ? `after:bg-lineage-${lineage}` : 'after:bg-sidonia-gold'
          )}
        >
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};
