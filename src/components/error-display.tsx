import React from 'react';
import { Box, Text } from 'ink';

type ErrorProps = {
    readonly error: Error;
};

function ErrorDisplay({ error }: ErrorProps) {
    return (
        <Box flexDirection="column">
            <Text color="yellow">
                Yikes, it seems something went wrong. Please try again or
                contact us if the issue persists.
            </Text>
            <Text color="red">{error.message}</Text>
        </Box>
    );
}

export default ErrorDisplay;
