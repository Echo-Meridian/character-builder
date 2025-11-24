import { CreateMLCEngine, MLCEngine, InitProgressCallback } from "@mlc-ai/web-llm";
import { pipeline, FeatureExtractionPipeline } from "@xenova/transformers";

// Fallback to Gemma 2 2B as Gemma 3 WASM kernels are not yet available in WebLLM.
const DEFAULT_LLM_MODEL_ID = "gemma-2-2b-it-q4f16_1-MLC";
const EMBEDDING_MODEL_ID = "google/embedding-gemma-300m";

export interface ModelInitProgress {
    progress: number;
    text: string;
}

export class LocalAIService {
    private static instance: LocalAIService;
    private engine: MLCEngine | null = null;
    private embedder: FeatureExtractionPipeline | null = null;
    private isInitializingLLM = false;
    private isInitializingEmbedder = false;

    private constructor() { }

    static getInstance(): LocalAIService {
        if (!LocalAIService.instance) {
            LocalAIService.instance = new LocalAIService();
        }
        return LocalAIService.instance;
    }

    async initializeLLM(
        onProgress?: (progress: ModelInitProgress) => void
    ): Promise<void> {
        if (this.engine || this.isInitializingLLM) return;

        this.isInitializingLLM = true;
        try {
            const initProgressCallback: InitProgressCallback = (report) => {
                if (onProgress) {
                    onProgress({
                        progress: report.progress,
                        text: report.text,
                    });
                }
            };

            this.engine = await CreateMLCEngine(DEFAULT_LLM_MODEL_ID, {
                initProgressCallback,
                logLevel: "INFO", // or "DEBUG"
            });
            console.log("LLM Engine initialized");
        } catch (error) {
            console.error("Failed to initialize LLM:", error);
            throw error;
        } finally {
            this.isInitializingLLM = false;
        }
    }

    async initializeEmbedder(): Promise<void> {
        if (this.embedder || this.isInitializingEmbedder) return;

        this.isInitializingEmbedder = true;
        try {
            // @ts-ignore - Transformers.js types can be tricky with specific pipelines
            this.embedder = await pipeline("feature-extraction", EMBEDDING_MODEL_ID, {
                quantized: true, // Use quantized version for browser efficiency
            });
            console.log("Embedder initialized");
        } catch (error) {
            console.error("Failed to initialize Embedder:", error);
            throw error;
        } finally {
            this.isInitializingEmbedder = false;
        }
    }

    async generateResponse(
        messages: { role: string; content: string }[]
    ): Promise<string> {
        if (!this.engine) {
            throw new Error("LLM not initialized. Call initializeLLM() first.");
        }

        const reply = await this.engine.chat.completions.create({
            messages: messages as any,
            temperature: 0.7,
            max_tokens: 1024,
        });

        return reply.choices[0].message.content || "";
    }

    async embedText(text: string): Promise<number[]> {
        if (!this.embedder) {
            await this.initializeEmbedder();
        }

        if (!this.embedder) {
            throw new Error("Failed to initialize embedder");
        }

        const output = await this.embedder(text, { pooling: "mean", normalize: true });
        // Convert Tensor to plain array
        return Array.from(output.data);
    }

    isLLMReady(): boolean {
        return !!this.engine;
    }

    isEmbedderReady(): boolean {
        return !!this.embedder;
    }
}
