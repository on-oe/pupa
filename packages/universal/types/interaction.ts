import type {
  CommandOptionType,
  CommandType,
  Message,
  MessageElement,
  User,
} from ".";

export interface Interaction {
  id: string;
  application_id: string;
  type: InteractionType;
  channel_id: string;
  data?: InteractionData;
  user?: User;
  message?: Message;
}

export const enum InteractionType {
  PING = 1,
  APPLICATION_COMMAND = 2,
  MESSAGE_COMPONENT = 3,
  APPLICATION_COMMAND_AUTOCOMPLETE = 4,
  MODEL_SUBMIT = 5,
  PAGE_FUNCTION_MESSAGE = 6,
}

export interface InteractionData {
  id: string;
  name: string;
  type: CommandType;
  options?: InteractionDataOption[];
}

export interface InteractionDataOption {
  name: string;
  value: DataOptionValue;
  type: CommandOptionType;
  // options?: InteractionDataOption[];
}

export type DataOptionValue = string | number | boolean;

export interface InteractionResponse {
  type: InteractionResponseType;
  data?: InteractionResponseData;
}

export const enum InteractionResponseType {
  PONG = 1,
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
  DEFERRED_UPDATE_MESSAGE = 6,
  UPDATE_MESSAGE = 7,
  EXECUTE_PAGE_FUNCTION = 11,
}

export type InteractionResponseData =
  | IRCResponseDataOfMessage
  | IRCResponseDataOfCmdAutocomplete
  | IRCResponseDataOfPageFn;

export interface IRCResponseDataOfPageFn {
  content?: string;
  page_fn: {
    name: string;
    code: string;
  };
}

export interface IRCResponseDataOfCmdAutocomplete {
  choices: InteractionDataOption[];
}

export interface IRCResponseDataOfMessage {
  content: string;
  components?: MessageElement[];
}
