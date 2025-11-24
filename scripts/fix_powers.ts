
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POWERS_FILE_PATH = path.join(__dirname, '../public/data/powers-esper.json');

function fix() {
    console.log(`Reading ${POWERS_FILE_PATH}...`);

    if (!fs.existsSync(POWERS_FILE_PATH)) {
        console.error(`Error: File not found at ${POWERS_FILE_PATH}`);
        process.exit(1);
    }

    const content = fs.readFileSync(POWERS_FILE_PATH, 'utf-8');
    let data;

    try {
        data = JSON.parse(content);
    } catch (e) {
        console.error('Error: Failed to parse JSON.');
        console.error(e);
        process.exit(1);
    }

    let fixedCount = 0;

    if (Array.isArray(data.powers)) {
        data.powers.forEach((power: any) => {
            if (typeof power.tier === 'string') {
                const num = parseInt(power.tier, 10);
                if (!isNaN(num)) {
                    power.tier = num;
                    fixedCount++;
                }
            } else if (power.tier === undefined && typeof power.evolutionStage === 'number') {
                power.tier = power.evolutionStage;
                fixedCount++;
            }

            const isMentalist = power.isMentalist === true || (power.tags && power.tags.includes('mentalist'));

            if (!isMentalist && (!power.effects || power.effects === "")) {
                power.effects = "See description.";
                fixedCount++;
            }

            if (power.description) {
                if (power.description.short === undefined) {
                    power.description.short = "";
                    fixedCount++;
                }
                if (power.description.player === undefined) {
                    power.description.player = "";
                    fixedCount++;
                }
            }
        });
    }

    if (fixedCount > 0) {
        console.log(`Fixed ${fixedCount} 'tier' fields.`);
        fs.writeFileSync(POWERS_FILE_PATH, JSON.stringify(data, null, 2));
        console.log('File saved.');
    } else {
        console.log('No changes needed.');
    }
}

fix();
