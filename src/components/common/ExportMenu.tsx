import { useState } from 'react';
import { CharacterBuild } from '../../state/slices/types';
import { JsonExporter } from '../../utils/exporters/jsonExporter';
import { FoundryExporter } from '../../utils/exporters/foundryExporter';

interface ExportMenuProps {
    build: CharacterBuild;
}

export function ExportMenu({ build }: ExportMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const exporters = [
        new FoundryExporter(),
        new JsonExporter(),
    ];

    const handleExport = (exporterIndex: number) => {
        const exporter = exporters[exporterIndex];
        const result = exporter.export(build);

        const blob = new Blob([result.data], { type: result.mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setIsOpen(false);
    };

    return (
        <div className="export-menu" style={{ position: 'relative', display: 'inline-block' }}>
            <button
                className="sheet-back-link" // Reusing existing style for consistency, or could be a primary button
                style={{ background: 'var(--accent-color)', color: 'var(--bg-color)', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', marginLeft: '1rem' }}
                onClick={() => setIsOpen(!isOpen)}
            >
                Export Character
            </button>

            {isOpen && (
                <div className="export-dropdown" style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    background: 'var(--surface-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '0.5rem',
                    zIndex: 100,
                    minWidth: '200px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                }}>
                    {exporters.map((exporter, idx) => (
                        <button
                            key={exporter.name}
                            onClick={() => handleExport(idx)}
                            style={{
                                display: 'block',
                                width: '100%',
                                textAlign: 'left',
                                padding: '0.5rem',
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-color)',
                                cursor: 'pointer',
                                borderBottom: idx < exporters.length - 1 ? '1px solid var(--border-color)' : 'none'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                        >
                            <div style={{ fontWeight: 'bold' }}>{exporter.name}</div>
                            <div style={{ fontSize: '0.8em', opacity: 0.7 }}>{exporter.description}</div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
