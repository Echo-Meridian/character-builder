import React from 'react';

import { LoreManager } from '../components/ai/LoreManager';

export default function LoreManagementPage() {
    return (
        <div className="container mx-auto p-6 space-y-6 pb-24">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-100 mb-2">Lore Management (Victor)</h1>
                <p className="text-slate-400">
                    Manage the knowledge base for the AI. Add lore, rules, and world details here.
                </p>
            </div>

            <div className="max-w-4xl mx-auto">
                <LoreManager />
            </div>
        </div>
    );
}
