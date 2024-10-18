import GumptionItemComponent from './gumption-item-component.js';
import React, { useMemo, useState } from 'react';
import SelectInput from 'ink-select-input';
import { Box, Text, useInput } from 'ink';

export const SearchSelectInput = ({
    title,
    items,
    onSelect,
}: {
    title: string;
    items: { label: string; value: string }[];
    onSelect: (args: { label: string; value: string }) => void;
}) => {
    const [search, setSearch] = useState('');

    const filteredItems = useMemo(() => {
        return items.filter((item) =>
            search.length > 0
                ? item.label.toLowerCase().includes(search.toLowerCase()) ||
                  item.value.toLowerCase().includes(search.toLowerCase())
                : true
        );
    }, [items, search]);

    useInput((input, key) => {
        if (key.backspace || key.delete) {
            // remove final character
            return setSearch((prev) => prev.slice(0, -1));
        }
        setSearch((prev) => `${prev}${input}`);
    });

    return (
        <Box flexDirection="column">
            <Text color="yellow">{title}</Text>
            <Text>
                <Text italic={!search.length}>
                    🔎&nbsp;
                    {search.length ? search : '(type to search)'}
                </Text>
            </Text>
            {filteredItems.length ? (
                <SelectInput
                    items={filteredItems}
                    itemComponent={GumptionItemComponent}
                    onSelect={(item) => onSelect(item)}
                    limit={10}
                />
            ) : (
                <Text italic>No results</Text>
            )}
        </Box>
    );
};
