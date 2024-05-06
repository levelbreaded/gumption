import React from 'react';
import {Text} from 'ink';
import {ItemProps} from 'ink-select-input';

const GumptionItemComponent = ({isSelected = false, label}: ItemProps) => (
	<Text color={isSelected ? 'cyan' : undefined}>{label}</Text>
);

export default GumptionItemComponent;
