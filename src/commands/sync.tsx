import ErrorDisplay from '../components/error-display.js';
import React, { useCallback, useState } from 'react';
import { Action, useAction } from '../hooks/use-action.js';
import { CommandConfig, CommandProps } from '../types.js';
import { ConfirmStatement } from '../components/confirm-statement.js';
import { Loading } from '../components/loading.js';
import { RecursiveRebaser } from '../components/recursive-rebaser.js';
import { SelectRootBranch } from '../components/select-root-branch.js';
import { Text } from 'ink';
import { useGit } from '../hooks/use-git.js';
import { useGitHelpers } from '../hooks/use-git-helpers.js';
import { useTree } from '../hooks/use-tree.js';

const Sync = (_: CommandProps) => {
    const { currentBranch } = useGitHelpers();
    const { rootBranchName } = useTree();

    if (!rootBranchName) {
        return <SelectRootBranch />;
    }

    if (currentBranch.isLoading) {
        return <Loading />;
    }

    return (
        <DoSync
            rootBranchName={rootBranchName}
            currentBranchName={currentBranch.value}
        />
    );
};

const DoSync = ({
    rootBranchName,
    currentBranchName,
}: {
    rootBranchName: string;
    currentBranchName: string;
}) => {
    const result = useSyncAction({ rootBranchName });

    if (result.isError) {
        return <ErrorDisplay error={result.error} />;
    }

    if (result.isLoading) {
        return <Loading />;
    }

    const { contestedBranch, deleteBranch, skipContestedBranch } = result;

    if (contestedBranch) {
        return (
            <ConfirmStatement
                statement={
                    <Text>
                        It seems like{' '}
                        <Text color="yellow" bold>
                            {contestedBranch}
                        </Text>{' '}
                        was deleted in the remote repository. Delete it locally?
                    </Text>
                }
                onAccept={() => {
                    if (contestedBranch) void deleteBranch(contestedBranch);
                }}
                onDeny={() => {
                    if (contestedBranch) skipContestedBranch(contestedBranch);
                }}
            />
        );
    }

    return (
        <RecursiveRebaser
            baseBranch={rootBranchName}
            endBranch={currentBranchName}
            successStateNode={<Text color="green">Synced successfully</Text>}
        />
    );
};

type UseSyncActionResult = Action & {
    deleteBranch: (branch: string) => Promise<void>;
    skipContestedBranch: (branch: string) => void;
    contestedBranch: string | undefined;
};

const useSyncAction = ({
    rootBranchName,
}: {
    rootBranchName: string;
}): UseSyncActionResult => {
    const git = useGit();
    const { currentTree, removeBranch } = useTree();
    const [allContestedBranches, setAllContestedBranches] = useState<string[]>(
        []
    );

    const skipContestedBranch = useCallback((branch: string) => {
        setAllContestedBranches((prev) => prev.filter((b) => b !== branch));
    }, []);

    const deleteBranch = useCallback(
        async (branch: string) => {
            // do the git branch delete first, since this is more error-prone
            await git.branchDelete(branch);
            removeBranch(branch);
            skipContestedBranch(branch);
        },
        [git, skipContestedBranch]
    );

    const performAction = useCallback(async () => {
        // todo: unsure if this is the correct condition
        if (!currentTree.length) return;

        await git.checkout(rootBranchName);
        await git.pull();

        for (const node of currentTree) {
            const closedOnRemote = await git.isClosedOnRemote(node.key);
            if (closedOnRemote) {
                setAllContestedBranches((prev) => [...prev, node.key]);
            }
        }
    }, [git, currentTree]);

    const action = useAction({
        asyncAction: performAction,
    });

    return {
        ...action,
        // always get the first one, we're filtering the array until it is empty
        contestedBranch: allContestedBranches[0],
        deleteBranch,
        skipContestedBranch,
    } as UseSyncActionResult;
};

export const syncConfig: CommandConfig = {
    description: 'Sync your local changes with the remote server',
    usage: 'sync',
    key: 'sync',
    getProps: () => {
        return {
            valid: true,
            props: null,
        };
    },
};

export default Sync;
