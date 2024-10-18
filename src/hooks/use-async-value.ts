import { AsyncResult } from '../types.js';
import { useEffect, useState } from 'react';

type State<T> = { type: 'LOADING' } | { type: 'COMPLETE'; value: T };

export const useAsyncValue = <T>({
    getValue,
}: {
    getValue: () => Promise<T>;
}): AsyncResult<T> => {
    const [state, setState] = useState<State<T>>({ type: 'LOADING' });

    useEffect(() => {
        void (async () => {
            const _value = await getValue();
            setState({ type: 'COMPLETE', value: _value });
        })();
    }, [getValue]);

    if (state.type !== 'COMPLETE') {
        return { value: undefined, isLoading: true };
    }

    return {
        value: state.value,
        isLoading: false,
    };
};
