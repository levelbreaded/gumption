import React from 'react';
import {Text} from 'ink';
import {type CommandProps} from '../command-registry.js';

function Sync({cli, input}: CommandProps) {
	console.log('Rendered', {cli, input});
	return <Text>Sync command</Text>;
}

export const syncConfig = {
	description: 'Sync your local changes with the remote server',
	usage: 'sync',
};

export default Sync;
