import React, {useEffect, useMemo, useState} from 'react';
import {CommandProps} from '../command-registry.js';
import {simpleGit, SimpleGitOptions} from 'simple-git';
import SelectInput from 'ink-select-input';
import {Box, Text, useApp} from 'ink';
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
	const [newBranch, setNewBranch] = useState<string | undefined>(undefined);
	const [error, setError] = useState<Error | undefined>(undefined);

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
			setNewBranch(current);
		};

		git
			.checkout(item.value)
			.then(() => {
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
			{newBranch ? (
				<Box flexDirection="column">
					<Text>
						<Text color="blue" dimColor italic>
							{currentBranch}
						</Text>
						↴
					</Text>
					<Text>
						Hopped to{' '}
						<Text color="blue" bold>
							{newBranch}
						</Text>
					</Text>
				</Box>
			) : (
				<SelectInput items={items} onSelect={handleSelect} />
			)}
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
