import ErrorDisplay from '../components/error-display.js';
import React, { useCallback } from 'react';
import { Action, useAction } from '../hooks/use-action.js';
import { CommandConfig, CommandProps } from '../types.js';
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
    const result = useSyncAction({
        rootBranchName,
        currentBranchName,
    });

    if (result.isError) {
        return <ErrorDisplay error={result.error} />;
    }

    if (result.isLoading) {
        return <Loading />;
    }

    // todo: prompt to delete branches
    return (
        <RecursiveRebaser
            baseBranch={rootBranchName}
            endBranch={currentBranchName}
            successStateNode={<Text color="green">Synced successfully</Text>}
        />
    );
};

type UseSyncActionResult = Action;
const useSyncAction = ({
    currentBranchName,
    rootBranchName,
}: {
    currentBranchName: string;
    rootBranchName: string;
}): UseSyncActionResult => {
    const git = useGit();

    const performAction = useCallback(async () => {
        await git.checkout(rootBranchName);
        await git.pull();
        await git.checkout(currentBranchName);
    }, [git]);

    const action = useAction({
        asyncAction: performAction,
    });

    return {
        ...action,
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
