import { BranchState } from './branch/types.js';
import { NoRootBranchError } from '../lib/errors.js';
import {
    assertBranchIsValidOrRoot,
    assertBranchNameExists,
    isBranchNotNone,
    isBranchWithParentBranchName,
} from './branch/assertions.js';
import { getGumptionRootBranchName } from './repo-config.js';
import { git } from './git.js';
import { loadBranch } from './branch/wrapper.js';

export type GumptionTree = Exclude<BranchState, { condition: 'NONE' }>[];
const getTree = (): GumptionTree => {
    const rootBranchName = getGumptionRootBranchName();
    if (!rootBranchName) throw new NoRootBranchError();

    const branchNames = git.getLocalBranchNames();

    return branchNames
        .map((branchName) => loadBranch(branchName))
        .filter((branch) => isBranchNotNone(branch)) as GumptionTree;
};

type TreeChild = Extract<
    BranchState,
    { condition: 'VALID' | 'NO_PARENT_COMMIT_HASH' | 'PARENT_META_MISMATCH' }
>;
const getChildren = ({ branchName }: { branchName: string }): TreeChild[] => {
    assertBranchNameExists(branchName);
    const branch = loadBranch(branchName);
    assertBranchIsValidOrRoot(branch);

    /**
     * @dark - do something smart to not need the as there
     */
    return getTree().filter((_branch) => {
        if (!isBranchWithParentBranchName(_branch)) return false;
        return _branch.parentBranchName === branchName;
    }) as TreeChild[];
};

/**
 * @returns a record mapping every branch name to the names of its child branches in the tree
 */
export const treeToParentChildRecord = (
    tree: GumptionTree
): Record<string, string[]> => {
    const record: Record<string, string[]> = {};

    tree.forEach((branch) => {
        if (!isBranchWithParentBranchName(branch)) return;

        if (!(branch.name in record)) {
            record[branch.name] = [];
        }

        const parentBranchName = branch.parentBranchName;

        if (parentBranchName in record) {
            const existingChildren = record[parentBranchName] as string[];
            record[parentBranchName] = [...existingChildren, branch.name];
        }

        if (!(parentBranchName in record)) {
            record[parentBranchName] = [branch.name];
        }
    });

    return record;
};

export const tree = {
    getTree,
    getChildren,
};
