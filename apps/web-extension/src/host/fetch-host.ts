import {
  InteractionType,
  type Application,
  type InteractionData,
} from "@pupa/universal/types";
import type { InteractionHost } from "./irc-host";
import { createChannel, type Repository } from "./repository";

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
    const endpoint = id;
    const app = (await fetch(`${endpoint}/install`).then((res) =>
      res.json(),
    )) as Application;
    app.dev = true;
    app.interactions_endpoint_url = endpoint;
    await this.appendInstalledApp(app);
    return app;
  }

  getInstalledApps() {
    return this.repository.getInstalledApps();
  }

  async getChannels() {
    const channels = await this.repository.getChannels();
    return channels;
  }

  addChannel() {
    return this.repository.createChannel(createChannel());
  }

  deleteChannel(channelId: string) {
    return this.repository.deleteChannel(channelId);
  }

  async getMessages(channelId: string) {
    return this.repository.getMessages(channelId);
  }

  private async appendInstalledApp(app: Application) {
    await this.repository.appendInstalledApp(app);
    return app;
  }
}
