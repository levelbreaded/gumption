import { useEffect, useState } from 'react';

export type ActionState<TResult extends object | void = void> =
    | {
          isComplete: true;
          data: TResult;
      }
    | { isComplete: false };

export const useAction = <T extends object | void = void>({
    func,
}: {
    func: () => T;
}) => {
    const [state, setState] = useState<ActionState<T>>({
        isComplete: false,
    });

    useEffect(() => {
        const result = func();
        setState({
            isComplete: true,
            data: result,
        });
    }, []);

    return state;
};
