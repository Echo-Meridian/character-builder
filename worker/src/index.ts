import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Ai } from '@cloudflare/ai';

type Bindings = {
    AI: any;
    VECTORIZE: VectorizeIndex;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/*', cors());

// Helper to chunk text
function chunkText(text: string, chunkSize: number = 500): string[] {
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
        const { data } = await ai.run('@cf/baai/bge-base-en-v1.5', { text: [chunk] });
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
    const { messages } = await c.req.json();
    const lastMessage = messages[messages.length - 1];
    const query = lastMessage.content;

    const ai = new Ai(c.env.AI);

    // 1. Embed query
    const { data } = await ai.run('@cf/baai/bge-base-en-v1.5', { text: [query] });
    const queryVector = data[0];

    // 2. Search Vectorize
    const matches = await c.env.VECTORIZE.query(queryVector, { topK: 3, returnMetadata: true });

    // 3. Construct Context
    const context = matches.matches
        .map((m: any) => m.metadata?.text)
        .filter(Boolean)
        .join('\n\n');

    console.log("Retrieved Context:", context);

    // 4. Generate Response
    const systemPrompt = `You are AVA, the advanced AI Assistant for the Sidonia TTRPG.
You are helpful, knowledgeable, and immersive.
You have access to a knowledge base called "Victor" (the vector database).
Use the following context retrieved by Victor to answer the user's question.
If the context is empty or irrelevant, rely on your general knowledge but mention that Victor didn't find specific records.

Context from Victor:
${context}
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
