import ErrorDisplay from '../../components/error-display.js';
import React, { useCallback } from 'react';
import { Action, useAction } from '../../hooks/use-action.js';
import { CommandConfig, CommandProps } from '../../types.js';
import { Text } from 'ink';
import { useGit } from '../../hooks/use-git.js';

function ChangedAdd({}: CommandProps) {
    const result = useChangesAdd();

    if (result.isError) {
        return <ErrorDisplay error={result.error} />;
    }

    if (result.isLoading) {
        return <Text color="cyan">Loading...</Text>;
    }

    return (
        <Text bold color="green">
            Staged all changes
        </Text>
    );
}

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
