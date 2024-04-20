import type { ApplicationWithCommands, Channel } from '@pupa/universal/types';
import { bridge } from '@shared/bridge';
import {
  applicationsAtom,
  channelsAtom,
  currentChannelAtom,
  messagesAtom,
  store,
} from './store';

export const applicationContext = {
  updateApplications(applications: ApplicationWithCommands[]) {
    store.set(applicationsAtom, applications);
  },
};

export const channelContext = {
  updateChannels(channels: Channel[]) {
    store.set(channelsAtom, channels);
  },
  updateCurrentChannel(channel: Channel | null) {
    store.set(currentChannelAtom, channel);
  },
};

bridge.on('applicationsChanged', (apps) => {
  applicationContext.updateApplications(apps);
});

bridge.on('channelsChanged', (channels) => {
  channelContext.updateChannels(channels);
});

bridge.on('currentChannelChanged', (channel) => {
  channelContext.updateCurrentChannel(channel);
});

bridge.on('messagesChanged', (messages) => {
  store.set(messagesAtom, messages);
});

bridge.on('messageUpdated', (message) => {
  store.set(messagesAtom, (messages) => {
    const index = messages.findIndex((m) => m.id === message.id);
    if (index !== -1) {
      messages[index] = message;
    }
    return [...messages];
  });
});

export default bridge;
