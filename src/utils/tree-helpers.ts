import { Tree } from '../services/tree.js';

/**
 * @returns a record mapping every branch name to the names of its child branches in the tree
 */
export const treeToParentChildRecord = (
    tree: Tree
): Record<string, string[]> => {
    const record: Record<string, string[]> = {};

    tree.forEach((node) => {
        if (!(node.key in record)) {
            record[node.key] = [];
        }

        if (node.parent === null) return;

        if (node.parent in record) {
            const existingChildren = record[node.parent] as string[];
            record[node.parent] = [...existingChildren, node.key];
        }
        if (!(node.parent in record)) {
            record[node.parent] = [];
        }
    });

    return record;
};
