import React, { useState } from 'react';
import { Text, useInput } from 'ink';

function Fake() {
    console.log('Rendered Fake');
    const [text, setText] = useState('Hello, world!');

    useInput((input, key) => {
        console.log('anything');
        if (key.backspace || key.delete) {
            setText((prev) => prev.slice(0, -1));
        } else {
            setText((prev) => `${prev}${input}`);
        }
    });

    return <Text>{text}</Text>;
}

export default Fake;
