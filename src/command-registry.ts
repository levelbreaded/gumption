import Help, { helpConfig } from './commands/help.js';
import Hop, { hopConfig } from './commands/hop.js';
import Sync, { syncConfig } from './commands/sync.js';
import { CommandGroup } from './types.js';

export const REGISTERED_COMMANDS: CommandGroup = {
    _group: {
        name: 'root',
        description: 'Gumption',
    },
    help: {
        component: Help,
        config: helpConfig,
    },
    hop: {
        component: Hop,
        config: hopConfig,
    },
    sync: {
        component: Sync,
        config: syncConfig,
    },
} as const;
