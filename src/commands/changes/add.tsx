import ErrorDisplay from '../../components/error-display.js';
import React, { useCallback } from 'react';
import { Action, useAction } from '../../hooks/use-action.js';
import { CommandConfig, CommandProps } from '../../types.js';
import { Loading } from '../../components/loading.js';
import { Text } from 'ink';
import { useGit } from '../../hooks/use-git.js';

const ChangedAdd = ({}: CommandProps) => {
    const result = useChangesAdd();

    if (result.isError) {
        return <ErrorDisplay error={result.error} />;
    }

    if (result.isLoading) {
        return <Loading />;
    }

    return (
        <Text bold color="green">
            Staged all changes
        </Text>
    );
};

const useChangesAdd = (): Action => {
    const git = useGit();

    const performAction = useCallback(async () => {
        await git.addAllFiles();
    }, [git]);

    return useAction({
        asyncAction: performAction,
    });
};

export const changesAddConfig: CommandConfig = {
    description: 'Stage all changes.',
    usage: 'changes add',
    key: 'add',
    aliases: ['a'],
    getProps: () => {
        return {
            valid: true,
            props: null,
        };
    },
};

export default ChangedAdd;
