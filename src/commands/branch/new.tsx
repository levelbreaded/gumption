import ErrorDisplay from '../../components/error-display.js';
import React, { useCallback } from 'react';
import { Action, useAction } from '../../hooks/use-action.js';
import {
    CommandConfig,
    CommandProps,
    PropSanitationResult,
    Valid,
} from '../../types.js';
import { Loading } from '../../components/loading.js';
import { SelectRootBranch } from '../../components/select-root-branch.js';
import { Text } from 'ink';
import { safeBranchNameFromCommitMessage } from '../../utils/naming.js';
import { useGit } from '../../hooks/use-git.js';
import { useTree } from '../../hooks/use-tree.js';

function BranchNew(props: CommandProps) {
    const args = branchNewConfig.getProps(props) as Valid<
        PropSanitationResult<CommandArgs>
    >;
    const { commitMessage } = args.props;

    const { rootBranchName } = useTree();

    const result = useBranchNew({
        message: commitMessage,
        enabled: Boolean(rootBranchName),
    });

    if (!result.isEnabled) {
        return <SelectRootBranch />;
    }

    if (result.isError) {
        return <ErrorDisplay error={result.error} />;
    }

    if (result.isLoading) {
        return <Loading />;
    }

    return (
        <Text color="green">
            New branch created - <Text bold>{result.branchName}</Text>
        </Text>
    );
}

type UseBranchNewAction = Action & {
    branchName: string;
};

const useBranchNew = ({
    message,
    enabled,
}: {
    message: string;
    enabled: boolean;
}): UseBranchNewAction => {
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
        enabled,
    });

    return {
        isEnabled: action.isEnabled,
        isLoading: action.isLoading,
        isError: action.isError,
        error: action.error,
        branchName,
    } as UseBranchNewAction;
};

interface CommandArgs {
    commitMessage: string;
}

export const branchNewConfig: CommandConfig<CommandArgs> = {
    description:
        'Create a new branch, switch to it, and commit all current changes to it',
    usage: 'branch new "<message>"',
    key: 'new',
    aliases: ['n'],
    getProps: (props) => {
        const { input } = props;
        const [, , message] = input;

        if (!message)
            return {
                valid: false,
                errors: ['Please provide a commit message'],
            };

        return {
            valid: true,
            props: {
                commitMessage: message,
            },
        };
    },
};

export default BranchNew;
