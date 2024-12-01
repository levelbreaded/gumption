import React, { useState } from 'react';
import SelectInput from 'ink-select-input';
import { Box, Text } from 'ink';
import { CommandConfig } from '../types.js';
import { TreeDisplayItemComponent } from '../components/tree-display-item-component.js';
import {
    TreeDisplayProvider,
    useTreeDisplay,
} from '../contexts/tree-display.context.js';
import { git } from '../modules/git.js';

export const Switch = () => {
    git.assertInWorkTree();

    return (
        <TreeDisplayProvider
            options={{ includeBranchNeedsRebaseRecord: false }}
        >
            <TreeBranchSelector />
        </TreeDisplayProvider>
    );
};

const TreeBranchSelector = () => {
    const { nodes } = useTreeDisplay();
    const [newBranchName, setNewBranchName] = useState<string | undefined>(
        undefined
    );

    if (newBranchName) {
        return (
            <Text>
                Switched to{' '}
                <Text bold color="green">
                    {newBranchName}
                </Text>
            </Text>
        );
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
                    git.assertInWorkTree();
                    git.checkoutBranch(item.value);
                    setNewBranchName(item.value);
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
