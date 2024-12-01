import { GumptionTree, treeToParentChildRecord } from '../tree.js';
import {
    assertBranchCanBeRebased,
    assertBranchIsValidOrRoot,
} from '../branch/assertions.js';
import { engine } from '../engine.js';
import { getGumptionRootBranchName } from '../repo-config.js';
import { git } from '../git.js';
import { loadBranch } from '../branch/wrapper.js';

export interface RebaseAction {
    branchName: string;
    ontoBranchName: string;
}

export const getRebaseActions = ({
    parentChildRecord,
    baseBranchName,
}: {
    parentChildRecord: Record<string, string[]>;
    baseBranchName: string;
}) => {
    if (!(baseBranchName in parentChildRecord)) {
        return [];
    }

    const rebaseActions: RebaseAction[] = [];

    const children = (parentChildRecord[baseBranchName] as string[]).filter(
        (child) => {
            /**
             * Don't process children that are the same as their parent.
             * This shouldn't ever happen, but causes an infinite loop if it does
             */
            if (child === baseBranchName) return false;
            return true;
        }
    );

    // explore the tree with a DFS so an entire stack gets resolved before moving on
    children.forEach((child) => {
        rebaseActions.push({
            branchName: child,
            ontoBranchName: baseBranchName,
        });

        rebaseActions.push(
            ...getRebaseActions({
                parentChildRecord,
                baseBranchName: child,
            })
        );
    });

    return rebaseActions.filter((action) => {
        if (action.branchName === action.ontoBranchName) return false;
        return true;
    });
};

export const recursiveRebase = ({
    tree,
    baseBranchName,
    endBranchName,
    events,
}: {
    tree: GumptionTree;
    baseBranchName: string;
    endBranchName?: string;
    events?: {
        rebased: (
            rebaseAction: RebaseAction,
            state: 'STARTED' | 'COMPLETED' | 'SKIPPED'
        ) => void;
        complete: () => void;
    };
}) => {
    const baseBranch_ = tree.find((branch) => branch.name === baseBranchName);
    if (!baseBranch_) {
        throw new Error(`${baseBranchName} is not in the tracked tree.`);
    }

    const rebasedEventHandler = events?.rebased
        ? events.rebased
        : (_: RebaseAction, __: string) => {};

    const completeEventHandler = events?.complete ? events.complete : () => {};

    const record = treeToParentChildRecord(tree);
    const rebaseActions = getRebaseActions({
        parentChildRecord: record,
        baseBranchName: baseBranch_.name,
    });

    for (const rebaseAction of rebaseActions) {
        if (
            !git.needsRebaseOnto({
                branchName: rebaseAction.branchName,
                ontoBranchName: rebaseAction.ontoBranchName,
            })
        ) {
            rebasedEventHandler(rebaseAction, 'SKIPPED');
            continue;
        }

        rebasedEventHandler(rebaseAction, 'STARTED');
        const _branch = loadBranch(rebaseAction.branchName);
        assertBranchCanBeRebased(_branch);

        const _newParentBranch = loadBranch(rebaseAction.ontoBranchName);
        assertBranchIsValidOrRoot(_newParentBranch);

        engine.trackedRebase({
            branch: _branch,
            ontoBranch: _newParentBranch,
        });
        rebasedEventHandler(rebaseAction, 'COMPLETED');
    }

    if (endBranchName) {
        try {
            git.checkoutBranch(endBranchName);
        } catch (e) {
            if ((e as Error).name !== 'NoBranchError') {
                throw e;
            }
            const rootBranchName = getGumptionRootBranchName();
            if (rootBranchName) {
                git.checkoutBranch(rootBranchName);
            }
        }
    }

    completeEventHandler();
};
