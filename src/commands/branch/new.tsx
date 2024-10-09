import ErrorDisplay from '../../components/error-display.js';
import React, { useCallback } from 'react';
import { Action, useAction } from '../../hooks/use-action.js';
import { CommandConfig, CommandProps } from '../../types.js';
import { Text } from 'ink';
import { safeBranchNameFromCommitMessage } from '../../utils/naming.js';
import { useGit } from '../../hooks/use-git.js';

function BranchNew({ input }: CommandProps) {
    const [, , message] = input;
    // todo: refactor to a sanitize input pattern
    const result = useBranchNew({ message: message! });

    if (result.isError) {
        return <ErrorDisplay error={result.error} />;
    }

    if (result.isLoading) {
        return <Text color="cyan">Loading...</Text>;
    }

    return (
        <Text bold color="green">
            New branch created - {result.branchName}
        </Text>
    );
}

type UseBranchNewAction = Action & {
    branchName: string;
};

const useBranchNew = ({ message }: { message: string }): UseBranchNewAction => {
    const git = useGit();

    const branchName = safeBranchNameFromCommitMessage(message);

    const performAction = useCallback(async () => {
        await git.createBranch({ branchName });
        await git.checkout(branchName);
        await git.addAllFiles();
        await git.commit({ message });
    }, [branchName]);

    const action = useAction({
        asyncAction: performAction,
    });

    return {
        isLoading: action.isLoading,
        isError: action.isError,
        error: action.error,
        branchName,
    } as UseBranchNewAction;
};


export const branchNewConfig: CommandConfig = {
    description:
        'Create a new branch, switch to it, and commit all current changes to it',
    usage: 'branch new "<message>"',
    key: 'new',
    aliases: ['n'],
    validateProps: (props) => {
        const { input } = props;
        const [, , message] = input;

        if (!message)
            return {
                valid: false,
                errors: ['Please provide a commit message'],
            };

        return { valid: true };
    },
};

export default BranchNew;
