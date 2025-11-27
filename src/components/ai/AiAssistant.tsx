import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Minimize2, Maximize2, Sparkles, Power, ShieldCheck, Loader2, Bot, User } from 'lucide-react';
import { CloudflareAIService } from '../../services/CloudflareAIService';
import { useAiContext } from '../../hooks/useAiContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export const AiAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const aiService = CloudflareAIService.getInstance();
    const { context } = useAiContext();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, isConnected]);

    const handleConnect = async () => {
        setIsConnecting(true);
        try {
            // Handshake / Intro
            // We include the character context here so AVA knows who she's talking to immediately.
            const systemMsg = `Introduce yourself briefly as AVA, the Sidonia AI Assistant.
            
            ${context.systemPrompt}
            `;

            const introMsg = await aiService.chat([{ role: 'system', content: systemMsg }]);
            setMessages([{ role: 'assistant', content: introMsg }]);
            setIsConnected(true);
        } catch (error) {
            console.error("Failed to connect:", error);
            setMessages([{ role: 'assistant', content: "Connection established, but AVA is quiet. (Check backend logs if no response)" }]);
            setIsConnected(true);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return;

        const userContent = input.trim();
        const userMsg: Message = { role: 'user', content: userContent };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsGenerating(true);

        try {
            const response = await aiService.chat(
                [
                    ...messages.map(m => ({ role: m.role, content: m.content })),
                    userMsg
                ],
                context.systemPrompt
            );

            setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [...prev, { role: 'assistant', content: "Error: AVA is unreachable." }]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 z-50 group"
                aria-label="Open AI Assistant"
            >
                <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </button>
        );
    }

    return (
        <div
            className={clsx(
                "fixed z-50 bg-slate-900 border border-slate-700 shadow-2xl transition-all duration-300 flex flex-col overflow-hidden",
                isMinimized
                    ? "bottom-6 right-6 w-72 h-14 rounded-t-lg rounded-b-none"
                    : "bottom-6 right-6 w-96 h-[600px] rounded-lg"
            )}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700 cursor-pointer"
                onClick={() => setIsMinimized(!isMinimized)}
            >
                <div className="flex items-center gap-2 text-cyan-400">
                    <Bot className="w-5 h-5" />
                    <span className="font-semibold text-sm tracking-wide">
                        AVA {isConnected && <span className="text-emerald-400 text-xs ml-1">(Online)</span>}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMinimized(!isMinimized);
                        }}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
                    >
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                        }}
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {!isMinimized && (
                <>
                    {!isConnected ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-900/95">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-600 shadow-lg shadow-cyan-900/20">
                                {isConnecting ? (
                                    <Loader2 size={32} className="text-cyan-400 animate-spin" />
                                ) : (
                                    <Power size={32} className="text-cyan-400" />
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-slate-100 mb-2">Connect to AVA</h3>
                            <p className="text-slate-400 text-sm mb-6">
                                Initialize the Sidonia AI Assistant. This connects to Cloudflare Workers AI.
                            </p>
                            <button
                                onClick={handleConnect}
                                disabled={isConnecting}
                                className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isConnecting ? 'Initializing...' : 'Initialize System'}
                            </button>
                            <div className="mt-4 flex items-center gap-1 text-[10px] text-slate-500">
                                <ShieldCheck size={12} />
                                <span>Powered by Victor (Vectorize)</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/95">
                                {messages.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={clsx(
                                            "flex flex-col max-w-[85%]",
                                            msg.role === 'user' ? "self-end items-end" : "self-start items-start"
                                        )}
                                    >
                                        <div
                                            className={clsx(
                                                "p-3 rounded-lg text-sm leading-relaxed prose prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0",
                                                msg.role === 'user'
                                                    ? "bg-cyan-600 text-white rounded-br-none prose-headings:text-white prose-strong:text-white"
                                                    : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none prose-headings:text-cyan-400 prose-strong:text-cyan-300 prose-em:text-cyan-400"
                                            )}
                                        >
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    // @ts-ignore - node type is complex, safe to ignore for simple anchor styling
                                                    a: ({ node, ...props }) => <a {...props} className="text-cyan-300 hover:underline" target="_blank" rel="noopener noreferrer" />,
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                        <span className="text-[10px] text-slate-500 mt-1 px-1">
                                            {msg.role === 'user' ? 'You' : 'AVA'}
                                        </span>
                                    </div>
                                ))}
                                {isGenerating && (
                                    <div className="self-start flex items-center gap-2 p-3 bg-slate-800 rounded-lg rounded-bl-none border border-slate-700">
                                        <Loader2 size={14} className="animate-spin text-cyan-400" />
                                        <span className="text-xs text-slate-400">Thinking...</span>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-3 bg-slate-800 border-t border-slate-700">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder="Ask AVA..."
                                        disabled={isGenerating}
                                        className="flex-1 bg-slate-900 text-white text-sm rounded-md border border-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none px-3 py-2 placeholder-slate-500 disabled:opacity-50"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim() || isGenerating}
                                        className="p-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};
