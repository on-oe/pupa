import type {
  CommandOptionType,
  CommandType,
  Message,
  MessageElement,
  User,
} from '.';

export interface Interaction {
  id: string;
  application_id: string;
  type: InteractionType;
  channel_id: string;
  token: string;
  data?: InteractionData;
  user?: User;
  message?: Message;
  created_at: number;
}

export const enum InteractionType {
  PING = 0,
  MESSAGE = 1,
  APPLICATION_COMMAND = 2,
  MESSAGE_COMPONENT = 3,
  APPLICATION_COMMAND_AUTOCOMPLETE = 4,
  MODEL_SUBMIT = 5,
  PAGE_FUNCTION_MESSAGE = 6,
  PAGE_RECYCLE = 7,
}

export const enum PageRecycleEvent {
  OPEN = 'open',
}

export type InteractionData = {
  name: string;
  type: CommandType;
  options?: InteractionDataOption[];
};

export interface InteractionDataOption {
  name: string;
  value: DataOptionValue;
  type: CommandOptionType;
  // options?: InteractionDataOption[];
}

export type DataOptionValue = string | number | boolean;

export type InteractionResponse =
  | {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE;
      data: IRCResponseDataOfMessage;
    }
  | {
      type: InteractionResponseType.EXECUTE_PAGE_FUNCTION;
      data: IRCResponseDataOfPageFn;
    }
  | {
      type: InteractionResponseType.AGENT_MESSAGE;
      data: IRCResponseOfAgentMessage;
    };

export const enum InteractionResponseType {
  PONG = 1,
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
  DEFERRED_UPDATE_MESSAGE = 6,
  UPDATE_MESSAGE = 7,
  EXECUTE_PAGE_FUNCTION = 11,
  AGENT_MESSAGE = 12,
}

export type InteractionResponseData =
  | IRCResponseDataOfMessage
  | IRCResponseDataOfCmdAutocomplete
  | IRCResponseDataOfPageFn
  | IRCResponseOfAgentMessage;

export interface IRCResponseDataOfPageFn {
  content?: string;
  name: string;
  uri: string;
}

export interface IRCResponseDataOfCmdAutocomplete {
  choices: InteractionDataOption[];
}

export interface IRCResponseDataOfMessage {
  content: string;
  elements?: MessageElement[];
}

export interface IRCResponseOfAgentMessage {
  content: string;
  prompt: string;
  stream: boolean;
}
