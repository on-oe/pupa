export const enum TranslateTool {
  Google = 'google',
  ChatGPT = 'gpt3',
}

export const enum SegmentType {
  Pause = 'pause',
  Sentence = 'sentence',
}

export interface TranscriptItem {
  text: string;
  offset: number;
  duration: number;
}

export type Transcript = TranscriptItem[];

export const enum LocalMessageEventType {
  PageFunctionSuccess = 'page-function-success',
  PageFunctionError = 'page-function-error',
  ExecutePageFn = 'execute-page-fn',
  PageFnEvent = 'page-fn-event',
  PageLoaded = 'page-loaded',
  Command = 'command',
}

export const enum InteractionType {
  PING = 1,
  APPLICATION_COMMAND = 2,
  MESSAGE_COMPONENT = 3,
  PAGE_FUNCTION = 4,
}

const enum CommandOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP = 2,
  STRING = 3,
  INTEGER = 4,
  BOOLEAN = 5,
  USER = 6,
  CHANNEL = 7,
  ROLE = 8,
}

interface CommandOption {
  name: string;
  type: CommandOptionType;
  value: string | number | boolean;
  options?: CommandOption[];
}

export interface InteractionData {
  name: string;
  options?: CommandOption[];
}

export interface Interaction {
  application_id: string;
  type: InteractionType;
  data?: InteractionData;
  channel_id?: string;
  user?: {
    id: string;
    name: string;
  };
  token?: string;
}

export interface CallbackData {
  content: string;
  components?: any[];
}

export interface CallbackMessage {
  type: CallbackType;
  data?: CallbackData;
}

export const enum CallbackType {
  PONG = 1,
  CHANNEL_MESSAGE_WITH_SOURCE = 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE = 5,
  DEFERRED_UPDATE_MESSAGE = 6,
  UPDATE_MESSAGE = 7,
  PREMIUM_REQUIRED = 10,
  PAGE_FUNCTION = 11,
  PAGE_FUNCTION_RESULT = 12,
}
