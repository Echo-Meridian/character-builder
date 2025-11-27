#!/usr/bin/env node
/**
 * Lore Ingestion Script for Sidonia Character Builder
 *
 * Usage:
 *   node scripts/ingest-lore.js              # Ingest all lore files
 *   node scripts/ingest-lore.js --status     # Check worker status and embedding model
 *
 * Prerequisites:
 *   1. Worker must be running: cd worker && npx wrangler dev
 *   2. For production: set WORKER_URL environment variable
 *
 * Re-ingestion after changing embedding model:
 *   1. Delete the Vectorize index: npx wrangler vectorize delete sidonia-lore-index
 *   2. Recreate it: npx wrangler vectorize create sidonia-lore-index --dimensions=768 --metric=cosine
 *   3. Run this script: node scripts/ingest-lore.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LORE_DIR = path.join(__dirname, '../public/Sidonia_Cannon');
const API_BASE = process.env.WORKER_URL || 'http://localhost:8787/api';

async function checkStatus() {
    try {
        const response = await fetch(`${API_BASE}/status`);
        if (!response.ok) {
            throw new Error(`Status check failed: ${response.statusText}`);
        }
        const status = await response.json();
        console.log('\n📊 Worker Status:');
        console.log(`   Status: ${status.status}`);
        console.log(`   Embedding Model: ${status.embeddingModel}`);
        console.log(`   LLM Model: ${status.llmModel}`);
        console.log(`   Vector Index: ${status.vectorIndex}`);
        console.log(`   Similarity Threshold: ${status.similarityThreshold}`);
        return status;
    } catch (error) {
        console.error('❌ Cannot reach worker:', error.message);
        console.error('   Make sure the worker is running: cd worker && npx wrangler dev');
        process.exit(1);
    }
}

async function ingestFile(filePath) {
    const filename = path.basename(filePath);
    console.log(`\n📄 Reading ${filename}...`);

    try {
        const text = await fs.readFile(filePath, 'utf-8');
        if (!text.trim()) {
            console.log(`   ⏭️  Skipping empty file`);
            return { success: false, skipped: true };
        }

        console.log(`   📤 Ingesting (${text.length.toLocaleString()} chars)...`);

        const response = await fetch(`${API_BASE}/ingest`, {
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
            const errorText = await response.text();
            throw new Error(`${response.statusText}: ${errorText}`);
        }

        const result = await response.json();
        console.log(`   ✅ Success: ${result.chunks} chunks created`);
        return { success: true, chunks: result.chunks };
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function main() {
    const args = process.argv.slice(2);

    console.log('🌙 Sidonia Lore Ingestion Script');
    console.log('================================\n');

    // Always check status first
    const status = await checkStatus();

    if (args.includes('--status')) {
        process.exit(0);
    }

    console.log(`\n📁 Scanning ${LORE_DIR}...`);

    try {
        const files = await fs.readdir(LORE_DIR);
        const loreFiles = files.filter(f => f.endsWith('.txt') || f.endsWith('.md'));

        if (loreFiles.length === 0) {
            console.log('No .txt or .md files found in lore directory.');
            process.exit(0);
        }

        console.log(`Found ${loreFiles.length} lore files to ingest.`);

        let totalChunks = 0;
        let successCount = 0;
        let errorCount = 0;

        for (const file of loreFiles) {
            const result = await ingestFile(path.join(LORE_DIR, file));
            if (result.success) {
                successCount++;
                totalChunks += result.chunks || 0;
            } else if (!result.skipped) {
                errorCount++;
            }
        }

        console.log('\n================================');
        console.log('🎉 Ingestion Complete!');
        console.log(`   Files processed: ${successCount}/${loreFiles.length}`);
        console.log(`   Total chunks: ${totalChunks}`);
        if (errorCount > 0) {
            console.log(`   ⚠️  Errors: ${errorCount}`);
        }
        console.log(`   Embedding model: ${status.embeddingModel}`);
    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        process.exit(1);
    }
}

main();
