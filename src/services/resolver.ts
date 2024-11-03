import { DEFAULT_OPTIONS, createGitService } from './git.js';
import { Tree } from './tree.js';
import { treeToParentChildRecord } from '../utils/tree-helpers.js';

export const recursiveRebase = async ({
    tree,
    baseBranch,
    endBranch,
    events,
}: {
    tree: Tree;
    baseBranch: string;
    endBranch: string;
    events?: {
        rebased: (
            rebaseAction: RebaseAction,
            state: 'STARTED' | 'COMPLETED'
        ) => void;
        complete: () => void;
    };
}) => {
    const baseBranchNode = tree.find((node) => node.key === baseBranch);

    if (!baseBranchNode) {
        throw new Error(`${baseBranch} is not in the tracked tree.`);
    }

    const rebasedEventHandler = events?.rebased
        ? events.rebased
        : (_: RebaseAction, __: string) => {};

    const completeEventHandler = events?.complete ? events.complete : () => {};

    const git = createGitService({ options: DEFAULT_OPTIONS });
    const record = treeToParentChildRecord(tree);

    const rebaseActions = getRebaseActions({
        parentChildRecord: record,
        baseBranch: baseBranchNode.key,
    });

    for (const rebaseAction of rebaseActions) {
        rebasedEventHandler(rebaseAction, 'STARTED');
        // todo: probably only do this if it's needed though, right?
        await git.rebaseBranchOnto({
            branch: rebaseAction.branch,
            ontoBranch: rebaseAction.ontoBranch,
        });
        rebasedEventHandler(rebaseAction, 'COMPLETED');
    }

    const rootBranchName = tree.find((b) => b.parent === null)?.key;
    await git.checkout(endBranch, { fallbackBranch: rootBranchName });
    completeEventHandler();
};

export interface RebaseAction {
    branch: string;
    ontoBranch: string;
}

export const getRebaseActions = ({
    parentChildRecord,
    baseBranch,
}: {
    parentChildRecord: Record<string, string[]>;
    baseBranch: string;
}) => {
    if (!(baseBranch in parentChildRecord)) {
        return [];
    }

    const rebaseActions: RebaseAction[] = [];

    const children = (parentChildRecord[baseBranch] as string[]).filter(
        (child) => {
            // don't process children that are the same as their parent. This shouldn't ever happen, but causes an infinite loop if it does
            if (child === baseBranch) return false;
            return true;
        }
    );

    // explore the "tree" with a DFS so an entire stack gets resolved before moving on
    children.forEach((child) => {
        rebaseActions.push({
            branch: child,
            ontoBranch: baseBranch,
        });

        rebaseActions.push(
            ...getRebaseActions({
                parentChildRecord,
                baseBranch: child,
            })
        );
    });

    return rebaseActions.filter((action) => {
        if (action.branch === action.ontoBranch) return false;
        return true;
    });
};
