import type {
  Application,
  InteractionData,
  Channel,
  Message,
  Interaction,
} from "@pupa/universal/types";

export interface BaseFetcher {
  installApp(id: string): Promise<Application>;

  getInstalledApps(): Promise<Application[]>;

  updateInstalledApps(): Promise<Application[]>;

  getChannels(): Promise<Channel[]>;

  addChannel(): Promise<Channel>;

  deleteChannel(channelId: string): Promise<void>;

  getMessages(channelId: string): Promise<Message[]>;

  execSlashCommand(
    applicationId: string,
    channelId: string,
    data: InteractionData,
  ): Promise<Interaction>;

  postPageMessage(
    applicationId: string,
    channelId: string,
    data: InteractionData,
  ): void;

  get abort(): () => boolean;
}
