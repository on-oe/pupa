import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Drawer, List } from 'antd';
import { channelStore } from '../../store';
import { isOpenHistoryAtom } from './state';
import { useChannel } from '../../hooks/use-channel';
import { useAtom } from 'jotai';

export function ChatHistory() {
  const { channels } = useChannel();
  const [isOpenHistory, setIsOpenHistory] = useAtom(isOpenHistoryAtom);

  function onSelectChatHistory(channelId: string) {
    channelStore.setCurrentChannel(channelId);
    setIsOpenHistory(false);
  }

  async function handleDelChannel(e: React.MouseEvent, channelId: string) {
    e.stopPropagation();
    channelStore.deleteChannel(channelId);
  }

  function handleClose() {
    setIsOpenHistory(false);
  }

  return (
    <>
      <Drawer
        placement="bottom"
        title="Chat History"
        size="large"
        open={isOpenHistory}
        onClose={handleClose}
      >
        <List>
          {channels.map((channel) => (
            <List.Item
              className="cursor-pointer hover:bg-slate-200"
              key={channel.id}
              onClick={() => onSelectChatHistory(channel.id)}
              actions={[
                <Button size="small" icon={<EditOutlined />} key="edit" />,
                <Button
                  size="small"
                  icon={<DeleteOutlined />}
                  key="del"
                  onClick={(e) => handleDelChannel(e, channel.id)}
                />,
              ]}
            >
              <List.Item.Meta
                title={channel.name}
                description={
                  <div className="text-ellipsis overflow-hidden whitespace-nowrap">
                    {channel.last_message?.content || 'New Chat'}
                  </div>
                }
              />
            </List.Item>
          ))}
        </List>
      </Drawer>
    </>
  );
}
