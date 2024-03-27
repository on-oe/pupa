import type { WebSocketMessage, SerializedMessage } from "./types";

export default class MessageInterpreter {
  static send(message: WebSocketMessage): SerializedMessage {
    return JSON.stringify(message);
  }

  static receive(serializedMessage: SerializedMessage): WebSocketMessage {
    return JSON.parse(serializedMessage);
  }
}
