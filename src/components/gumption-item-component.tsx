import React from 'react';
import {Text} from 'ink';
import {type ItemProps} from 'ink-select-input';

function GumptionItemComponent({isSelected = false, label}: ItemProps) {
	return <Text color={isSelected ? 'cyan' : undefined}>{label}</Text>;
}

export default GumptionItemComponent;
