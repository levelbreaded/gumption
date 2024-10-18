import React from 'react';
import { Box, Text } from 'ink';
import { Loading } from './loading.js';
import { useGitHelpers } from '../hooks/use-git-helpers.js';

const TRACK_BRANCH_COMMAND = 'gum branch track';

export const UntrackedBranch = () => {
    const { currentBranch } = useGitHelpers();

    if (currentBranch.isLoading) {
        return <Loading />;
    }

    return (
        <Box flexDirection="column">
            <Text color="red">
                Cannot perform this operation on untracked branch{' '}
                <Text color="yellow">{currentBranch.value}</Text>.
            </Text>
            <Text color="red">
                You can start tracking it with{' '}
                <Text color="cyan">{TRACK_BRANCH_COMMAND}</Text>.
            </Text>
        </Box>
    );
};
