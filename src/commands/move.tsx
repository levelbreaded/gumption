import React, { useState } from 'react';
import SelectInput from 'ink-select-input';
import { Box, Text } from 'ink';
import { CommandConfig } from '../types.js';
import { RecursiveRebaser } from '../components/recursive-rebaser.js';
import { TreeDisplayItemComponent } from '../components/tree-display-item-component.js';
import {
    TreeDisplayProvider,
    useTreeDisplay,
} from '../contexts/tree-display.context.js';
import {
    assertBranchIsNotNone,
    assertBranchIsValidAndNotRoot,
} from '../modules/branch/assertions.js';
import { engine } from '../modules/engine.js';
import { git } from '../modules/git.js';
import { loadBranch } from '../modules/branch/wrapper.js';

export const Move = () => {
    return (
        <TreeDisplayProvider>
            <TreeBranchSelector />
        </TreeDisplayProvider>
    );
};

const TreeBranchSelector = () => {
    const { nodes } = useTreeDisplay();
    const [isFirstRebaseComplete, setIsFirstRebaseComplete] = useState(false);
    const currentBranchName = git.getCurrentBranchName();

    if (!isFirstRebaseComplete) {
        return (
            <Box flexDirection="column">
                <Text color="white" bold>
                    Select the new parent for{' '}
                    <Text color="yellow">{currentBranchName}</Text>
                </Text>
                <SelectInput
                    items={nodes.map((n) => ({ label: n.name, value: n.name }))}
                    itemComponent={TreeDisplayItemComponent}
                    onSelect={(item) => {
                        const currentBranch = loadBranch(currentBranchName);
                        assertBranchIsValidAndNotRoot(currentBranch);

                        const newParentBranch = loadBranch(item.value);
                        assertBranchIsNotNone(newParentBranch);

                        engine.trackedRebase({
                            branch: currentBranch,
                            ontoBranch: newParentBranch,
                        });

                        setIsFirstRebaseComplete(true);
                    }}
                    limit={nodes.length}
                />
            </Box>
        );
    }

    return (
        <RecursiveRebaser
            baseBranchName={currentBranchName}
            endBranchName={currentBranchName}
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
