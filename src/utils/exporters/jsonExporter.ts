import { CharacterBuild } from '../../state/slices/types';
import { CharacterExporter, ExportResult } from './types';

export class JsonExporter implements CharacterExporter {
    name = 'Sidonia JSON';
    description = 'Raw character data in JSON format. Useful for backups or custom tools.';

    export(build: CharacterBuild): ExportResult {
        const filename = `${build.profile.name || 'Unnamed_Character'}.json`.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        return {
            filename,
            data: JSON.stringify(build, null, 2),
            mimeType: 'application/json',
        };
    }
}
