import { useAtomValue } from 'jotai';
import { messageStore, messagesAtom } from '../store';

export function useMessage() {
  const messages = useAtomValue(messagesAtom);

  return {
    messages,
    getMessageByIndex: messageStore.getMessageByIndex,
  };
}
