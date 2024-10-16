import { Tree, TreeService, createTreeService } from '../services/tree.js';
import { useMemo, useState } from 'react';

interface UseTreeResult extends TreeService {
    currentTree: Tree;
    rootBranchName: string | undefined;
}

export const useTree = (): UseTreeResult => {
    const [currentTree, setCurrentTree] = useState<Tree>([]);

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
    };
};
