import { BridgeNode } from "@shared/bridge/bridge-node";
import { ReceiveMessageEvent } from "@shared/bridge/events/message";
import { messageStore } from "./store";

export const bridge = new BridgeNode();

bridge.addHandler(ReceiveMessageEvent, (msg) => {
  messageStore.addMessage(msg);
});
