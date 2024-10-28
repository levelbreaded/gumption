import React, { useCallback, useState } from 'react';
import { Action, useAction } from './use-action.js';
import { RebaseAction, recursiveRebase } from '../services/resolver.js';
import { useGit } from './use-git.js';
import { useTree } from './use-tree.js';

type UseRecursiveRebaseResult = Action & {
    hasConflict: boolean;
    isComplete: boolean;
    logs: RebaseActionLog[];
};

export type RebaseActionLog = RebaseAction & {
    state: 'STARTED' | 'COMPLETED';
};

export const useRecursiveRebase = ({
    baseBranch,
    endBranch,
}: {
    baseBranch: string;
    endBranch: string;
}): UseRecursiveRebaseResult => {
    const git = useGit();
    const { currentTree } = useTree();

    const [hasConflict, setHasConflict] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [logs, setLogs] = useState<RebaseActionLog[]>([]);

    const performAction = useCallback(async () => {
        try {
            await recursiveRebase({
                tree: currentTree,
                baseBranch: baseBranch,
                endBranch: endBranch,
                events: {
                    rebased: (action, state) => {
                        if (state === 'STARTED') {
                            setLogs((prev) => [
                                ...prev,
                                {
                                    ...action,
                                    state: 'STARTED',
                                },
                            ]);
                            return;
                        }

                        setLogs((prev) => {
                            return prev.map((_action) => {
                                if (_action.state === 'COMPLETED') {
                                    return _action;
                                }

                                if (
                                    _action.branch !== action.branch ||
                                    _action.ontoBranch !== action.ontoBranch
                                ) {
                                    return _action;
                                }

                                return {
                                    ..._action,
                                    state: 'COMPLETED',
                                };
                            });
                        });
                    },
                    complete: () => setIsComplete(true),
                },
            });
        } catch (e) {
            const isRebasing = await git.isRebasing();
            if (!isRebasing) {
                throw e;
            }
            setHasConflict(true);
        }
    }, [currentTree]);

    const action = useAction({
        asyncAction: performAction,
    });

    return {
        ...action,
        hasConflict,
        isComplete,
        logs,
    } as UseRecursiveRebaseResult;
};
