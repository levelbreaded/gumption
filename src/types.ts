import { ComponentType } from 'react';
import { Result } from 'meow';

type ValidateProps<T extends Record<string, unknown>> = (props: T) => {
    valid: boolean;
    errors?: string[];
};

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
    aliases?: string[];
    validateProps?: ValidateProps<CommandProps>;
}

export interface Command {
    component: ComponentType<CommandProps>;
    config: CommandConfig;
}
