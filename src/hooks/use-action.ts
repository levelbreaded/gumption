import { useEffect, useState } from 'react';

export const useAction = ({
    asyncAction,
    enabled = true,
}: {
    asyncAction: () => Promise<void>;
    enabled?: boolean;
}): Action => {
    const [state, setState] = useState<State>({ type: 'LOADING' });

    useEffect(() => {
        if (!enabled) {
            setState({ type: 'NOT_ENABLED' });
            return;
        }

        setState({ type: 'LOADING' });
        asyncAction()
            .then(() => setState({ type: 'COMPLETE' }))
            .catch((e: Error) => {
                setState({ type: 'ERROR', error: e });
            });
    }, [asyncAction, enabled]);

    if (state.type === 'ERROR') {
        return {
            isEnabled: true,
            isLoading: false,
            isError: true,
            error: state.error,
        };
    }

    return {
        isEnabled: state.type !== 'NOT_ENABLED',
        isLoading: state.type === 'LOADING',
        isError: false,
        error: undefined,
    };
};

export type Action =
    | {
          isEnabled: boolean;
          isLoading: boolean;
          isError: false;
          error: undefined;
      }
    | {
          isEnabled: true;
          isLoading: boolean;
          isError: true;
          error: Error;
      };

export type State =
    | {
          type: 'NOT_ENABLED';
      }
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
