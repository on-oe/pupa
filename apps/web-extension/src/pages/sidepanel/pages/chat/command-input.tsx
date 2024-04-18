import {
  FileAddOutlined,
  HistoryOutlined,
  PlusSquareFilled,
  SendOutlined,
} from "@ant-design/icons";
import { Button, Popover } from "antd";
import { useSnapshot } from "valtio";
import { useEffect, useState } from "react";
import type { Channel, Interaction } from "@pupa/universal/types";
import { ExecSlashCommandEvent } from "@shared/bridge/events/application";
import { AddChannelEvent } from "@shared/bridge/events/message";
import { sendingCommandStore, store } from "./store";
import bridge from "../../bridge";
import { useInputMenu } from "../../hooks/use-input-menu";
import { applicationStore, channelStore } from "../../store";
import { isEnterKey } from "../../utils/keyboard";
import { AutoSizeTextarea } from "../../components/auto-size-textarea";
import { AppMenu } from "./app-menu";
import { CommandMenu } from "./command-menu";
import { CommandInputStatus } from "./command-input-status";

function getSlashCommandDataFromInteraction(interaction: Interaction) {
  const command = interaction.data!;
  return {
    application: {
      id: interaction.application_id,
      name: interaction.application_id,
      description: "",
      icon: "",
    },
    command: {
      name: command.name,
      description: "",
      type: command.type,
    },
    interactionId: interaction.id,
  };
}

export function CommandInput() {
  const { isShowApps, isShowCmds, currentApp, currentCommand, input } =
    useSnapshot(store.state);
  const { currentOption } = useSnapshot(sendingCommandStore.state);
  const { applications } = useSnapshot(applicationStore.state);
  const [placeholder, setPlaceholder] = useState<string>("");
  const { onKeydown: onSelectAppKeydown, selectedIndex: selectedAppIndex } =
    useInputMenu({
      length: applications.length,
      onSelect: (index) => {
        store.selectedApp(applicationStore.state.applications[index]);
      },
    });
  const { onKeydown: onSelectCmdKeydown, selectedIndex: selectedCmdIndex } =
    useInputMenu({
      length: applicationStore.allCommands.length,
      onSelect: (index) => {
        const cmd = applicationStore.allCommands[index];
        store.selectedCmd(cmd);
      },
    });

  useEffect(() => {
    if (currentApp) {
      setPlaceholder(`How can ${currentApp.name} assist you today?`);
    } else if (currentCommand) {
      if (!currentOption)
        setPlaceholder(`⌘ + Enter to send ${currentCommand.name} command`);
    } else {
      setPlaceholder("");
    }
  }, [currentApp, currentCommand, currentOption]);

  useEffect(() => {
    if (currentOption) {
      setPlaceholder(currentOption.description);
    }
  }, [currentOption]);

  const handleHistoryClick = () => {
    store.toggleHistoryPanel(true);
  };

  const handleAddChannelClick = () => {
    store.newChannel();
  };

  async function onSend() {
    if (store.state.currentCommand) {
      if (!store.state.currentChannel) {
        const channel = await bridge.send<Channel>(AddChannelEvent.create());
        channelStore.addChannel(channel);
        store.state.currentChannel = channel;
        onSlashCommand(channel);
      } else {
        onSlashCommand();
      }
    }
    store.clearInput();
  }

  async function onSlashCommand(channel = store.state.currentChannel) {
    const { currentCommand } = store.state;
    const { dataOptions } = sendingCommandStore.state;
    if (!currentCommand || !channel) return;
    const application = applicationStore.getApplication(
      currentCommand.applicationId,
    )!;
    store.state.runningCommand = {
      application,
      command: currentCommand,
    };
    const interaction = await bridge.send<Interaction>(
      ExecSlashCommandEvent.create({
        applicationId: application.id,
        channelId: channel.id,
        data: {
          ...currentCommand,
          options: dataOptions,
        },
      }),
    );
    // store.state.runningCommand =
    //   getSlashCommandDataFromInteraction(interaction);
  }

  const handleAtClick = () => {
    store.setInput("@");
  };

  function handleMsgChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    store.setInput(e.target.value);
  }

  function handleMsgKeydown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (isShowApps) {
      onSelectAppKeydown(e);
    } else if (isShowCmds) {
      onSelectCmdKeydown(e);
    } else if (input.length === 0 && e.key === "Backspace") {
      store.clearInput();
    } else if (isEnterKey(e) && currentCommand && input.length > 0) {
      e.preventDefault();
      sendingCommandStore.submitOption(input);
    } else if (isEnterKey(e) && (e.metaKey || e.ctrlKey)) {
      onSend();
    }
  }

  function handleSelectCommand(key: string) {
    const [appId, cmdId] = key.split("-");
    const cmd = applicationStore.getAppCommand(appId, cmdId);
    if (cmd) {
      store.selectedCmd({ applicationId: appId, ...cmd });
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
        open={isShowApps || isShowCmds}
        overlayClassName="w-[calc(100%-24px)]"
        overlayInnerStyle={{
          padding: "4px",
        }}
        placement="top"
        align={{
          offset: [0, -8],
        }}
        arrow={false}
        content={
          isShowApps ? (
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
