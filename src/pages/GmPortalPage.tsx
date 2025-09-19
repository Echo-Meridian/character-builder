import { useMemo, useState } from 'react';
import { useCharacterData } from '../data/DataContext';
import { analytics } from '../utils/analytics';
import { useSessionStore } from '../state/sessionStore';
import './gm-portal.css';

export function GmPortalPage() {
  const { data } = useCharacterData();
  const gmUnlocked = useSessionStore((state) => state.gmUnlocked);
  const authenticateGm = useSessionStore((state) => state.authenticateGm);
  const lockGm = useSessionStore((state) => state.lockGm);
  const gmUnlockedAt = useSessionStore((state) => state.gmUnlockedAt);

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const designDocs = data?.designDocs ?? [];
  const powerSchemas = data?.powerSchemas ?? {};

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (authenticateGm(code)) {
      setError(null);
      setCode('');
    } else {
      setError('Access denied. Double-check the veil phrase.');
      analytics.track('gm.invalid_passphrase', {});
    }
  };

  const schemaEntries = useMemo(() => Object.entries(powerSchemas), [powerSchemas]);

  return (
    <section className="gm-portal">
      <header>
        <h1>GM Veil</h1>
        <p>
          Hidden truths live here. Only game masters with the veil phrase may cross. Player tables should never see the
          material below.
        </p>
      </header>

      {!gmUnlocked && (
        <form className="gm-form" onSubmit={handleSubmit}>
          <label>
            <span>Veil Phrase</span>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Enter the GM veil phrase"
              autoComplete="off"
            />
          </label>
          <button type="submit">Slip Behind the Veil</button>
          {error && <p className="gm-error">{error}</p>}
        </form>
      )}

      {gmUnlocked && (
        <div className="gm-content">
          <section className="gm-status">
            <div>
              <h2>Veil Raised</h2>
              <p>Unlocked {gmUnlockedAt ? new Date(gmUnlockedAt).toLocaleString() : 'just now'}.</p>
            </div>
            <button type="button" onClick={lockGm}>
              Re-engage Safety
            </button>
          </section>

          <section>
            <h2>Power Schemas</h2>
            <p>Raw schema data for powers, lineages, and their restrictions. Export directly for system reference.</p>
            <div className="schema-grid">
              {schemaEntries.map(([key, schema]) => (
                <article key={key}>
                  <header>
                    <h3>{toTitleCase(key)}</h3>
                    <button type="button" onClick={() => downloadJson(`${key}-schema.json`, schema)}>
                      Download JSON
                    </button>
                  </header>
                  <pre>{JSON.stringify(schema, null, 2).slice(0, 400)}…</pre>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2>Design Documents</h2>
            <p>Reference briefs written for GM eyes. Share selectively with players as the narrative reveals itself.</p>
            <div className="doc-grid">
              {designDocs.map((doc) => (
                <article key={doc.id}>
                  <header>
                    <h3>{doc.title}</h3>
                    <button type="button" onClick={() => downloadText(`${doc.id}.md`, doc.content)}>
                      Download Markdown
                    </button>
                  </header>
                  <pre>{doc.content.slice(0, 400)}…</pre>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2>Analytics Buffer</h2>
            <p>Inspect anonymized analytics currently stored locally. Export before sharing with designers.</p>
            <AnalyticsLog />
          </section>
        </div>
      )}
    </section>
  );
}

function toTitleCase(value: string) {
  return value
    .split(/[-_]/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  triggerDownload(filename, blob);
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  triggerDownload(filename, blob);
}

function triggerDownload(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function AnalyticsLog() {
  const consent = useSessionStore((state) => state.analyticsConsent);
  const entries = analytics.getAll();

  if (consent !== 'accepted') {
    return <p>Analytics collection is currently disabled or declined.</p>;
  }

  if (entries.length === 0) {
    return <p>No analytics entries recorded yet.</p>;
  }

  return (
    <div className="analytics-log">
      <button type="button" onClick={() => downloadJson('sidonia-analytics.json', entries)}>
        Export Analytics Buffer
      </button>
      <ul>
        {entries.map((entry) => (
          <li key={`${entry.event}-${entry.timestamp}`}>
            <strong>{entry.event}</strong>
            <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
            {entry.data && <code>{JSON.stringify(entry.data)}</code>}
          </li>
        ))}
      </ul>
    </div>
  );
}
