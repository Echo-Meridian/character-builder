import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LORE_DIR = path.join(__dirname, '../public/Sidonia_Cannon');
const API_URL = 'http://localhost:8787/api/ingest';

async function ingestFile(filePath) {
    const filename = path.basename(filePath);
    console.log(`Reading ${filename}...`);

    try {
        const text = await fs.readFile(filePath, 'utf-8');
        if (!text.trim()) {
            console.log(`Skipping empty file: ${filename}`);
            return;
        }

        console.log(`Ingesting ${filename} (${text.length} chars)...`);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                metadata: {
                    source: filename,
                    date: new Date().toISOString()
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to ingest ${filename}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log(`✅ Successfully ingested ${filename}: ${result.chunks} chunks`);
    } catch (error) {
        console.error(`❌ Error ingesting ${filename}:`, error.message);
    }
}

async function main() {
    try {
        const files = await fs.readdir(LORE_DIR);
        const txtFiles = files.filter(f => f.endsWith('.txt') || f.endsWith('.md'));

        console.log(`Found ${txtFiles.length} lore files in ${LORE_DIR}`);

        for (const file of txtFiles) {
            await ingestFile(path.join(LORE_DIR, file));
        }

        console.log('🎉 Bulk ingestion complete!');
    } catch (error) {
        console.error('Fatal error:', error);
    }
}

main();
