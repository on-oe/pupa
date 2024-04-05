import { BridgeNode } from "@shared/bridge/bridge-node";
import { ReceiveMessageEvent } from "@shared/bridge/events/message";
import { RefreshInstalledAppsEvent } from "@shared/bridge/events/application";
import { applicationStore, messageStore } from "./store";

export const bridge = new BridgeNode();

bridge.addHandler(ReceiveMessageEvent, (msg) => {
  messageStore.addMessage(msg);
});

bridge.addHandler(RefreshInstalledAppsEvent, () => {
  applicationStore.fetchApplications();
});
