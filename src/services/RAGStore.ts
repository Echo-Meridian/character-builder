import { LocalAIService } from "./LocalAIService";

export interface DocumentChunk {
    id: string;
    text: string;
    metadata?: Record<string, any>;
    embedding?: number[];
}

export class RAGStore {
    private static instance: RAGStore;
    private chunks: DocumentChunk[] = [];
    private aiService: LocalAIService;

    private constructor() {
        this.aiService = LocalAIService.getInstance();
    }

    static getInstance(): RAGStore {
        if (!RAGStore.instance) {
            RAGStore.instance = new RAGStore();
        }
        return RAGStore.instance;
    }

    async ingest(text: string, metadata?: Record<string, any>): Promise<void> {
        // Simple chunking strategy: split by paragraphs or fixed size
        // For now, let's split by double newlines (paragraphs)
        const rawChunks = text.split(/\n\n+/).filter((c) => c.trim().length > 0);

        for (const chunkText of rawChunks) {
            const embedding = await this.aiService.embedText(chunkText);
            this.chunks.push({
                id: crypto.randomUUID(),
                text: chunkText,
                metadata,
                embedding,
            });
        }
        console.log(`Ingested ${rawChunks.length} chunks.`);
    }

    async search(query: string, topK: number = 3): Promise<DocumentChunk[]> {
        const queryEmbedding = await this.aiService.embedText(query);

        // Calculate cosine similarity
        const scoredChunks = this.chunks.map((chunk) => {
            if (!chunk.embedding) return { chunk, score: -1 };
            const score = this.cosineSimilarity(queryEmbedding, chunk.embedding);
            return { chunk, score };
        });

        // Sort by score descending
        scoredChunks.sort((a, b) => b.score - a.score);

        return scoredChunks.slice(0, topK).map((item) => item.chunk);
    }

    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    getChunkCount(): number {
        return this.chunks.length;
    }

    clear(): void {
        this.chunks = [];
    }
}
