/* eslint-disable @typescript-eslint/no-explicit-any */
import { proxy } from "valtio";
import { watch } from "valtio/utils";

type State = Record<string, any>;
type Action<S> = (state: S, ...args: any[]) => any;
type Getter<S> = (state: S) => any;

type OmitFirstArg<Func> = Func extends (x: any, ...args: infer P) => infer R
  ? (...args: P) => R
  : never;

type Actions<A> = {
  [K in keyof A]: OmitFirstArg<A[K]>;
};

type Getters<S, G> = {
  [K in keyof G]: G[K] extends Getter<S> ? ReturnType<G[K]> : never;
};

export function createStore<
  S extends State,
  A extends Record<string, Action<S>>,
  G extends Record<string, Getter<S>>,
>({
  state,
  actions,
  getters,
}: {
  state: S;
  actions?: A;
  getters?: G;
}): { state: S } & Actions<A> & Getters<S, G> {
  const proxyState = proxy(state);

  const store: any = { state: proxyState };

  if (actions) {
    Object.keys(actions).forEach((key) => {
      const action = actions[key];
      store[key] = (...args: any[]) => action(proxyState, ...args);
    });
  }

  if (getters) {
    Object.keys(getters).forEach((getterKey) => {
      const item = proxy({ value: getters[getterKey](state) });
      watch((get) => {
        get(proxyState);
        item.value = getters[getterKey](proxyState);
      });
      Object.defineProperty(store, getterKey, {
        get: () => item.value,
        enumerable: true,
      });
    });
  }

  return store;
}
