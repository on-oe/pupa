import type { Channel } from "@pupa/universal/types";
import { createStore } from "./store";

export const channelStore = createStore({
  state: { channels: [] as Channel[] },
  actions: {
    addChannel: (state, channel: Channel) => {
      state.channels.unshift(channel);
    },
    setChannels: (state, channels: Channel[]) => {
      Object.assign(state, { channels });
    },
    deleteChannel: (state, channelId: string) => {
      const channels = state.channels.filter(
        (channel) => channel.id !== channelId,
      );
      Object.assign(state, { channels });
    },
    getChannelById: (state, channelId: string) =>
      state.channels.find((channel) => channel.id === channelId) || null,
  },
  getters: {
    length: (state) => state.channels.length,
    lastChannel: (state) => state.channels[state.channels.length - 1],
  },
});
