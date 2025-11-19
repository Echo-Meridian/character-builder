import { useCallback, useMemo } from 'react';
import { useCharacterStore } from '../state/characterStore';
import { getLineageDefinition } from '../data/lineages';
import { useCharacterData } from '../data/DataContext';

export interface AiContext {
    systemPrompt: string;
    characterSummary: string;
}

export function useAiContext() {
    const { data } = useCharacterData();
    const builds = useCharacterStore((state) => state.builds);
    const activeBuildId = useCharacterStore((state) => state.activeBuildId);

    const build = activeBuildId ? builds[activeBuildId] : null;

    const generateContext = useCallback((): AiContext => {
        if (!build) {
            return {
                systemPrompt: "The user has not selected a character yet. Guide them to create or select a character.",
                characterSummary: "No active character."
            };
        }

        const lineageDef = build.lineage.key ? getLineageDefinition(build.lineage.key) : null;
        const backgroundTitle = build.background.title;

        // Calculate derived stats for context
        const totalAttr = Object.values(build.attributes.scores).reduce((a, b) => a + b, 0);
        const totalSkills = Object.values(build.skills.ratings).reduce((a, b) => a + b, 0);

        const summaryParts = [
            `Name: ${build.profile.name || 'Unnamed'}`,
            `Concept: ${build.profile.concept || 'Undefined'}`,
            `Lineage: ${lineageDef?.name || build.lineage.key || 'None'}`,
            `Background: ${backgroundTitle || 'None'}`,
            `Current Stage: ${build.stage}`,
            `Attributes: ${totalAttr} points spent`,
            `Skills: ${totalSkills} ratings assigned`,
        ];

        // Construct a more detailed system prompt
        const systemPrompt = `
You are the Sidonia AI Assistant. Your goal is to help the player build a character that fits their "Secret Heart" archetype within the grim, sci-fi fantasy world of Sidonia.

Current Character Context:
- Name: ${build.profile.name || 'Unnamed'}
- Concept: ${build.profile.concept || 'The player has not defined a concept yet. Ask them about their character idea.'}
- Lineage: ${lineageDef ? `${lineageDef.name} (${lineageDef.summary})` : 'Undecided'}
- Background: ${backgroundTitle || 'Undecided'}
- Key Priorities: ${Object.entries(build.priorities).map(([k, v]) => `${k}=${v || '?'}`).join(', ')}

Guidance Strategy:
1. If "Concept" is missing, encourage the player to describe their archetype.
2. Suggest Lineages and Backgrounds that align with their Concept.
3. Explain mechanical implications of their choices in simple terms.
4. Ensure the character fits the tone of Sidonia (Long Night, scarcity, survival).
`.trim();

        return {
            systemPrompt,
            characterSummary: summaryParts.join('\n')
        };
    }, [build, data]);

    const context = useMemo(() => generateContext(), [generateContext]);

    return {
        context,
        refreshContext: generateContext
    };
}
