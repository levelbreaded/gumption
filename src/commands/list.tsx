import React, { useMemo } from 'react';
import { Box, Text } from 'ink';
import { CommandConfig } from '../types.js';
import { Loading } from '../components/loading.js';
import { SelectRootBranch } from '../components/select-root-branch.js';
import { treeToParentChildRecord } from '../utils/tree-helpers.js';
import { useGitHelpers } from '../hooks/use-git-helpers.js';
import { useTree } from '../hooks/use-tree.js';

const colorMap = ['blue', 'red', 'green', 'yellow', 'magenta', 'cyan', 'white'];

const BranchTreeDisplay = ({
    treeParentChildRecord,
    displayedBranchName,
    currentBranch,
    prefix = '',
    isLast = true,
    depth = 0,
}: {
    treeParentChildRecord: Record<string, string[]>;
    displayedBranchName: string;
    currentBranch: string;
    prefix?: string;
    isLast?: boolean;
    depth?: number;
}) => {
    // Misc UNICODE for reference: └ ─ ┘ ┌ ┐ ├ | ● ○
    const connector = depth === 0 ? '   ' : isLast ? '└──' : '├──';
    const color = colorMap[depth % colorMap.length];
    const updatedPrefix = `${prefix}${isLast ? '   ' : '|  '}`;
    const children = treeParentChildRecord?.[displayedBranchName] ?? [];

    return (
        <>
            <Text key={displayedBranchName}>
                {`${prefix}${connector}${currentBranch === displayedBranchName ? '◉' : '○'} `}
                <Text color={color}>{`${displayedBranchName}\n`}</Text>
            </Text>
            {children.map((child) => {
                return (
                    <React.Fragment key={child}>
                        <BranchTreeDisplay
                            treeParentChildRecord={treeParentChildRecord}
                            displayedBranchName={child}
                            currentBranch={currentBranch}
                            prefix={updatedPrefix}
                            isLast={child === children[children.length - 1]}
                            depth={depth + 1}
                        />
                    </React.Fragment>
                );
            })}
        </>
    );
};

export const List = () => {
    const { currentBranch } = useGitHelpers();
    const { get, rootBranchName } = useTree();
    const treeParentChildRecord = useMemo(
        () => treeToParentChildRecord(get()),
        []
    );

    if (!rootBranchName) {
        return <SelectRootBranch />;
    }

    if (currentBranch.isLoading) {
        return <Loading />;
    }

    return (
        <Box flexDirection="column">
            <Text>
                <BranchTreeDisplay
                    treeParentChildRecord={treeParentChildRecord}
                    displayedBranchName={rootBranchName}
                    currentBranch={currentBranch.value}
                />
            </Text>
        </Box>
    );
};

export const listConfig: CommandConfig = {
    description:
        'Print out a tree representation of the current branch structure',
    usage: 'list"',
    key: 'list',
    aliases: ['ls'],
    getProps: () => {
        return {
            valid: true,
            props: {},
        };
    },
};
