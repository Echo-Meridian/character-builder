import React from 'react';
import { clsx } from 'clsx';

export interface DecoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  lineage?: 'neosapien' | 'sorcerer' | 'chimera' | 'automata' | 'esper';
  corrupted?: boolean;
  children: React.ReactNode;
}

export const DecoButton: React.FC<DecoButtonProps> = ({
  variant = 'primary',
  size = 'md',
  lineage,
  corrupted = false,
  className,
  children,
  ...props
}) => {
  const baseClasses = clsx(
    // Base button styling
    'relative font-accent tracking-wider uppercase',
    'transition-all duration-300',
    'border-2',
    'hover:shadow-lg active:scale-95',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    // Pseudo-element for gradient overlay
    'before:absolute before:inset-0',
    'before:bg-gradient-to-r before:from-transparent before:to-transparent',
    'before:opacity-0 hover:before:opacity-10 before:pointer-events-none',
  );

  const variantClasses = {
    primary: clsx(
      'bg-sidonia-black text-sidonia-gold',
      lineage ? `border-lineage-${lineage}` : 'border-sidonia-gold',
      lineage ? `hover:bg-lineage-${lineage}/10` : 'hover:bg-sidonia-gold/10',
      lineage ? `hover:shadow-lineage-${lineage}/20` : 'hover:shadow-sidonia-gold/20',
    ),
    secondary: clsx(
      'bg-sidonia-dark border-sidonia-brass text-sidonia-brass',
      'hover:bg-sidonia-brass/10',
    ),
    danger: clsx(
      'bg-sidonia-black border-corruption-red text-corruption-red',
      'hover:bg-corruption-red/10',
    ),
    ghost: clsx(
      'bg-transparent border-transparent text-sidonia-text',
      'hover:border-sidonia-gold/50',
    ),
  };

  const sizeClasses = {
    sm: 'px-deco-sm py-1 text-sm',
    md: 'px-deco-md py-2 text-base',
    lg: 'px-deco-lg py-3 text-lg',
  };

  const corruptedClasses = corrupted ? 'animate-corruption-glow' : '';

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        corruptedClasses,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
