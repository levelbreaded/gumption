import GumptionItemComponent from './gumption-item-component.js';
import React, { useCallback, useMemo, useState } from 'react';
import SelectInput from 'ink-select-input';
import { Box, Text, useInput } from 'ink';
import { ConfirmStatement } from './confirm-statement.js';
import { Loading } from './loading.js';
import { useAsyncValue } from '../hooks/use-async-value.js';
import { useGit } from '../hooks/use-git.js';
import { useTree } from '../hooks/use-tree.js';

export const SelectRootBranch = () => {
    const git = useGit();
    const { registerRoot, rootBranchName } = useTree();
    const [search, setSearch] = useState('');
    const [unconfirmedRoot, setUnconfirmedRoot] = useState<string | undefined>(
        undefined
    );

    const getAllBranches = useCallback(async (): Promise<string[]> => {
        const { all } = await git.branchLocal();
        return all;
    }, [git]);

    const { value: allBranches } = useAsyncValue({
        getValue: getAllBranches,
    });

    const handleSelect = (item: { label: string; value: string }) => {
        setUnconfirmedRoot(item.value);
    };

    useInput(
        (input, key) => {
            if (key.backspace || key.delete) {
                // remove final character
                return setSearch((prev) => prev.slice(0, -1));
            }

            setSearch((prev) => `${prev}${input}`);
        },
        {
            isActive: !Boolean(unconfirmedRoot),
        }
    );

    const items = useMemo(() => {
        if (!allBranches) {
            return [];
        }

        const filtered = allBranches.filter((b) =>
            search.length > 0
                ? b.toLowerCase().includes(search.toLowerCase())
                : true
        );
        return filtered.map((b) => ({ label: b, value: b }));
    }, [search, allBranches]);

    if (rootBranchName) {
        return (
            <Text color="green">
                Set <Text bold>{rootBranchName}</Text> as the root branch
            </Text>
        );
    }

    if (!allBranches) {
        return <Loading />;
    }

    if (unconfirmedRoot) {
        return (
            <ConfirmStatement
                statement={
                    <Text bold>
                        Set <Text color="yellow">{unconfirmedRoot}</Text> as the
                        root branch?
                    </Text>
                }
                onAccept={() =>
                    unconfirmedRoot && registerRoot(unconfirmedRoot)
                }
                onDeny={() => {
                    setUnconfirmedRoot(undefined);
                    setSearch('');
                }}
            />
        );
    }

    return (
        <Box flexDirection="column">
            <Text color="yellow">
                Please select a root branch for Gumption before proceeding.
            </Text>
            <Text>
                <Text italic={!search.length}>
                    🔎&nbsp;
                    {search.length ? search : '(type to search)'}
                </Text>
            </Text>
            {items.length ? (
                <SelectInput
                    items={items}
                    itemComponent={GumptionItemComponent}
                    onSelect={handleSelect}
                    limit={10}
                />
            ) : (
                <Text italic>No results</Text>
            )}
        </Box>
    );
};
