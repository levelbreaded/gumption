import React, { useCallback, useMemo, useState } from 'react';
import { CommandConfig, CommandProps } from '../../types.js';
import { Loading } from '../../components/loading.js';
import { SearchSelectInput } from '../../components/select-search-input.js';
import { SelectRootBranch } from '../../components/select-root-branch.js';
import { Text } from 'ink';
import { useGitHelpers } from '../../hooks/use-git-helpers.js';
import { useTree } from '../../hooks/use-tree.js';

function BranchTrack(_: CommandProps) {
    const { allBranches, currentBranch } = useGitHelpers();
    const {
        rootBranchName,
        isCurrentBranchTracked,
        attachTo,
        isLoading,
        currentTree,
    } = useTree();

    // either false or the name of the parent branch
    const [complete, setComplete] = useState<false | string>(false);

    const trackBranch = useCallback(
        ({ parentBranch }: { parentBranch: string }) => {
            if (currentBranch.isLoading) return;
            attachTo({ newBranch: currentBranch.value, parent: parentBranch });
            setComplete(parentBranch);
        },
        [attachTo, currentBranch.value, currentBranch.isLoading]
    );

    const branchItems = useMemo(() => {
        if (allBranches.isLoading) return [];
        // only branches in the tree already can be selected as the parent in this case
        const branchesInTree = allBranches.value.filter((b) => {
            return Boolean(currentTree.find((node) => node.key === b));
        });
        return branchesInTree.map((b) => ({ label: b, value: b }));
    }, [allBranches.value, allBranches.isLoading, currentTree]);

    if (isLoading || currentBranch.isLoading || allBranches.isLoading) {
        return <Loading />;
    }

    if (!rootBranchName) {
        return <SelectRootBranch />;
    }

    if (complete) {
        return (
            <Text>
                <Text color="green" bold>
                    {currentBranch.value}
                </Text>{' '}
                tracked with parent{' '}
                <Text color="yellow" bold>
                    {complete}
                </Text>
                !
            </Text>
        );
    }

    if (isCurrentBranchTracked) {
        return (
            <Text>
                <Text color="green" bold>
                    {currentBranch.value}
                </Text>{' '}
                is already a tracked branch
            </Text>
        );
    }

    return (
        <SearchSelectInput
            title="Please select a parent branch"
            items={branchItems}
            onSelect={(item) => trackBranch({ parentBranch: item.value })}
        />
    );
}

export const branchTrackConfig: CommandConfig = {
    description: 'Track a branch',
    usage: 'branch track',
    key: 'track',
    aliases: ['t'],
    getProps: (_) => {
        return {
            valid: true,
            props: {},
        };
    },
};

export default BranchTrack;
