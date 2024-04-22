import {
  type ApplicationWithCommands,
  type Application,
  type Channel,
  type Message,
  type InteractionData,
  type Interaction,
  InteractionType,
  type User,
} from '@pupa/universal/types';
import type { BaseFetcher } from './base-fetcher';
import { BaseAbortFetcher } from './abort-fetcher';
import ky from 'ky';

export class ApiFetcher extends BaseAbortFetcher implements BaseFetcher {
  host = ky.create({
    prefixUrl: import.meta.env.VITE_API_URL,
  });

  constructor() {
    super();
  }

  getUser() {
    return this.host.get('auth/user').json<User>();
  }

  login(username: string, password: string): Promise<void> {
    return this.host
      .post('auth/login', {
        json: {
          email: username,
          password,
        },
      })
      .json();
  }

  async installApp(id: string): Promise<Application> {
    const app = await this.host
      .post('install', { json: { id } })
      .json<ApplicationWithCommands>();
    return app;
  }
  getInstalledApps(): Promise<Application[]> {
    const apps = this.host
      .get('application/installed')
      .json<ApplicationWithCommands[]>();
    return apps;
  }
  updateInstalledApps(): Promise<Application[]> {
    throw new Error('Method not implemented.');
  }
  getChannels(): Promise<Channel[]> {
    return this.host.get('channel').json<Channel[]>();
  }
  addChannel(opt?: { name: string }): Promise<Channel> {
    return this.host.post('channel', { json: opt }).json<Channel>();
  }
  deleteChannel(channelId: string): Promise<void> {
    return this.host.delete(`channel/${channelId}`).json();
  }
  getMessages(channelId: string): Promise<Message[]> {
    return this.host.get(`channel/${channelId}/messages`).json<Message[]>();
  }
  execSlashCommand(
    applicationId: string,
    channelId: string,
    data: InteractionData,
  ): Promise<Interaction> {
    return this.host
      .post('interaction/send', {
        json: {
          type: InteractionType.APPLICATION_COMMAND,
          applicationId,
          channelId,
          data,
        },
      })
      .json<Interaction>();
  }
  postPageMessage(
    applicationId: string,
    channelId: string,
    data: InteractionData,
  ) {
    return this.host.post('interaction/send', {
      json: {
        type: InteractionType.PAGE_FUNCTION_MESSAGE,
        applicationId,
        channelId,
        data,
      },
    });
  }

  sendMessage(payload: {
    content: string;
    channelId: string;
    applicationId?: string;
  }) {
    return this.host.post('channel/message', { json: payload }).json<Message>();
  }

  get abort(): () => boolean {
    return this.abort;
  }
}
