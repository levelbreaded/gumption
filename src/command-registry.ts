import BranchNew, { branchNewConfig } from './commands/branch/new.js';
import ChangesAdd, { changesAddConfig } from './commands/changes/add.js';
import ChangesCommit, {
    changesCommitConfig,
} from './commands/changes/commit.js';
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
            component: ChangesAdd,
            config: changesAddConfig,
        },
        commit: {
            component: ChangesCommit,
            config: changesCommitConfig,
        },
    } as CommandGroup,
    branch: {
        _group: {
            alias: 'b',
            name: 'branch',
            description: 'Commands related to branch management',
        },
        new: {
            component: BranchNew,
            config: branchNewConfig,
        },
    } as CommandGroup,
} as const;
