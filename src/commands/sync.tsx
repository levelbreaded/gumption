import React from 'react';
import { CommandConfig, CommandProps } from '../types.js';
import { RecursiveRebaser } from '../components/recursive-rebaser.js';
import { SelectRootBranch } from '../components/select-root-branch.js';
import { Text } from 'ink';
import { useTree } from '../hooks/use-tree.js';

const Sync = (_: CommandProps) => {
    const { rootBranchName } = useTree();

    if (!rootBranchName) {
        return <SelectRootBranch />;
    }

    // todo: prompt to delete branches

    return (
        <RecursiveRebaser
            baseBranch={rootBranchName}
            successStateNode={<Text color="green">Synced successfully</Text>}
        />
    );
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
