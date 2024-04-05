import { BridgeNode } from "@shared/bridge/bridge-node";
import {
  ExecSlashCommandEvent,
  GetInstalledAppsEvent,
} from "@shared/bridge/events/application";
import { builtInApplication } from "@shared/built-in-app";
import {
  AddChannelEvent,
  DeleteChannelEvent,
  FetchChannelsEvent,
  FetchMessagesEvent,
} from "@shared/bridge/events/message";
import { fetcher } from "./services/fetcher";
import { builtIn } from "./services/built-in";

export const bridge = new BridgeNode();

bridge.addHandler(GetInstalledAppsEvent, async () => {
  const apps = await fetcher.getInstalledApps();
  return apps;
});

bridge.addHandler(ExecSlashCommandEvent, (payload) => {
  const { data, applicationId, channelId } = payload;
  if (applicationId === builtInApplication.id) {
    builtIn.executeCommand(data);
    return false;
  }
  return fetcher.execSlashCommand(applicationId, channelId, data);
});

bridge.addHandler(FetchChannelsEvent, () => {
  return fetcher.getChannels();
});

bridge.addHandler(FetchMessagesEvent, (payload) => {
  return fetcher.getMessages(payload.channelId);
});

bridge.addHandler(AddChannelEvent, () => {
  return fetcher.addChannel();
});

bridge.addHandler(DeleteChannelEvent, (payload) => {
  return fetcher.deleteChannel(payload.channelId);
});
