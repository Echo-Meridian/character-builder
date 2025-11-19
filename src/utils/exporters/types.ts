import { CharacterBuild } from '../../state/slices/types';

export interface ExportResult {
    filename: string;
    data: string; // Serialized data (JSON, XML, etc.)
    mimeType: string;
}

export interface CharacterExporter {
    name: string;
    description: string;
    export(build: CharacterBuild): ExportResult;
}
