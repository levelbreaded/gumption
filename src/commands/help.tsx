import React from 'react';
import {Box, Text} from 'ink';
import {type CommandProps, REGISTERED_COMMANDS} from '../command-registry.js';

function Help({input}: CommandProps) {
	if (input.length === 0) {
		return (
			<Box flexDirection="column">
				<Text color="blue">=== Help ====</Text>
				{Object.values(REGISTERED_COMMANDS).map(command => (
					<Text key={command.name}>
						<Text color="blue">[{command.name}]</Text> -{' '}
						<Text>{command.description}</Text>
					</Text>
				))}
			</Box>
		);
	}

	const [commandName] = input;
	if (!commandName) {
		return <Text color="red">Command not found.</Text>;
	}

	const command = Object.values(REGISTERED_COMMANDS).find(
		command => command.name === commandName,
	);
	if (!command) {
		return <Text color="red">Command not found.</Text>;
	}

	return (
		<Box flexDirection="column">
			<Text color="blue">==== Help ===</Text>
			<Text color="yellow">──── {command.name} ────</Text>
			<Text>{command.description}</Text>
			<Text>Usage - {command.usage}</Text>
		</Box>
	);
}

export const helpConfig = {
	validateProps({cli, input}: CommandProps) {
		console.log({cli, input});
		return {
			valid: true,
			errors: [],
		};
	},
};

export default Help;
