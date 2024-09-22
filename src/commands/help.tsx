import React from 'react';
import { Box, Text } from 'ink';
import {
    CommandConfig,
    CommandGroup,
    CommandProps,
    isCommand,
    isCommandGroup,
} from '../types.js';
import { REGISTERED_COMMANDS } from '../command-registry.js';
import { findCommand, findCommandGroup } from '../utils/commands.js';

function Help({ input }: CommandProps) {
    const nonCommandInputs = input.filter((_) => _ !== helpConfig.key);

    if (nonCommandInputs.length === 0 || !nonCommandInputs?.[0]) {
        return <CommandList title={'Help'} group={REGISTERED_COMMANDS} />;
    }

    const commandGroup = findCommandGroup({
        accessor: nonCommandInputs,
        matchAliases: false,
    });

    if (commandGroup) {
        return (
            <CommandList
                title={commandGroup._group.name}
                group={commandGroup}
            />
        );
    }

    const command = findCommand({
        accessor: nonCommandInputs,
        matchAliases: false,
    });

    if (!command) {
        return <Text color="red">Command not found.</Text>;
    }

    return (
        <Box flexDirection="column">
            <Text color="yellow">──── {command.config.key} ────</Text>
            <Text>{command.config.description}</Text>
            <Text>Usage - {command.config.usage}</Text>
        </Box>
    );
}

const CommandList = ({
    title,
    group,
}: {
    title: string;
    group: CommandGroup;
}) => {
    return (
        <Box flexDirection="column">
            <Text color="light">=== {title} ====</Text>
            {Object.entries(group)
                .filter(([_, c]) => isCommand(c) || isCommandGroup(c))
                .map(([name, command]) => (
                    <Text key={name}>
                        {isCommand(command) && (
                            <>
                                <Text color="blue">{name}</Text> -{' '}
                                <Text>{command.config.description}</Text>
                            </>
                        )}
                        {isCommandGroup(command) && (
                            <>
                                <Text color="green">({name})</Text> -{' '}
                                <Text>{command._group.description}</Text>
                            </>
                        )}
                    </Text>
                ))}
        </Box>
    );
};

export const helpConfig: CommandConfig = {
    description:
        'Get help on a specific command or list all available commands',
    usage: 'help | help <COMMAND>',
    key: 'help',
};

export default Help;
