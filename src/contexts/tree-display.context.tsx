import React, { ReactNode, createContext, useContext } from 'react';
import {
    DisplayNode,
    getDisplayNodes,
    maxWidthFromDisplayNodes,
} from '../utils/tree-display.js';
import { getRootBranch } from '../modules/branch/wrapper.js';
import { tree, treeToParentChildRecord } from '../modules/tree.js';
import { useBranchNeedsRestackRecord } from '../hooks/use-branch-needs-restack-record.js';

interface TreeDisplayContextType {
    maxWidth: number;
    nodes: DisplayNode[];
    branchNeedsRestackRecord: Record<string, boolean>;
}

const TreeDisplayContext = createContext<TreeDisplayContextType>({
    maxWidth: 0,
    nodes: [],
    branchNeedsRestackRecord: {},
});

export const TreeDisplayProvider = ({
    children,
    options,
}: {
    children: ReactNode;
    options?: { includeBranchNeedsRebaseRecord?: boolean };
}) => {
    const rootBranchName = getRootBranch().name;
    const _tree = tree.getTree();
    const treeParentChildRecord = treeToParentChildRecord(_tree);
    const branchNeedsRestackRecord = useBranchNeedsRestackRecord({
        tree: _tree,
        enabled: Boolean(options?.includeBranchNeedsRebaseRecord),
    });

    const nodes: DisplayNode[] = rootBranchName
        ? getDisplayNodes({
              treeParentChildRecord,
              branchName: rootBranchName,
          })
        : [];

    const maxWidth = maxWidthFromDisplayNodes({ displayNodes: nodes });

    return (
        <TreeDisplayContext.Provider
            value={{
                maxWidth,
                nodes,
                branchNeedsRestackRecord,
            }}
        >
            {children}
        </TreeDisplayContext.Provider>
    );
};

export const useTreeDisplay = () => {
    return useContext(TreeDisplayContext);
};
