import type { Channel, Message } from '@pupa/universal/types';
import { atom } from 'jotai';
import { store } from './store';
import { fetcher } from '../services/fetcher';
import bridge from '../bridge';

export const channelsAtom = atom([] as Channel[]);
export const currentChannelAtom = atom<Channel | null>(null);
export const messagesAtom = atom([] as Message[]);

export const channelStore = {
  async load() {
    const channels = await fetcher.getChannels();
    store.set(channelsAtom, channels);
  },
  addChannel(channel: Channel) {
    store.set(channelsAtom, (channels) => {
      channels.unshift(channel);
      return channels;
    });
  },
  deleteChannel(channelId: string) {
    store.set(channelsAtom, (channels) => {
      return channels.filter((channel) => channel.id !== channelId);
    });
  },
  getChannelById(channelId: string) {
    return (
      store.get(channelsAtom).find((channel) => channel.id === channelId) ||
      null
    );
  },
};

export const messageStore = {
  addMessage(message: Message) {
    store.set(messagesAtom, (messages) => [...messages, message]);
  },
  updateMessage(message: Message) {
    store.set(messagesAtom, (messages) => {
      const index = messages.findIndex((m) => m.id === message.id);
      if (index !== -1) {
        messages[index] = message;
      }
      return messages;
    });
    bridge.send('messageUpdated', message);
  },
};

store.sub(currentChannelAtom, async () => {
  const channel = store.get(currentChannelAtom);
  if (!channel) {
    store.set(messagesAtom, []);
  } else {
    const messages = await fetcher.getMessages(channel.id);
    store.set(messagesAtom, messages);
  }
});

store.sub(channelsAtom, () => {
  bridge.send('channelsChanged', store.get(channelsAtom));
});

store.sub(messagesAtom, () => {
  bridge.send('messagesChanged', store.get(messagesAtom));
});

store.sub(currentChannelAtom, () => {
  bridge.send('currentChannelChanged', store.get(currentChannelAtom));
});
