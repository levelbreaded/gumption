import BranchNew, { branchNewConfig } from './commands/branch/new.js';
import BranchTrack, { branchTrackConfig } from './commands/branch/track.js';
import ChangesAdd, { changesAddConfig } from './commands/changes/add.js';
import ChangesCommit, {
    changesCommitConfig,
} from './commands/changes/commit.js';
import Continue, { continueConfig } from './commands/continue.js';
import Help, { helpConfig } from './commands/help.js';
import Hop, { hopConfig } from './commands/hop.js';
import Sync, { syncConfig } from './commands/sync.js';
import { CommandGroup } from './types.js';
import { List, listConfig } from './commands/list.js';
import { Move, moveConfig } from './commands/move.js';
import { Switch, switchConfig } from './commands/switch.js';

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
    list: {
        component: List,
        config: listConfig,
    },
    switch: {
        component: Switch,
        config: switchConfig,
    },
    move: {
        component: Move,
        config: moveConfig,
    },
    continue: {
        component: Continue,
        config: continueConfig,
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
        track: {
            component: BranchTrack,
            config: branchTrackConfig,
        },
    } as CommandGroup,
} as const;

export const TOP_LEVEL_ALIASES = {
    cc: ['changes', 'commit'],
    bn: ['branch', 'new'],
} satisfies Record<string, string[]>;

export type TopLevelAliasKey = keyof typeof TOP_LEVEL_ALIASES;
