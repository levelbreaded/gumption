import { ComponentType } from 'react';
import { Result } from 'meow';

export type AsyncResult<T> =
    | { value: T; isLoading: false }
    | { value: undefined; isLoading: true };

export type SanitizeProps<
    T extends Record<string, unknown>,
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    K extends object = any,
> = (props: T) => PropSanitationResult<K>;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type PropSanitationResult<K extends object = any> =
    | {
          valid: true;
          props: K;
      }
    | { valid: false; errors: string[] };

export type Valid<T extends PropSanitationResult> = T extends { valid: true }
    ? T
    : never;

export interface CommandProps extends Record<string, unknown> {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    cli: Pick<Result<any>, 'flags' | 'unnormalizedFlags'>;
    input: string[];
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export interface CommandConfig<K extends object = any> {
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
    getProps: SanitizeProps<CommandProps, K>;
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
