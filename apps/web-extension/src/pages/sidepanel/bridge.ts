import { BridgeNode } from "@shared/bridge/bridge-node";
import {
  ReceiveMessageEvent,
  UpdateMessageEvent,
} from "@shared/bridge/events/message";
import { AddOrUpdateAppEvent, RefreshInstalledAppsEvent, RemoveAppEvent } from "@shared/bridge/events/application";
import type { Message } from "@pupa/universal/types";
import { applicationStore, messageStore } from "./store";

const bridge = new BridgeNode();
export default bridge;

bridge.addHandler(ReceiveMessageEvent, (msg) => {
  messageStore.addMessage(msg);
});

bridge.addHandler(UpdateMessageEvent, (message: Message) => {
  messageStore.updateMessage(message);
});

bridge.addHandler(RefreshInstalledAppsEvent, () => {
  applicationStore.fetchApplications();
});

bridge.addHandler(AddOrUpdateAppEvent, (app) => {
  applicationStore.addOrUpdateApp(app);
});

bridge.addHandler(RemoveAppEvent, (appId) => {
  applicationStore.removeApp(appId);
});
