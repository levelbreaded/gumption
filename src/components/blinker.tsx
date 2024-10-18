import React, { useEffect, useState } from 'react';
import { Text } from 'ink';

const BLINK_CHAR = '_';

export const Blinker = () => {
    const [blink, setBlink] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setBlink((prev) => !prev);
        }, 500);

        return () => {
            clearInterval(interval);
        };
    }, []);

    return <Text dimColor={blink}>{BLINK_CHAR}</Text>;
};
