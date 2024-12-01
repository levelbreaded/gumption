import React from 'react';
import { Box } from 'ink';
import { CommandConfig } from '../types.js';
import { TreeBranchDisplay } from '../utils/tree-display.js';
import {
    TreeDisplayProvider,
    useTreeDisplay,
} from '../contexts/tree-display.context.js';
import { git } from '../modules/git.js';

export const List = () => {
    return (
        <TreeDisplayProvider options={{ includeBranchNeedsRebaseRecord: true }}>
            <DoList currentBranchName={git.getCurrentBranchName()} />
        </TreeDisplayProvider>
    );
};

const DoList = ({ currentBranchName }: { currentBranchName: string }) => {
    const { nodes, maxWidth, branchNeedsRestackRecord } = useTreeDisplay();
    return (
        <Box flexDirection="column" gap={0}>
            {nodes.map((node) => {
                return (
                    <TreeBranchDisplay
                        key={node.name}
                        node={node}
                        isCurrent={currentBranchName === node.name}
                        maxWidth={maxWidth}
                        needsRestack={
                            branchNeedsRestackRecord[node.name] ?? false
                        }
                        underline={false}
                    />
                );
            })}
        </Box>
    );
};

export const listConfig: CommandConfig = {
    description:
        'Print out a tree representation of the current branch structure',
    usage: 'list',
    key: 'list',
    aliases: ['ls'],
    getProps: () => {
        return {
            valid: true,
            props: {},
        };
    },
};
