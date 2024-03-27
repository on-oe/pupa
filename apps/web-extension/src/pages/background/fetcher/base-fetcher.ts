import type {
  Application,
  InteractionData,
  Channel,
  Message,
} from "@pupa/universal/types";

export interface BaseFetcher {
  installApp(id: string): Promise<Application>;

  getInstalledApps(): Promise<Application[]>;

  getChannels(): Promise<Channel[]>;

  getMessages(channelId: string): Promise<Message[]>;

  execSlashCommand(
    applicationId: string,
    channelId: string,
    data: InteractionData,
  ): Promise<void>;

  postPageMessage(
    applicationId: string,
    channelId: string,
    data: InteractionData,
  ): void;

  get abort(): () => boolean;
}
