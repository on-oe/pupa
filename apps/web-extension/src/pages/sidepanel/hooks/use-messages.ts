import {
  CreateMessageEvent,
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

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannel] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const fetchChannel = async () => {
      const channels = await bridge.send<Channel[]>(
        FetchChannelsEvent.create(),
      );
      setChannel(channels);
    };

    fetchChannel();
  }, []);

  useEffect(() => {
    if (channels.length > 0 && !currentChannel) {
      setCurrentChannel(channels[channels.length - 1]);
    }
  }, [channels, currentChannel]);

  useEffect(() => {
    const fetchMessages = async (channelId: string) => {
      const messages = await bridge.send<Message[]>(
        FetchMessagesEvent.create({ channelId }),
      );
      setMessages(messages);
    };

    if (currentChannel) {
      fetchMessages(currentChannel.id);
    }
  }, [currentChannel]);

  function sendMessage(content: string) {
    bridge.send(
      CreateMessageEvent.create({ content, channelId: currentChannel!.id }),
    );
  }

  function sendSlashCommand(data: {
    application: Application;
    command: Command;
    options: InteractionDataOption[];
  }) {
    if (!currentChannel) return;
    bridge.send(
      ExecSlashCommandEvent.create({
        applicationId: data.application.id,
        channelId: currentChannel.id,
        data: {
          ...data.command,
          options: data.options,
        },
      }),
    );
  }

  return {
    channels,
    currentChannel,
    setCurrentChannel,
    messages,
    sendMessage,
    sendSlashCommand,
  } as const;
}
