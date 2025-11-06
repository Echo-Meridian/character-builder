import { useParams, Navigate, Link } from 'react-router-dom';
import { useCharacterStore, BODY_LOCATIONS, type BodyLocationKey } from '../state/characterStore';
import { useCharacterData } from '../data/DataContext';
import { getLineageDefinition } from '../data/lineages';
import '../styles/character-sheet.css';

export function CharacterSheetPage() {
  const { buildId } = useParams<{ buildId: string }>();
  const { data } = useCharacterData();
  const builds = useCharacterStore((state) => state.builds);

  const build = buildId ? builds[buildId] : null;

  if (!buildId || !build) {
    return <Navigate to="/management" replace />;
  }

  const lineageDefinition = getLineageDefinition(build.lineage.key);
  const backgroundTemplate = build.background.title ? data?.backgrounds[build.background.title] : undefined;

  // Calculate totals for display
  const totalAttributePoints = Object.values(build.attributes.scores).reduce((sum, val) => sum + val, 0);
  const totalSkillRatings = Object.values(build.skills.ratings).reduce((sum, val) => sum + val, 0);

  return (
    <div className="character-sheet">
      <div className="sheet-header">
        <Link to="/management" className="sheet-back-link">← Back to Management</Link>
        <h1 className="sheet-title">{build.profile.name || build.label}</h1>
        {build.profile.concept && <p className="sheet-concept">{build.profile.concept}</p>}
      </div>

      <div className="sheet-container">
        {/* Identity Section */}
        <section className="sheet-section sheet-identity">
          <h2>Identity</h2>
          <div className="sheet-identity-grid">
            {build.profile.portraitUrl && (
              <div className="sheet-portrait">
                <img src={build.profile.portraitUrl} alt={`${build.profile.name} portrait`} />
              </div>
            )}
            <div className="sheet-identity-fields">
              <div className="sheet-field">
                <span className="sheet-label">Alias</span>
                <span className="sheet-value">{build.profile.alias || '—'}</span>
              </div>
              <div className="sheet-field">
                <span className="sheet-label">Lineage</span>
                <span className="sheet-value">{lineageDefinition?.name || build.lineage.key || '—'}</span>
              </div>
              <div className="sheet-field">
                <span className="sheet-label">Background</span>
                <span className="sheet-value">{build.background.title || '—'}</span>
              </div>
              <div className="sheet-field">
                <span className="sheet-label">Current Profession</span>
                <span className="sheet-value">{build.profile.currentProfession || '—'}</span>
              </div>
              <div className="sheet-field">
                <span className="sheet-label">Ward of Residence</span>
                <span className="sheet-value">{build.profile.wardOfResidence || '—'}</span>
              </div>
            </div>
          </div>
          {build.profile.backstory && (
            <div className="sheet-field-block">
              <span className="sheet-label">Backstory</span>
              <p className="sheet-text">{build.profile.backstory}</p>
            </div>
          )}
          {build.profile.physicalDescription && (
            <div className="sheet-field-block">
              <span className="sheet-label">Physical Description</span>
              <p className="sheet-text">{build.profile.physicalDescription}</p>
            </div>
          )}
        </section>

        {/* Attributes Section */}
        <section className="sheet-section sheet-attributes">
          <h2>Attributes ({totalAttributePoints} points)</h2>
          <div className="sheet-attributes-grid">
            {Object.entries(build.attributes.scores).map(([key, value]) => {
              const specializations = build.attributes.specializations[key as 'physique' | 'intellect' | 'presence'] || [];
              return (
                <div key={key} className="sheet-attribute">
                  <div className="sheet-attribute-header">
                    <span className="sheet-attribute-name">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    <span className="sheet-attribute-value">{value}</span>
                  </div>
                  {specializations.length > 0 && (
                    <div className="sheet-attribute-specs">
                      {specializations.map(spec => (
                        <span key={spec} className="sheet-spec-tag">{spec}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Skills Section */}
        <section className="sheet-section sheet-skills">
          <h2>Skills ({totalSkillRatings} ratings)</h2>
          <div className="sheet-skills-list">
            {Object.entries(build.skills.ratings)
              .filter(([, rating]) => rating > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([skillId, rating]) => {
                const [discipline, skill] = skillId.split(':');
                const displayName = skill.split('-').map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');

                // Find specializations for this skill
                const skillSpecs = build.skills.specializations.filter(spec =>
                  spec.skillId === skillId
                );

                return (
                  <div key={skillId} className="sheet-skill">
                    <div className="sheet-skill-header">
                      <span className="sheet-skill-name">{displayName}</span>
                      <span className="sheet-skill-rating">{'●'.repeat(rating)}{'○'.repeat(5 - rating)}</span>
                    </div>
                    {skillSpecs.length > 0 && (
                      <div className="sheet-skill-specs">
                        {skillSpecs.map(spec => (
                          <span key={spec.id} className="sheet-spec-tag">
                            {spec.label}
                            {spec.type === 'custom' && !spec.gmApproved && ' [Pending GM Approval]'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {build.skills.backgroundSpecializations.length > 0 && (
            <div className="sheet-field-block">
              <span className="sheet-label">Background Specializations</span>
              <div className="sheet-spec-list">
                {build.skills.backgroundSpecializations.map(spec => (
                  <span key={spec} className="sheet-spec-tag">{spec}</span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Lineage Powers Section */}
        {build.lineage.powers.length > 0 && (
          <section className="sheet-section sheet-powers">
            <h2>Lineage Powers</h2>
            <div className="sheet-powers-list">
              {build.lineage.powers.map((power, idx) => (
                <div key={power.id || idx} className="sheet-power">
                  <span className="sheet-power-name">{power.label}</span>
                  {power.meta && (
                    <div className="sheet-power-meta">
                      {power.meta.tierLabel && <span className="sheet-power-tier">{power.meta.tierLabel}</span>}
                      {power.meta.sphere && <span className="sheet-power-detail">{power.meta.sphere}</span>}
                      {power.meta.moveType && <span className="sheet-power-detail">{power.meta.moveType}</span>}
                      {power.meta.category && <span className="sheet-power-detail">{power.meta.category}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Resources Section */}
        <section className="sheet-section sheet-resources">
          <h2>Resources</h2>

          {build.resources.contacts.length > 0 && (
            <div className="sheet-resource-group">
              <h3>Contacts</h3>
              {build.resources.contacts.map((contact, idx) => (
                <div key={idx} className="sheet-resource-item">
                  <div className="sheet-resource-header">
                    <span className="sheet-resource-name">{contact.name || 'Unnamed Contact'}</span>
                    {contact.specialization && <span className="sheet-resource-spec">({contact.specialization})</span>}
                  </div>
                  <div className="sheet-resource-stats">
                    Reach {contact.reach} • Influence {contact.influence}
                    {!contact.gmApproved && <span className="sheet-pending"> [GM Approval Required]</span>}
                  </div>
                  {contact.description && <p className="sheet-resource-desc">{contact.description}</p>}
                </div>
              ))}
            </div>
          )}

          {build.resources.retainers.length > 0 && (
            <div className="sheet-resource-group">
              <h3>Retainers</h3>
              {build.resources.retainers.map((retainer, idx) => (
                <div key={idx} className="sheet-resource-item">
                  <div className="sheet-resource-header">
                    <span className="sheet-resource-name">{retainer.name || 'Unnamed Retainer'}</span>
                    {retainer.specialization && <span className="sheet-resource-spec">({retainer.specialization})</span>}
                  </div>
                  <div className="sheet-resource-stats">
                    Competence {retainer.competence} • Loyalty {retainer.loyalty}
                    {!retainer.gmApproved && <span className="sheet-pending"> [GM Approval Required]</span>}
                  </div>
                  {retainer.description && <p className="sheet-resource-desc">{retainer.description}</p>}
                </div>
              ))}
            </div>
          )}

          {build.resources.properties.length > 0 && (
            <div className="sheet-resource-group">
              <h3>Properties</h3>
              {build.resources.properties.map((property, idx) => (
                <div key={idx} className="sheet-resource-item">
                  <div className="sheet-resource-header">
                    <span className="sheet-resource-name">{property.name || 'Unnamed Property'}</span>
                    {property.specialization && <span className="sheet-resource-spec">({property.specialization})</span>}
                  </div>
                  <div className="sheet-resource-stats">
                    {property.tenure} • {property.zoning}
                    {property.ward && ` • Ward ${property.ward}`}
                    {!property.gmApproved && <span className="sheet-pending"> [GM Approval Required]</span>}
                  </div>
                  {property.description && <p className="sheet-resource-desc">{property.description}</p>}
                </div>
              ))}
            </div>
          )}

          {build.resources.goods.length > 0 && (
            <div className="sheet-resource-group">
              <h3>Goods & Stockpiles</h3>
              {build.resources.goods.map((goods, idx) => (
                <div key={idx} className="sheet-resource-item">
                  <div className="sheet-resource-header">
                    <span className="sheet-resource-name">{goods.name || 'Unnamed Cache'}</span>
                    {goods.specialization && <span className="sheet-resource-spec">({goods.specialization})</span>}
                  </div>
                  <div className="sheet-resource-stats">
                    Quality {goods.quality}
                    {!goods.gmApproved && <span className="sheet-pending"> [GM Approval Required]</span>}
                  </div>
                  {goods.description && <p className="sheet-resource-desc">{goods.description}</p>}
                </div>
              ))}
            </div>
          )}

          <div className="sheet-field">
            <span className="sheet-label">Liquid Assets</span>
            <span className="sheet-value">{build.resources.liquid}</span>
          </div>
        </section>

        {/* Health Section */}
        <section className="sheet-section sheet-health">
          <h2>Health by Location</h2>
          <div className="sheet-health-grid">
            {(Object.keys(BODY_LOCATIONS) as BodyLocationKey[]).map(location => {
              const entry = build.health[location];
              return (
                <div key={location} className="sheet-health-location">
                  <div className="sheet-health-header">
                    <span className="sheet-health-name">{BODY_LOCATIONS[location]}</span>
                    <span className="sheet-health-value">{entry.current} / {entry.max}</span>
                  </div>
                  {entry.scar && (
                    <p className="sheet-health-scar">{entry.scar}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Corruption & Advancement Section */}
        <section className="sheet-section sheet-corruption">
          <h2>Corruption & Advancement</h2>
          <div className="sheet-stat-row">
            <div className="sheet-stat">
              <span className="sheet-label">Corruption</span>
              <span className="sheet-value">{build.corruption.current} / {build.corruption.warning}</span>
            </div>
            <div className="sheet-stat">
              <span className="sheet-label">Experience</span>
              <span className="sheet-value">{build.advancement.experience}</span>
            </div>
          </div>
          {build.corruption.notes && (
            <div className="sheet-field-block">
              <span className="sheet-label">Corruption Notes</span>
              <p className="sheet-text">{build.corruption.notes}</p>
            </div>
          )}
        </section>

        {/* Narrative Section */}
        <section className="sheet-section sheet-narrative">
          <h2>Narrative Details</h2>

          {build.profile.code && (
            <div className="sheet-field-block">
              <span className="sheet-label">Code</span>
              <p className="sheet-text">{build.profile.code}</p>
            </div>
          )}

          {build.profile.lineNotCrossed && (
            <div className="sheet-field-block">
              <span className="sheet-label">Line Not Crossed</span>
              <p className="sheet-text">{build.profile.lineNotCrossed}</p>
            </div>
          )}

          {build.profile.temptation && (
            <div className="sheet-field-block">
              <span className="sheet-label">Temptation</span>
              <p className="sheet-text">{build.profile.temptation}</p>
            </div>
          )}

          {build.narrative.relationships.length > 0 && (
            <div className="sheet-field-block">
              <span className="sheet-label">Relationships</span>
              <ul className="sheet-list">
                {build.narrative.relationships.map((rel, idx) => (
                  <li key={idx}>{rel}</li>
                ))}
              </ul>
            </div>
          )}

          {build.narrative.anchors && (
            <div className="sheet-field-block">
              <span className="sheet-label">Anchors</span>
              <p className="sheet-text">{build.narrative.anchors}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
