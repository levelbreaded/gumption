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
    changes: {
        _group: {
            alias: 'c',
            name: 'changes',
            description: 'Commands related to staged changes',
        },
        add: {
            component: Sync,
            config: {
                key: 'add',
                aliases: ['a'],
                usage: 'works',
                description: 'yo',
            },
        },
    } as CommandGroup,
} as const;
