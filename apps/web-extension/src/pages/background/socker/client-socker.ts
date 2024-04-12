import {
  ReceiveMessageEvent,
  UpdateMessageEvent,
} from '@shared/bridge/events/message';
import type { ApplicationWithCommands, Message } from '@pupa/universal/types';
import { pageFn, type ExecutePageFnOptions } from '../services/page-fn';
import { bridge } from '../bridge';
import { type Socket, io } from 'socket.io-client';
import { AddOrUpdateAppEvent } from '@shared/bridge/events/application';

export class ClientSocker {
  private socket?: Socket;

  constructor() {}

  private get host() {
    if (!this.socket) {
      throw new Error('socket is not connected');
    }
    return this.socket;
  }

  connect() {
    this.socket = io('http://localhost:3000', {
      protocols: ['websocket'],
    });
    this.onConnected();
  }

  private onConnected() {
    this.host.on('execute_page_fn', (data) => {
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
  }
}
