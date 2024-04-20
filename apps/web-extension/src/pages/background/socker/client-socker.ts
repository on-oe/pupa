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

  async connect() {
    const cookie = await chrome.cookies.get({ url: 'http://localhost:3000', name: 'Authorization' });
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
      this.onConnected();
    });
    socket.on('disconnect', () => {
      console.log('socket disconnected');
    });
    socket.on('error', (error) => {
      console.error('socket error', error);
    });
    socket.on('connect_error', (error) => {
      console.error('socket connect error', error);
    });
  }

  private onConnected() {
    this.host.on('execute_page_fn', (data) => {
      console.log('execute_page_fn', data);
      pageFn.execute(data as ExecutePageFnOptions);
    });
    this.host.on('new_message', (data: Message) => {
      messageStore.addMessage(data);
    });
    this.host.on('update_message', (data) => {
      messageStore.updateMessage(data);
    });
    this.host.on('dev_application_started', (app: ApplicationWithCommands) => {
      applicationStore.addOrUpdateApp(app);
    });
    this.host.on(
      'dev_application_updated',
      (data: {
        shouldRefresh: boolean;
        application: ApplicationWithCommands;
      }) => {
        applicationStore.addOrUpdateApp(data.application);
    });
    this.host.on('dev_application_stopped', (id: string) => {
      applicationStore.removeApp(id);
    });
  }
}
