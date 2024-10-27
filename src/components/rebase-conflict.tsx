import React from 'react';
import { Box, Text } from 'ink';

export const RebaseConflict = () => {
    return (
        <Box flexDirection="column">
            <Text color="red">Rebase conflict</Text>
            <Text color="yellow">
                1. Please resolve the conflict before proceeding
            </Text>
            <Text color="yellow">
                2. Add all files with <Text color="cyan">gum changes add</Text>
            </Text>
            <Text color="yellow">
                3. Continue the rebase with{' '}
                <Text color="cyan">gum continue</Text>
            </Text>
        </Box>
    );
};
