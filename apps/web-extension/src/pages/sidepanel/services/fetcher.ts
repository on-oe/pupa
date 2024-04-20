import { FetchMessagesEvent } from '@shared/bridge/events/channel';
import bridge from '../bridge';
import { GetInstalledAppsEvent } from '@shared/bridge/events/application';

class Fetcher {
  async getMessages() {
    return await bridge.send(FetchMessagesEvent.create());
  }

  async getInstalledApps() {
    const apps = await bridge.send(GetInstalledAppsEvent.create());
    return apps;
  }
}

export const fetcher = new Fetcher();
