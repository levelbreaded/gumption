import React from 'react';
import { type ItemProps } from 'ink-select-input';
import { TreeBranchDisplay } from '../utils/tree-display.js';
import { useGitHelpers } from '../hooks/use-git-helpers.js';
import { useTreeDisplay } from '../contexts/tree-display.context.js';

export const TreeDisplayItemComponent = ({
    isSelected = false,
    label,
}: ItemProps) => {
    const { currentBranch } = useGitHelpers();
    const { nodes, maxWidth } = useTreeDisplay();

    const node = nodes.find((n) => n.name === label);

    if (!node || currentBranch.isLoading) {
        return null;
    }

    return (
        <TreeBranchDisplay
            key={node.name}
            node={node}
            maxWidth={maxWidth}
            isCurrent={node.name === currentBranch.value}
            needsRebase={false}
            underline={isSelected}
        />
    );
};
