import withSuspense from "@shared/hoc/withSuspense";
import withErrorBoundary from "@shared/hoc/withErrorBoundary";
import { useEffect, useRef, useState } from "react";
import { Button, Avatar, Popover, List, Tag } from "antd";
import { SendOutlined, FileAddOutlined } from "@ant-design/icons";
import {
  type CommandOption,
  type ApplicationWithCommands,
  type Command,
  type Message,
} from "@pupa/universal/types";
import { useMessages } from "./hooks/use-messages";
import { useApplication } from "./hooks/use-application";
import { MessageComponent } from "./components/message";

type CommandOptionItem = { app: ApplicationWithCommands } & Command;

function App() {
  const [input, setInput] = useState("");
  const { applications } = useApplication();
  const { messages, sendMessage, sendSlashCommand } = useMessages();
  const [isShowApps, setIsShowApps] = useState(false);
  const [preSelectedAppIndex, setPreSelectedAppIndex] = useState<number>(0);
  const [isShowCmds, setIsShowCmds] = useState(false);
  const [preSelectedCmdIndex, setPreSelectedCmdIndex] = useState<number>(0);
  const [currentCommand, setCurrentCommand] =
    useState<CommandOptionItem | null>(null);
  const [currentApp, setCurrentApp] = useState<ApplicationWithCommands | null>(
    null,
  );
  const [placeholder, setPlaceholder] = useState<string>("");
  const [currentOption, setCurrentOption] = useState<
    CommandOption | undefined
  >();
  const [dataOptions, setDataOptions] = useState<
    (CommandOption & { value: string })[]
  >([]);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (input.startsWith("/") && !currentCommand) setIsShowCmds(true);
    else setIsShowCmds(false);
    if (input.startsWith("@") && !currentApp) setIsShowApps(true);
    else setIsShowApps(false);
  }, [currentApp, currentCommand, input]);

  useEffect(() => {
    if (isShowApps) {
      setPreSelectedAppIndex(0);
    }
  }, [isShowApps]);

  useEffect(() => {
    if (currentCommand && currentCommand.options?.length) {
      setCurrentOption(currentCommand.options[0]);
      setDataOptions(
        currentCommand.options.map((opt) => ({
          ...opt,
          value: "",
        })),
      );
    } else {
      setCurrentOption(undefined);
      setDataOptions([]);
    }
  }, [currentCommand]);

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

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleTextareaInput(e: React.FormEvent<HTMLTextAreaElement>) {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = "auto";
    const height = Math.min(Math.max(target.scrollHeight, 60), 120);
    target.style.height = `${height}px`;
  }

  function handleMsgChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
  }

  function handleSendClick() {
    if (currentCommand) {
      sendSlashCommand({
        application: currentCommand.app,
        command: currentCommand,
        options: dataOptions.map((opt) => ({
          name: opt.name,
          value: opt.value,
          type: opt.type,
        })),
      });
    }
    setInput("");
    setCurrentCommand(null);
  }

  function onSelectCmd(command: CommandOptionItem) {
    setCurrentCommand(command);
    setIsShowApps(false);
  }

  function onSelectCmdOption(option: CommandOption) {
    setCurrentOption(option);
    setPlaceholder(option.description);
  }

  function handleMsgKeydown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (isShowApps) {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setPreSelectedAppIndex((prev) =>
            prev === 0 ? applications.length - 1 : prev - 1,
          );
          break;
        case "ArrowDown":
          e.preventDefault();
          setPreSelectedAppIndex((prev) =>
            prev === applications.length - 1 ? 0 : prev + 1,
          );
          break;
        case "Enter":
          {
            e.preventDefault();
            const app = applications[preSelectedAppIndex];
            setCurrentApp(app);
            setInput("");
          }
          break;
      }
    } else if (isShowCmds) {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setPreSelectedCmdIndex((prev) =>
            prev === 0 ? commands.length - 1 : prev - 1,
          );
          break;
        case "ArrowDown":
          e.preventDefault();
          setPreSelectedCmdIndex((prev) =>
            prev === commands.length - 1 ? 0 : prev + 1,
          );
          break;
        case "Enter":
          {
            e.preventDefault();
            const cmd = commands[preSelectedCmdIndex];
            onSelectCmd(cmd);
            setInput("");
          }
          break;
      }
    } else if (input.length === 0 && e.key === "Backspace") {
      setCurrentApp(null);
      setCurrentCommand(null);
    } else if (
      e.key === "Enter" &&
      (e.metaKey || e.ctrlKey) &&
      e.repeat === false
    ) {
      handleSendClick();
    } else if (
      e.key === "Enter" &&
      !e.repeat &&
      currentOption &&
      input.length > 0
    ) {
      e.preventDefault();
      const option = dataOptions.find((opt) => opt.name === currentOption.name);
      if (option) {
        option.value = input;
        setDataOptions([...dataOptions]);
        const nextOption = dataOptions.find((opt) => !opt.value);
        setInput("");
        setCurrentOption(nextOption);
      }
    }
  }

  const AppMenu = (
    <List size="small" split={false}>
      {applications.map((app, i) => (
        <List.Item
          key={app.id}
          className={`hover:bg-slate-300 cursor-pointer ${preSelectedAppIndex === i ? "bg-slate-300" : ""}`}
        >
          <List.Item.Meta
            title={app.name}
            avatar={<Avatar src={app.icon} size="small" />}
            description={app.description}
          />
        </List.Item>
      ))}
    </List>
  );

  const commands = applications
    .map((app) => app.commands.map((cmd) => ({ app, ...cmd })))
    .flat();

  const CommandMenu = (
    <List size="small" split={false}>
      {commands.map((cmd, i) => (
        <List.Item
          key={cmd.name}
          className={`hover:bg-slate-200 cursor-pointer ${preSelectedCmdIndex === i ? "bg-slate-200" : ""}`}
          onClick={() => onSelectCmd(cmd)}
        >
          <List.Item.Meta
            title={
              <p>
                <span>/{cmd.name} </span>
                {(cmd.options || []).map((opt) => (
                  <Tag key={opt.name} bordered={false} className=" scale-75">
                    {opt.name}:{" "}
                  </Tag>
                ))}
              </p>
            }
            description={cmd.description}
          />
        </List.Item>
      ))}
    </List>
  );

  return (
    <div className=" w-screen h-screen bg-default-100 p-1">
      <div className="w-full h-full rounded-xl bg-white flex flex-col">
        <div className="flex-1 pb-9 overflow-auto p-2">
          {messages.map((message) => (
            <div key={message.id} className="flex p-4">
              <div className="mr-[6px]">
                <Avatar
                  src={message.author.avatar}
                  className="w-6 h-6 text-tiny"
                />
              </div>
              <div className="flex-1 overflow-auto">
                <div className="text-xs font-semibold text-gray-600">
                  {message.author.username}
                </div>
                <MessageComponent message={message as unknown as Message} />
              </div>
            </div>
          ))}
          <div ref={endOfMessagesRef} />
        </div>
        <div className="relative px-2 pb-1 pt-4 text-sm">
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
            content={isShowApps ? AppMenu : CommandMenu}
          >
            <div className="bg-[#f7f7f7] rounded-xl transition-all py-2 px-3">
              <div className=" mb-2">
                {currentApp && (
                  <Tag
                    bordered={false}
                    color="processing"
                    closeIcon
                    onClose={() => setCurrentApp(null)}
                  >
                    @{currentApp.name}
                  </Tag>
                )}
                {currentCommand && (
                  <>
                    <Tag
                      bordered={false}
                      color="processing"
                      closeIcon
                      onClose={() => setCurrentCommand(null)}
                    >
                      {`/${currentCommand.name} `}
                    </Tag>
                    {dataOptions.map((opt) => (
                      <Tag
                        key={opt.name}
                        className="cursor-pointer"
                        onClick={() => onSelectCmdOption(opt)}
                      >
                        {opt.name}:
                        {opt.value || (opt.required ? "required" : "optional")}
                      </Tag>
                    ))}
                  </>
                )}
              </div>
              <textarea
                className="resize-none w-full outline-none bg-transparent overflow-auto min-h-[60px]"
                placeholder={
                  placeholder || "press '@' for chat, '/' for commands..."
                }
                value={input}
                onInput={handleTextareaInput}
                onChange={handleMsgChange}
                onKeyDown={handleMsgKeydown}
              />
              <div className="flex py-1 justify-between items-center">
                <div className="flex items-center">
                  <Button size="small" type="link" icon={<FileAddOutlined />} />
                  <Button
                    size="small"
                    type="link"
                    onClick={() => setInput("@")}
                  >
                    @
                  </Button>
                </div>
                <Button
                  size="small"
                  type="link"
                  icon={<SendOutlined />}
                  onClick={handleSendClick}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </Popover>
        </div>
      </div>
    </div>
  );
}

export default withErrorBoundary(
  withSuspense(App, <div> Loading ... </div>),
  <div> Error Occur </div>,
);
