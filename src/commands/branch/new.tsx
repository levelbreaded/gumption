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
import { UntrackedBranch } from '../../components/untracked-branch.js';
import { safeBranchNameFromCommitMessage } from '../../utils/naming.js';
import { useGit } from '../../hooks/use-git.js';
import { useTree } from '../../hooks/use-tree.js';

const BranchNew = (props: CommandProps) => {
    const { rootBranchName, isCurrentBranchTracked } = useTree();

    if (!rootBranchName) {
        return <SelectRootBranch />;
    }

    if (!isCurrentBranchTracked) {
        return <UntrackedBranch />;
    }

    return <DoBranchNew {...props} />;
};

const DoBranchNew = (props: CommandProps) => {
    const args = branchNewConfig.getProps(props) as Valid<
        PropSanitationResult<CommandArgs>
    >;
    const { commitMessage } = args.props;

    const result = useBranchNew({
        message: commitMessage,
    });

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
};

type UseBranchNewAction = Action & {
    branchName: string;
};

const useBranchNew = ({ message }: { message: string }): UseBranchNewAction => {
    const git = useGit();
    const { attachTo } = useTree();

    const branchName = safeBranchNameFromCommitMessage(message);

    const performGitActions = useCallback(async () => {
        const branchBefore = await git.currentBranch();

        await git.createBranch({ branchName });
        await git.checkout(branchName);
        await git.addAllFiles();
        await git.commit({ message });

        return branchBefore;
    }, [branchName]);

    const performAction = useCallback(async () => {
        await performGitActions().then((prevBranch) => {
            attachTo({ newBranch: branchName, parent: prevBranch });
        });
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
