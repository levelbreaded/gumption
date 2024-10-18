import { AsyncResult } from '../types.js';
import { useAsyncValue } from './use-async-value.js';
import { useCallback } from 'react';
import { useGit } from './use-git.js';

interface UseGitHelpersResult {
    currentBranch: AsyncResult<string>;
    allBranches: AsyncResult<string[]>;
}

export const useGitHelpers = (): UseGitHelpersResult => {
    const git = useGit();

    const getCurrentBranch = useCallback(async () => {
        return await git.currentBranch();
    }, [git.currentBranch]);

    const currentBranchResult = useAsyncValue({
        getValue: getCurrentBranch,
    });

    const getBranches = useCallback(async () => {
        return git.listBranches();
    }, [git.listBranches]);

    const allBranchesResult = useAsyncValue({
        getValue: getBranches,
    });

    return {
        currentBranch: currentBranchResult,
        allBranches: allBranchesResult,
    };
};
