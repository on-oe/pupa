import {
  CommandOptionType,
  type Application,
  CommandType,
} from "@pupa/universal/types";

export const builtInApplication: Application = {
  id: "built-in-app",
  description: "Built-in application",
  name: "BUILD-IN",
  icon: "https://example.com/icon.png",
  interactions_endpoint_url: "",
};

export const installDevAppCommand = {
  id: "1",
  name: "install dev app",
  description: "Install a dev app",
  type: CommandType.CHAT_INPUT,
  options: [
    {
      name: "port",
      description: "Port number",
      type: CommandOptionType.INTEGER,
      required: true,
    },
  ],
};

export const builtInCommands = [installDevAppCommand];

export const builtInAppWithCommands = {
  ...builtInApplication,
  commands: builtInCommands,
};
