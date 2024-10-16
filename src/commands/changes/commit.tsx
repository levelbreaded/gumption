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
import { useGit } from '../../hooks/use-git.js';
import { useTree } from '../../hooks/use-tree.js';

function ChangesCommit(props: CommandProps) {
    const args = changesCommitConfig.getProps(props) as Valid<
        PropSanitationResult<CommandArgs>
    >;

    const { rootBranchName } = useTree();

    const result = useChangesCommit({
        message: args.props.message,
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
        <Text bold color="green">
            Committed all changes
        </Text>
    );
}

const useChangesCommit = ({
    message,
    enabled,
}: {
    message: string;
    enabled: boolean;
}): Action => {
    const git = useGit();

    const performAction = useCallback(async () => {
        await git.addAllFiles();
        await git.commit({ message });
    }, []);

    return useAction({
        asyncAction: performAction,
        enabled,
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
