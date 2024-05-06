import React from 'react';
import { type ItemProps } from 'ink-select-input';
import { Text } from 'ink';

function GumptionItemComponent({ isSelected = false, label }: ItemProps) {
    return <Text color={isSelected ? 'cyan' : undefined}>{label}</Text>;
}

export default GumptionItemComponent;
