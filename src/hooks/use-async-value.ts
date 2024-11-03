import { AsyncResult, AsyncResultWithDefault } from '../types.js';
import { useEffect, useMemo, useState } from 'react';

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

export const useAsyncValueWithDefault = <T>({
    getValue,
    defaultValue,
}: {
    getValue: () => Promise<T>;
    defaultValue: T;
}): AsyncResultWithDefault<T> => {
    const result = useAsyncValue({ getValue });

    return useMemo(() => {
        if (result.isLoading) {
            return { value: defaultValue, isLoading: true };
        }

        return { value: result.value, isLoading: false };
    }, [result.isLoading, result.value, defaultValue]);
};
