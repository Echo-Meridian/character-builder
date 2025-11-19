import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { useAiContext } from '../../hooks/useAiContext';
import clsx from 'clsx';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export const AiAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Greetings. I am the Sidonia Assistant. I can help you translate your concept into the reality of the Long Night. What archetype calls to your secret heart?",
            timestamp: Date.now(),
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { context } = useAiContext();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Log context to console for debugging verification
        console.log('--- AI Context Snapshot ---');
        console.log('System Prompt:', context.systemPrompt);
        console.log('Character Summary:', context.characterSummary);
        console.log('User Input:', input);
        console.log('---------------------------');

        // Mock AI response
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I see. That is a compelling concept. Given your current choices, you might consider exploring the 'Neo-Drifter' background or perhaps the 'Void-Touched' lineage trait to better reflect that struggle.",
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
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
                    <Sparkles className="w-5 h-5" />
                    <span className="font-semibold text-sm tracking-wide">Sidonia Assistant</span>
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

            {/* Chat Area */}
            {!isMinimized && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/95">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={clsx(
                                    "flex flex-col max-w-[85%]",
                                    msg.role === 'user' ? "self-end items-end" : "self-start items-start"
                                )}
                            >
                                <div
                                    className={clsx(
                                        "p-3 rounded-lg text-sm leading-relaxed",
                                        msg.role === 'user'
                                            ? "bg-cyan-600 text-white rounded-br-none"
                                            : "bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none"
                                    )}
                                >
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-slate-500 mt-1 px-1">
                                    {msg.role === 'user' ? 'You' : 'Assistant'}
                                </span>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="self-start flex items-center gap-1 p-2 bg-slate-800 rounded-lg rounded-bl-none border border-slate-700">
                                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                                placeholder="Describe your concept..."
                                className="flex-1 bg-slate-900 text-white text-sm rounded-md border border-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none px-3 py-2 placeholder-slate-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="p-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mt-2 text-[10px] text-slate-500 text-center">
                            AI can make mistakes. Review generated lore.
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
