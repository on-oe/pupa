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
    const channels = await this.getChannelsStorage();
    return Object.values(channels);
  }

  async getChannel(id: string): Promise<Channel | undefined> {
    const channels = await this.getChannelsStorage();
    return channels[id];
  }

  async createChannel(channel: Channel) {
    const channels = await this.getChannelsStorage();
    channels[channel.id] = channel;
    this.storage.set({ [this.keys.channels]: channels });
    return channel;
  }

  async appendInstalledApp(app: Application) {
    const installedApps = await this.getAppsStorage();
    installedApps[app.id] = app;
    this.storage.set({ installedApps });
    return app;
  }

  async getMessages(channelId: string): Promise<Message[]> {
    const messages = await this.getMessageStorage(channelId);
    return Object.values(messages);
  }

  async appendMessage(message: Message) {
    const { channel_id: channelId } = message;
    const messages = await this.getMessageStorage(channelId);
    messages[message.id] = message;
    this.storage.set({ [getMessageStorageKey(channelId)]: messages });
    return message;
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

  private async getChannelsStorage(): Promise<Record<string, Channel>> {
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
}): Message {
  return {
    ...data,
    id: createId(),
    type: data.type ?? MessageType.DEFAULT,
    channel_id: data.channelId,
  };
}

export function createChannel(): Channel {
  return {
    id: createId(),
  };
}
