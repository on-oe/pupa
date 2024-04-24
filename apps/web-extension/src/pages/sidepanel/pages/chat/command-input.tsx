import {
  FileAddOutlined,
  HistoryOutlined,
  PlusSquareFilled,
  SendOutlined,
} from '@ant-design/icons';
import { Avatar, Button, List, Popover } from 'antd';
import { useEffect, useState } from 'react';
import type { Channel, Command } from '@pupa/universal/types';
import { isEnterKey } from '../../utils/keyboard';
import { AutoSizeTextarea } from '../../components/auto-size-textarea';
import { CommandInputStatus } from './command-input-status';
import { useApplication } from '../../hooks/use-application';
import { useChannel } from '../../hooks/use-channel';
import { useAtom } from 'jotai';
import {
  currentAppAtom,
  currentCommandAtom,
  currentCommandValOptsAtom,
  currentOptionAtom,
  inputAtom,
  isOpenHistoryAtom,
  isShowAppPanelAtom,
  isShowCommandPanelAtom,
} from './state';
import { channelStore, applicationStore } from '../../store';
import { InputMenu, interceptKeydown } from './input-menu';

export function CommandInput() {
  const [, setIsOpenHistory] = useAtom(isOpenHistoryAtom);
  const [currentApp, setCurrentApp] = useAtom(currentAppAtom);
  const [currentCommand, setCurrentCommand] = useAtom(currentCommandAtom);
  const [input, setInput] = useAtom(inputAtom);
  const [isShowAppPanel] = useAtom(isShowAppPanelAtom);
  const [isShowCommandPanel] = useAtom(isShowCommandPanelAtom);
  const [currentOption, setCurrentOption] = useAtom(currentOptionAtom);
  const [currentCommandValOpts, setCurrentCommandValOpts] = useAtom(
    currentCommandValOptsAtom,
  );
  const [commands, setCommands] = useState<Command[]>([]);
  const { applications, getAppCommand, getApplication } =
    useApplication();
  const { addChannel, currentChannel } = useChannel();
  const [placeholder, setPlaceholder] = useState<string>('');

  useEffect(() => {
    if (currentApp) {
      setCommands(currentApp.commands);
    } else {
      setCommands([]);
    }
  }, [currentApp]);

  useEffect(() => {
    if (currentApp && !currentCommand) {
      setPlaceholder('press / for command, or type to chat...')
    } else if (currentCommand) {
      if (!currentOption)
        setPlaceholder(`⌘ + Enter to send ${currentCommand.name} command`);
    } else {
      setPlaceholder('');
    }
  }, [currentApp, currentCommand, currentOption]);

  useEffect(() => {
    if (currentOption) {
      setPlaceholder(currentOption.description);
    }
  }, [currentOption]);

  const handleHistoryClick = () => {
    setIsOpenHistory(true);
  };

  const handleAddChannelClick = () => {
    channelStore.setCurrentChannel();
  };

  const resetInput = () => {
    setInput('');
    setCurrentCommand(null);
  };

  async function onSend() {
    let channel = currentChannel;
    if (!channel) {
      channel = await addChannel({
        name: `Chat for ${currentCommand?.name || 'New Chat'}`,
      });
    }
    if (currentCommand) {
      onSlashCommand(channel);
    } else {
      sendMessage(channel);
    }
    resetInput();
  }

  function sendMessage(channel: Channel) {
    if (input.length > 0) {
      channelStore.sendMessage(input, channel.id);
    }
  }

  async function onSlashCommand(channel: Channel) {
    if (!currentCommand || !currentApp) return;
    applicationStore.execSlashCommand({
      applicationId: currentApp.id,
      channelId: channel.id,
      data: {
        ...currentCommand,
        options: currentCommandValOpts,
      },
    });
  }

  const handleAtClick = () => {
    setInput('@');
  };

  function handleMsgChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
  }

  function submitOption(value: string) {
    if (currentOption) {
      const index = currentCommandValOpts.findIndex(
        (opt) => opt.name === currentOption.name,
      );
      if (index > -1) {
        currentCommandValOpts[index].value = value;
        setCurrentCommandValOpts([...currentCommandValOpts]);
      } else {
        setCurrentCommandValOpts([
          ...currentCommandValOpts,
          { ...currentOption, value },
        ]);
      }
      setInput('');
      const nextOpt = currentCommand?.options?.find(
        (opt) => opt.name !== currentOption.name,
      );
      if (nextOpt) {
        setCurrentOption(nextOpt);
      }
    }
  }

  function handleMsgKeydown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (input.length === 0 && e.key === 'Backspace') {
      if (currentCommand) {
        setCurrentCommand(null);
      } else {
        setCurrentApp(null);
      }
    } else if (isEnterKey(e) && currentCommand && input.length > 0) {
      e.preventDefault();
      submitOption(input);
    } else if (isEnterKey(e) && (e.metaKey || e.ctrlKey)) {
      onSend();
    }
  }

  return (
    <div className="relative px-2 pb-1 pt-4 text-sm">
      <div className=" flex justify-between items-center">
        <div>
          <Button
            icon={<HistoryOutlined />}
            type="link"
            size="small"
            onClick={handleHistoryClick}
          />
          <Button
            icon={<PlusSquareFilled />}
            type="link"
            size="small"
            onClick={handleAddChannelClick}
          />
        </div>
      </div>
      <Popover
        open={isShowAppPanel || isShowCommandPanel}
        overlayClassName="w-[calc(100%-24px)]"
        overlayInnerStyle={{
          padding: '4px',
        }}
        placement="top"
        align={{
          offset: [0, -8],
        }}
        arrow={false}
        content={
          isShowAppPanel ? (
            <InputMenu
              list={applications}
              Meta={(app) => <List.Item.Meta avatar={<Avatar src={app.icon} />} title={app.name} description={app.description} />}
              onSelect={app => {
                setCurrentApp(app);
                setInput('');
              }} />
          ) : (
            <InputMenu
              list={commands}
              Meta={(cmd) => <List.Item.Meta title={'/' + cmd.name} description={cmd.description} />}
              onSelect={cmd => {
                setCurrentCommand(cmd);
                setInput('');
              }} />
          )
        }
      >
        <div className="bg-[#f7f7f7] rounded-xl transition-all py-2 px-3">
          <CommandInputStatus />
          <AutoSizeTextarea
            className="resize-none w-full outline-none bg-transparent overflow-auto min-h-[60px]"
            placeholder={
              placeholder || "press '@' for Copilot, or type to chat..."
            }
            minHeight={60}
            maxHeight={120}
            value={input}
            onChange={handleMsgChange}
            onKeyDown={interceptKeydown(handleMsgKeydown)}
          />
          <div className="flex py-1 justify-between items-center">
            <div className="flex items-center">
              <Button size="small" type="link" icon={<FileAddOutlined />} />
              <Button size="small" type="link" onClick={handleAtClick}>
                @
              </Button>
            </div>
            <Button
              size="small"
              type="link"
              icon={<SendOutlined />}
              onClick={() => onSend()}
              className="cursor-pointer"
            />
          </div>
        </div>
      </Popover>
    </div>
  );
}
