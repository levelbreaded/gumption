import { GumptionTree } from '../modules/tree.js';
import { git } from '../modules/git.js';
import {
    isBranchRoot,
    isBranchWithParentBranchName,
} from '../modules/branch/assertions.js';
import { useMemo } from 'react';

export const useBranchNeedsRestackRecord = ({
    tree,
    enabled = true,
}: {
    tree: GumptionTree;
    enabled?: boolean;
}) => {
    return useMemo(() => {
        const record: Record<string, boolean> = {};

        if (!enabled) return record;

        for (const _branch of tree) {
            if (
                isBranchRoot(_branch) ||
                !isBranchWithParentBranchName(_branch)
            ) {
                continue;
            }

            const parentBranchName = _branch.parentBranchName;
            record[_branch.name] = git.needsRebaseOnto({
                branchName: _branch.name,
                ontoBranchName: parentBranchName,
            });
        }

        return record;
    }, [tree]);
};
