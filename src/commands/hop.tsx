import React, { useMemo, useState } from 'react';
import { Box, Text } from 'ink';
import { CommandConfig, CommandProps } from '../types.js';
import { SearchSelectInput } from '../components/select-search-input.js';
import { git } from '../modules/git.js';

const Hop = (_: CommandProps) => {
    const previousBranchName = git.getCurrentBranchName();
    const [newBranchName, setNewBranchName] = useState<string | undefined>(
        undefined
    );

    const items = useMemo(() => {
        return git.getLocalBranchNames().map((branchName) => ({
            label: branchName,
            value: branchName,
        }));
    }, []);

    if (newBranchName) {
        return (
            <Box flexDirection="column">
                <Box gap={1}>
                    <Text color="yellow">{previousBranchName}</Text>
                    <Text bold>↴</Text>
                </Box>
                <Text>
                    Hopped to{' '}
                    <Text bold color="green">
                        {newBranchName}
                    </Text>
                </Text>
            </Box>
        );
    }

    return (
        <SearchSelectInput
            title=""
            items={items}
            onSelect={(item) => {
                git.checkoutBranch(item.value);
                setNewBranchName(item.label);
            }}
        />
    );
};

export const hopConfig: CommandConfig = {
    description: 'Hop to other branches',
    usage: 'hop',
    key: 'hop',
    aliases: ['h'],
    getProps: () => {
        return {
            valid: true,
            props: {},
        };
    },
};

export default Hop;
