import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text } from 'ink';

export const Loading = () => {
    return <InfiniteLoadingAnimation />;
};

const WIDTH = 3;
const SYMBOLS = ['◔', '◑', '◕', '●'];

export const InfiniteLoadingAnimation = () => {
    const [barStartIndex, setBarStartIndex] = useState(0);
    const [symbolIndex, setSymbolIndex] = useState(0);

    useEffect(() => {
        const loadingBarInterval = setInterval(() => {
            setBarStartIndex((prev) => (prev + 1) % WIDTH);
        }, 150);

        const symbolInterval = setInterval(() => {
            setSymbolIndex((prev) => (prev + 1) % SYMBOLS.length);
        }, 200);

        return () => {
            clearInterval(loadingBarInterval);
            clearInterval(symbolInterval);
        };
    }, []);

    // alternative loading bar concept
    const currentBar = useMemo(() => {
        const blocks = Array(WIDTH).fill('█') as string[];
        blocks.splice(barStartIndex, 1, ' ');
        return blocks;
    }, [barStartIndex]);

    return (
        <Box gap={1}>
            <Text color="cyan">{SYMBOLS[symbolIndex]} |</Text>
            {/*<Text color="cyan">{currentBar.join('')}</Text>*/}
            <Text color="cyan">Loading</Text>
        </Box>
    );
};
