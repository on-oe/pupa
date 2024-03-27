import type { BridgeEvent } from "./define-bridge-event";

export function createBridgeHandlerBundle() {
  const handlers: Record<string, (data: unknown) => unknown> = {};

  function addHandler<D>(Event: BridgeEvent<D>, handler: (data: D) => unknown) {
    handlers[Event.type] = handler as (data: unknown) => unknown;
  }

  return {
    addHandler,
    getHandlers() {
      return handlers;
    },
  };
}
