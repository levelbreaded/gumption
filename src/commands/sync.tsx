import React from 'react';
import { type CommandProps } from '../command-registry.js';
import Fake from './fake.js';

function Sync({}: CommandProps) {
    // console.log('Rendered', { cli, input });
    // return <Text>Sync command</Text>;
    return <Fake />;
}

export const syncConfig = {
    description: 'Sync your local changes with the remote server',
    usage: 'sync',
};

export default Sync;
