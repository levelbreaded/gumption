import React from 'react';
import { Box } from 'ink';
import { CommandConfig } from '../types.js';
import { Loading } from '../components/loading.js';
import { SelectRootBranch } from '../components/select-root-branch.js';
import { TreeBranchDisplay } from '../utils/tree-display.js';
import {
    TreeDisplayProvider,
    useTreeDisplay,
} from '../contexts/tree-display.context.js';
import { useGitHelpers } from '../hooks/use-git-helpers.js';
import { useTree } from '../hooks/use-tree.js';

export const List = () => {
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
            <DoList currentBranch={currentBranch.value} />
        </TreeDisplayProvider>
    );
};

const DoList = ({ currentBranch }: { currentBranch: string }) => {
    const { nodes, maxWidth, branchNeedsRebaseRecord } = useTreeDisplay();
    return (
        <Box flexDirection="column" gap={0}>
            {nodes.map((node) => {
                return (
                    <TreeBranchDisplay
                        key={node.name}
                        node={node}
                        isCurrent={currentBranch === node.name}
                        maxWidth={maxWidth}
                        needsRebase={
                            branchNeedsRebaseRecord[node.name] ?? false
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
