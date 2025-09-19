import { useMemo } from 'react';
import type { PriorityRank, LineageKey, RawLineagePowerData } from '../../../data/types';
import { LINEAGE_DEFINITIONS, getLineageDefinition } from '../../../data/lineages';
import type { PriorityCategory } from '../../../state/characterStore';
import './lineage-stage.css';
import { LineagePowersPanel } from '../LineagePowersPanel';

interface LineageStageProps {
  priorities: Record<PriorityCategory, PriorityRank | null>;
  selected: LineageKey | null;
  onSelect: (key: LineageKey) => void;
  canReveal: boolean;
  revealMechanics: boolean;
  onToggleReveal: () => void;
  notes: string;
  onUpdateNotes: (text: string) => void;
  powerSet?: RawLineagePowerData;
}

export function LineageStage({
  priorities,
  selected,
  onSelect,
  canReveal,
  revealMechanics,
  onToggleReveal,
  notes,
  onUpdateNotes,
  powerSet
}: LineageStageProps) {
  const lineagePriority = priorities.lineage;
  const activeDefinition = useMemo(() => getLineageDefinition(selected), [selected]);
  const gmViewActive = canReveal && revealMechanics;

  return (
    <div className="stage stage--lineage">
      <header className="stage__header">
        <div>
          <h2>Lineage</h2>
          <p>
            The letter you assign to Lineage defines how far from humanity you step. Explore each lineage's aesthetic,
            pick the one that sings to your table, then reveal mechanics when ready.
          </p>
        </div>
        <div className="stage__actions">
          <button
            type="button"
            onClick={onToggleReveal}
            className={`reveal-toggle ${revealMechanics ? 'active' : ''}`}
            disabled={!canReveal}
          >
            {canReveal
              ? revealMechanics
                ? 'Hide mechanical truths'
                : 'Reveal mechanical truths'
              : 'GM access required'}
          </button>
        </div>
      </header>

      <section className="lineage-grid">
        {LINEAGE_DEFINITIONS.map((definition) => {
          const isActive = definition.key === selected;
          const priorityCallout = lineagePriority ? definition.priorityImpacts[lineagePriority] : null;
          return (
            <article
              key={definition.key}
              className={`lineage-card ${isActive ? 'is-active' : ''}`}
              style={{
                borderColor: isActive ? definition.aesthetic.accent : 'rgba(255,255,255,0.08)',
                boxShadow: isActive ? `0 12px 32px ${definition.aesthetic.accent}40` : undefined,
                backgroundImage: definition.aesthetic.texture
              }}
            >
              <header>
                <h3>{definition.name}</h3>
                <p className="lineage-card__tagline">{definition.tagline}</p>
              </header>
              <p>{definition.summary}</p>
              <div className="lineage-card__priority">
                <span>With Priority {lineagePriority ?? '—'}:</span>
                <p>{priorityCallout ?? 'Assign a priority letter to see what changes.'}</p>
              </div>
              <details>
                <summary>First impressions</summary>
                <p>{definition.narrativeHook}</p>
              </details>
              {revealMechanics && canReveal && (
                <details open>
                  <summary>GM Whisper</summary>
                  <p>{definition.gmWhisper}</p>
                </details>
              )}
              <footer>
                <button type="button" className="lineage-card__choose" onClick={() => onSelect(definition.key)}>
                  {isActive ? 'Selected' : 'Choose Lineage'}
                </button>
              </footer>
            </article>
          );
        })}
      </section>

      <LineagePowersPanel lineage={selected} powerData={powerSet} gmEnabled={gmViewActive} />

      <section className="lineage-notes">
        <label className="field">
          <span>Lineage Notes & Promises</span>
          <textarea
            value={notes}
            onChange={(event) => onUpdateNotes(event.target.value)}
            placeholder="Record patron obligations, corruption tells, and aesthetic cues for later sessions."
          />
        </label>
      </section>

      {activeDefinition && (
        <aside className="lineage-highlight" style={{ borderColor: activeDefinition.aesthetic.accent }}>
          <h4>Echos of {activeDefinition.name}</h4>
          <p>
            Layer the UI palette with {activeDefinition.aesthetic.accent}. Consider swapping ambient sound or card
            frames to mirror the lineage vibe when this character is active at the table.
          </p>
        </aside>
      )}
    </div>
  );
}
