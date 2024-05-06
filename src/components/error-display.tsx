import React from 'react';
import {Box, Text} from 'ink';

type ErrorProps = {
	readonly error: Error;
};

function ErrorDisplay({error}: ErrorProps) {
	return (
		<Box flexDirection="column">
			<Text>
				Yikes, it seems something went wrong. Please try again or contact us if
				the issue persists.
			</Text>
			<Box
				flexDirection="column"
				width="50"
				borderStyle="single"
				borderColor="red"
				paddingX={3}
			>
				<Text color="red">{error.message}</Text>
			</Box>
		</Box>
	);
}

export default ErrorDisplay;
