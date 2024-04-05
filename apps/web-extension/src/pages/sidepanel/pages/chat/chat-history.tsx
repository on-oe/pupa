import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Drawer, List } from "antd";
import { useSnapshot } from "valtio";
import { DeleteChannelEvent } from "@shared/bridge/events/message";
import { channelStore } from "../../store";
import { store } from "./store";
import { bridge } from "../../bridge";

export function ChatHistory() {
  const { channels } = useSnapshot(channelStore.state);
  const { isOpenHistory } = useSnapshot(store.state);

  function onSelectChatHistory(channelId: string) {
    store.setCurrentChannel(channelStore.getChannelById(channelId));
    store.toggleHistoryPanel(false);
  }

  async function handleDelChannel(e: React.MouseEvent, channelId: string) {
    e.stopPropagation();
    await bridge.send(DeleteChannelEvent.create({ channelId }));
    channelStore.deleteChannel(channelId);
    store.setCurrentChannel(channelStore.lastChannel);
  }

  function handleClose() {
    store.toggleHistoryPanel(false);
  }

  return (
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
                  {channel.last_message?.content || "New Chat"}
                </div>
              }
            />
          </List.Item>
        ))}
      </List>
    </Drawer>
  );
}
