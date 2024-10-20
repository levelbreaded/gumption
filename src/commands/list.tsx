import React, { useMemo } from 'react';
import { Box, Text } from 'ink';
import { CommandConfig } from '../types.js';
import { ForegroundColorName } from 'chalk';
import { LiteralUnion } from 'type-fest';
import { Loading } from '../components/loading.js';
import { SelectRootBranch } from '../components/select-root-branch.js';
import { treeToParentChildRecord } from '../utils/tree-helpers.js';
import { useGitHelpers } from '../hooks/use-git-helpers.js';
import { useTree } from '../hooks/use-tree.js';

interface TextStyle {
    color: LiteralUnion<ForegroundColorName, string>;
    dimColor?: boolean;
}

const styleMap: TextStyle[] = [
    { color: 'cyan' },
    { color: 'blue' },
    { color: 'yellow' },
    { color: 'magentaBright' },
    { color: 'green' },
    { color: 'blueBright' },
    { color: 'yellowBright' },
    { color: 'magenta' },
    { color: 'cyanBright' },
];

const DisplayElementText = ({ elements }: { elements: DisplayElement[] }) => {
    return (
        <>
            {elements.map((element, index) => {
                const style = styleMap[index % styleMap.length] as TextStyle;
                return (
                    <Text
                        key={`element-${index}`}
                        color={style.color}
                        dimColor={style.dimColor}
                    >
                        {element.symbols}
                    </Text>
                );
            })}
        </>
    );
};

const Spaces = ({ count }: { count: number }) => {
    return <>{Array(count).fill('  ')}</>;
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

    const nodes = getDisplayNodes({
        record: treeParentChildRecord,
        branchName: rootBranchName,
    });
    const maxWidth = maxWidthFromDisplayNodes({ displayNodes: nodes });

    return (
        <Box flexDirection="column" gap={0}>
            {nodes.map((node) => {
                const style = styleMap[
                    node.prefix.length % styleMap.length
                ] as TextStyle;
                return (
                    <Text key={node.name}>
                        <DisplayElementText
                            elements={[
                                ...node.prefix,
                                {
                                    symbols:
                                        currentBranch.value === node.name
                                            ? '◉'
                                            : '◯',
                                },
                                ...node.suffix,
                            ]}
                        />
                        <Spaces count={maxWidth + 2 - node.width} />
                        <Text color={style.color} dimColor={style.dimColor}>
                            {node.name}{' '}
                            {currentBranch.value === node.name ? '👈' : ''}
                        </Text>
                    </Text>
                );
            })}
        </Box>
    );
};

interface DisplayElement {
    symbols: string;
};

interface DisplayNode {
    prefix: DisplayElement[];
    suffix: DisplayElement[];
    name: string;
    /**
     * How "wide" (in increments of 2 spaces) the row will be. This helps to line up the branch names on the right
     */
    width: number;
};

const getDisplayNodes = ({
    record,
    branchName,
    childIndex = 0,
    parentPrefix = [],
    parentWidth = 0,
    depth = 0,
}: {
    record: Record<string, string[]>;
    branchName: string;
    childIndex?: number;
    parentPrefix?: DisplayElement[];
    parentWidth?: number;
    depth?: number;
}): DisplayNode[] => {
    const prefix = [...parentPrefix, ...prefixFromChildIndex({ childIndex })];
    const children = record[branchName] ?? [];
    const suffix = suffixFromNumChildren({
        numChildren: children.length,
    });

    const widthWithoutChildren = (parentWidth ?? 0) + (childIndex ?? 0);
    const widthFromChildren = children.length > 1 ? children.length - 1 : 0;

    let nodes: DisplayNode[] = [];
    children.forEach((childBranch, index) => {
        const childNodes = getDisplayNodes({
            record,
            branchName: childBranch,
            childIndex: index,
            parentPrefix: prefix,
            parentWidth: widthWithoutChildren,
            depth: depth + 1,
        });
        nodes = [...nodes, ...childNodes];
    });

    nodes = [
        ...nodes,
        {
            prefix,
            suffix,
            name: branchName,
            width: widthWithoutChildren + widthFromChildren,
        },
    ];

    return nodes;
};

const prefixFromChildIndex = ({
    childIndex,
}: {
    childIndex: number;
}): DisplayElement[] => {
    return Array(childIndex)
        .fill(null)
        .map(() => {
            return {
                symbols: '│ ',
            };
        });
};

const suffixFromNumChildren = ({
    numChildren,
}: {
    numChildren: number;
}): DisplayElement[] => {
    if (numChildren < 1) return [] as DisplayElement[];

    const length = numChildren - 1;
    return Array(length)
        .fill(null)
        .map((_, index) => {
            return {
                symbols: index === length - 1 ? '─┘' : '─┴',
            };
        });
};

const maxWidthFromDisplayNodes = ({
    displayNodes,
}: {
    displayNodes: DisplayNode[];
}) => {
    let maxWidth = 0;

    displayNodes.forEach((node) => {
        maxWidth = Math.max(node.width, maxWidth);
    });

    return maxWidth;
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
