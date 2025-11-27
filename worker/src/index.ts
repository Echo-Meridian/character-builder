import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Ai } from '@cloudflare/ai';

// Embedding model - change this and re-ingest if switching models
const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';
// Alternative: '@cf/qwen/qwen3-embedding-text-0.6b' (requires re-ingestion)

// Minimum similarity score threshold (0-1 scale, higher = more similar)
const SIMILARITY_THRESHOLD = 0.65;

type Bindings = {
    AI: any;
    VECTORIZE: VectorizeIndex;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/*', cors());

// Health/status endpoint - shows current configuration
app.get('/api/status', async (c) => {
    return c.json({
        status: 'ok',
        embeddingModel: EMBEDDING_MODEL,
        llmModel: '@cf/qwen/qwen3-30b-a3b-fp8',
        vectorIndex: 'sidonia-lore-index',
        similarityThreshold: SIMILARITY_THRESHOLD
    });
});

// Helper to chunk text
function chunkText(text: string, chunkSize: number = 1000): string[] {
    const chunks: string[] = [];
    let currentChunk = '';

    const sentences = text.split(/(?<=[.?!])\s+/);

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > chunkSize) {
            chunks.push(currentChunk.trim());
            currentChunk = '';
        }
        currentChunk += sentence + ' ';
    }
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }
    return chunks;
}

app.post('/api/ingest', async (c) => {
    const { text, metadata } = await c.req.json();

    if (!text) return c.json({ error: 'Text is required' }, 400);

    const ai = new Ai(c.env.AI);
    const chunks = chunkText(text);
    const vectors: VectorizeVector[] = [];

    console.log(`Ingesting ${chunks.length} chunks...`);

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const { data } = await ai.run(EMBEDDING_MODEL as any, { text: [chunk] });
        const values = data[0]; // Embedding vector

        vectors.push({
            id: `${metadata?.source || 'doc'}-${Date.now()}-${i}`,
            values,
            metadata: {
                ...metadata,
                text: chunk
            }
        });
    }

    // Upsert in batches of 100 if needed, but for now simple upsert
    await c.env.VECTORIZE.upsert(vectors);

    return c.json({ success: true, chunks: chunks.length });
});

app.post('/api/chat', async (c) => {
    const { messages, characterContext } = await c.req.json();
    const lastMessage = messages[messages.length - 1];
    const query = lastMessage.content;

    const ai = new Ai(c.env.AI);

    // 1. Embed query using same model as ingestion
    const { data } = await ai.run(EMBEDDING_MODEL as any, { text: [query] });
    const queryVector = data[0];

    // 2. Search Vectorize with more results, then filter by quality
    const matches = await c.env.VECTORIZE.query(queryVector, { topK: 5, returnMetadata: true });

    // 3. Filter by similarity threshold and construct context
    const relevantMatches = matches.matches
        .filter((m: any) => m.score >= SIMILARITY_THRESHOLD)
        .slice(0, 3); // Take top 3 that pass threshold

    const loreContext = relevantMatches
        .map((m: any) => m.metadata?.text)
        .filter(Boolean)
        .join('\n\n---\n\n');

    const hasLoreContext = relevantMatches.length > 0;

    console.log(`Retrieved ${relevantMatches.length}/${matches.matches.length} relevant matches (threshold: ${SIMILARITY_THRESHOLD})`);
    if (hasLoreContext) {
        console.log("Lore Context:", loreContext.substring(0, 200) + "...");
    }

    // 4. Generate Response with integrated character + lore context
    const systemPrompt = `You are AVA, the AI Assistant for Sidonia—a noir tabletop RPG where corruption is currency and every power has a price.

PERSONA:
- Speak like a world-weary guide who's seen the Long Night claim too many hopeful souls
- Be direct, practical, and occasionally sardonic—this isn't a fairy tale
- Help players build characters that will SURVIVE, not just look good on paper
- When discussing mechanics, connect them to the fiction: "That Priority B in Lineage? It means you're dangerous enough to matter, but not so powerful you've got a target painted on your back."

${characterContext ? `CURRENT CHARACTER:
${characterContext}

Use this context to give personalized guidance. Reference their choices, suggest synergies, warn about trade-offs.` : 'The player hasn\'t started building yet. Help them understand the system and find their concept.'}

${hasLoreContext ? `RELEVANT LORE (from Victor):
${loreContext}

Use this lore to ground your answers in Sidonia's world. Cite specifics when helpful.` : 'Victor found no directly relevant records for this query. Answer from your understanding of Sidonia\'s themes: survival, scarcity, corruption, and the price of power.'}

GUIDELINES:
- For mechanics questions: Be precise about numbers and rules
- For creative questions: Offer 2-3 options that fit different playstyles
- For lore questions: Paint the picture, make it feel real
- Always remember: in Sidonia, "balanced" means "everyone has something to lose"
`;

    const response = await ai.run('@cf/qwen/qwen3-30b-a3b-fp8' as any, {
        messages: [
            { role: 'system', content: systemPrompt },
            ...messages
        ]
    });

    // Ensure we return a consistent format for the frontend
    // Qwen might return { response: "..." } or { result: { response: "..." } } or just the string if not careful.
    // We'll wrap it to be safe if it's not already an object with 'response'.

    // @ts-ignore
    const rawResponse = response as any;

    // Check for OpenAI-compatible format (which Cloudflare AI often uses for chat models)
    let responseText = "";

    if (rawResponse.choices && rawResponse.choices.length > 0 && rawResponse.choices[0].message) {
        responseText = rawResponse.choices[0].message.content;
    } else if (rawResponse.response) {
        responseText = rawResponse.response;
    } else if (rawResponse.result && rawResponse.result.response) {
        responseText = rawResponse.result.response;
    } else {
        // Fallback: If we can't find the text, we might be getting a stream or something else.
        // But we definitely don't want to dump the whole object if it contains internal logs.
        console.error("Unexpected response format:", JSON.stringify(rawResponse));
        responseText = "I apologize, but I'm having trouble formulating a response right now.";
    }

    return c.json({ response: responseText });
});

export default app;
