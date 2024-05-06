import Help, { helpConfig } from './commands/help.js';
import Hop, { hopConfig } from './commands/hop.js';
import Sync, { syncConfig } from './commands/sync.js';
import { type ComponentType } from 'react';
import { type Result } from 'meow';

type ValidateProps<T extends Record<string, unknown>> = (props: T) => {
    valid: boolean;
    errors?: string[];
};

export type CommandProps = {
    cli: Pick<Result<any>, 'flags' | 'unnormalizedFlags'>;
    input: string[];
};

type CommandConfig = {
    description: string;
    usage: string;
    validateProps?: ValidateProps<CommandProps>;
};

export type Command = {
    component: ComponentType<CommandProps>;
    config: CommandConfig;
};

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

export type RegisteredCommand = keyof typeof REGISTERED_COMMANDS;
