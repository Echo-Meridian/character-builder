import React, { useState, useRef, useEffect } from 'react';
import { LocalAIService } from '../../services/LocalAIService';
import { RAGStore } from '../../services/RAGStore';
import { Send, User, Bot, Loader2 } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export const LocalChat: React.FC = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const aiService = LocalAIService.getInstance();
    const ragStore = RAGStore.getInstance();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setIsGenerating(true);

        try {
            // 1. Retrieve context
            const contextChunks = await ragStore.search(userMessage, 3);
            const contextText = contextChunks.map((c) => c.text).join('\n\n');

            // 2. Construct prompt
            const systemPrompt = `You are a helpful AI assistant for the Sidonia TTRPG. Use the following context to answer the user's question. If the answer is not in the context, say so, but you can use your general knowledge if it helps.
      
Context:
${contextText}
`;

            const promptMessages = [
                { role: 'system', content: systemPrompt },
                ...messages.map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content: userMessage }
            ];

            // 3. Generate response
            const response = await aiService.generateResponse(promptMessages);

            setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [...prev, { role: 'assistant', content: "Error: Failed to generate response." }]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-slate-900/50 rounded-lg border border-slate-700 backdrop-blur-sm overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800/30">
                <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                    <Bot size={20} className="text-emerald-400" />
                    Sidonia AI Assistant
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-slate-500 mt-10">
                        <p>Ask me anything about the lore or rules!</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center border border-emerald-700/50 shrink-0">
                                <Bot size={16} className="text-emerald-400" />
                            </div>
                        )}

                        <div
                            className={`max-w-[80%] rounded-lg p-3 text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                                }`}
                        >
                            {msg.content}
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center border border-indigo-700/50 shrink-0">
                                <User size={16} className="text-indigo-400" />
                            </div>
                        )}
                    </div>
                ))}

                {isGenerating && (
                    <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center border border-emerald-700/50 shrink-0">
                            <Bot size={16} className="text-emerald-400" />
                        </div>
                        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-emerald-400" />
                            <span className="text-slate-400 text-sm">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-slate-800/30 border-t border-slate-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        disabled={isGenerating}
                        className="flex-1 bg-slate-900/50 border border-slate-700 rounded-md px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isGenerating || !input.trim()}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-md transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
