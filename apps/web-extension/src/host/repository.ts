import type {
  Application,
  Channel,
  Interaction,
  InteractionData,
  InteractionType,
  Message,
  MessageElement,
  User,
} from "@pupa/universal/types";
import { MessageType } from "@pupa/universal/types";

function getMessageStorageKey(channelId: string) {
  return `host:message_storage_${channelId}`;
}

export class Repository {
  private storage: chrome.storage.StorageArea;

  private keys = {
    installedApps: "host:installed_apps",
    channels: "host:channels",
  };

  constructor() {
    this.storage = chrome.storage.local;
  }

  async getInstalledApps(): Promise<Application[]> {
    const apps = await this.getAppsStorage();
    return Object.values(apps);
  }

  async getInstalledApp(id: string): Promise<Application | undefined> {
    const apps = await this.getAppsStorage();
    return apps[id];
  }

  async getChannels(): Promise<Channel[]> {
    const storage = await this.getChannelsStorage();
    let channels = Object.values(storage);
    const getLastMessage = async (id: string, msgId: string) => {
      const messages = await this.getMessageStorage(id);
      return messages[msgId];
    };
    channels = await Promise.all(
      channels.map(async (channel) => {
        if (channel.last_message_id) {
          const lastMessage = await getLastMessage(
            channel.id,
            channel.last_message_id,
          );
          return { ...channel, last_message: lastMessage };
        }
        return channel;
      }),
    );
    return channels.sort(
      (a, b) => (b.updated_at || b.created_at) - (a.updated_at || b.created_at),
    );
  }

  async getChannel(id: string): Promise<Channel | undefined> {
    const channels = await this.getChannelsStorage();
    const channel = channels[id];
    if (channel.last_message_id) {
      const messages = await this.getMessageStorage(id);
      return { ...channel, last_message: messages[channel.last_message_id] };
    }
    return channel;
  }

  async createChannel(channel: Channel) {
    const channels = await this.getChannelsStorage();
    channels[channel.id] = {
      id: channel.id,
      name: channel.name || "New Chat",
      created_at: Date.now(),
      last_message_id: channel.last_message?.id,
    };
    this.storage.set({ [this.keys.channels]: channels });
    return channel;
  }

  async appendInstalledApp(app: Application) {
    const installedApps = await this.getAppsStorage();
    installedApps[app.id] = app;
    this.storage.set({ [this.keys.installedApps]: installedApps });
    return app;
  }

  async getMessages(channelId: string): Promise<Message[]> {
    const storage = await this.getMessageStorage(channelId);
    const messages = Object.values(storage);
    return messages.sort((a, b) => a.created_at - b.created_at);
  }

  async appendMessage(message: Message) {
    const { channel_id: channelId } = message;
    const messages = await this.getMessageStorage(channelId);
    messages[message.id] = message;
    this.updateChannel(channelId, { last_message_id: message.id });
    this.storage.set({
      [getMessageStorageKey(channelId)]: messages,
    });
    return message;
  }

  async updateChannel(id: string, data: Partial<ChannelTable>) {
    const channels = await this.getChannelsStorage();
    channels[id] = { ...channels[id], ...data, updated_at: Date.now() };
    this.storage.set({ [this.keys.channels]: channels });
  }

  async deleteChannel(id: string) {
    const channels = await this.getChannelsStorage();
    delete channels[id];
    this.storage.set({ [this.keys.channels]: channels });
  }

  private async getMessageStorage(
    channelId: string,
  ): Promise<Record<string, Message>> {
    const key = getMessageStorageKey(channelId);
    const res = await this.storage.get(key);
    return res[key] ?? {};
  }

  private async getAppsStorage(): Promise<Record<string, Application>> {
    const res = await this.storage.get(this.keys.installedApps);
    return res[this.keys.installedApps] ?? {};
  }

  private async getChannelsStorage(): Promise<Record<string, ChannelTable>> {
    const res = await this.storage.get(this.keys.channels);
    return res[this.keys.channels] ?? {};
  }
}

function createId() {
  return Math.random().toString(36).slice(2);
}

export function createInteraction(
  type: InteractionType,
  app: Application,
  channelId: string,
  data?: InteractionData,
): Interaction {
  return {
    id: createId(),
    type,
    application_id: app.id,
    channel_id: channelId,
    data,
  };
}

export function createMessage(data: {
  content: string;
  channelId: string;
  author: User;
  type?: MessageType;
  components?: MessageElement[];
  interaction_id?: string;
}): Message {
  return {
    ...data,
    id: createId(),
    type: data.type ?? MessageType.DEFAULT,
    channel_id: data.channelId,
    created_at: Date.now(),
  };
}

export function createChannel(): Channel {
  return {
    id: createId(),
    created_at: Date.now(),
  };
}

interface ChannelTable {
  id: string;
  name: string;
  created_at: number;
  updated_at?: number;
  last_message_id?: string;
}
