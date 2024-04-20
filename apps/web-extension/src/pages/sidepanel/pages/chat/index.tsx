import withSuspense from '@shared/hoc/withSuspense';
import withErrorBoundary from '@shared/hoc/withErrorBoundary';
import { CommandInput } from './command-input';
import { ChatHistory } from './chat-history';
import { MessageList } from './message-list';
import { Header } from './header';

function App() {
  return (
    <div className=" w-screen h-screen bg-default-100 p-1">
      <div className="w-full h-full rounded-xl bg-white flex flex-col">
        <Header />
        <MessageList />
        <CommandInput />
      </div>
      <ChatHistory />
    </div>
  );
}

export default withErrorBoundary(
  withSuspense(App, <div> Loading ... </div>),
  <div> Error Occur </div>,
);
