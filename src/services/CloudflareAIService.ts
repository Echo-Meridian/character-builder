export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export class CloudflareAIService {
    private static instance: CloudflareAIService;
    private baseUrl: string;

    private constructor() {
        // Use environment variable for worker URL, fallback to localhost for dev
        this.baseUrl = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787/api';
    }

    static getInstance(): CloudflareAIService {
        if (!CloudflareAIService.instance) {
            CloudflareAIService.instance = new CloudflareAIService();
        }
        return CloudflareAIService.instance;
    }

    async chat(messages: ChatMessage[], characterContext?: string): Promise<string> {
        try {
            const response = await fetch(`${this.baseUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages, characterContext })
            });

            if (!response.ok) {
                throw new Error(`Chat request failed: ${response.statusText}`);
            }

            const data = await response.json();
            // Cloudflare Workers AI usually returns { response: "text" } or similar depending on the model
            // Llama 3 instruct response format:
            return data.response || data.result?.response || "No response from AI";
        } catch (error) {
            console.error("Cloudflare AI Chat Error:", error);
            throw error;
        }
    }

    async ingest(text: string, metadata?: any): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/ingest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, metadata })
            });

            if (!response.ok) {
                throw new Error(`Ingest request failed: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Cloudflare AI Ingest Error:", error);
            throw error;
        }
    }
}
