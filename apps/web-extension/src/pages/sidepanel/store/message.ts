import type { Message } from "@pupa/universal/types";
import { createStore } from "./store";

export const messageStore = createStore({
  state: { messages: [] as Message[] },
  actions: {
    addMessage: (state, message: Message) => {
      state.messages.push(message);
    },
    updateMessages: (state, messages: Message[]) => {
      Object.assign(state, { messages });
    },
    getMessageByIndex: (state, index: number) => state.messages[index],
  },
});
