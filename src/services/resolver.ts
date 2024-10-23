import { Tree } from './tree.js';
import { treeToParentChildRecord } from '../utils/tree-helpers.js';
import { createGitService, DEFAULT_OPTIONS } from './git.js';

export const recursiveRebase = async ({
    tree,
    baseBranch,
    events,
}: {
    tree: Tree;
    baseBranch: string;
    events?: {
        rebased: (rebaseAction: RebaseAction) => void;
        complete: () => void;
    };
}) => {
    const baseBranchNode = tree.find((node) => node.key === baseBranch);

    if (!baseBranchNode) {
        throw new Error();
    }

    const rebasedEventHandler = events?.rebased
        ? events.rebased
        : (_: RebaseAction) => {};

    const completeEventHandler = events?.complete ? events.complete : () => {};

    const git = createGitService({ options: DEFAULT_OPTIONS });
    const record = treeToParentChildRecord(tree);

    const rebaseActions = getRebaseActions({
        parentChildRecord: record,
        baseBranch: baseBranchNode.key,
    });

    for (const rebaseAction of rebaseActions) {
        try {
            await git.rebaseBranchOnto({
                branch: rebaseAction.branch,
                ontoBranch: rebaseAction.ontoBranch,
            });
        } catch (e) {
            console.log(JSON.stringify(e));
            throw e;
        }

        rebasedEventHandler(rebaseAction);
    }

    completeEventHandler();
};

interface RebaseAction {
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
