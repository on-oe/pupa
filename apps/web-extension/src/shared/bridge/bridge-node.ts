import type { BridgeEvent, BridgeEventPayload } from "./define-bridge-event";

export class BridgeNode {
  private sendMessage = chrome.runtime.sendMessage;

  private handlers: Record<string, (data: unknown) => unknown> = {};

  constructor() {
    this.connect();
  }

  addHandler<D>(Event: BridgeEvent<D>, handler: (data: D) => unknown) {
    this.handlers[Event.type] = handler as (data: unknown) => unknown;
  }

  addHandlers(handlers: Record<string, (data: unknown) => unknown>) {
    this.handlers = { ...this.handlers, ...handlers };
  }

  async callHandler(type: string, data: unknown) {
    console.log("callHandler", type, data);
    return this.handlers[type](data);
  }

  send<R>(event: BridgeEventPayload): Promise<R> {
    return new Promise((resolve) => {
      this.sendMessage(event, (response) => {
        resolve(response);
      });
    });
  }

  private connect() {
    chrome.runtime.onMessage.addListener(
      (event: BridgeEventPayload, sender, sendResponse) => {
        const { type, data } = event;
        this.callHandler(type, data).then((result) => {
          sendResponse(result);
        });

        return true;
      },
    );
  }
}
