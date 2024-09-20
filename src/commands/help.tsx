import React from 'react';
import { Box, Text } from 'ink';
import { CommandConfig, CommandProps } from '../types.js';
import { REGISTERED_COMMANDS } from '../command-registry.js';
import { findCommand } from '../utils/commands.js';

function Help({ input }: CommandProps) {
    if (input.length === 0 || !input[0]) {
        return (
            <Box flexDirection="column">
                <Text color="blue">=== Help ====</Text>
                {Object.entries(REGISTERED_COMMANDS).map(([name, command]) => (
                    <Text key={name}>
                        <Text color="blue">[{name}]</Text> -{' '}
                        <Text>{command.config.description}</Text>
                    </Text>
                ))}
            </Box>
        );
    }

    const command = findCommand({
        accessor: input[0],
        matchAliases: false,
    });

    if (!command) {
        return <Text color="red">Command not found.</Text>;
    }

    return (
        <Box flexDirection="column">
            <Text color="blue">==== Help ===</Text>
            <Text color="yellow">──── {command.config.key} ────</Text>
            <Text>{command.config.description}</Text>
            <Text>Usage - {command.config.usage}</Text>
        </Box>
    );
}

export const helpConfig: CommandConfig = {
    description:
        'Get help on a specific command or list all available commands',
    usage: 'help | help <COMMAND>',
    key: 'help',
};

export default Help;
