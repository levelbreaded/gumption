import React, {useEffect, useMemo, useState} from 'react';
import {CommandProps} from '../command-registry.js';
import {simpleGit, SimpleGitOptions} from 'simple-git';
import SelectInput from 'ink-select-input';
import {useApp} from 'ink';
import ErrorDisplay from '../components/ErrorDisplay.js';

const Hop = () => {
	const options: Partial<SimpleGitOptions> = {
		baseDir: process.cwd(),
		binary: 'git',
		maxConcurrentProcesses: 6,
		trimmed: false,
	};
	const git = simpleGit(options);
	const {exit} = useApp();
	const [allBranches, setAllBranches] = useState<string[]>([]);
	const [currentBranch, setCurrentBranch] = useState('');
	const [error, setError] = useState<Error | undefined>(undefined);
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		const getLocalBranches = async () => {
			const {all, current} = await git.branchLocal();
			setAllBranches(all);
			setCurrentBranch(current);
		};

		getLocalBranches();
	}, [setAllBranches, setCurrentBranch]);

	const handleSelect = (item: any) => {
		const updateCurrentBranch = async () => {
			const {current} = await git.branchLocal();
			setCurrentBranch(current);
		};

		git
			.checkout(item.value)
			.then(() => {
				setSuccess(true)
				return updateCurrentBranch();
			})
			.catch(e => setError(e))
			.finally(() => {
				exit();
			});
	};

	const items = useMemo(() => {
		return allBranches
			.filter(branch => branch !== currentBranch)
			.map(branch => ({
				label: branch,
				value: branch,
			}));
	}, [allBranches, currentBranch]);

	if (error) {
		return <ErrorDisplay error={error} />;
	}

	return (
		<>
			{success && <Text>Hopped to {currentBranch}</Text>}
			<SelectInput items={items} onSelect={handleSelect} />
		</>
	);
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
