/* eslint-disable @typescript-eslint/no-explicit-any */
type EventParams = {
  [event: string]: any;
};

type EventReturns = {
  [event: string]: any;
};

type EventKey<T extends EventParams> = string & keyof T;
type EventReceiver<P, R> = (params: P) => R;

export class Bridge<P extends EventParams, R extends EventReturns> {
  private sendMessage = chrome.runtime.sendMessage;

  private handlers: {
    [K in keyof P & keyof R]?: EventReceiver<P[K], Promise<R[K]> | R[K]>;
  } = {};

  constructor() {
    this.connect();
  }

  on<K extends EventKey<P>>(
    eventName: K,
    handler: EventReceiver<P[K], Promise<R[K]> | R[K]>,
  ): void {
    this.handlers[eventName] = handler;
  }

  send<K extends EventKey<P>>(eventName: K, data?: P[K]): Promise<R[K]> {
    return new Promise((resolve) => {
      try {
        this.sendMessage({ name: eventName, data }, (response) => {
          resolve(response);
        });
      } catch (error) {
        console.error(error);
      }
    });
  }

  private connect<K extends EventKey<P>>() {
    chrome.runtime.onMessage.addListener(
      (event: { name: K; data?: P[K] }, sender, sendResponse) => {
        const { name, data } = event;
        const handler = this.handlers[name];
        if (!handler) {
          throw new Error(`No handler associated for ${name}`);
        }
        const result = handler(data as any);
        if (result && (result as any).then) {
          (result as any).then(sendResponse);
        } else {
          sendResponse(result);
        }

        return true;
      },
    );
  }
}
