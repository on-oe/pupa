import { atom } from 'jotai';
import { store } from './store';
import type { Channel, Message } from '@pupa/universal/types';
import bridge from '../bridge';

export const channelsAtom = atom([] as Channel[]);
export const currentChannelAtom = atom<Channel | null>(null);

export const channelStore = {
  getChannelById: (channelId: string) => {
    return (
      store.get(channelsAtom).find((channel) => channel.id === channelId) ||
      null
    );
  },
  setCurrentChannel: (id?: string) => {
    bridge.send('setCurrentChannel', id);
  },
  addChannel(options?: { name: string }) {
    return bridge.send('addChannel', options);
  },
  deleteChannel(channelId: string) {
    bridge.send('deleteChannel', channelId);
  },
  sendMessage(message: string, channelId: string) {
    bridge.send('sendMessage', {
      content: message,
      channelId,
    });
  },
};

export const messagesAtom = atom<Message[]>([]);

export const messageStore = {
  resetMessages: (messages: Message[] = []) => {
    store.set(messagesAtom, messages);
  },
  addMessage: (message: Message) => {
    store.set(messagesAtom, (messages) => [...messages, message]);
  },
  updateMessage: (message: Message) => {
    store.set(messagesAtom, (messages) => {
      const index = messages.findIndex((m) => m.id === message.id);
      if (index !== -1) {
        messages[index] = message;
      }
      return messages;
    });
  },
  getMessageByIndex: (index: number) => {
    return store.get(messagesAtom)[index];
  },
};
