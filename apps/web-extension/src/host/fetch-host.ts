import {
  InteractionType,
  type Application,
  type InteractionData,
} from "@pupa/universal/types";
import type { InteractionHost } from "./irc-host";
import { createChannel, type Repository } from "./repository";

function getApp(id: string): Promise<Application> {
  console.log("getApp", id);
  throw new Error("Not implemented");
}

export class FetchHost {
  constructor(
    private repository: Repository,
    private ircHost: InteractionHost,
  ) {
    this.repository = repository;
    this.ircHost = ircHost;
  }

  async execSlashCommand(
    applicationId: string,
    channelId: string,
    data: InteractionData,
  ) {
    const app = await this.repository.getInstalledApp(applicationId);
    this.ircHost.post(
      InteractionType.APPLICATION_COMMAND,
      app!,
      channelId,
      data,
    );
  }

  async postPageMessage(
    applicationId: string,
    channelId: string,
    data: InteractionData,
  ) {
    const app = await this.repository.getInstalledApp(applicationId);
    this.ircHost.post(
      InteractionType.PAGE_FUNCTION_MESSAGE,
      app!,
      channelId,
      data,
    );
  }

  async installApp(id: string) {
    const app = await getApp(id);
    await this.appendInstalledApp(app);
    return app;
  }

  getInstalledApps() {
    return this.repository.getInstalledApps();
  }

  async getChannels() {
    const channels = await this.repository.getChannels();
    if (channels.length === 0) {
      const channel = await this.repository.createChannel(createChannel());
      return [channel];
    }
    return channels;
  }

  async getMessages(channelId: string) {
    return this.repository.getMessages(channelId);
  }

  private async appendInstalledApp(app: Application) {
    await this.repository.appendInstalledApp(app);
    return app;
  }
}
