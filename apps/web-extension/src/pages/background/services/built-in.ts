import type { InteractionData } from '@pupa/universal/types';
import {
  installDevAppCommand,
  loginCommand,
  updateDevAppCommand,
} from '@shared/built-in-app';
import { getDataOptionValue } from '@pupa/universal/utils';
import { RefreshInstalledAppsEvent } from '@shared/bridge/events/application';
import type { BaseFetcher } from '../fetcher/base-fetcher';
import { fetcher } from './fetcher';
import { bridge } from '../bridge';

class BuiltIn {
  constructor(private fetcher: BaseFetcher) {
    this.fetcher = fetcher;
  }

  executeCommand(data: InteractionData) {
    if (data.name === installDevAppCommand.name && data.options) {
      const port = getDataOptionValue<number>(data.options, 'port');
      if (port) {
        this.installDevApp(port);
      }
    } else if (data.name === updateDevAppCommand.name) {
      this.updateDevApp();
    } else if (data.name === loginCommand.name && data.options) {
      const username = getDataOptionValue<string>(data.options, 'username');
      const password = getDataOptionValue<string>(data.options, 'password');
      if (username && password) {
        this.login(username, password);
      }
    }
  }

  private async login(username: string, password: string) {
    await this.fetcher.login(username, password);
  }

  private async installDevApp(port: number) {
    await this.fetcher.installApp(`http://localhost:${port}`);
    bridge.send(RefreshInstalledAppsEvent.create());
  }

  private async updateDevApp() {
    await this.fetcher.updateInstalledApps();
    bridge.send(RefreshInstalledAppsEvent.create());
  }
}

export const builtIn = new BuiltIn(fetcher);
