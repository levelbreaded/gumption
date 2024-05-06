import {simpleGit, type SimpleGit, type SimpleGitOptions} from 'simple-git';

const options: Partial<SimpleGitOptions> = {
	baseDir: process.cwd(),
	binary: 'git',
	maxConcurrentProcesses: 6,
	trimmed: false,
};

export const useGit = (): SimpleGit => {
	return simpleGit(options);
};
