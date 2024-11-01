import React, { useState } from 'react';
import SelectInput from 'ink-select-input';
import { Box, Text } from 'ink';
import { CommandConfig } from '../types.js';
import { Loading } from '../components/loading.js';
import { SelectRootBranch } from '../components/select-root-branch.js';
import { TreeDisplayItemComponent } from '../components/tree-display-item-component.js';
import {
    TreeDisplayProvider,
    useTreeDisplay,
} from '../contexts/tree-display.context.js';
import { useGit } from '../hooks/use-git.js';
import { useGitHelpers } from '../hooks/use-git-helpers.js';
import { useTree } from '../hooks/use-tree.js';

export const Switch = () => {
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
    const { nodes, isLoading: isLoadingTreeDisplay } = useTreeDisplay();
    const [newBranch, setNewBranch] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    if (newBranch) {
        return (
            <Text>
                Hopped to{' '}
                <Text bold color="green">
                    {newBranch}
                </Text>
            </Text>
        );
    }

    if (isLoadingTreeDisplay || isLoading) {
        return <Loading />;
    }

    return (
        <Box flexDirection="column">
            <Text color="white" bold>
                Select the branch you want to switch to
            </Text>
            <SelectInput
                items={nodes.map((n) => ({ label: n.name, value: n.name }))}
                itemComponent={TreeDisplayItemComponent}
                onSelect={(item) => {
                    setIsLoading(true);
                    void git.checkout(item.value).then(() => {
                        setNewBranch(item.value);
                        setIsLoading(false);
                    });
                }}
                limit={nodes.length}
            />
        </Box>
    );
};

export const switchConfig: CommandConfig = {
    description: 'Switch between branches tracked in the tree',
    usage: 'switch',
    key: 'switch',
    aliases: ['sw'],
    getProps: () => {
        return {
            valid: true,
            props: {},
        };
    },
};
