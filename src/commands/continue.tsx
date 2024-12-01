import React from 'react';
import { CommandConfig, CommandProps } from '../types.js';
import { RebaseConflictError } from '../lib/errors.js';
import { RecursiveRebaser } from '../components/recursive-rebaser.js';
import { Text } from 'ink';
import { git } from '../modules/git.js';
import { isBranchWithParentBranchName } from '../modules/branch/assertions.js';
import { loadBranch, updateMetadata } from '../modules/branch/wrapper.js';
import { useAction } from '../hooks/use-action.js';

const Continue = (_: CommandProps) => {
    const result = useAction<{
        noRebaseInProgress: boolean;
        performRecursiveRebase?: boolean;
    }>({
        func: () => {
            if (!git.isRebasing()) {
                return { noRebaseInProgress: true };
            }

            const _branch = loadBranch(git.getRebasingBranchName());

            if (!isBranchWithParentBranchName(_branch)) {
                return { noRebaseInProgress: false };
            }

            const parentBranchName = _branch.parentBranchName;

            const storedParentCommitHash =
                'parentCommitHash' in _branch ? _branch.parentCommitHash : null;
            const correctParentCommitHash = git.getCurrentCommitHash({
                branchName: parentBranchName,
            });

            /**
             * If a rebase conflict has occurred, the user has resolved it, & we now need to
             * continue, that means the branch metadata is in a broken state.
             *
             * The branch knows the correct new parent branch name, but not the new parent
             * branch commit hash. This basically breaks tracking.
             */
            updateMetadata({
                branchName: _branch.name,
                metadata: {
                    parentCommitHash: correctParentCommitHash,
                },
            });

            /**
             * Do this last. If the metadata manipulation that comes before this fails,
             * keep the index in a state where it still needs the user to call this command again.
             */
            try {
                git.rebaseContinue();
            } catch (e) {
                if (git.isRebasing()) {
                    throw new RebaseConflictError();
                } else {
                    throw e;
                }
            }

            return {
                noRebaseInProgress: false,
                performRecursiveRebase:
                    storedParentCommitHash !== correctParentCommitHash,
            };
        },
    });

    if (!result.isComplete) {
        return null;
    }

    if (result.data.noRebaseInProgress) {
        return <Text color="yellow">No ongoing rebase found.</Text>;
    }

    if (result.data.performRecursiveRebase) {
        const currentBranchName = git.getCurrentBranchName();
        return (
            <RecursiveRebaser
                baseBranchName={currentBranchName}
                endBranchName={currentBranchName}
                successStateNode={null}
            />
        );
    }

    return null;
};

export const continueConfig: CommandConfig = {
    description: 'Continues a rebase',
    usage: 'continue',
    key: 'continue',
    aliases: ['cont'],
    getProps: () => {
        return {
            valid: true,
            props: {},
        };
    },
};

export default Continue;
