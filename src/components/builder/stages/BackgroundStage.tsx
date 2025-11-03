import { useMemo, useState, useEffect } from 'react';
import type { BackgroundEntry, BackgroundsData, BackgroundProfession, PriorityRank } from '../../../data/types';
import type { CharacterBuild } from '../../../state/characterStore';
import './background-stage.css';

interface BackgroundStageProps {
  priority: PriorityRank | null;
  background: CharacterBuild['background'];
  skills: CharacterBuild['skills'];
  onUpdate: (changes: Partial<CharacterBuild['background']>) => void;
  onUpdateSpecializations: (specializations: string[]) => void;
  onUpdateCustomSpecializations: (customSpecs: string[]) => void;
  data: BackgroundsData;
}

interface CustomSpecRow {
  id: string;
  value: string;
  checked: boolean;
}

// Background Points per priority rank
const BACKGROUND_POINTS: Record<PriorityRank, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1
};

// Specialization slots per priority rank
const SPECIALIZATION_SLOTS: Record<PriorityRank, number> = {
  A: 3,
  B: 2,
  C: 2,
  D: 1,
  E: 1
};

export function BackgroundStage({
  priority,
  background,
  skills,
  onUpdate,
  onUpdateSpecializations,
  onUpdateCustomSpecializations,
  data
}: BackgroundStageProps) {
  // Ensure skills have default values for new fields (backward compatibility)
  const backgroundSpecializations = skills.backgroundSpecializations || [];
  const backgroundCustomSpecializations = skills.backgroundCustomSpecializations || [];

  // Local state for custom specialization rows
  const [customRows, setCustomRows] = useState<CustomSpecRow[]>([]);

  // Track which cards are expanded
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Initialize custom rows from stored data
  useEffect(() => {
    if (backgroundCustomSpecializations.length === 0) {
      // Start with one empty row
      setCustomRows([{ id: crypto.randomUUID(), value: '', checked: false }]);
    } else {
      // Convert stored specializations to rows (all checked)
      const rows = backgroundCustomSpecializations.map(value => ({
        id: crypto.randomUUID(),
        value,
        checked: true
      }));
      // Add one empty row at the end
      rows.push({ id: crypto.randomUUID(), value: '', checked: false });
      setCustomRows(rows);
    }
  }, [backgroundCustomSpecializations.length]); // Only re-init when length changes

  const entries = useMemo(() => Object.entries(data), [data]);
  const selectedEntry: BackgroundEntry | undefined = background.title && data[background.title] ? data[background.title] : undefined;
  const professionByPriority = useMemo(() => {
    if (!selectedEntry?.professions) return new Map<PriorityRank, BackgroundProfession>();
    return new Map(selectedEntry.professions.map((profession) => [profession.priority, profession]));
  }, [selectedEntry?.professions]);

  const highlightedProfession = priority ? professionByPriority.get(priority) : undefined;
  const backgroundPoints = priority ? BACKGROUND_POINTS[priority] : 0;
  const specializationSlots = priority ? SPECIALIZATION_SLOTS[priority] : 0;

  const calloutTitle = background.title || 'Choose a background';
  const calloutDescription = highlightedProfession?.description || selectedEntry?.description || 'Select a background below to load its story, talents, and contacts.';

  const skillTags = selectedEntry?.skillSpecializationOptions ?? [];
  const resourceTags = selectedEntry?.resourceSynergyExamples ?? [];

  const handleAdoptBackground = (name: string) => {
    const entry = data[name];
    const updates: Partial<CharacterBuild['background']> = { title: name };
    if (entry) {
      if (!background.tierNotes && entry.description) {
        updates.tierNotes = entry.description;
      }
      if (!background.contacts && entry.resourceSynergyExamples?.length) {
        updates.contacts = entry.resourceSynergyExamples.join('\n');
      }
    }
    onUpdate(updates);
  };

  const handleToggleSpecialization = (spec: string) => {
    const isSelected = backgroundSpecializations.includes(spec);
    // Count custom specs toward the total
    const customSpecCount = customRows.filter(r => r.checked && r.value.trim()).length;
    const totalSelected = backgroundSpecializations.length + customSpecCount;

    if (isSelected) {
      // Remove it
      onUpdateSpecializations(backgroundSpecializations.filter(s => s !== spec));
    } else {
      // Add it if we haven't reached the limit
      if (totalSelected < specializationSlots) {
        onUpdateSpecializations([...backgroundSpecializations, spec]);
      }
    }
  };

  const toggleCardExpanded = (backgroundName: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(backgroundName)) {
        newSet.delete(backgroundName);
      } else {
        newSet.add(backgroundName);
      }
      return newSet;
    });
  };

  const handleCustomRowChange = (id: string, value: string) => {
    const newRows = customRows.map(row =>
      row.id === id ? { ...row, value } : row
    );
    setCustomRows(newRows);

    // Save checked rows to store
    saveCustomRows(newRows);
  };

  const handleCustomRowToggle = (id: string) => {
    const newRows = customRows.map(row =>
      row.id === id ? { ...row, checked: !row.checked } : row
    );
    setCustomRows(newRows);

    // If this row was just checked and has a value, add a new empty row
    const toggledRow = newRows.find(r => r.id === id);
    if (toggledRow && toggledRow.checked && toggledRow.value.trim()) {
      const hasEmptyRow = newRows.some(r => !r.checked && !r.value.trim());
      if (!hasEmptyRow) {
        newRows.push({ id: crypto.randomUUID(), value: '', checked: false });
        setCustomRows(newRows);
      }
    }

    // Save checked rows to store
    saveCustomRows(newRows);
  };

  const saveCustomRows = (rows: CustomSpecRow[]) => {
    const checkedSpecs = rows
      .filter(row => row.checked && row.value.trim())
      .map(row => row.value.trim());
    onUpdateCustomSpecializations(checkedSpecs);
  };

  // Calculate total selected specializations for limit checking (includes checked custom rows with values)
  const totalSelected = backgroundSpecializations.length + customRows.filter(r => r.checked && r.value.trim()).length;

  return (
    <div className="stage stage--background">
      <header className="stage__header">
        <div>
          <h2>Background</h2>
          <p>
            Backgrounds tell the table who you were before the Long Night took hold. Use the narrative scope guidance to
            outline your reach and obligations.
          </p>
        </div>
        <aside className="background-callout">
          <div className="background-callout__header">
            <span className="background-callout__label">
              Priority {priority ?? '—'} {priority && `• ${backgroundPoints} Background Points`}
            </span>
            <h3>{calloutTitle}</h3>
            {highlightedProfession && (
              <h4 className="background-callout__profession-title">{highlightedProfession.title}</h4>
            )}
          </div>
          <p className="background-callout__body">{calloutDescription}</p>
          {(skillTags.length > 0 || resourceTags.length > 0) && (
            <div className="background-callout__tags">
              {skillTags.length > 0 && (
                <div>
                  <span className="background-callout__tag-label">
                    Signature Skills ({specializationSlots} {specializationSlots === 1 ? 'slot' : 'slots'})
                  </span>
                  <ul>
                    {skillTags.map((entry) => (
                      <li key={entry}>{entry}</li>
                    ))}
                  </ul>
                </div>
              )}
              {resourceTags.length > 0 && (
                <div>
                  <span className="background-callout__tag-label">Example Resource Synergies (0.5x cost)</span>
                  <ul>
                    {resourceTags.map((entry) => (
                      <li key={entry}>{entry}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </aside>
      </header>

      {selectedEntry && skillTags.length > 0 && (
        <section className="background-specializations">
          <h3>Select Background Specializations</h3>
          <p className="background-specializations__description">
            Choose up to {specializationSlots} specialization{specializationSlots !== 1 ? 's' : ''} from your background's signature skills.
            These do NOT count against your skill specialization limit.
          </p>
          <div className="background-specializations__options">
            {skillTags.map((spec) => {
              const isSelected = backgroundSpecializations.includes(spec);
              const isDisabled = !isSelected && backgroundSpecializations.length >= specializationSlots;
              return (
                <label
                  key={spec}
                  className={`background-specialization-option ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => handleToggleSpecialization(spec)}
                  />
                  <span>{spec}</span>
                </label>
              );
            })}
          </div>
          <div className="background-specializations__custom">
            <h4>Custom Specializations (Optional, require GM approval)</h4>
            <p>Create your own specialization if the suggestions don't fit your character.</p>
            {customRows.map(row => {
              const canCheck = !row.checked && totalSelected >= specializationSlots;
              return (
                <label
                  key={row.id}
                  className={`background-specialization-option ${row.checked ? 'selected' : ''} ${canCheck ? 'disabled' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={row.checked}
                    disabled={canCheck}
                    onChange={() => handleCustomRowToggle(row.id)}
                  />
                  <input
                    type="text"
                    className="custom-spec-input"
                    value={row.value}
                    placeholder="Ex: Engineering: Runesmithing, Social: Underworld Contacts, etc."
                    onChange={(e) => handleCustomRowChange(row.id, e.target.value)}
                  />
                </label>
              );
            })}
          </div>
        </section>
      )}

      <section className="background-catalog">
        {entries.map(([name, entry]) => {
          const isActive = name === background.title;
          // Get the profession for the current priority (or show all if no priority selected)
          const relevantProfession = priority && entry.professions
            ? entry.professions.find(p => p.priority === priority)
            : undefined;

          const isExpanded = expandedCards.has(name);

          return (
            <article key={name} className={`background-card ${isActive ? 'active' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`}>
              <header className="background-card__header">
                <div>
                  <h3>{name}</h3>
                  <p>{entry.description}</p>
                </div>
                <div className="background-card__actions">
                  <button type="button" onClick={() => handleAdoptBackground(name)}>
                    {isActive ? 'Selected' : 'Adopt Background'}
                  </button>
                  <button
                    type="button"
                    className="background-card__toggle"
                    onClick={() => toggleCardExpanded(name)}
                    aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                  >
                    {isExpanded ? '▲ Hide Details' : '▼ View Details'}
                  </button>
                </div>
              </header>

              {isExpanded && (
                <>
                  {priority && relevantProfession && (
                    <section className="background-card__section">
                      <h4>Your Profession Tier (Priority {priority})</h4>
                      <div className="background-card__professions">
                        <div className="background-card__profession highlight">
                          <div className="background-card__profession-header">
                            <span className="badge">{relevantProfession.priority}</span>
                            <strong>{relevantProfession.title}</strong>
                          </div>
                          <p>{relevantProfession.description}</p>
                        </div>
                      </div>
                    </section>
                  )}

                  {!priority && (entry.professions?.length ?? 0) > 0 && (
                    <section className="background-card__section">
                      <h4>Profession Ladder</h4>
                      <p className="background-card__hint">Assign a priority to Background to see your profession tier</p>
                    </section>
                  )}

                  {(entry.skillSpecializationOptions?.length ?? 0) > 0 && (
                    <section className="background-card__section">
                      <h4>Skill Specializations ({specializationSlots} {specializationSlots === 1 ? 'slot' : 'slots'})</h4>
                      <ul>
                        {entry.skillSpecializationOptions!.map((skill) => (
                          <li key={skill}>{skill}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {(entry.resourceSynergyExamples?.length ?? 0) > 0 && (
                    <section className="background-card__section">
                      <h4>Example Resource Synergies (0.5x cost)</h4>
                      <ul>
                        {entry.resourceSynergyExamples!.map((resource) => (
                          <li key={resource}>{resource}</li>
                        ))}
                      </ul>
                    </section>
                  )}
                </>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
