import React from 'react';
import { clsx } from 'clsx';

export interface DecoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const DecoInput: React.FC<DecoInputProps> = ({
  label,
  error,
  className,
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          // Base input styling
          'bg-sidonia-black border text-sidonia-text px-deco-sm py-2',
          'font-body placeholder:text-sidonia-muted',
          'transition-all duration-300',
          'focus:outline-none focus:ring-1',
          // Border states
          error
            ? 'border-corruption-red focus:border-corruption-red focus:ring-corruption-red/20'
            : 'border-sidonia-gold/50 focus:border-sidonia-gold focus:ring-sidonia-gold/20',
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-corruption-red text-sm font-body">{error}</span>
      )}
    </div>
  );
};
