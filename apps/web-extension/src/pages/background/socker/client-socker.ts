import {
  ReceiveMessageEvent,
  UpdateMessageEvent,
} from '@shared/bridge/events/message';
import type { ApplicationWithCommands, Message } from '@pupa/universal/types';
import { pageFn, type ExecutePageFnOptions } from '../services/page-fn';
import { bridge } from '../bridge';
import { type Socket, io } from 'socket.io-client';
import { AddOrUpdateAppEvent, RemoveAppEvent } from '@shared/bridge/events/application';

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
    this.host.on('new_message', (data) => {
      bridge.send(ReceiveMessageEvent.create(data as Message));
    });
    this.host.on('update_message', (data) => {
      bridge.send(UpdateMessageEvent.create(data as Message));
    });
    this.host.on('dev_application_started', (app: ApplicationWithCommands) => {
      bridge.send(AddOrUpdateAppEvent.create(app));
    });
    this.host.on(
      'dev_application_updated',
      (data: {
        shouldRefresh: boolean;
        application: ApplicationWithCommands;
      }) => {
        bridge.send(AddOrUpdateAppEvent.create(data.application));
    });
    this.host.on('dev_application_stopped', (id: string) => {
      bridge.send(RemoveAppEvent.create(id));
    });
  }
}
