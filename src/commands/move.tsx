import React, { useCallback, useState } from 'react';
import SelectInput from 'ink-select-input';
import { Box, Text } from 'ink';
import { CommandConfig } from '../types.js';
import { Loading } from '../components/loading.js';
import { RecursiveRebaser } from '../components/recursive-rebaser.js';
import { SelectRootBranch } from '../components/select-root-branch.js';
import { TreeDisplayItemComponent } from '../components/tree-display-item-component.js';
import {
    TreeDisplayProvider,
    useTreeDisplay,
} from '../contexts/tree-display.context.js';
import { useGit } from '../hooks/use-git.js';
import { useGitHelpers } from '../hooks/use-git-helpers.js';
import { useTree } from '../hooks/use-tree.js';

export const Move = () => {
    const { currentBranch } = useGitHelpers();
    const { rootBranchName } = useTree();

    if (!rootBranchName) {
        return <SelectRootBranch />;
    }

    if (currentBranch.isLoading) {
        return <Loading />;
    }

    return (
        <TreeDisplayProvider>
            <TreeBranchSelector />
        </TreeDisplayProvider>
    );
};

const TreeBranchSelector = () => {
    const git = useGit();
    const { moveOnto } = useTree();
    const { currentBranch } = useGitHelpers();
    const { nodes, isLoading: isLoadingTreeDisplay } = useTreeDisplay();
    const [isFirstRebaseComplete, setIsFirstRebaseComplete] = useState(false);

    const moveCurrentBranchToParent = useCallback(
        async ({
            currentBranchName,
            newParentBranchName,
        }: {
            currentBranchName: string;
            newParentBranchName: string;
        }) => {
            // assign a new parent in the tree and rebase. Do the rebase first since it's more error prone.
            await git.rebaseBranchOnto({
                branch: currentBranchName,
                ontoBranch: newParentBranchName,
            });
            moveOnto({
                branch: currentBranchName,
                parent: newParentBranchName,
            });
        },
        [git, moveOnto]
    );

    if (isLoadingTreeDisplay || currentBranch.isLoading) {
        return <Loading />;
    }

    if (!isFirstRebaseComplete && currentBranch.value) {
        return (
            <Box flexDirection="column">
                <Text color="white" bold>
                    Select the new parent for{' '}
                    <Text color="yellow">{currentBranch.value}</Text>
                </Text>
                <SelectInput
                    items={nodes.map((n) => ({ label: n.name, value: n.name }))}
                    itemComponent={TreeDisplayItemComponent}
                    onSelect={(item) => {
                        if (currentBranch.isLoading) return;

                        void moveCurrentBranchToParent({
                            currentBranchName: currentBranch.value,
                            newParentBranchName: item.value,
                        }).then(() => {
                            setIsFirstRebaseComplete(true);
                        });
                    }}
                    limit={nodes.length}
                />
            </Box>
        );
    }

    return (
        <RecursiveRebaser
            baseBranch={currentBranch.value}
            endBranch={currentBranch.value}
            successStateNode={<Text color="green">Moved successfully</Text>}
        />
    );
};

export const moveConfig: CommandConfig = {
    description:
        'Move the current branch onto a new parent, rebasing it on that new parent accordingly.',
    usage: 'move',
    key: 'move',
    aliases: ['mv'],
    getProps: () => {
        return {
            valid: true,
            props: {},
        };
    },
};
