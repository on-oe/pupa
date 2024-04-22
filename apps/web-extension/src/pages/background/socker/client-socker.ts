import type { ApplicationWithCommands, Message } from '@pupa/universal/types';
import { pageFn, type ExecutePageFnOptions } from '../services/page-fn';
import { type Socket, io } from 'socket.io-client';
import { applicationStore, messageStore } from '../store';

export class ClientSocker {
  private socket?: Socket;

  constructor() {}

  private get host() {
    if (!this.socket) {
      throw new Error('socket is not connected');
    }
    return this.socket;
  }

  private handlers = {
    execute_page_fn: (data: ExecutePageFnOptions) => {
      pageFn.execute(data);
    },
    new_message: (data: Message) => {
      messageStore.addMessage(data);
    },
    update_message: (data: Message) => {
      messageStore.updateMessage(data);
    },
    dev_application_started: (app: ApplicationWithCommands) => {
      applicationStore.addOrUpdateApp(app);
    },
    dev_application_updated: (data: {
      shouldRefresh: boolean;
      application: ApplicationWithCommands;
    }) => {
      applicationStore.addOrUpdateApp(data.application);
    },
    dev_application_stopped: (id: string) => {
      applicationStore.removeApp(id);
    },
  };

  async connect() {
    const cookie = await chrome.cookies.get({
      url: 'http://localhost:3000',
      name: 'Authorization',
    });
    if (!cookie) {
      return console.error('403 Forbidden to connect to socket server');
    }
    const socket = io('http://localhost:3000/chat', {
      transports: ['websocket'],
      query: {
        token: cookie.value,
      },
    });
    this.socket = socket;
    socket.on('connect', () => {
      console.log('socket connected');
      this.onConnect();
    });
    socket.on('disconnect', () => {
      console.log('socket disconnected');
      this.onDisconnect();
    });
    socket.on('error', (error) => {
      console.error('socket error', error);
    });
    socket.on('connect_error', (error) => {
      console.error('socket connect error', error);
    });
  }

  private onConnect() {
    Object.entries(this.handlers).forEach(([event, handler]) => {
      this.host.on(event, handler);
    });
  }

  private onDisconnect() {
    Object.entries(this.handlers).forEach(([event, handler]) => {
      this.host.off(event, handler);
    });
  }
}
