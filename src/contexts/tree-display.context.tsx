import React, {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useMemo,
} from 'react';
import {
    DisplayNode,
    getDisplayNodes,
    maxWidthFromDisplayNodes,
} from '../utils/tree-display.js';
import { treeToParentChildRecord } from '../utils/tree-helpers.js';
import { useAsyncValue } from '../hooks/use-async-value.js';
import { useGit } from '../hooks/use-git.js';
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
    const git = useGit();
    const { rootBranchName, currentTree } = useTree();
    const treeParentChildRecord = useMemo(
        () => treeToParentChildRecord(currentTree),
        [currentTree]
    );

    const getBranchNeedsRebaseRecord = useCallback(async () => {
        const record: Record<string, boolean> = {};
        await Promise.all(
            currentTree.map(async (_node) => {
                if (!_node.parent) return null;

                record[_node.key] = await git.needsRebaseOnto({
                    branch: _node.key,
                    ontoBranch: _node.parent,
                });
                return null;
            })
        );
        return record;
    }, [currentTree, git.needsRebaseOnto]);

    const branchNeedsRebaseRecordResult = useAsyncValue({
        getValue: getBranchNeedsRebaseRecord,
    });

    const branchNeedsRebaseRecord = useMemo(() => {
        if (branchNeedsRebaseRecordResult.isLoading)
            return {} as Record<string, boolean>;

        return branchNeedsRebaseRecordResult.value;
    }, [branchNeedsRebaseRecordResult]);

    const isLoading = useMemo(() => {
        return branchNeedsRebaseRecordResult.isLoading;
    }, [branchNeedsRebaseRecordResult]);

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
