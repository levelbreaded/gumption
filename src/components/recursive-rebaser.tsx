import ErrorDisplay from './error-display.js';
import React, { ReactNode } from 'react';
import { Box, Text } from 'ink';
import { Loading } from './loading.js';
import {
    RebaseActionLog,
    useRecursiveRebase,
} from '../hooks/use-recursive-rebase.js';
import { RebaseConflict } from './rebase-conflict.js';

export const RecursiveRebaser = ({
    baseBranch,
    successStateNode,
}: {
    baseBranch: string;
    successStateNode: ReactNode;
}) => {
    const result = useRecursiveRebase({ baseBranch });

    if (result.isError) {
        return <ErrorDisplay error={result.error} />;
    }

    if (result.isLoading && !result.logs.length) {
        return <Loading />;
    }

    if (result.hasConflict) {
        return (
            <Box flexDirection="column">
                <Logs logs={result.logs} />
                <RebaseConflict />
            </Box>
        );
    }

    if (result.isComplete) {
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
                const isComplete = action.state === 'COMPLETED';
                return (
                    <Text key={`${action.branch}->${action.ontoBranch}`}>
                        › {isComplete ? 'Rebased' : 'Rebasing'}{' '}
                        <Text color={isComplete ? 'grey' : 'yellow'} bold>
                            {action.branch}
                        </Text>{' '}
                        onto{' '}
                        <Text color={isComplete ? 'grey' : 'yellow'} bold>
                            {action.ontoBranch}
                        </Text>
                    </Text>
                );
            })}
        </Box>
    );
};
