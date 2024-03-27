import type { User } from "./user";

export interface Message {
  id: string;
  content: string;
  channel_id: string;
  author: User;
  type: MessageType;
  elements?: MessageElement[];
  bot?: boolean;
}

export const enum MessageType {
  DEFAULT = 0,
  CHAT_INPUT_COMMAND = 20,
}

export interface MessageColumnElement {
  type: MessageElementType.Column;
  elements: MessageElement[];
}

export interface MessageButtonElement {
  type: MessageElementType.Button;
  label: string;
}

export interface MessageMarkdownElement {
  type: MessageElementType.Markdown;
  content: string;
}

export interface MessageSelectElement {
  type: MessageElementType.Select;
  options: MessageSelectOption[];
  placeholder: string;
}

export interface MessageSelectOption {
  label: string;
  value: string;
  description: string;
}

export type MessageElement =
  | MessageColumnElement
  | MessageButtonElement
  | MessageSelectElement
  | MessageMarkdownElement;

export const enum MessageElementType {
  Column = 1,
  Button = 2,
  Select = 3,
  Markdown = 4,
}
