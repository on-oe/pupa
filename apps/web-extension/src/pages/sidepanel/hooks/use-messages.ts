import {
  AddChannelEvent,
  CreateMessageEvent,
  DeleteChannelEvent,
  FetchChannelsEvent,
  FetchMessagesEvent,
} from "@shared/bridge/events/message";
import type {
  Application,
  Channel,
  Command,
  InteractionDataOption,
  Message,
} from "@pupa/universal/types";
import { useEffect, useState } from "react";
import { ExecSlashCommandEvent } from "@shared/bridge/events/application";
import { bridge } from "../bridge";
import { channelStore, messageStore } from "../store";

export function useMessages() {
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const fetchChannel = async () => {
      const list = await bridge.send<Channel[]>(FetchChannelsEvent.create());
      channelStore.setChannels(list);
      setCurrentChannel(channelStore.lastChannel);
    };

    fetchChannel();
  }, []);

  useEffect(() => {
    const fetchMessages = async (channelId: string) => {
      const messages = await bridge.send<Message[]>(
        FetchMessagesEvent.create({ channelId }),
      );
      messageStore.updateMessages(messages);
    };

    if (currentChannel) {
      fetchMessages(currentChannel.id);
    } else {
      messageStore.updateMessages([]);
    }
  }, [currentChannel]);

  function sendMessage(content: string) {
    bridge.send(
      CreateMessageEvent.create({ content, channelId: currentChannel!.id }),
    );
  }

  async function sendSlashCommand(data: SlashCommandData) {
    if (!currentChannel) {
      const channel = await bridge.send<Channel>(AddChannelEvent.create());
      setCurrentChannel(channel);
      onSlashCommand(data, channel);
    } else {
      onSlashCommand(data, currentChannel);
    }
  }

  function onSlashCommand(data: SlashCommandData, channel: Channel) {
    bridge.send(
      ExecSlashCommandEvent.create({
        applicationId: data.application.id,
        channelId: channel.id,
        data: {
          ...data.command,
          options: data.options,
        },
      }),
    );
  }

  function addChannel() {
    setCurrentChannel(null);
  }

  async function delChannel(channelId: string) {
    await bridge.send(DeleteChannelEvent.create({ channelId }));
    channelStore.deleteChannel(channelId);
    setCurrentChannel(channelStore.lastChannel);
  }

  return {
    currentChannel,
    setCurrentChannel,
    sendMessage,
    sendSlashCommand,
    addChannel,
    delChannel,
  } as const;
}

interface SlashCommandData {
  application: Application;
  command: Command;
  options: InteractionDataOption[];
}
