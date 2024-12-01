import React, { useMemo, useState } from 'react';
import { ActionState } from '../../hooks/use-action.js';
import { CommandConfig, CommandProps } from '../../types.js';
import { SearchSelectInput } from '../../components/select-search-input.js';
import { Text } from 'ink';
import {
    assertBranchIsValidOrRoot,
    isBranchNotNone,
} from '../../modules/branch/assertions.js';
import { engine } from '../../modules/engine.js';
import { git } from '../../modules/git.js';
import { loadBranch } from '../../modules/branch/wrapper.js';
import { tree } from '../../modules/tree.js';

function BranchTrack(_: CommandProps) {
    const currentBranchName = git.getCurrentBranchName();
    const currentBranch = loadBranch(currentBranchName);
    const isCurrentBranchTracked = isBranchNotNone(currentBranch);

    const [state, setState] = useState<
        ActionState<{ newParentBranchName: string }>
    >({
        isComplete: false,
    });

    const branchItems = useMemo(() => {
        return tree.getTree().map((branch) => {
            return {
                label: branch.name,
                value: branch.name,
            };
        });
    }, []);

    if (isCurrentBranchTracked) {
        return (
            <Text>
                <Text color="green" bold>
                    {currentBranchName}
                </Text>{' '}
                is already a tracked branch
            </Text>
        );
    }

    if (state.isComplete) {
        return (
            <Text>
                <Text color="green" bold>
                    {currentBranchName}
                </Text>{' '}
                tracked with parent{' '}
                <Text color="yellow" bold>
                    {state.data.newParentBranchName}
                </Text>
                !
            </Text>
        );
    }

    return (
        <SearchSelectInput
            title="Please select a parent branch"
            items={branchItems}
            onSelect={(item) => {
                const _branch = loadBranch(currentBranchName);
                const _newParentBranch = loadBranch(item.value);
                assertBranchIsValidOrRoot(_newParentBranch);

                engine.trackBranch({
                    branchName: _branch.name,
                    parentBranchName: _newParentBranch.name,
                });

                setState({
                    isComplete: true,
                    data: { newParentBranchName: item.value },
                });
            }}
        />
    );
}

export const branchTrackConfig: CommandConfig = {
    description: 'Track a branch',
    usage: 'branch track',
    key: 'track',
    aliases: ['t'],
    getProps: (_) => {
        return {
            valid: true,
            props: {},
        };
    },
};

export default BranchTrack;
