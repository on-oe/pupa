import type { Message } from "@pupa/universal/types";
import { defineBridgeEvent } from "../define-bridge-event";

export const FetchMessagesEvent = defineBridgeEvent<{ channelId: string }>(
  "FetchMessages",
);

export const FetchChannelsEvent = defineBridgeEvent("FetchChannels");

export const CreateMessageEvent = defineBridgeEvent<{
  content: string;
  channelId: string;
}>("CreateMessage");

export const ReceiveMessageEvent = defineBridgeEvent<Message>("ReceiveMessage");
