import { ComponentType } from 'react';
import { Result } from 'meow';

export type ValidateProps<T extends Record<string, unknown>> = (
    props: T
) => PropValidationResult;

export type PropValidationResult =
    | {
          valid: true;
      }
    | { valid: false; errors: string[] };

export interface CommandProps extends Record<string, unknown> {
    cli: Pick<Result<any>, 'flags' | 'unnormalizedFlags'>;
    input: string[];
}

export interface CommandConfig {
    description: string;
    usage: string;

    /**
     * This property is included here as a convenience.
     * The key in REGISTERED_COMMANDS should always match, so it's technically redundant here.
     */
    key: string;

    /**
     * Aliases are not "top-level".
     * For example, if you had a group called "group" with alias "g" & a command called "test" in it with aliases: ["t"]
     * you can access this command with "gum g t", not "gum gt".
     *
     * Note that "gum group t" and "gum g test" would also work.
     */
    aliases?: string[];
    validateProps?: ValidateProps<CommandProps>;
}

export interface Command {
    component: ComponentType<CommandProps>;
    config: CommandConfig;
}

export interface CommandGroup
    extends Record<string, Command | CommandGroup | CommandGroupConfig> {
    _group: CommandGroupConfig;
}

export interface CommandGroupConfig {
    alias?: string;
    description: string;
    name: string;
}

export const isCommand = (
    commandOrCommandGroup: Command | CommandGroup | CommandGroupConfig
): commandOrCommandGroup is Command => {
    return (
        commandOrCommandGroup.hasOwnProperty('component') &&
        commandOrCommandGroup.hasOwnProperty('config')
    );
};

export const isCommandGroupConfig = (
    commandOrCommandGroup: Command | CommandGroup | CommandGroupConfig
): commandOrCommandGroup is CommandGroupConfig => {
    return commandOrCommandGroup.hasOwnProperty('alias');
};

export const isCommandGroup = (
    commandOrCommandGroup: Command | CommandGroup | CommandGroupConfig
): commandOrCommandGroup is CommandGroup => {
    return commandOrCommandGroup.hasOwnProperty('_group');
};
