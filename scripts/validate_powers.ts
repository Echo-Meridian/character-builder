
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POWERS_FILE_PATH = path.join(__dirname, '../public/data/powers-esper.json');

interface EsperPower {
    id: string;
    name: string;
    type: string;
    tier: number;
    lineage: string;
    archetype?: string;
    path?: string;
    tags: string[];
    description: {
        short: string;
        player: string;
    };
    effects: string | any[]; // Can be string or array based on inspection
    flaws?: string | any[];
    metadata?: {
        source: string;
        version: string;
    };
}

interface EsperData {
    lineage: string;
    note?: string;
    powers: EsperPower[];
}

function validate() {
    console.log(`Reading ${POWERS_FILE_PATH}...`);

    if (!fs.existsSync(POWERS_FILE_PATH)) {
        console.error(`Error: File not found at ${POWERS_FILE_PATH}`);
        process.exit(1);
    }

    const content = fs.readFileSync(POWERS_FILE_PATH, 'utf-8');
    let data: EsperData;

    try {
        data = JSON.parse(content);
    } catch (e) {
        console.error('Error: Failed to parse JSON.');
        console.error(e);
        process.exit(1);
    }

    const errors: string[] = [];

    if (data.lineage !== 'esper') {
        errors.push('Top-level "lineage" field must be "esper".');
    }

    if (!Array.isArray(data.powers)) {
        errors.push('Top-level "powers" field must be an array.');
        console.error(errors.join('\n'));
        process.exit(1);
    }

    console.log(`Found ${data.powers.length} powers. Validating individual entries...`);

    data.powers.forEach((power: any, index) => {
        const context = `Power #${index} (${power.id || 'unknown ID'})`;

        if (!power.id) errors.push(`${context}: Missing "id".`);
        if (!power.name) errors.push(`${context}: Missing "name".`);
        if (!power.type) errors.push(`${context}: Missing "type".`);
        if (power.lineage !== 'esper') errors.push(`${context}: "lineage" must be "esper".`);

        const isMentalist = power.isMentalist === true || (power.tags && power.tags.includes('mentalist'));

        if (isMentalist) {
            // Mentalist Schema Validation
            if (typeof power.evolutionStage !== 'number' && typeof power.tier !== 'number') {
                errors.push(`${context}: Mentalist power must have "evolutionStage" or "tier" as a number.`);
            }
            // Effects and flaws can be empty arrays or strings for Mentalist powers
            if (!power.effects && power.effects !== "" && !Array.isArray(power.effects)) {
                errors.push(`${context}: Missing "effects" field.`);
            }
        } else {
            // Standard Esper Schema Validation
            if (typeof power.tier !== 'number') errors.push(`${context}: "tier" must be a number.`);
            if (!power.effects) errors.push(`${context}: Missing "effects".`);
        }

        if (!power.description || typeof power.description !== 'object') {
            errors.push(`${context}: Missing or invalid "description" object.`);
        } else {
            // Description checks can be lenient if empty strings are allowed, but keys must exist
            if (power.description.short === undefined) errors.push(`${context}: Missing "description.short".`);
            if (power.description.player === undefined) errors.push(`${context}: Missing "description.player".`);
        }

        // Check for known valid types
        const validTypes = ['augment', 'move'];
        if (power.type && !validTypes.includes(power.type)) {
            errors.push(`${context}: Invalid type "${power.type}". Expected one of: ${validTypes.join(', ')}.`);
        }
    });

    if (errors.length > 0) {
        console.error(`\nValidation failed with ${errors.length} errors:`);
        errors.forEach(err => console.error(`- ${err}`));
        process.exit(1);
    } else {
        console.log('\nValidation successful! No errors found.');
    }
}

validate();
