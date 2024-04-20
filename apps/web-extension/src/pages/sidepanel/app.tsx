import { Provider } from 'jotai';
import ChatPage from './pages/chat';
import { store } from './store';
import { useEffect } from 'react';
import bridge from './bridge';

export default function App() {
  useEffect(() => {
    bridge.send('loadSidePanel');
  });

  return (
    <Provider store={store}>
      <ChatPage />
    </Provider>
  );
}
