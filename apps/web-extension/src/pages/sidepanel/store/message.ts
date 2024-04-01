import type { Message } from "@pupa/universal/types";
import { proxy } from "valtio";

const state = proxy({
  messages: [] as Message[],
});

export const messageStore = {
  addMessage(message: Message) {
    state.messages.push(message);
  },
  updateMessages(messages: Message[]) {
    state.messages = messages;
  },
  get state() {
    return state;
  },
};
