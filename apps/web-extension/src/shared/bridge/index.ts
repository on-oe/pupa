import type {
  ApplicationWithCommands,
  Channel,
  InteractionData,
  Message,
} from '@pupa/universal/types';
import { Bridge } from './bridge';

interface Events {
  setCurrentChannel: string;
  applicationsChanged: ApplicationWithCommands[];
  channelsChanged: Channel[];
  messagesChanged: Message[];
  currentChannelChanged: Channel | null;
  addChannel: { name: string };
  deleteChannel: string;
  loadSidePanel: void;
  execSlashCommand: {
    applicationId: string;
    channelId: string;
    data: InteractionData;
  };
  messageUpdated: Message;
}

interface SenderResponses {
  setCurrentChannel: void;
  addChannel: Channel;
}

export const bridge = new Bridge<Events, SenderResponses>();
