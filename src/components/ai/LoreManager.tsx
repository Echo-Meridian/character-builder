
import React, { useState } from 'react';
import { CloudflareAIService } from '../../services/CloudflareAIService';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

export const LoreManager: React.FC = () => {
    const [text, setText] = useState('');
    const [isIngesting, setIsIngesting] = useState(false);

    const aiService = CloudflareAIService.getInstance();

    const handleIngest = async () => {
        if (!text.trim()) return;

        setIsIngesting(true);
        try {
            await aiService.ingest(text, { source: 'user-input', date: new Date().toISOString() });
            setText('');
            alert("Ingested successfully!");
        } catch (error) {
            console.error("Failed to ingest text:", error);
            alert("Failed to ingest text. See console for details.");
        } finally {
            setIsIngesting(false);
        }
    };

    const handleLoadCoreRules = async () => {
        setIsIngesting(true);
        try {
            const response = await fetch('/data/backgrounds.json');
            if (!response.ok) throw new Error("Failed to load backgrounds");
            const data = await response.json();
            const textContent = JSON.stringify(data, null, 2);

            await aiService.ingest(textContent, { source: 'core-rules', date: new Date().toISOString() });
            alert("Core rules loaded successfully!");
        } catch (error) {
            console.error("Failed to load core rules:", error);
            alert("Failed to load core rules.");
        } finally {
            setIsIngesting(false);
        }
    };

    const handleClear = () => {
        // Clearing vector index is not exposed via simple API yet
        alert("Clearing index requires admin access via Wrangler for now.");
    };

    return (
        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 backdrop-blur-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                    <BookOpen size={20} className="text-indigo-400" />
                    Lore Knowledge Base
                </h3>
            </div>

            <div className="flex-1 flex flex-col gap-2 min-h-[200px]">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste game lore, rules, or character details here..."
                    className="flex-1 w-full bg-slate-800/50 border border-slate-700 rounded-md p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none text-sm"
                />

                <div className="flex gap-2 justify-end flex-wrap">
                    <button
                        onClick={handleLoadCoreRules}
                        disabled={isIngesting}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition-colors text-sm"
                        title="Load default game rules"
                    >
                        <BookOpen size={16} />
                        Load Core Rules
                    </button>
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
