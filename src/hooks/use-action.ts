import { useEffect, useState } from 'react';

export const useAction = ({
    asyncAction,
}: {
    asyncAction: () => Promise<void>;
}): Action => {
    const [state, setState] = useState<State>({ type: 'LOADING' });

    useEffect(() => {
        asyncAction()
            .then(() => setState({ type: 'COMPLETE' }))
            .catch((e: Error) => {
                setState({ type: 'ERROR', error: e });
            });
    }, [asyncAction]);

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
        error: undefined,
    };
};

export type Action =
    | {
          isLoading: boolean;
          isError: false;
          error: undefined;
      }
    | {
          isLoading: boolean;
          isError: true;
          error: Error;
      };

// export type Action = { isLoading: boolean } & ErrorResult;

export type State =
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
