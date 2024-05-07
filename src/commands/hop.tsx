import ErrorDisplay from '../components/error-display.js';
import GumptionItemComponent from '../components/gumption-item-component.js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SelectInput from 'ink-select-input';
import { Box, Text } from 'ink';
import { CommandProps } from '../command-registry.js';
import { useGit } from '../hooks/use-git.js';

function Hop({ input }: CommandProps) {
    const git = useGit();
    const [allBranches, setAllBranches] = useState<string[]>([]);
    const [currentBranch, setCurrentBranch] = useState<string | undefined>(
        undefined
    );
    const [newBranch, setNewBranch] = useState<string | undefined>(undefined);
    const [error, setError] = useState<Error | undefined>(undefined);

    const [maybeSearchTerm] = input;

    useEffect(() => {
        if (currentBranch) return;
        const getLocalBranches = async () => {
            const { current } = await git.branchLocal();
            setCurrentBranch((prev) => prev ?? current);
        };
        void getLocalBranches();
    }, [git, setCurrentBranch, currentBranch]);

    useEffect(() => {
        const getLocalBranches = async () => {
            const { all } = await git.branchLocal();
            setAllBranches(all);
        };

        void getLocalBranches();
    }, [git, setAllBranches]);

    const handleSelect = useCallback(
        (item: { label: string; value: string }) => {
            const updateCurrentBranch = async () => {
                const { current } = await git.branchLocal();
                setNewBranch(current);
            };

            git.checkout(item.value)
                .then(() => {
                    void updateCurrentBranch();
                })
                .catch((error: Error) => {
                    setError(error);
                });
        },
        [git, setNewBranch, setError]
    );

    const items = useMemo(() => {
        if (!currentBranch) return [];

        if (allBranches.length === 1) {
            return [{ label: currentBranch, value: currentBranch }];
        }

        return allBranches
            .filter((branch) =>
                maybeSearchTerm
                    ? branch
                          .toLowerCase()
                          .includes(maybeSearchTerm.toLowerCase())
                    : true
            )
            .filter((branch) => maybeSearchTerm || branch !== currentBranch)
            .map((branch) => ({
                label: branch,
                value: branch,
            }));
    }, [allBranches, currentBranch]);

    if (error) {
        return <ErrorDisplay error={error} />;
    }

    if (!items.length && maybeSearchTerm) {
        return (
            <Text>
                No branches match the pattern:{' '}
                <Text color="cyan" bold>
                    {maybeSearchTerm}
                </Text>
            </Text>
        );
    }

    if (newBranch) {
        return (
            <Box flexDirection="column">
                <Box gap={1}>
                    <Text dimColor italic color="cyan">
                        {currentBranch}
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

    return (
        <SelectInput
            items={items}
            itemComponent={GumptionItemComponent}
            onSelect={handleSelect}
            limit={10}
        />
    );
}

export const hopConfig = {
    description: 'Hop to other branches',
    usage: 'hop | hop <SEARCH_TERM>',
};

export default Hop;
