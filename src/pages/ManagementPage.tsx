import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { useCharacterStore } from '../state/characterStore';
import { useCharacterData } from '../data/DataContext';
import { downloadCharacterJson, downloadCharacterSheet } from '../utils/exporters';
import { DecoButton } from '../components/ui/DecoButton';
import { DecoCard } from '../components/ui/DecoCard';
import { DecoInput } from '../components/ui/DecoInput';

export function ManagementPage() {
  const { data } = useCharacterData();
  const builds = useCharacterStore((state) => state.builds);
  const activeBuildId = useCharacterStore((state) => state.activeBuildId);
  const createBuild = useCharacterStore((state) => state.createBuild);
  const setActiveBuild = useCharacterStore((state) => state.setActiveBuild);
  const archiveBuild = useCharacterStore((state) => state.archiveBuild);
  const renameBuild = useCharacterStore((state) => state.renameBuild);
  const duplicateBuild = useCharacterStore((state) => state.duplicateBuild);

  const [newLabel, setNewLabel] = useState('');

  const buildList = useMemo(() => Object.values(builds).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)), [builds]);

  const handleCreate = () => {
    const id = createBuild(newLabel.trim() || undefined);
    setNewLabel('');
    setActiveBuild(id);
  };

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen px-deco-md py-deco-lg">
      <div className="max-w-7xl mx-auto space-y-deco-lg">
        {/* Header */}
        <header className="text-center space-y-deco-sm mb-deco-xl">
          <h1 className="text-display-lg text-shadow-gold">
            Character Management
          </h1>
          <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-sidonia-gold to-transparent" />
          <p className="text-body text-sidonia-text max-w-2xl mx-auto">
            Spin up new dossiers, duplicate existing ones, and export packages for your virtual tabletop or print.
          </p>
        </header>

        {/* Create New Character */}
        <DecoCard className="mb-deco-lg">
          <div className="flex flex-col sm:flex-row gap-deco-sm items-end">
            <div className="flex-1 w-full">
              <DecoInput
                label="Name your new dossier"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Untitled Operative"
              />
            </div>
            <DecoButton variant="primary" size="lg" onClick={handleCreate} className="w-full sm:w-auto">
              Create Character
            </DecoButton>
          </div>
        </DecoCard>

        {/* Empty State */}
        {buildList.length === 0 && (
          <div className="text-center py-deco-xl">
            <p className="text-sidonia-muted font-body">
              No builds yet. Start by creating a new dossier.
            </p>
          </div>
        )}

        {/* Character Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {buildList.map((build) => {
            const isActive = build.id === activeBuildId;
            return (
              <article
                key={build.id}
                className={clsx(
                  'relative bg-sidonia-dark border-2 rounded-lg p-deco-md space-y-deco-sm',
                  'transition-all duration-300',
                  isActive
                    ? 'border-sidonia-gold shadow-lg shadow-sidonia-gold/20'
                    : 'border-sidonia-gold/60 hover:border-sidonia-gold'
                )}
              >
                {/* Active Badge */}
                {isActive && (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-sidonia-gold/20 border border-sidonia-gold">
                    <span className="text-xs font-accent uppercase tracking-wider text-sidonia-gold">Active</span>
                  </div>
                )}

                {/* Character Label */}
                <header className="space-y-2">
                  <input
                    value={build.label}
                    onChange={(e) => renameBuild(build.id, e.target.value)}
                    aria-label="Character label"
                    className="w-full bg-sidonia-black border border-sidonia-gold/50 text-sidonia-text
                             px-deco-sm py-2 rounded font-display text-lg tracking-wider uppercase
                             focus:outline-none focus:ring-1 focus:border-sidonia-gold focus:ring-sidonia-gold/20
                             transition-all duration-300"
                  />
                  {!isActive && (
                    <DecoButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveBuild(build.id)}
                      className="w-full"
                    >
                      Set Active
                    </DecoButton>
                  )}
                </header>

                {/* Character Details */}
                <dl className="space-y-2 py-deco-sm border-t border-b border-sidonia-gold/60">
                  <div>
                    <dt className="text-label">Name</dt>
                    <dd className="text-sidonia-text font-body">{build.profile.name || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-label">Profession</dt>
                    <dd className="text-sidonia-text font-body">{build.profile.currentProfession || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-label">Updated</dt>
                    <dd className="text-sidonia-text font-body text-sm">
                      {new Date(build.updatedAt).toLocaleString()}
                    </dd>
                  </div>
                </dl>

                {/* Actions */}
                <footer className="flex flex-wrap gap-2">
                  <Link
                    to={`/sheet/${build.id}`}
                    className="px-3 py-1.5 rounded-lg border-2 border-sidonia-gold/60 bg-transparent
                             text-sidonia-text hover:border-sidonia-gold hover:bg-sidonia-gold/5
                             text-xs font-body tracking-wide transition-all duration-300 flex-1 text-center"
                  >
                    View Sheet
                  </Link>
                  <DecoButton
                    variant="ghost"
                    size="sm"
                    onClick={() => duplicateBuild(build.id)}
                    className="text-xs flex-1"
                  >
                    Duplicate
                  </DecoButton>
                  <DecoButton
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadCharacterJson(build, data)}
                    className="text-xs flex-1"
                  >
                    Export JSON
                  </DecoButton>
                  <DecoButton
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadCharacterSheet(build)}
                    className="text-xs flex-1"
                  >
                    Printable
                  </DecoButton>
                  <DecoButton
                    variant="danger"
                    size="sm"
                    onClick={() => confirmDelete(build.id, build.label, archiveBuild)}
                    className="text-xs flex-1"
                  >
                    Delete
                  </DecoButton>
                </footer>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function confirmDelete(id: string, label: string, archive: (id: string) => void) {
  const acknowledged = window.confirm(`Delete ${label}? This action cannot be undone.`);
  if (acknowledged) {
    archive(id);
  }
}
