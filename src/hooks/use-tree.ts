import { Tree, TreeService, createTreeService } from '../services/tree.js';
import { useGitHelpers } from './use-git-helpers.js';
import { useMemo, useState } from 'react';

interface UseTreeResult extends TreeService {
    currentTree: Tree;
    rootBranchName: string | undefined;
    isCurrentBranchTracked: boolean;
    isLoading: boolean;
}

export const useTree = (): UseTreeResult => {
    const [currentTree, setCurrentTree] = useState<Tree>([]);
    const { currentBranch } = useGitHelpers();

    const currentBranchResult = useMemo(() => {
        if (currentBranch.isLoading) return { value: false, isLoading: true };
        const value = Boolean(
            currentTree.find((b) => b.key === currentBranch.value)
        );
        return { value, isLoading: false };
    }, [currentBranch]);

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
        isCurrentBranchTracked: currentBranchResult.value,
        isLoading: currentBranchResult.isLoading,
    };
};
