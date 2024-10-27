import ErrorDisplay from '../components/error-display.js';
import React, { useCallback, useState } from 'react';
import { Action, useAction } from '../hooks/use-action.js';
import { CommandConfig, CommandProps } from '../types.js';
import { Loading } from '../components/loading.js';
import { Text } from 'ink';
import { useGit } from '../hooks/use-git.js';

const Continue = (_: CommandProps) => {
    const result = useRebaseContinue();

    if (result.isError) {
        return <ErrorDisplay error={result.error} />;
    }

    if (result.isLoading) {
        return <Loading />;
    }

    if (!result.isRebaseInProgress) {
        return <Text color="yellow">No ongoing rebase found.</Text>;
    }

    return null;
};

type UseRebaseContinueResult = Action & {
    isRebaseInProgress: boolean;
};
const useRebaseContinue = (): UseRebaseContinueResult => {
    const git = useGit();
    // assume a rebase is in action when this is called until proven otherwise
    const [isRebaseInProgress, setIsRebaseInProgress] = useState(true);

    const performAction = useCallback(async () => {
        const isRebasing = await git.isRebasing();
        if (!isRebasing) {
            setIsRebaseInProgress(false);
            return;
        }

        await git.rebaseContinue();
    }, [git]);

    const action = useAction({
        asyncAction: performAction,
    });

    return {
        ...action,
        isRebaseInProgress,
    } as UseRebaseContinueResult;
};

export const continueConfig: CommandConfig = {
    description: 'Continues a rebase',
    usage: 'continue',
    key: 'continue',
    getProps: () => {
        return {
            valid: true,
            props: {},
        };
    },
};

export default Continue;
