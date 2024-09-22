import React from 'react';
import { Box, Text } from 'ink';
import { type Result } from 'meow';
import { findCommand } from './utils/commands.js';

type Props = {
    readonly cli: Result<any>;
};

export default function App({ cli }: Props) {
    const [_attemptedCommand, ...restOfInput] = cli.input;
    let attemptedCommand = _attemptedCommand?.toLowerCase();
    if (cli.input.length === 0 || !attemptedCommand) {
        attemptedCommand = 'help';
    }

    const command = findCommand({ accessor: attemptedCommand });

    if (!command) {
        return (
            <Text>
                Invalid command: <Text color="red">{attemptedCommand}</Text>
            </Text>
        );
    }

    const { valid, errors } = command.config.validateProps
        ? command.config.validateProps({
              cli,
              input: restOfInput,
          })
        : { valid: true, errors: [] };

    if (!valid) {
        return (
            <Box flexDirection="column">
                <Text>
                    Invalid inputs for command:{' '}
                    <Text color="red">{attemptedCommand}</Text>
                </Text>
                {errors?.map((error) => (
                    <Text key={error}>
                        - <Text color="red">{error}</Text>
                    </Text>
                ))}
            </Box>
        );
    }

    const CommandHandlerComponent = command.component;

    return <CommandHandlerComponent cli={cli} input={restOfInput} />;
}
