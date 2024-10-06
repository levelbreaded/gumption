import ErrorDisplay from '../../components/error-display.js';
import React, { useEffect, useState } from 'react';
import { CommandConfig, CommandProps } from '../../types.js';
import { Text } from 'ink';
import { useGit } from '../../hooks/use-git.js';

function ChangedAdd({}: CommandProps) {
    const result = useChangesAdd();

    if (result.isError) {
        return <ErrorDisplay error={result.error} />;
    }

    if (result.isLoading) {
        return <Text color="cyan">Loading...</Text>;
    }

    return (
        <Text bold color="green">
            Staged all changes
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

const useChangesAdd = (): Action => {
    const git = useGit();
    const [state, setState] = useState<State>({ type: 'LOADING' });

    useEffect(() => {
        git.addAllFiles()
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

export const changesAddConfig: CommandConfig = {
    description: 'Stage all changes.',
    usage: 'changes add',
    key: 'add',
    aliases: ['a'],
};

export default ChangedAdd;
