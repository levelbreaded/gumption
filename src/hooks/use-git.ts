import { type SimpleGit, type SimpleGitOptions, simpleGit } from 'simple-git';
import { useMemo } from 'react';

const options: Partial<SimpleGitOptions> = {
    baseDir: process.cwd(),
    binary: 'git',
    maxConcurrentProcesses: 6,
    trimmed: false,
};

export const useGit = (): SimpleGit => {
    return useMemo(() => simpleGit(options), []);
};
