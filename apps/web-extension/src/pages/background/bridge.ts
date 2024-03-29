import { BridgeNode } from "@shared/bridge/bridge-node";
import {
  ExecSlashCommandEvent,
  GetInstalledAppsEvent,
} from "@shared/bridge/events/application";
import { builtInApplication, installDevAppCommand } from "@shared/built-in-app";
import { getDataOptionValue } from "@pupa/universal/utils";
import {
  FetchChannelsEvent,
  FetchMessagesEvent,
} from "@shared/bridge/events/message";
import { devApp } from "./services/dev-app";
import { fetcher } from "./services/fetcher";

export const bridge = new BridgeNode();

bridge.addHandler(GetInstalledAppsEvent, async () => {
  const devApps = await devApp.getInstalledApps();
  const apps = await fetcher.getInstalledApps();
  return [...devApps, ...apps];
});

bridge.addHandler(ExecSlashCommandEvent, (payload) => {
  const { data, applicationId, channelId } = payload;
  if (applicationId === builtInApplication.id) {
    if (data.id === installDevAppCommand.id) {
      if (!data.options) return false;
      const port = getDataOptionValue<number>(data.options, "port");
      if (port) devApp.installDevApp(port);
    }
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
