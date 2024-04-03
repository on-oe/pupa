import type { InteractionData, Message } from "@pupa/universal/types";
import { fetchHost } from "@host";
import { BaseAbortFetcher } from "./abort-fetcher";
import type { BaseFetcher } from "./base-fetcher";

export class ClientFetcher extends BaseAbortFetcher implements BaseFetcher {
  private host = fetchHost;

  postPageMessage(
    applicationId: string,
    channelId: string,
    data: InteractionData,
  ): void {
    this.host.postPageMessage(applicationId, channelId, data);
  }

  async execSlashCommand(
    applicationId: string,
    channelId: string,
    data: InteractionData,
  ) {
    return this.host.execSlashCommand(applicationId, channelId, data);
  }

  async installApp(id: string) {
    return this.host.installApp(id);
  }

  getInstalledApps() {
    return this.host.getInstalledApps();
  }

  getChannels() {
    return this.host.getChannels();
  }

  getMessages(channelId: string): Promise<Message[]> {
    return this.host.getMessages(channelId);
  }

  addChannel() {
    return this.host.addChannel();
  }

  deleteChannel(channelId: string) {
    return this.host.deleteChannel(channelId);
  }
}
