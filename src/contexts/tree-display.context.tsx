import React, { ReactNode, createContext, useContext, useMemo } from 'react';
import {
    DisplayNode,
    getDisplayNodes,
    maxWidthFromDisplayNodes,
} from '../utils/tree-display.js';
import { treeToParentChildRecord } from '../utils/tree-helpers.js';
import { useBranchNeedsRebaseRecord } from '../hooks/computed-values/use-branch-needs-rebase-record.js';
import { useCleanCurrentTree } from '../hooks/computed-values/use-clean-current-tree.js';
import { useTree } from '../hooks/use-tree.js';

interface TreeDisplayContextType {
    maxWidth: number;
    nodes: DisplayNode[];
    branchNeedsRebaseRecord: Record<string, boolean>;
    isLoading: boolean;
}

const TreeDisplayContext = createContext<TreeDisplayContextType>({
    maxWidth: 0,
    nodes: [],
    branchNeedsRebaseRecord: {},
    isLoading: true,
});

export const TreeDisplayProvider = ({ children }: { children: ReactNode }) => {
    const { rootBranchName } = useTree();

    const { value: currentTree, isLoading: isLoadingCurrentTree } =
        useCleanCurrentTree();

    const treeParentChildRecord = useMemo(
        () => treeToParentChildRecord(currentTree),
        [currentTree]
    );
    const {
        value: branchNeedsRebaseRecord,
        isLoading: isLoadingBranchNeedsRebaseRecord,
    } = useBranchNeedsRebaseRecord({ currentTree });

    const isLoading = useMemo(() => {
        return isLoadingBranchNeedsRebaseRecord || isLoadingCurrentTree;
    }, [isLoadingBranchNeedsRebaseRecord, isLoadingCurrentTree]);

    const nodes: DisplayNode[] = rootBranchName
        ? getDisplayNodes({
              record: treeParentChildRecord,
              branchName: rootBranchName,
          })
        : [];
    const maxWidth = maxWidthFromDisplayNodes({ displayNodes: nodes });

    return (
        <TreeDisplayContext.Provider
            value={{
                maxWidth,
                nodes,
                branchNeedsRebaseRecord,
                isLoading,
            }}
        >
            {children}
        </TreeDisplayContext.Provider>
    );
};

export const useTreeDisplay = () => {
    return useContext(TreeDisplayContext);
};
