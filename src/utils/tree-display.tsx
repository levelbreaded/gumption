import React from 'react';
import { ForegroundColorName } from 'chalk';
import { LiteralUnion } from 'type-fest';
import { Text } from 'ink';

export const TreeBranchDisplay = ({
    node,
    isCurrent,
    maxWidth,
    needsRestack,
    underline,
}: {
    node: DisplayNode;
    isCurrent: boolean;
    maxWidth: number;
    needsRestack: boolean;
    underline: boolean;
}) => {
    const style = styleMap[node.prefix.length % styleMap.length] as TextStyle;

    return (
        <Text key={node.name} underline={underline}>
            <DisplayElementText
                elements={[
                    ...node.prefix,
                    {
                        symbols: `${isCurrent ? '⊗' : '◯'}${node.suffix.length ? '─' : ''}`,
                    },
                    ...node.suffix,
                ]}
            />
            <Spaces count={maxWidth - node.width + (isCurrent ? 0 : 2)} />
            <Text color={style.color} dimColor={style.dimColor}>
                {isCurrent ? ' 👉 ' : ''}
                {node.name}{' '}
                {needsRestack && <Text color="white">(Needs restack)</Text>}
            </Text>
        </Text>
    );
};

interface DisplayElement {
    symbols: string;
}

export interface DisplayNode {
    prefix: DisplayElement[];
    suffix: DisplayElement[];
    name: string;
    /**
     * How "wide" (in increments of 2 spaces) the row will be. This helps to line up the branch names on the right
     */
    width: number;
}

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

export const getDisplayNodes = ({
    treeParentChildRecord,
    branchName,
    childIndex = 0,
    parentPrefix = [],
    parentWidth = 0,
    depth = 0,
}: {
    treeParentChildRecord: Record<string, string[]>;
    branchName: string;
    childIndex?: number;
    parentPrefix?: DisplayElement[];
    parentWidth?: number;
    depth?: number;
}): DisplayNode[] => {
    const prefix = [...parentPrefix, ...prefixFromChildIndex({ childIndex })];
    const children = treeParentChildRecord[branchName] ?? [];
    const suffix = suffixFromNumChildren({
        numChildren: children.length,
    });

    const widthWithoutChildren = (parentWidth ?? 0) + (childIndex ?? 0);
    const widthFromChildren = children.length > 1 ? children.length - 1 : 0;

    let nodes: DisplayNode[] = [];
    children.forEach((childBranch, index) => {
        const childNodes = getDisplayNodes({
            treeParentChildRecord,
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
            if (index === length - 1) return { symbols: '┘' };
            if (index === 0) return { symbols: '┴─' };
            return { symbols: '┴─' };
        });
};

export const maxWidthFromDisplayNodes = ({
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
