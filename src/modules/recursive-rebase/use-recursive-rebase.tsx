import { RebaseAction, recursiveRebase } from './recursive-rebase.js';
import { git } from '../git.js';
import { tree } from '../tree.js';
import { useEffect, useState } from 'react';

type UseRecursiveRebaseResult = {
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'CONFLICT' | 'COMPLETE';
    logs: RebaseActionLog[];
};

export type RebaseActionLog = RebaseAction & {
    state: 'STARTED' | 'COMPLETED' | 'SKIPPED';
};

export const useRecursiveRebase = ({
    baseBranchName,
    endBranchName,
}: {
    baseBranchName: string;
    endBranchName?: string;
}): UseRecursiveRebaseResult => {
    const [state, setState] = useState<{
        status: UseRecursiveRebaseResult['status'];
    }>({ status: 'NOT_STARTED' });
    const [logs, setLogs] = useState<RebaseActionLog[]>([]);

    useEffect(() => {
        try {
            recursiveRebase({
                tree: tree.getTree(),
                baseBranchName,
                endBranchName,
                events: {
                    rebased: (action, state) => {
                        setState({ status: 'IN_PROGRESS' });

                        if (state === 'SKIPPED') {
                            setLogs((prev) => [
                                ...prev,
                                {
                                    ...action,
                                    state: 'SKIPPED',
                                },
                            ]);
                            return;
                        }

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
                                    _action.branchName !== action.branchName ||
                                    _action.ontoBranchName !==
                                        action.ontoBranchName
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
                    complete: () => setState({ status: 'COMPLETE' }),
                },
            });
        } catch (e) {
            if ((e as Error).name === 'RebaseConflictError') {
                setState({ status: 'CONFLICT' });
            } else {
                throw e;
            }
        }
    }, []);

    return {
        status: state.status,
        logs,
    } as UseRecursiveRebaseResult;
};
