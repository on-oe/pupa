import { wsHost } from "@host";
import {
  ReceiveMessageEvent,
  UpdateMessageEvent,
} from "@shared/bridge/events/message";
import type { Message } from "@pupa/universal/types";
import { pageFn, type ExecutePageFnOptions } from "../services/page-fn";
import { bridge } from "../bridge";

export class ClientSocker {
  private host = wsHost;

  constructor() {
    this.host.on("execute_page_fn", (data) => {
      pageFn.execute(data as ExecutePageFnOptions);
    });
    this.host.on("message", (data) => {
      bridge.send(ReceiveMessageEvent.create(data as Message));
    });
    this.host.on("update_message", (data) => {
      bridge.send(UpdateMessageEvent.create(data as Message));
    });
  }
}
