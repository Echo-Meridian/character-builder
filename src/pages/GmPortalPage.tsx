import { useMemo, useState } from 'react';
import { useCharacterData } from '../data/DataContext';
import { analytics } from '../utils/analytics';
import { useSessionStore } from '../state/sessionStore';
import { DecoButton } from '../components/ui/DecoButton';
import { DecoCard } from '../components/ui/DecoCard';
import { DecoInput } from '../components/ui/DecoInput';

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
    <div className="min-h-screen px-deco-md py-deco-lg">
      <div className="max-w-7xl mx-auto space-y-deco-lg">
        {/* Header */}
        <header className="text-center space-y-deco-sm">
          <h1 className="text-display-lg text-corruption-red text-shadow-gold">
            GM Veil
          </h1>
          <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-corruption-red to-transparent" />
          <p className="text-body text-sidonia-text/80 max-w-2xl mx-auto">
            Hidden truths live here. Only game masters with the veil phrase may cross. Player tables should never see the material below.
          </p>
        </header>

        {/* Locked State - Veil Phrase Entry */}
        {!gmUnlocked && (
          <DecoCard className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-deco-sm">
              <DecoInput
                label="Veil Phrase"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter the GM veil phrase"
                autoComplete="off"
                error={error || undefined}
              />
              <DecoButton
                variant="danger"
                size="lg"
                type="submit"
                className="w-full animate-corruption-glow"
              >
                Slip Behind the Veil
              </DecoButton>
            </form>
          </DecoCard>
        )}

        {/* Unlocked State - GM Content */}
        {gmUnlocked && (
          <div className="space-y-deco-lg">
            {/* Status Banner */}
            <DecoCard className="bg-corruption-dark/20 border-corruption-red/40">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-deco-sm">
                <div>
                  <h2 className="font-display text-2xl tracking-wider uppercase text-corruption-red">
                    Veil Raised
                  </h2>
                  <p className="text-sidonia-text/70 font-body text-sm mt-1">
                    Unlocked {gmUnlockedAt ? new Date(gmUnlockedAt).toLocaleString() : 'just now'}.
                  </p>
                </div>
                <DecoButton variant="secondary" onClick={lockGm}>
                  Re-engage Safety
                </DecoButton>
              </div>
            </DecoCard>

            {/* Power Schemas Section */}
            <section className="space-y-deco-sm">
              <h2 className="font-display text-3xl tracking-wider uppercase text-sidonia-gold">
                Power Schemas
              </h2>
              <p className="text-sidonia-text/70 font-body">
                Raw schema data for powers, lineages, and their restrictions. Export directly for system reference.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-deco-sm">
                {schemaEntries.map(([key, schema]) => (
                  <DecoCard key={key} className="space-y-deco-sm">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-display text-lg tracking-wide uppercase text-sidonia-brass">
                        {toTitleCase(key)}
                      </h3>
                      <DecoButton
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadJson(`${key}-schema.json`, schema)}
                        className="text-xs flex-shrink-0"
                      >
                        Download
                      </DecoButton>
                    </div>
                    <pre className="max-h-[200px] overflow-auto p-deco-sm rounded bg-sidonia-black/60
                                   text-sidonia-text/80 font-mono text-xs border border-sidonia-gold/20">
                      {JSON.stringify(schema, null, 2).slice(0, 400)}…
                    </pre>
                  </DecoCard>
                ))}
              </div>
            </section>

            {/* Design Documents Section */}
            <section className="space-y-deco-sm">
              <h2 className="font-display text-3xl tracking-wider uppercase text-sidonia-gold">
                Design Documents
              </h2>
              <p className="text-sidonia-text/70 font-body">
                Reference briefs written for GM eyes. Share selectively with players as the narrative reveals itself.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-deco-sm">
                {designDocs.map((doc) => (
                  <DecoCard key={doc.id} className="space-y-deco-sm">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-display text-lg tracking-wide uppercase text-sidonia-brass">
                        {doc.title}
                      </h3>
                      <DecoButton
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadText(`${doc.id}.md`, doc.content)}
                        className="text-xs flex-shrink-0"
                      >
                        Download
                      </DecoButton>
                    </div>
                    <pre className="max-h-[200px] overflow-auto p-deco-sm rounded bg-sidonia-black/60
                                   text-sidonia-text/80 font-mono text-xs border border-sidonia-gold/20 whitespace-pre-wrap">
                      {doc.content.slice(0, 400)}…
                    </pre>
                  </DecoCard>
                ))}
              </div>
            </section>

            {/* Analytics Buffer Section */}
            <section className="space-y-deco-sm">
              <h2 className="font-display text-3xl tracking-wider uppercase text-sidonia-gold">
                Analytics Buffer
              </h2>
              <p className="text-sidonia-text/70 font-body">
                Inspect anonymized analytics currently stored locally. Export before sharing with designers.
              </p>
              <DecoCard>
                <AnalyticsLog />
              </DecoCard>
            </section>
          </div>
        )}
      </div>
    </div>
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
    return (
      <p className="text-sidonia-muted font-body text-center py-deco-md">
        Analytics collection is currently disabled or declined.
      </p>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="text-sidonia-muted font-body text-center py-deco-md">
        No analytics entries recorded yet.
      </p>
    );
  }

  return (
    <div className="space-y-deco-sm">
      <DecoButton
        variant="secondary"
        size="md"
        onClick={() => downloadJson('sidonia-analytics.json', entries)}
      >
        Export Analytics Buffer
      </DecoButton>
      <ul className="list-none p-0 m-0 space-y-2 max-h-[220px] overflow-auto">
        {entries.map((entry) => (
          <li
            key={`${entry.event}-${entry.timestamp}`}
            className="grid grid-cols-[auto_auto_1fr] gap-2 bg-sidonia-black/40 p-deco-sm rounded
                     border border-sidonia-gold/20 items-center"
          >
            <strong className="text-sidonia-gold font-accent text-xs uppercase tracking-wide">
              {entry.event}
            </strong>
            <span className="text-sidonia-muted font-mono text-xs">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
            {entry.data && (
              <code className="text-sidonia-text/60 font-mono text-xs overflow-hidden text-ellipsis">
                {JSON.stringify(entry.data)}
              </code>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
