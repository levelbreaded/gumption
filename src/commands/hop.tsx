import ErrorDisplay from '../components/error-display.js';
import React, { useCallback, useMemo, useState } from 'react';
import { Box, Text } from 'ink';
import { CommandConfig, CommandProps } from '../types.js';
import { Loading } from '../components/loading.js';
import { SearchSelectInput } from '../components/select-search-input.js';
import { useGit } from '../hooks/use-git.js';
import { useGitHelpers } from '../hooks/use-git-helpers.js';

const Hop = (_: CommandProps) => {
    const git = useGit();

    const { currentBranch, allBranches } = useGitHelpers();

    const [newBranch, setNewBranch] = useState<string | undefined>(undefined);
    const [error, setError] = useState<Error | undefined>(undefined);

    const handleSelect = useCallback(
        (item: { label: string; value: string }) => {
            git.checkout(item.value)
                .then(() => {
                    setNewBranch(item.label);
                })
                .catch((error: Error) => {
                    setError(error);
                });
        },
        [git, setNewBranch, setError]
    );

    const items = useMemo(() => {
        if (currentBranch.isLoading || allBranches.isLoading) return [];

        if (allBranches.value.length === 1) {
            return [{ label: currentBranch.value, value: currentBranch.value }];
        }

        return allBranches.value.map((branch) => ({
            label: branch,
            value: branch,
        }));
    }, [allBranches, currentBranch]);

    if (error) {
        return <ErrorDisplay error={error} />;
    }

    if (currentBranch.isLoading || allBranches.isLoading) {
        return <Loading />;
    }

    if (newBranch) {
        return (
            <Box flexDirection="column">
                <Box gap={1}>
                    <Text dimColor italic color="cyan">
                        {currentBranch.value}
                    </Text>
                    <Text bold>↴</Text>
                </Box>
                <Text>
                    Hopped to{' '}
                    <Text bold color="green">
                        {newBranch}
                    </Text>
                </Text>
            </Box>
        );
    }

    return <SearchSelectInput title="" items={items} onSelect={handleSelect} />;
};

export const hopConfig: CommandConfig = {
    description: 'Hop to other branches',
    usage: 'hop',
    key: 'hop',
    aliases: ['h'],
    getProps: () => {
        return {
            valid: true,
            props: {},
        };
    },
};

export default Hop;
