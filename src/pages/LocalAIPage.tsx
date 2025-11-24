import React from 'react';
import { ModelManager } from '../components/ai/ModelManager';
import { LoreManager } from '../components/ai/LoreManager';
import { LocalChat } from '../components/ai/LocalChat';

export const LocalAIPage: React.FC = () => {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-100 mb-2">Local AI Assistant</h1>
                <p className="text-slate-400">
                    Run Gemma 3n locally in your browser for private, offline RAG capabilities.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Management */}
                <div className="space-y-6">
                    <ModelManager />
                    <LoreManager />
                </div>

                {/* Right Column: Chat */}
                <div className="lg:col-span-2">
                    <LocalChat />
                </div>
            </div>
        </div>
    );
};
