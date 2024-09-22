import React from 'react';
import { CommandConfig, CommandProps } from '../types.js';
import { Text } from 'ink';

function Sync({ cli, input }: CommandProps) {
    console.log('Rendered', { cli, input });
    return <Text>Sync command</Text>;
}

export const syncConfig: CommandConfig = {
    description: 'Sync your local changes with the remote server',
    usage: 'sync',
    key: 'sync',
};

export default Sync;
