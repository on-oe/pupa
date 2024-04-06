import withSuspense from "@shared/hoc/withSuspense";
import withErrorBoundary from "@shared/hoc/withErrorBoundary";
import { useEffect } from "react";
import type { Channel } from "@pupa/universal/types";
import { FetchChannelsEvent } from "@shared/bridge/events/message";
import { CommandInput } from "./command-input";
import { ChatHistory } from "./chat-history";
import { MessageList } from "./message-list";
import { Header } from "./header";
import bridge from "../../bridge";
import { applicationStore, channelStore } from "../../store";
import { store } from "./store";

function App() {
  useEffect(() => {
    applicationStore.fetchApplications();
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
