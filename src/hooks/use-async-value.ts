import { useEffect, useState } from 'react';

type State<T> = { type: 'LOADING' } | { type: 'COMPLETE'; value: T };
type Result<T> = { value?: T };
export const useAsyncValue = <T>({
    getValue,
}: {
    getValue: () => Promise<T>;
}): Result<T> => {
    const [state, setState] = useState<State<T>>({ type: 'LOADING' });

    useEffect(() => {
        void (async () => {
            const _value = await getValue();
            setState({ type: 'COMPLETE', value: _value });
        })();
    }, [getValue]);

    if (state.type !== 'COMPLETE') {
        return {};
    }

    return {
        value: state.value,
    };
};
