import React from 'react';
import { Box, Text } from 'ink';
import { GumptionErrorBoundary } from './components/gumption-error-boundary.js';
import { type Result } from 'meow';
import { findCommand, getCli } from './utils/commands.js';

type Props = {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    readonly cli: Result<any>;
};

export default function App({ cli: _cli }: Props) {
    const cli = getCli(_cli);

    const sanitizedInput =
        cli.input.length === 0
            ? ['help']
            : cli.input.map((_) => _.toLowerCase());

    const command = findCommand({ accessor: sanitizedInput });

    if (!command) {
        return (
            <Text>
                Invalid command:{' '}
                <Text color="red">{sanitizedInput.join(' ')}</Text>
            </Text>
        );
    }

    const propSanitationResult = command.config.getProps({
        cli,
        input: cli.input,
    });

    if (!propSanitationResult.valid) {
        return (
            <Box flexDirection="column">
                <Text>
                    Invalid inputs for command:{' '}
                    <Text color="red">{sanitizedInput.join(' ')}</Text>
                </Text>
                {propSanitationResult.errors.map((error) => (
                    <Text key={error}>
                        - <Text color="red">{error}</Text>
                    </Text>
                ))}
            </Box>
        );
    }

    const CommandHandlerComponent = command.component;

    return (
        <GumptionErrorBoundary>
            <CommandHandlerComponent cli={cli} input={cli.input} />
        </GumptionErrorBoundary>
    );
}
