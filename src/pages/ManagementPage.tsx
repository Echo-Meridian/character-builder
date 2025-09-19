import { useMemo, useState } from 'react';
import { useCharacterStore } from '../state/characterStore';
import { useCharacterData } from '../data/DataContext';
import { downloadCharacterJson, downloadCharacterSheet } from '../utils/exporters';
import './management-page.css';

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
    <section className="management">
      <header>
        <h1>Character Management</h1>
        <p>Spin up new dossiers, duplicate existing ones, and export packages for your virtual tabletop or print.</p>
      </header>
      <div className="management__actions">
        <label>
          <span>Name your new dossier</span>
          <input value={newLabel} onChange={(event) => setNewLabel(event.target.value)} placeholder="Untitled Operative" />
        </label>
        <button type="button" onClick={handleCreate}>
          Create Character
        </button>
      </div>

      {buildList.length === 0 && <p>No builds yet. Start by creating a new dossier.</p>}

      <div className="management__grid">
        {buildList.map((build) => {
          const isActive = build.id === activeBuildId;
          return (
            <article key={build.id} className={`management-card ${isActive ? 'active' : ''}`}>
              <header>
                <input
                  value={build.label}
                  onChange={(event) => renameBuild(build.id, event.target.value)}
                  aria-label="Character label"
                />
                {isActive ? <span className="badge">Active</span> : <button onClick={() => setActiveBuild(build.id)}>Set Active</button>}
              </header>
              <dl>
                <div>
                  <dt>Name</dt>
                  <dd>{build.profile.name || '—'}</dd>
                </div>
                <div>
                  <dt>Concept</dt>
                  <dd>{build.profile.concept || '—'}</dd>
                </div>
                <div>
                  <dt>Updated</dt>
                  <dd>{new Date(build.updatedAt).toLocaleString()}</dd>
                </div>
              </dl>
              <footer>
                <button type="button" onClick={() => duplicateBuild(build.id)}>Duplicate</button>
                <button type="button" onClick={() => downloadCharacterJson(build, data)}>Export JSON</button>
                <button type="button" onClick={() => downloadCharacterSheet(build)}>Printable Sheet</button>
                <button type="button" className="danger" onClick={() => confirmDelete(build.id, build.label, archiveBuild)}>
                  Delete
                </button>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function confirmDelete(id: string, label: string, archive: (id: string) => void) {
  const acknowledged = window.confirm(`Delete ${label}? This action cannot be undone.`);
  if (acknowledged) {
    archive(id);
  }
}
