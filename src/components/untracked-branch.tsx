import React from 'react';
import { Box, Text } from 'ink';
import { git } from '../modules/git.js';

const TRACK_BRANCH_COMMAND = 'gum branch track';

export const UntrackedBranch = () => {
    const currentBranchName = git.getCurrentBranchName();

    return (
        <Box flexDirection="column">
            <Text color="red">
                Cannot perform this operation on untracked branch{' '}
                <Text color="yellow">{currentBranchName}</Text>.
            </Text>
            <Text color="red">
                You can start tracking it with{' '}
                <Text color="cyan">{TRACK_BRANCH_COMMAND}</Text>.
            </Text>
        </Box>
    );
};
