import {Result} from 'meow';
import Help, {helpConfig} from './commands/help.js';
import Sync, {syncConfig} from './commands/sync.js';
import {ComponentType} from 'react';

type ValidateProps<T extends object> = (props: T) => {
	valid: boolean;
	errors?: string[];
};

export type CommandProps = {
	cli: Pick<Result<any>, 'flags' | 'unnormalizedFlags'>;
	input: string[];
};

type CommandConfig = {
	validateProps: ValidateProps<CommandProps>;
};

export type Command = {
	name: string;
	description: string;
	usage: string;
	component: ComponentType<CommandProps>;
	config: CommandConfig;
};

export const REGISTERED_COMMANDS: Record<string, Command> = {
	SYNC: {
		name: 'sync',
		description: 'Sync your local changes with the remote server',
		usage: 'sync',
		component: Sync,
		config: syncConfig,
	},
	HELP: {
		name: 'help',
		description:
			'Get help on a specific command or list all available commands',
		usage: 'help | help <COMMAND>',
		component: Help,
		config: helpConfig,
	},
} as const;

export type RegisteredCommand = keyof typeof REGISTERED_COMMANDS;
