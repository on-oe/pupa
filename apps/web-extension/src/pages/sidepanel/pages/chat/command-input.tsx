import {
  FileAddOutlined,
  HistoryOutlined,
  PlusSquareFilled,
  SendOutlined,
} from '@ant-design/icons';
import { Button, Popover } from 'antd';
import { useEffect, useState } from 'react';
import type { Channel } from '@pupa/universal/types';
import { useInputMenu } from '../../hooks/use-input-menu';
import { isEnterKey } from '../../utils/keyboard';
import { AutoSizeTextarea } from '../../components/auto-size-textarea';
import { AppMenu } from './app-menu';
import { CommandMenu } from './command-menu';
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

// function getSlashCommandDataFromInteraction(interaction: Interaction) {
//   const command = interaction.data!;
//   return {
//     application: {
//       id: interaction.application_id,
//       name: interaction.application_id,
//       description: "",
//       icon: "",
//     },
//     command: {
//       name: command.name,
//       description: "",
//       type: command.type,
//     },
//     interactionId: interaction.id,
//   };
// }

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
  const { applications, allCommands, getAppCommand, getApplication } =
    useApplication();
  const { addChannel, currentChannel } = useChannel();
  const [placeholder, setPlaceholder] = useState<string>('');
  const { onKeydown: onSelectAppKeydown, selectedIndex: selectedAppIndex } =
    useInputMenu({
      length: applications.length,
      onSelect: (index) => {
        setCurrentApp(applications[index]);
      },
    });
  const { onKeydown: onSelectCmdKeydown, selectedIndex: selectedCmdIndex } =
    useInputMenu({
      length: allCommands.length,
      onSelect: (index) => {
        const cmd = allCommands[index];
        setCurrentCommand(cmd);
        setInput('');
      },
    });

  useEffect(() => {
    if (currentApp) {
      setPlaceholder(`How can ${currentApp.name} assist you today?`);
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
    setCurrentApp(null);
    setCurrentCommand(null);
  };

  async function onSend() {
    if (currentCommand) {
      if (!currentChannel) {
        const channel = await addChannel({
          name: `Chat for ${currentCommand.name}`,
        });
        onSlashCommand(channel);
      } else {
        onSlashCommand(currentChannel);
      }
    }
    resetInput();
  }

  async function onSlashCommand(channel: Channel) {
    if (!currentCommand) return;
    const application = getApplication(currentCommand.applicationId)!;
    applicationStore.execSlashCommand({
      applicationId: application.id,
      channelId: channel.id,
      data: {
        ...currentCommand,
        options: currentCommandValOpts,
      },
    });
    // store.state.runningCommand = {
    //   application,
    //   command: currentCommand,
    // };
    // store.state.runningCommand =
    //   getSlashCommandDataFromInteraction(interaction);
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
    if (isShowAppPanel) {
      onSelectAppKeydown(e);
    } else if (isShowCommandPanel) {
      onSelectCmdKeydown(e);
    } else if (input.length === 0 && e.key === 'Backspace') {
      resetInput();
    } else if (isEnterKey(e) && currentCommand && input.length > 0) {
      e.preventDefault();
      submitOption(input);
    } else if (isEnterKey(e) && (e.metaKey || e.ctrlKey)) {
      onSend();
    }
  }

  function handleSelectCommand(key: string) {
    const [appId, cmdId] = key.split('-');
    const cmd = getAppCommand(appId, cmdId);
    if (cmd) {
      setCurrentCommand({ applicationId: appId, ...cmd });
      if (cmd.options?.length === 0) {
        onSend();
      }
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
            <AppMenu selectedIndex={selectedAppIndex} />
          ) : (
            <CommandMenu
              selectedIndex={selectedCmdIndex}
              onSelect={handleSelectCommand}
            />
          )
        }
      >
        <div className="bg-[#f7f7f7] rounded-xl transition-all py-2 px-3">
          <CommandInputStatus />
          <AutoSizeTextarea
            className="resize-none w-full outline-none bg-transparent overflow-auto min-h-[60px]"
            placeholder={
              placeholder || "press '@' for chat, '/' for commands..."
            }
            minHeight={60}
            maxHeight={120}
            value={input}
            onChange={handleMsgChange}
            onKeyDown={handleMsgKeydown}
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
