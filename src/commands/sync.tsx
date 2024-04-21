import React from 'react';
import {CommandProps} from '../command-registry.js';

const Sync = ({}: CommandProps) => {
	return <div></div>;
};

export const syncConfig = {
	validateProps: ({}: CommandProps) => {
		return {
			valid: true,
			errors: [],
		};
	},
};

export default Sync;
