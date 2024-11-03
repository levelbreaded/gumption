import { Tree } from '../../services/tree.js';
import { useAsyncValueWithDefault } from '../use-async-value.js';
import { useCallback, useMemo } from 'react';
import { useGit } from '../use-git.js';

export const useBranchNeedsRebaseRecord = ({
    currentTree,
}: {
    currentTree: Tree;
}) => {
    const git = useGit();

    const getBranchNeedsRebaseRecord = useCallback(async () => {
        const record: Record<string, boolean> = {};

        for (const _node of currentTree) {
            if (!_node.parent) continue;

            record[_node.key] = await git.needsRebaseOnto({
                branch: _node.key,
                ontoBranch: _node.parent,
            });
        }
        return record;
    }, [currentTree, git.needsRebaseOnto]);

    // We need to memoize the default value to avoid infinite renders
    const defaultValue = useMemo(() => ({}), []);

    return useAsyncValueWithDefault({
        getValue: getBranchNeedsRebaseRecord,
        defaultValue,
    });
};
