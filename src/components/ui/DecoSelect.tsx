import React from 'react';
import { clsx } from 'clsx';

export interface DecoSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const DecoSelect: React.FC<DecoSelectProps> = ({
  label,
  error,
  options,
  className,
  id,
  ...props
}) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={clsx(
          // Base select styling
          'bg-sidonia-black border text-sidonia-text px-deco-sm py-2',
          'font-body appearance-none',
          'transition-all duration-300',
          'focus:outline-none focus:ring-1',
          'pr-10', // Space for dropdown arrow
          // Dropdown arrow background
          'bg-[url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23d4af37\'%3e%3cpath d=\'M7 10l5 5 5-5z\'/%3e%3c/svg%3e")]',
          'bg-[length:24px] bg-[position:right_0.5rem_center] bg-no-repeat',
          // Border states
          error
            ? 'border-corruption-red focus:border-corruption-red focus:ring-corruption-red/20'
            : 'border-sidonia-gold/50 focus:border-sidonia-gold focus:ring-sidonia-gold/20',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-corruption-red text-sm font-body">{error}</span>
      )}
    </div>
  );
};
