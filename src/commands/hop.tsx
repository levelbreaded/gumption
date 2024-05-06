import React, {useEffect, useMemo, useState} from 'react';
import SelectInput from 'ink-select-input';
import {Box, Text, useApp} from 'ink';
import ErrorDisplay from '../components/ErrorDisplay.js';
import {useGit} from '../hooks/useGit.js';

const Hop = () => {
	const git = useGit();
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
					<Box gap={1}>
						<Text color="blue" dimColor italic>
							{currentBranch}
						</Text>
						<Text bold>↴</Text>
					</Box>
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
	usage: 'hop',
};

export default Hop;
