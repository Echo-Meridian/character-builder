import React, { useState, useEffect } from 'react';
import { LocalAIService, ModelInitProgress } from '../../services/LocalAIService';
import { Download, Check, AlertTriangle, Loader2 } from 'lucide-react';

export const ModelManager: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
    const [progress, setProgress] = useState<ModelInitProgress | null>(null);
    const [error, setError] = useState<string | null>(null);

    const aiService = LocalAIService.getInstance();

    useEffect(() => {
        if (aiService.isLLMReady()) {
            setStatus('ready');
        }
    }, []);

    const handleInitialize = async () => {
        setStatus('loading');
        setError(null);
        try {
            await aiService.initializeLLM((p) => {
                setProgress(p);
            });
            setStatus('ready');
        } catch (err: any) {
            setStatus('error');
            setError(err.message || "Failed to load model");
        }
    };

    return (
        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
                <span className="text-emerald-400">●</span> Local AI Status
            </h3>

            <div className="space-y-4">
                {status === 'idle' && (
                    <div className="flex flex-col gap-2">
                        <p className="text-slate-300 text-sm">
                            Download Gemma 2 2B to run AI locally. This requires ~1.4GB of data.
                        </p>
                        <button
                            onClick={handleInitialize}
                            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md transition-colors"
                        >
                            <Download size={18} />
                            Download & Initialize Model
                        </button>
                    </div>
                )}

                {status === 'loading' && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Loader2 size={18} className="animate-spin" />
                            <span className="font-medium">Loading Model...</span>
                        </div>
                        {progress && (
                            <div className="space-y-1">
                                <div className="w-full bg-slate-700 rounded-full h-2.5">
                                    <div
                                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                                        style={{ width: `${progress.progress * 100}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-slate-400 truncate">{progress.text}</p>
                            </div>
                        )}
                    </div>
                )}

                {status === 'ready' && (
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-900/20 p-3 rounded-md border border-emerald-800/50">
                        <Check size={20} />
                        <div>
                            <div>
                                <div>
                                    <p className="font-medium">Model Ready</p>
                                    <p className="text-xs text-emerald-300/80">Gemma 2 2B is active locally.</p>
                                </div>
                            </div>            </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-red-400 bg-red-900/20 p-3 rounded-md border border-red-800/50">
                            <AlertTriangle size={20} />
                            <div>
                                <p className="font-medium">Initialization Failed</p>
                                <p className="text-xs text-red-300/80">{error}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleInitialize}
                            className="text-sm text-slate-400 hover:text-white underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
