import { useSessionStore } from '../../state/sessionStore';
import './analytics-banner.css';

export function AnalyticsBanner() {
  const consent = useSessionStore((state) => state.analyticsConsent);
  const notified = useSessionStore((state) => state.analyticsNotified);
  const setConsent = useSessionStore((state) => state.setAnalyticsConsent);
  const markNotified = useSessionStore((state) => state.markAnalyticsNotified);

  if (consent !== 'unknown' || notified) {
    return null;
  }

  return (
    <aside className="analytics-banner" role="dialog" aria-live="polite">
      <div>
        <h3>Help Improve Sidonia</h3>
        <p>
          We collect anonymous usage patterns (no personal data) to refine the priority flow and uncover confusing
          choices. You can opt out and still use the builder—no pressure.
        </p>
      </div>
      <div className="analytics-banner__actions">
        <button type="button" onClick={() => setConsent(true)}>
          Share Anonymous Data
        </button>
        <button type="button" className="secondary" onClick={() => setConsent(false)}>
          No Thanks
        </button>
        <button type="button" className="dismiss" onClick={markNotified}>
          Remind Me Later
        </button>
      </div>
    </aside>
  );
}
