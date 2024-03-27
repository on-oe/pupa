import withSuspense from "@shared/hoc/withSuspense";
import withErrorBoundary from "@shared/hoc/withErrorBoundary";
import { useState } from "react";
import { TextArea, Avatar } from "@radix-ui/themes";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import {
  CommandOptionType,
  type ApplicationWithCommands,
  type InteractionDataOption,
} from "@pupa/universal/types";
import { useMessages } from "./hooks/use-messages";
import { useApplication } from "./hooks/use-application";
import { MessageComponent } from "./components/message";

function parseInputContent(
  content: string,
  applications: ApplicationWithCommands[],
) {
  if (!content.startsWith("/") || content.trim().length === 1) return null;
  const parts = content.split(/ (?=[a-z]+:)/);
  const commandName = (parts.shift() ?? "/").slice(1);

  const application = applications.find((app) =>
    app.commands.some((command) => command.name === commandName),
  );
  if (!application) return null;
  const command = application.commands.find(
    (command) => command.name === commandName,
  );
  if (!command) return null;
  if (!command.options) return { application, command, options: [] };

  const inputOptions = parts.map((part) => {
    const [name, value] = part.split(":").map((v) => v.trim());
    return { name, value };
  });

  const options: InteractionDataOption[] = [];
  command.options.forEach((option) => {
    const inputOption = inputOptions.find(
      (inputOption) => inputOption.name === option.name,
    );
    if (!inputOption) return;
    const value =
      option.type === CommandOptionType.INTEGER
        ? Number(inputOption.value) || 0
        : inputOption.value;
    options.push({
      name: option.name,
      value,
      type: option.type,
    });
  });

  return { application, command, options };
}

function App() {
  const [isFocusSender, setIsFocusSender] = useState(false);
  const [input, setInput] = useState("");
  const { applications } = useApplication();
  const { messages, sendMessage, sendSlashCommand } = useMessages();

  function handleMsgChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
  }

  function handleSendClick() {
    const parsedContent = parseInputContent(input, applications);
    if (!parsedContent) sendMessage(input);
    else sendSlashCommand(parsedContent);
    setInput("");
  }

  function handleMsgKeyUp(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSendClick();
    }
  }

  return (
    <div className=" w-screen h-screen bg-default-100 p-1">
      <div className="w-full h-full rounded-xl bg-white flex flex-col">
        <div className="flex-1 pb-9 overflow-auto">
          {messages.map((message) => (
            <div key={message.id} className="flex p-4">
              <div className="mr-[6px]">
                <Avatar
                  src={message.author.avatar}
                  fallback="U"
                  className="w-6 h-6 text-tiny"
                />
              </div>
              <div className="flex-1 overflow-auto">
                <div className="text-xs font-semibold text-gray-600">
                  {message.author.username}
                </div>
                <MessageComponent message={message} />
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 pb-1 pt-4">
          <div
            className={`relative transition-all p-1 bg-[#f7f7f7] rounded-xl ${isFocusSender ? "shadow-[0_1px_4px_#333] !bg-transparent" : ""}`}
          >
            <TextArea
              placeholder="Press '/' for commands, send message..."
              value={input}
              rows={2}
              onChange={handleMsgChange}
              onFocus={() => setIsFocusSender(true)}
              onBlur={() => setIsFocusSender(false)}
              onKeyUp={handleMsgKeyUp}
            />
            <div className="flex justify-between p-2">
              <div className="flex">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 8L10.8103 10.1897L13 11L10.8103 11.8103L10 14L9.18973 11.8103L7 11L9.18973 10.1897L10 8Z"
                    fill="currentColor"
                  />
                  <path
                    d="M13 3L13.5402 4.45982L15 5L13.5402 5.54018L13 7L12.4598 5.54018L11 5L12.4598 4.45982L13 3Z"
                    fill="currentColor"
                  />
                  <path
                    d="M3.5 1L4.17523 2.82477L6 3.5L4.17523 4.17523L3.5 6L2.82477 4.17523L1 3.5L2.82477 2.82477L3.5 1Z"
                    fill="currentColor"
                  />
                  <path
                    d="M3.14284 13.2583L9.64284 1.99998"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="square"
                  />
                </svg>
              </div>
              <PaperPlaneIcon fontSize={14} onClick={handleSendClick} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withErrorBoundary(
  withSuspense(App, <div> Loading ... </div>),
  <div> Error Occur </div>,
);
