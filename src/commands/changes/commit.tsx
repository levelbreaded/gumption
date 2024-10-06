import ErrorDisplay from '../../components/error-display.js';
import React, { useEffect, useState } from 'react';
import { CommandConfig, CommandProps } from '../../types.js';
import { Text } from 'ink';
import { useGit } from '../../hooks/use-git.js';

function ChangesCommit({ input }: CommandProps) {
    const [, , message] = input;
    // todo: refactor to a sanitize input pattern
    const result = useChangesCommit({ message: message! });

    if (result.isError) {
        return <ErrorDisplay error={result.error} />;
    }

    if (result.isLoading) {
        return <Text color="cyan">Loading...</Text>;
    }

    return (
        <Text bold color="green">
            Committed all changes
        </Text>
    );
}

type Action = { isLoading: boolean } & (
    | {
          isError: false;
      }
    | {
          isError: true;
          error: Error;
      }
);

type State =
    | {
          type: 'LOADING';
      }
    | {
          type: 'COMPLETE';
      }
    | {
          type: 'ERROR';
          error: Error;
      };

const useChangesCommit = ({ message }: { message: string }): Action => {
    const git = useGit();
    const [state, setState] = useState<State>({ type: 'LOADING' });

    useEffect(() => {
        git.commit({ message })
            .then(() => setState({ type: 'COMPLETE' }))
            .catch((e: Error) => {
                setState({ type: 'ERROR', error: e });
            });
    }, []);

    if (state.type === 'ERROR') {
        return {
            isLoading: false,
            isError: true,
            error: state.error,
        };
    }

    return {
        isLoading: state.type === 'LOADING',
        isError: false,
    };
};

export const changesCommitConfig: CommandConfig = {
    description: 'Stage and commit all changes.',
    usage: 'changes commit "<message>"',
    key: 'commit',
    aliases: ['c'],
    validateProps: (props) => {
        const { input } = props;
        const [, , message] = input;

        if (!message)
            return {
                valid: false,
                errors: ['Please provide a commit message'],
            };

        return { valid: true };
    },
};

export default ChangesCommit;
