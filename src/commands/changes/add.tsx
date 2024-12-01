import React from 'react';
import { CommandConfig, CommandProps } from '../../types.js';
import { Text } from 'ink';
import { git } from '../../modules/git.js';
import { useAction } from '../../hooks/use-action.js';

const ChangedAdd = ({}: CommandProps) => {
    const result = useAction({
        func: () => {
            git.assertInWorkTree();
            git.stageAllChanges();
        },
    });

    if (!result.isComplete) return null;

    return (
        <Text bold color="green">
            Staged all changes
        </Text>
    );
};

export const changesAddConfig: CommandConfig = {
    description: 'Stage all changes.',
    usage: 'changes add',
    key: 'add',
    aliases: ['a'],
    getProps: () => {
        return {
            valid: true,
            props: null,
        };
    },
};

export default ChangedAdd;
