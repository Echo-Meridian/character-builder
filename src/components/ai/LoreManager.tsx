import React, { useState } from 'react';
import { RAGStore } from '../../services/RAGStore';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

export const LoreManager: React.FC = () => {
    const [text, setText] = useState('');
    const [isIngesting, setIsIngesting] = useState(false);
    const [chunkCount, setChunkCount] = useState(0);

    const ragStore = RAGStore.getInstance();

    const handleIngest = async () => {
        if (!text.trim()) return;

        setIsIngesting(true);
        try {
            await ragStore.ingest(text, { source: 'user-input', date: new Date().toISOString() });
            setText('');
            setChunkCount(ragStore.getChunkCount());
        } catch (error) {
            console.error("Failed to ingest text:", error);
            alert("Failed to ingest text. See console for details.");
        } finally {
            setIsIngesting(false);
        }
    };

    const handleClear = () => {
        ragStore.clear();
        setChunkCount(0);
    };

    return (
        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 backdrop-blur-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                    <BookOpen size={20} className="text-indigo-400" />
                    Lore Knowledge Base
                </h3>
                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
                    {chunkCount} chunks
                </span>
            </div>

            <div className="flex-1 flex flex-col gap-2 min-h-[200px]">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste game lore, rules, or character details here..."
                    className="flex-1 w-full bg-slate-800/50 border border-slate-700 rounded-md p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none text-sm"
                />

                <div className="flex gap-2 justify-end">
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-400 transition-colors text-sm"
                        title="Clear all knowledge"
                    >
                        <Trash2 size={16} />
                        Clear
                    </button>
                    <button
                        onClick={handleIngest}
                        disabled={isIngesting || !text.trim()}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
                    >
                        {isIngesting ? (
                            <span>Ingesting...</span>
                        ) : (
                            <>
                                <Plus size={16} />
                                Add to Knowledge
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
