import React from 'react';
import {
    CommandConfig,
    CommandProps,
    PropSanitationResult,
    Valid,
} from '../../types.js';
import { Loading } from '../../components/loading.js';
import { Text } from 'ink';
import {
    assertBranchNameExists,
    assertCurrentHasDiff,
} from '../../modules/branch/assertions.js';
import { engine } from '../../modules/engine.js';
import { git } from '../../modules/git.js';
import { safeBranchNameFromCommitMessage } from '../../utils/naming.js';
import { useAction } from '../../hooks/use-action.js';

const BranchNew = (props: CommandProps) => {
    const args = branchNewConfig.getProps(props) as Valid<
        PropSanitationResult<CommandArgs>
    >;
    const { commitMessage } = args.props;

    const result = useAction<{ newBranchName: string }>({
        func: () => {
            const newBranchName =
                safeBranchNameFromCommitMessage(commitMessage);
            const branchBeforeName = git.getCurrentBranchName();
            assertCurrentHasDiff();
            git.createBranch({ branchName: newBranchName });
            assertBranchNameExists(newBranchName);
            git.checkoutBranch(newBranchName);
            git.stageAllChanges();
            git.commit({ message: commitMessage });

            engine.trackBranch({
                branchName: newBranchName,
                parentBranchName: branchBeforeName,
            });

            return { newBranchName };
        },
    });

    if (!result.isComplete) return <Loading />;

    return (
        <Text color="green">
            New branch created - <Text bold>{result.data.newBranchName}</Text>
        </Text>
    );
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
