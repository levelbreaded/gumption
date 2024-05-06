import React from 'react';
import {Box, Text} from 'ink';
import {type CommandProps, REGISTERED_COMMANDS} from '../command-registry.js';

function Help({input}: CommandProps) {
	if (input.length === 0) {
		return (
			<Box flexDirection="column">
				<Text color="blue">=== Help ====</Text>
				{Object.entries(REGISTERED_COMMANDS).map(([_commandName, _command]) => (
					<Text key={_commandName}>
						<Text color="blue">[{_commandName}]</Text> -{' '}
						<Text>{_command.config.description}</Text>
					</Text>
				))}
			</Box>
		);
	}

	const [inputCommandName] = input;
	if (!inputCommandName) {
		return <Text color="red">Command not found.</Text>;
	}

	const [commandName, command] = Object.entries(REGISTERED_COMMANDS).find(
		([_commandName, _command]) => _commandName === inputCommandName,
	) ?? [];

	if (!commandName || !command) {
		return <Text color="red">Command not found.</Text>;
	}

	return (
		<Box flexDirection="column">
			<Text color="blue">==== Help ===</Text>
			<Text color="yellow">──── {commandName} ────</Text>
			<Text>{command.config.description}</Text>
			<Text>Usage - {command.config.usage}</Text>
		</Box>
	);
}

export const helpConfig = {
	description: 'Get help on a specific command or list all available commands',
	usage: 'help | help <COMMAND>',
	validateProps({cli, input}: CommandProps) {
		console.log({cli, input});
		return {
			valid: true,
			errors: [],
		};
	},
};

export default Help;
