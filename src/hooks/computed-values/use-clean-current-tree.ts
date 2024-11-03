import { Tree } from '../../services/tree.js';
import { useAsyncValueWithDefault } from '../use-async-value.js';
import { useCallback, useMemo } from 'react';
import { useGit } from '../use-git.js';
import { useTree } from '../use-tree.js';

/**
 * The "cleaned" tree is the current tree without the branches that don't exist locally.
 */
export const useCleanCurrentTree = () => {
    const git = useGit();
    const { currentTree: uncleanCurrentTree, removeBranch } = useTree();

    const getCleanCurrentTree = useCallback(async () => {
        const cleanTree: Tree = [];
        for (const _node of uncleanCurrentTree) {
            const branchExistsLocally = await git.branchExistsLocally(
                _node.key
            );

            if (branchExistsLocally) cleanTree.push(_node);
            else removeBranch(_node.key, { ignoreBranchDoesNotExist: true });
        }
        return cleanTree;
    }, [uncleanCurrentTree, git.branchExistsLocally, removeBranch]);

    // We need to memoize the default value to avoid infinite renders
    const defaultValue = useMemo(() => [], []);

    return useAsyncValueWithDefault({
        getValue: getCleanCurrentTree,
        defaultValue,
    });
};
