import React, { ReactNode, useMemo, useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface ConfirmStatementProps {
    statement: ReactNode | string;
    onAccept: () => void;
    onDeny: () => void;
}

export const ConfirmStatement = ({
    statement,
    onAccept,
    onDeny,
}: ConfirmStatementProps) => {
    const [userInput, setUserInput] = useState('');

    const intent = useMemo(() => {
        if (userInput === '') return { accept: true, deny: false };
        if (['Y', 'y'].includes(userInput))
            return { accept: true, deny: false };
        if (['N', 'n'].includes(userInput))
            return { accept: false, deny: true };

        return { accept: false, deny: false };
    }, [userInput]);

    useInput((input, key) => {
        if (key.backspace || key.delete) {
            // input is always 1 character, so net to empty on backspace
            setUserInput('');
        }

        if (key.return && !userInput.length) {
            // treat as affirmative response immediately
            onAccept();
        }

        if (key.return && userInput.length) {
            if (['Y', 'y'].includes(userInput)) {
                onAccept();
            }
            if (['N', 'n'].includes(userInput)) {
                onDeny();
            }
        }

        if (!['Y', 'y', 'N', 'n'].includes(input)) return;

        // input is always 1 character at this point
        setUserInput(input);
    });

    return (
        <Box gap={1}>
            <Text>
                {statement}
                <Text>
                    &nbsp;[
                    <Text underline={intent.accept} bold={intent.accept}>
                        Y
                    </Text>
                    /
                    <Text underline={intent.deny} bold={intent.deny}>
                        n
                    </Text>
                    ]:
                </Text>
            </Text>
            <Text>{userInput.length ? userInput : '_'}</Text>
        </Box>
    );
};
