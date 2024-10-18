import { Tree, TreeService, createTreeService } from '../services/tree.js';
import { useAsyncValue } from './use-async-value.js';
import { useCallback, useMemo, useState } from 'react';
import { useGit } from './use-git.js';

interface UseTreeResult extends TreeService {
    currentTree: Tree;
    rootBranchName: string | undefined;
    isCurrentBranchTracked: boolean;
    isLoading: boolean;
}

export const useTree = (): UseTreeResult => {
    const [currentTree, setCurrentTree] = useState<Tree>([]);
    const git = useGit();

    const getCurrentBranchTracked = useCallback(async () => {
        const currentBranch = await git.currentBranch();
        return Boolean(currentTree.find((b) => b.key === currentBranch));
    }, [currentTree, git.currentBranch]);

    const currentBranchTrackedResult = useAsyncValue({
        getValue: getCurrentBranchTracked,
    });

    const service = useMemo(() => createTreeService({ setCurrentTree }), []);

    const computed = useMemo(() => {
        return {
            rootBranchName: currentTree.find((b) => b.parent === null)?.key,
        };
    }, [currentTree]);

    return {
        currentTree,
        ...computed,
        ...service,
        isCurrentBranchTracked: Boolean(currentBranchTrackedResult.value),
        isLoading: !('value' in currentBranchTrackedResult),
    };
};
