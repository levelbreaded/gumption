import { Box, Text, useInput } from 'ink';
import { useAsyncValue } from '../hooks/use-async-value.js';
import React, { useCallback } from 'react';
import { useGit } from '../hooks/use-git.js';

const TRACK_BRANCH_COMMAND = 'gum branch track';

export const UntrackedBranch = () => {
    const git = useGit();

    const getCurrentBranch = useCallback(async () => {
        return await git.currentBranch();
    }, [git.currentBranch]);

    const { value: currentBranch } = useAsyncValue({
        getValue: getCurrentBranch,
    });

    return (
        <Box flexDirection="column">
            <Text color="red">
                Cannot perform this operation on untracked branch{' '}
                <Text color="yellow">{currentBranch}</Text>.
            </Text>
            <Text color="red">
                You can start tracking it with{' '}
                <Text color="cyan">{TRACK_BRANCH_COMMAND}</Text>.
            </Text>
        </Box>
    );
};
