import './LoadingSpinner.css';

export function LoadingSpinner() {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <div className="loading-spinner__glow" />
      <span className="loading-spinner__label">Loading the Veil…</span>
    </div>
  );
}
