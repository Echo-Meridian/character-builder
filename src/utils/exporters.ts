import type { CharacterBuild } from '../state/characterStore';
import type { BackgroundEntry, CharacterBuilderData } from '../data/types';

interface ExportPayload {
  version: string;
  generatedAt: string;
  profile: CharacterBuild['profile'];
  priorities: CharacterBuild['priorities'];
  lineage: CharacterBuild['lineage'];
  resources: CharacterBuild['resources'];
  background: CharacterBuild['background'];
  skills: CharacterBuild['skills'];
  attributes: CharacterBuild['attributes'];
  corruption: CharacterBuild['corruption'];
  health: CharacterBuild['health'];
  narrative: CharacterBuild['narrative'];
  gmNotes: string;
  reference: {
    resources: CharacterBuilderData['resources'];
    resourceCosts: CharacterBuilderData['resourceCosts'];
    powerSchemas: CharacterBuilderData['powerSchemas'];
    attributes: CharacterBuilderData['attributes'];
    backgrounds: CharacterBuilderData['backgrounds'];
    selectedBackgroundTemplate: BackgroundEntry | null;
    characterSheet: CharacterBuilderData['characterSheet'];
  };
}

export function buildExportPayload(build: CharacterBuild, data: CharacterBuilderData): ExportPayload {
  const selectedBackgroundTemplate = build.background.title ? data.backgrounds[build.background.title] ?? null : null;
  return {
    version: '0.1.0',
    generatedAt: new Date().toISOString(),
    profile: build.profile,
    priorities: build.priorities,
    lineage: build.lineage,
    resources: build.resources,
    background: build.background,
    skills: build.skills,
    attributes: build.attributes,
    corruption: build.corruption,
    health: build.health,
    narrative: build.narrative,
    gmNotes: build.gmNotes,
    reference: {
      resources: data.resources,
      resourceCosts: data.resourceCosts,
      powerSchemas: data.powerSchemas,
      attributes: data.attributes,
      backgrounds: data.backgrounds,
      selectedBackgroundTemplate,
      characterSheet: data.characterSheet
    }
  };
}

export function downloadCharacterJson(build: CharacterBuild, data: CharacterBuilderData) {
  const payload = buildExportPayload(build, data);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  triggerDownload(`${slugify(build.profile.name || build.label)}.json`, blob);
}

export function downloadCharacterSheet(build: CharacterBuild) {
  const content = renderTextSheet(build);
  const blob = new Blob([content], { type: 'text/plain' });
  triggerDownload(`${slugify(build.profile.name || build.label)}.txt`, blob);
}

function renderTextSheet(build: CharacterBuild): string {
  const lines: string[] = [];
  lines.push(`SIDONIA DOSSIER :: ${build.profile.name || build.label}`);
  lines.push(`Concept: ${build.profile.concept}`);
  lines.push(`Pronouns: ${build.profile.pronouns}`);
  lines.push(`Summary: ${build.profile.summary}`);
  lines.push('');
  lines.push('Priorities:');
  Object.entries(build.priorities).forEach(([key, value]) => {
    lines.push(`  ${key.toUpperCase()}: ${value ?? '-'}`);
  });
  lines.push('');
  lines.push(`Lineage: ${build.lineage.key ?? 'Unchosen'}`);
  lines.push(`Lineage Notes: ${build.lineage.notes}`);
  lines.push('');
  lines.push('Resource Allocations:');
  Object.entries(build.resources.allocations).forEach(([key, value]) => {
    lines.push(`  ${key}: ${value}`);
  });
  lines.push(`Resource Notes: ${build.resources.notes}`);
  lines.push('');
  lines.push(`Background: ${build.background.title}`);
  lines.push(`Details: ${build.background.tierNotes}`);
  lines.push(`Contacts: ${build.background.contacts}`);
  lines.push('');
  lines.push('Skills:');
  Object.entries(build.skills.ratings).forEach(([skillId, rating]) => {
    if (rating > 0) {
      lines.push(`  ${formatSkillId(skillId)}: ${rating}`);
    }
  });
  const nonBackgroundSpecs = build.skills.specializations.filter((entry) => entry.type !== 'background');
  if (nonBackgroundSpecs.length > 0) {
    lines.push('Specializations:');
    nonBackgroundSpecs.forEach((entry) => {
      const status = entry.type === 'custom' && !entry.gmApproved ? ' (Pending GM Approval)' : '';
      lines.push(`  - ${entry.label}${status}`);
    });
  }
  if (build.skills.backgroundSpecialization) {
    lines.push(`Background Specialization: ${build.skills.backgroundSpecialization}`);
  }
  lines.push(`Skill Notes: ${build.skills.notes}`);
  lines.push('');
  lines.push('Attributes:');
  Object.entries(build.attributes.scores).forEach(([key, value]) => {
    lines.push(`  ${key}: ${value}`);
  });
  const attributeSpecializations = Object.entries(build.attributes.specializations).filter(([, list]) => list.length > 0);
  if (attributeSpecializations.length > 0) {
    lines.push('Attribute Specializations:');
    attributeSpecializations.forEach(([key, list]) => {
      lines.push(`  ${key}: ${list.join(', ')}`);
    });
  }
  lines.push(`Attribute Notes: ${build.attributes.notes}`);
  lines.push('');
  lines.push(`Corruption: ${build.corruption.current} / ${build.corruption.warning}`);
  lines.push(`Corruption Notes: ${build.corruption.notes}`);
  lines.push('');
  lines.push('Health:');
  Object.entries(build.health).forEach(([key, entry]) => {
    lines.push(`  ${key}: ${entry.current}/${entry.max} :: ${entry.scar}`);
  });
  lines.push('');
  lines.push('Relationships:');
  build.narrative.relationships.forEach((relationship) => lines.push(`  - ${relationship}`));
  lines.push(`Anchors: ${build.narrative.anchors}`);
  lines.push(`Notes: ${build.narrative.notes}`);
  if (build.gmNotes) {
    lines.push('');
    lines.push('GM Notes:');
    lines.push(build.gmNotes);
  }
  return lines.join('\n');
}

function triggerDownload(filename: string, blob: Blob) {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function slugify(value: string) {
  const cleaned = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return cleaned || 'sidonia-character';
}

function formatSkillId(value: string) {
  const [discipline, skill] = value.split(':');
  return `${toTitleCase(discipline)} · ${toTitleCase((skill ?? '').replace(/-/g, ' '))}`;
}

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
    .trim();
}
