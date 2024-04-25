import { bridge } from '@shared/bridge';
import {
  store,
  channelsAtom,
  currentChannelAtom,
  applicationsAtom,
  messagesAtom,
} from './store';
import { fetcher } from './services/fetcher';
import { admin } from './services/admin';

export const channelContext = {
  updateCurrentChannel(id: string) {
    const channel = store
      .get(channelsAtom)
      .find((channel) => channel.id === id);
    store.set(currentChannelAtom, channel || null);
  },
  async addChannel(opt?: { name: string }) {
    const channel = await fetcher.addChannel(opt);
    store.set(channelsAtom, (channels) => {
      channels.unshift(channel);
      return channels;
    });
    store.set(currentChannelAtom, channel);
    return channel;
  },
  async deleteChannel(id: string) {
    await fetcher.deleteChannel(id);
    store.set(channelsAtom, (channels) => {
      return channels.filter((channel) => channel.id !== id);
    });
    const currentChannel = store.get(currentChannelAtom);
    if (currentChannel && currentChannel.id === id) {
      store.set(currentChannelAtom, null);
    }
  },
};

bridge.on('setCurrentChannel', (channelId) => {
  channelContext.updateCurrentChannel(channelId);
});

bridge.on('deleteChannel', (id) => {
  channelContext.deleteChannel(id);
});

bridge.on('loadSidePanel', () => {
  const applications = store.get(applicationsAtom);
  const channels = store.get(channelsAtom);
  const currentChannel = store.get(currentChannelAtom);
  const messages = store.get(messagesAtom);
  bridge.send('applicationsChanged', applications);
  bridge.send('channelsChanged', channels);
  bridge.send('currentChannelChanged', currentChannel);
  bridge.send('messagesChanged', messages);
  bridge.send('adminChanged', admin.info);
});

bridge.on('addChannel', (opt) => {
  return channelContext.addChannel(opt);
});

bridge.on('execSlashCommand', (payload) => {
  const { channelId, applicationId, data } = payload;
  fetcher.execSlashCommand(applicationId, channelId, data);
});

bridge.on('sendMessage', (payload) => {
  fetcher.sendMessage(payload);
});

bridge.on('openPage', (payload) => {
  fetcher.openPage(payload);
});

export default bridge;
