import React from 'react';
import {Text, Box} from 'ink';
import {REGISTERED_COMMANDS, RegisteredCommand} from './command-registry.js';
import {Result} from 'meow';

type Props = {
	readonly cli: Result<any>;
};

export default function App({cli}: Props) {
	const [_attemptedCommand, ...restOfInput] = cli.input;
	let attemptedCommand = _attemptedCommand?.toLowerCase();
	if (!cli.input.length) {
		attemptedCommand = 'help';
	}

	const selectedCommand = Object.keys(REGISTERED_COMMANDS).find(
		(registeredCommand: string) =>
			attemptedCommand ===
			REGISTERED_COMMANDS[registeredCommand as RegisteredCommand]?.name,
	) as RegisteredCommand | undefined;

	if (selectedCommand === undefined) {
		return (
			<Text>
				Invalid command: <Text color="red">{attemptedCommand}</Text>
			</Text>
		);
	}

	const command = REGISTERED_COMMANDS[selectedCommand];
	const CommandHandlerComponent = command?.component;

	if (!command || !CommandHandlerComponent) {
		return (
			<Text>
				It seems we have not configured the command: {attemptedCommand}. Please
				try again later.
			</Text>
		);
	}

	const {valid, errors} = command.config.validateProps({
		cli,
		input: restOfInput,
	});

	if (!valid) {
		return (
			<Box flexDirection="column">
				<Text>
					Invalid inputs for command:{' '}
					<Text color="red">{attemptedCommand}</Text>
				</Text>
				{errors?.map((error, idx) => (
					<Text key={`error-${idx}`}>
						- <Text color="red">{error}</Text>
					</Text>
				))}
			</Box>
		);
	}

	return <CommandHandlerComponent cli={cli} input={restOfInput} />;
}
