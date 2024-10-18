import React, { useMemo } from 'react';
import { Box, Text } from 'ink';
import { CommandConfig } from '../types.js';
import { Tree } from '../services/tree.js';
import { useTree } from '../hooks/use-tree.js';

const colorMap = ['blue', 'red', 'green', 'yellow', 'magenta', 'cyan', 'white'];

/**
 * Function to convert the parent-referential Tree structure to a child-referral structure.
 * @param tree the current tree
 * @returns a map containing nodes and their children
 */
export const getChildMap = (tree: Tree): Map<string, string[]> => {
    const childMap = new Map<string, string[]>();

    tree.forEach(({ key: node, parent }) => {
        if (!childMap.has(node)) {
            childMap.set(node, []);
        }
        if (parent !== null) {
            if (!childMap.has(parent)) {
                childMap.set(parent, []);
            }
            childMap.get(parent)!.push(node);
        }
    });
    return childMap;
};

const getChildMappedTreeString = (
    childMap: Map<string, string[]>,
    currentNode: string,
    prefix: string = '',
    isLast = true,
    depth = 0
) => {
    // Misc UNICODE for reference: └ ─ ┘ ┌ ┐ ├ | ● ○

    const connector = depth === 0 ? '   ' : isLast ? '└──' : '├──';
    const color = colorMap[depth % colorMap.length];

    const currentElement = (
        <Text key={currentNode}>
            {`${prefix}${connector}○ `}
            <Text color={color}>{`${currentNode}\n`}</Text>
        </Text>
    );

    const updatedPrefix = `${prefix}${isLast ? '   ' : '|  '}`;

    const childElements: JSX.Element[] = [];
    const children = childMap.get(currentNode) ?? [];
    const numChildren = children.length;
    children.forEach((child) => {
        const isLastChild = child === children[numChildren - 1];
        const childElement = getChildMappedTreeString(
            childMap,
            child,
            updatedPrefix,
            isLastChild,
            depth + 1
        );
        childElements.push(
            <React.Fragment key={child}>{childElement}</React.Fragment>
        );
    });

    return (
        <>
            {currentElement}
            {childElements}
        </>
    );
};

export const List = () => {
    const { get, getRoot } = useTree();
    const tree = useMemo(() => get(), []);
    const { key: root } = useMemo(() => getRoot(), []);
    const childMap = getChildMap(tree);

    return (
        <Box flexDirection="column">
            <Text>{getChildMappedTreeString(childMap, root)}</Text>
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
