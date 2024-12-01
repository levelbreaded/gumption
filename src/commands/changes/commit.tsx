import React from 'react';
import {
    CommandConfig,
    CommandProps,
    PropSanitationResult,
    Valid,
} from '../../types.js';
import { RecursiveRebaser } from '../../components/recursive-rebaser.js';
import { Text } from 'ink';
import { git } from '../../modules/git.js';
import { useAction } from '../../hooks/use-action.js';

const ChangesCommit = (props: CommandProps) => {
    const args = changesCommitConfig.getProps(props) as Valid<
        PropSanitationResult<CommandArgs>
    >;

    const currentBranchName = git.getCurrentBranchName();

    const result = useAction({
        func: () => {
            git.assertInWorkTree();
            git.assertHasDiff();
            git.stageAllChanges();
            git.commit({ message: args.props.message });
        },
    });

    if (!result.isComplete) return null;

    return (
        <RecursiveRebaser
            baseBranchName={currentBranchName}
            endBranchName={currentBranchName}
            successStateNode={
                <Text color="green">Committed changes successfully</Text>
            }
        />
    );
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
