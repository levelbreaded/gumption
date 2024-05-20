import {
    DEFAULT_OPTIONS,
    GitService,
    createGitService,
} from '../services/git.js';
import { useMemo } from 'react';

export const useGit = (): GitService => {
    return useMemo(() => createGitService({ options: DEFAULT_OPTIONS }), []);
};
