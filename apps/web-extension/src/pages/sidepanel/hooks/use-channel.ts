import { useAtomValue } from 'jotai';
import { channelStore, channelsAtom, currentChannelAtom } from '../store';

export function useChannel() {
  const channels = useAtomValue(channelsAtom);
  const currentChannel = useAtomValue(currentChannelAtom);

  const addChannel = async (options?: { name: string }) => {
    return channelStore.addChannel(options);
  };

  return {
    channels,
    currentChannel,
    addChannel,
  };
}
