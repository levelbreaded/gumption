import React from 'react';
import { CommandConfig, CommandProps } from '../types.js';
import { Text } from 'ink';

const Sync = ({ cli, input }: CommandProps) => {
    console.log('Rendered', { cli, input });
    return <Text>Sync command</Text>;
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
