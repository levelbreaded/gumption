import Help, { helpConfig } from './commands/help.js';
import Hop, { hopConfig } from './commands/hop.js';
import Sync, { syncConfig } from './commands/sync.js';
import { Command } from './types.js';

export const REGISTERED_COMMANDS: Record<string, Command> = {
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
