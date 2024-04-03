import type { Channel } from "@pupa/universal/types";
import { proxy } from "valtio";

const state = proxy({
  channels: [] as Channel[],
});

export const channelStore = {
  get state() {
    return state;
  },
  get length() {
    return state.channels.length;
  },
  get lastChannel() {
    return state.channels[state.channels.length - 1];
  },
  addChannel(channel: Channel) {
    state.channels.unshift(channel);
  },
  setChannels(channels: Channel[]) {
    state.channels = channels;
  },
  deleteChannel(channelId: string) {
    state.channels = state.channels.filter(
      (channel) => channel.id !== channelId,
    );
  },
  getChannelById(channelId: string) {
    return state.channels.find((channel) => channel.id === channelId) || null;
  },
};
