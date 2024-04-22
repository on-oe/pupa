import { Avatar } from 'antd';
import { useEffect, useRef } from 'react';
import { MessageComponent } from '../../components/message';
import { useMessage } from '../../hooks/use-message';

export function MessageList() {
  const { messages } = useMessage();
  // const { runningCommand } = useSnapshot(store.state);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // useEffect(() => {
  //   const resolvedCommand = messages.some(
  //     (message) => message.interaction_id === runningCommand?.interactionId,
  //   );
  //   if (resolvedCommand) {
  //     store.state.runningCommand = undefined;
  //   }
  // }, [messages, runningCommand]);

  return (
    <div className="flex-1 pb-9 overflow-auto p-2">
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          avatar={message.user.avatar}
          username={message.user.bot ? message.user.name : 'You'}
        >
          <MessageComponent message={message} />
        </MessageItem>
      ))}
      {/* {runningCommand && (
        <MessageItem
          avatar={runningCommand.application.icon!}
          username={runningCommand.application.name!}
          reference={`/${runningCommand.command.name}`}
        >
          <div className="w-4 h-4 my-2 bg-stone-900 rounded-full animate-breathe" />
        </MessageItem>
      )} */}
      <div ref={endOfMessagesRef} />
    </div>
  );
}

interface MessageItemProps extends React.PropsWithChildren {
  avatar: string;
  username: string;
  reference?: string;
}

function MessageItem({
  avatar,
  username,
  reference,
  children,
}: MessageItemProps) {
  return (
    <div className="flex px-1 py-3">
      <div className="mr-[6px]">
        <Avatar src={avatar} className="w-6 h-6 text-tiny" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-base">{username}</div>
        {reference && <div className="opacity-40">{reference}</div>}
        {children}
      </div>
    </div>
  );
}
