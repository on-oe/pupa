import { type DependencyList, useEffect } from 'react';

/**
 *
 * @param {Function} effect
 * @param {Array} deps
 */
export function useAbortEffect(effect: (signal: AbortSignal, abort: AbortController) => ReturnType<React.EffectCallback>, deps?: DependencyList) {
  useEffect(() => {
    const abortController = new AbortController();

    const handle = effect(abortController.signal, abortController);

    return () => {
        abortController.abort();
        handle && handle();
    };
  }, deps);
}