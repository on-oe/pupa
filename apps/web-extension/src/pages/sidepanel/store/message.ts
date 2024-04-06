import type { Message } from "@pupa/universal/types";
import { createStore } from "./store";

export const messageStore = createStore({
  state: { messages: [] as Message[] },
  actions: {
    addMessage: (state, message: Message) => {
      state.messages.push(message);
    },
    updateMessage: (state, message: Message) => {
      const index = state.messages.findIndex((m) => m.id === message.id);
      if (index !== -1) {
        Object.assign(state.messages[index], message);
      }
    },
    updateMessages: (state, messages: Message[]) => {
      Object.assign(state, { messages });
    },
    getMessageByIndex: (state, index: number) => state.messages[index],
  },
});
