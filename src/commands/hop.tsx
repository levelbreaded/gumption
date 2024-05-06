import React, {useEffect, useMemo, useState} from 'react';
import {CommandProps} from '../command-registry.js';
import {simpleGit, SimpleGitOptions} from 'simple-git';
import SelectInput from 'ink-select-input';
import {log} from 'util';

const Hop = () => {
	const options: Partial<SimpleGitOptions> = {
		baseDir: process.cwd(),
		binary: 'git',
		maxConcurrentProcesses: 6,
		trimmed: false,
	};
	const git = simpleGit(options);
	const [allBranches, setAllBranches] = useState<string[]>([]);
	const [currentBranch, setCurrentBranch] = useState('');

	useEffect(() => {
		const getLocalBranches = async () => {
			const {all, current} = await git.branchLocal();
			setAllBranches(all);
			setCurrentBranch(current);
		};

		getLocalBranches();
	}, [setAllBranches, setCurrentBranch]);

	const handleSelect = (item: any) => {
		git
			.checkout(item.value)
			.then(() => console.log('Switched to branch', item.value));
	};

	const items = useMemo(() => {
		return allBranches
			.filter(branch => branch !== currentBranch)
			.map(branch => ({
				label: branch,
				value: branch,
			}));
	}, [allBranches, currentBranch]);

	return <SelectInput items={items} onSelect={handleSelect} />;
};

export const hopConfig = {
	description: 'Hop to other branches',
	usage: 'hop | hop <branch-name>',
	validateProps({cli, input}: CommandProps) {
		console.log({cli, input});
		return {
			valid: true,
			errors: [],
		};
	},
};

export default Hop;
