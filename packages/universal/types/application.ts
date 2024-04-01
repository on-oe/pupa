export interface Application {
  id: string;
  name: string;
  description: string;
  icon: string;
  interactions_endpoint_url: string;
  dev?: boolean;
}

export interface ApplicationWithCommands extends Application {
  commands: Command[];
}

export const enum CommandType {
  CHAT_INPUT = 1,
  USER = 2,
  MESSAGE = 3,
  PAGE_FUNCTION = 4,
}

export interface Command {
  id: string;
  name: string;
  description: string;
  type: CommandType;
  options?: CommandOption[];
}

export const enum CommandOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP = 2,
  STRING = 3,
  INTEGER = 4,
  BOOLEAN = 5,
  USER = 6,
  CHANNEL = 7,
  ROLE = 8,
}

export interface CommandOption {
  name: string;
  type: CommandOptionType;
  description: string;
  required?: boolean;
  options?: CommandOption[];
}
