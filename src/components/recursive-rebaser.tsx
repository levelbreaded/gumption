import React, { ReactNode } from 'react';
import { Box, Text } from 'ink';
import { Loading } from './loading.js';
import {
    RebaseActionLog,
    useRecursiveRebase,
} from '../modules/recursive-rebase/use-recursive-rebase.js';
import { RebaseConflict } from './rebase-conflict.js';

export const RecursiveRebaser = ({
    baseBranchName,
    endBranchName,
    successStateNode,
}: {
    baseBranchName: string;
    endBranchName?: string;
    successStateNode: ReactNode;
}) => {
    const result = useRecursiveRebase({ baseBranchName, endBranchName });

    if (result.status === 'NOT_STARTED') {
        return <Loading />;
    }

    if (result.status === 'CONFLICT') {
        return (
            <Box flexDirection="column">
                <Logs logs={result.logs} />
                <RebaseConflict />
            </Box>
        );
    }

    if (result.status === 'COMPLETE') {
        return (
            <Box flexDirection="column">
                <Logs logs={result.logs} />
                {successStateNode}
            </Box>
        );
    }

    return <Logs logs={result.logs} />;
};

const Logs = ({ logs }: { logs: RebaseActionLog[] }) => {
    return (
        <Box flexDirection="column">
            {logs.map((action) => {
                if (action.state === 'COMPLETED') {
                    return (
                        <Text
                            key={`${action.branchName}->${action.ontoBranchName}`}
                        >
                            › Rebased{' '}
                            <Text color="grey" bold>
                                {action.branchName}
                            </Text>{' '}
                            onto{' '}
                            <Text color="grey" bold>
                                {action.ontoBranchName}
                            </Text>
                        </Text>
                    );
                }

                if (action.state === 'STARTED') {
                    return (
                        <Text
                            key={`${action.branchName}->${action.ontoBranchName}`}
                        >
                            › Rebasing{' '}
                            <Text color="yellow" bold>
                                {action.branchName}
                            </Text>{' '}
                            onto{' '}
                            <Text color="yellow" bold>
                                {action.ontoBranchName}
                            </Text>
                        </Text>
                    );
                }

                if (action.state === 'SKIPPED') {
                    return (
                        <Text
                            key={`${action.branchName}->${action.ontoBranchName}`}
                        >
                            <Text color="grey" bold>
                                {action.branchName}
                            </Text>{' '}
                            does not need to be rebased onto{' '}
                            <Text color="grey" bold>
                                {action.ontoBranchName}
                            </Text>
                        </Text>
                    );
                }

                return null;
            })}
        </Box>
    );
};
