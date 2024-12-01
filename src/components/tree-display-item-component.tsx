import React from 'react';
import { type ItemProps } from 'ink-select-input';
import { TreeBranchDisplay } from '../utils/tree-display.js';
import { git } from '../modules/git.js';
import { useTreeDisplay } from '../contexts/tree-display.context.js';

export const TreeDisplayItemComponent = ({
    isSelected = false,
    label,
}: ItemProps) => {
    const currentBranchName = git.getCurrentBranchName();
    const { nodes, maxWidth } = useTreeDisplay();

    const node = nodes.find((n) => n.name === label);

    if (!node) {
        return null;
    }

    return (
        <TreeBranchDisplay
            key={node.name}
            node={node}
            maxWidth={maxWidth}
            isCurrent={node.name === currentBranchName}
            needsRestack={false}
            underline={isSelected}
        />
    );
};
