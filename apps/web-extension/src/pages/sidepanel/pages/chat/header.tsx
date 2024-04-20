import { useChannel } from '../../hooks/use-channel';

export function Header() {
  const { currentChannel } = useChannel();

  return <h2 className="text-xl">{currentChannel?.name || 'New Chat'}</h2>;
}
