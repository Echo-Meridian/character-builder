import { CharacterBuild } from '../../state/slices/types';
import { CharacterExporter, ExportResult } from './types';

export class FoundryExporter implements CharacterExporter {
    name = 'Foundry VTT';
    description = 'Export character as a JSON file compatible with Foundry VTT Actor import.';

    export(build: CharacterBuild): ExportResult {
        const filename = `${build.profile.name || 'Unnamed_Character'}_Foundry.json`.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        // Map Sidonia attributes to a generic system structure
        const attributes = Object.entries(build.attributes.scores).reduce((acc, [key, value]) => {
            acc[key] = { value: value, min: 0, max: 10 }; // Assuming 0-10 scale
            return acc;
        }, {} as Record<string, any>);

        // Map Sidonia skills
        const skills = Object.entries(build.skills.ratings).reduce((acc, [key, value]) => {
            acc[key] = { value: value };
            return acc;
        }, {} as Record<string, any>);

        // Create Items from Resources and Powers
        const items = [
            // Resources
            ...build.resources.contacts.map(c => ({
                name: c.name,
                type: 'contact',
                system: { description: c.description, reach: c.reach, influence: c.influence }
            })),
            ...build.resources.properties.map(p => ({
                name: p.name,
                type: 'property',
                system: { description: p.description, location: p.ward, type: p.zoning, tenure: p.tenure }
            })),
            // Powers (Lineage)
            ...build.lineage.powers.map(p => ({
                name: p.label,
                type: 'power',
                system: {
                    description: p.kind,
                    cost: p.meta?.mutationPoints || p.meta?.slots || 0,
                    type: 'lineage',
                    meta: p.meta
                }
            }))
        ];

        const foundryData = {
            name: build.profile.name || 'Unnamed Character',
            type: 'character',
            img: 'icons/svg/mystery-man.svg', // Default icon
            system: {
                attributes: attributes,
                skills: skills,
                details: {
                    biography: build.profile.backstory || '',
                    lineage: build.lineage.key,
                    background: build.background.title,
                    concept: build.profile.concept,
                },
                resources: {
                    liquid: build.resources.liquid,
                }
            },
            items: items,
            flags: {
                exportSource: 'Sidonia Character Builder',
                exportDate: new Date().toISOString()
            }
        };

        return {
            filename,
            data: JSON.stringify(foundryData, null, 2),
            mimeType: 'application/json',
        };
    }
}
