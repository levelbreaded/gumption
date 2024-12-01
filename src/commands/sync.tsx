import React, { useCallback, useEffect, useState } from 'react';
import { CommandConfig, CommandProps } from '../types.js';
import { ConfirmStatement } from '../components/confirm-statement.js';
import { RecursiveRebaser } from '../components/recursive-rebaser.js';
import { Text } from 'ink';
import { engine } from '../modules/engine.js';
import { getRootBranch } from '../modules/branch/wrapper.js';
import { git } from '../modules/git.js';
import { tree } from '../modules/tree.js';

const Sync = (_: CommandProps) => {
    const rootBranch = getRootBranch();
    const originalBranchName = git.getCurrentBranchName();
    const { contestedBranchName, deleteBranch, skipContestedBranch } =
        useSyncAction({ rootBranchName: rootBranch.name });

    if (contestedBranchName) {
        return (
            <ConfirmStatement
                statement={
                    <Text>
                        It seems like{' '}
                        <Text color="yellow" bold>
                            {contestedBranchName}
                        </Text>{' '}
                        was deleted in the remote repository. Delete it locally?
                    </Text>
                }
                onAccept={() => {
                    if (contestedBranchName)
                        void deleteBranch(contestedBranchName);
                }}
                onDeny={() => {
                    if (contestedBranchName)
                        skipContestedBranch(contestedBranchName);
                }}
            />
        );
    }

    return (
        <RecursiveRebaser
            baseBranchName={rootBranch.name}
            endBranchName={originalBranchName}
            successStateNode={<Text color="green">Synced successfully</Text>}
        />
    );
};

type UseSyncActionResult = {
    deleteBranch: (branchName: string) => Promise<void>;
    skipContestedBranch: (branchName: string) => void;
    contestedBranchName: string | undefined;
};

const useSyncAction = ({
    rootBranchName,
}: {
    rootBranchName: string;
}): UseSyncActionResult => {
    const currentTree = tree.getTree();
    const [allContestedBranchNames, setAllContestedBranchNames] = useState<
        string[]
    >([]);

    const skipContestedBranch = useCallback((branchName: string) => {
        setAllContestedBranchNames((prev) =>
            prev.filter((b) => b !== branchName)
        );
    }, []);

    const deleteBranch = useCallback(
        (branchName: string) => {
            engine.deleteTrackedBranch({ branchName });
            skipContestedBranch(branchName);
        },
        [skipContestedBranch]
    );

    useEffect(() => {
        git.checkoutBranch(rootBranchName);
        git.pull({ prune: true });
        const _contestedBranchNames = [];

        for (const _branch of currentTree) {
            const closedOnRemote = git.isClosedOnRemote({
                branchName: _branch.name,
            });
            if (closedOnRemote) {
                _contestedBranchNames.push(_branch.name);
            }
        }

        setAllContestedBranchNames(_contestedBranchNames);
    }, []);

    return {
        // always get the first one, we're filtering the array until it is empty
        contestedBranchName: allContestedBranchNames[0],
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
