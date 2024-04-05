import withSuspense from "@shared/hoc/withSuspense";
import withErrorBoundary from "@shared/hoc/withErrorBoundary";
import { useEffect } from "react";
import type { Application, Channel, Command } from "@pupa/universal/types";
import { GetInstalledAppsEvent } from "@shared/bridge/events/application";
import { builtInAppWithCommands } from "@shared/built-in-app";
import { FetchChannelsEvent } from "@shared/bridge/events/message";
import { CommandInput } from "./command-input";
import { ChatHistory } from "./chat-history";
import { MessageList } from "./message-list";
import { Header } from "./header";
import { bridge } from "../../bridge";
import { applicationStore, channelStore } from "../../store";
import { store } from "./store";

function fetchCommand(app: Application): Promise<Command[]> {
  const url = app.interactions_endpoint_url;
  return fetch(`${url}/commands`).then((res) => res.json());
}

async function fetchCommands(apps: Application[]) {
  const list = await Promise.all(apps.map(fetchCommand));
  return list.map((commands, i) => ({
    ...apps[i],
    commands,
  }));
}

function App() {
  useEffect(() => {
    const fetchApplication = async () => {
      const apps = await bridge.send<Application[]>(
        GetInstalledAppsEvent.create(),
      );
      fetchCommands(apps)
        .then((apps) => {
          applicationStore.update([...apps, builtInAppWithCommands]);
        })
        .catch(() => {
          applicationStore.update([builtInAppWithCommands]);
        });
    };

    fetchApplication();
  }, []);

  useEffect(() => {
    const fetchChannel = async () => {
      const list = await bridge.send<Channel[]>(FetchChannelsEvent.create());
      channelStore.setChannels(list);
      store.setCurrentChannel(channelStore.lastChannel);
    };

    fetchChannel();
  }, []);

  return (
    <div className=" w-screen h-screen bg-default-100 p-1">
      <div className="w-full h-full rounded-xl bg-white flex flex-col">
        <Header />
        <MessageList />
        <CommandInput />
      </div>
      <ChatHistory />
    </div>
  );
}

export default withErrorBoundary(
  withSuspense(App, <div> Loading ... </div>),
  <div> Error Occur </div>,
);
