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
import { RecursiveRebaser } from '../../components/recursive-rebaser.js';
import { SelectRootBranch } from '../../components/select-root-branch.js';
import { Text } from 'ink';
import { UntrackedBranch } from '../../components/untracked-branch.js';
import { useGit } from '../../hooks/use-git.js';
import { useGitHelpers } from '../../hooks/use-git-helpers.js';
import { useTree } from '../../hooks/use-tree.js';

const ChangesCommit = (props: CommandProps) => {
    const { currentBranch } = useGitHelpers();
    const { rootBranchName, isCurrentBranchTracked } = useTree();

    if (!rootBranchName) {
        return <SelectRootBranch />;
    }

    if (!isCurrentBranchTracked) {
        return <UntrackedBranch />;
    }

    if (currentBranch.isLoading) {
        return <Loading />;
    }

    return <DoChangesCommit {...props} currentBranch={currentBranch.value} />;
};

const DoChangesCommit = ({
    currentBranch,
    ...props
}: CommandProps & { currentBranch: string }) => {
    const args = changesCommitConfig.getProps(props) as Valid<
        PropSanitationResult<CommandArgs>
    >;

    const result = useChangesCommit({
        message: args.props.message,
    });

    if (result.isError) {
        return <ErrorDisplay error={result.error} />;
    }

    if (result.isLoading) {
        return <Loading />;
    }

    return (
        <RecursiveRebaser
            baseBranch={currentBranch}
            successStateNode={
                <Text color="green">Committed changes successfully</Text>
            }
        />
    );
};

const useChangesCommit = ({ message }: { message: string }): Action => {
    const git = useGit();

    const performAction = useCallback(async () => {
        await git.addAllFiles();
        await git.commit({ message });
    }, []);

    return useAction({
        asyncAction: performAction,
    });
};

interface CommandArgs {
    message: string;
}

export const changesCommitConfig: CommandConfig<CommandArgs> = {
    description: 'Stage and commit all changes.',
    usage: 'changes commit "<message>"',
    key: 'commit',
    aliases: ['c'],
    getProps: (props) => {
        const { input } = props;
        const [, , message] = input;

        if (!message) {
            return {
                valid: false,
                errors: ['Please provide a commit message'],
            };
        }

        return {
            valid: true,
            props: {
                message,
            },
        };
    },
};

export default ChangesCommit;
