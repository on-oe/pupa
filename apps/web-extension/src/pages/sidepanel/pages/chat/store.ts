import type {
  Application,
  ApplicationWithCommands,
  Channel,
  Command,
  CommandOption,
} from "@pupa/universal/types";
import { subscribeKey } from "valtio/utils";
import { createStore } from "../../store";

type CommandWithApplication = Command & { applicationId: string };

export const store = createStore({
  state: {
    input: "",
    isShowApps: false,
    isShowCmds: false,
    currentCommand: null as CommandWithApplication | null,
    currentApp: null as ApplicationWithCommands | null,
    placeholder: "",
    isOpenHistory: false,
    currentChannel: null as Channel | null,
    runningCommand: undefined as
      | {
          application: Partial<Application>;
          command: Partial<Command>;
          interactionId?: string;
        }
      | undefined,
  },
  actions: {
    newChannel: (state) => {
      state.currentChannel = null;
    },
    toggleHistoryPanel: (state, isShow: boolean) => {
      state.isOpenHistory = isShow;
    },
    clearInput: (state) => {
      state.input = "";
      state.currentCommand = null;
      state.currentApp = null;
    },
    setInput: (state, input: string) => {
      state.input = input;
    },
    selectedApp: (state, app: ApplicationWithCommands) => {
      state.currentApp = app;
      state.isShowApps = false;
      state.isShowCmds = true;
      state.input = "";
    },
    selectedCmd: (state, cmd: CommandWithApplication) => {
      state.currentCommand = cmd;
      state.isShowCmds = false;
      state.input = "";
      state.placeholder = cmd.name;
    },
    setCurrentChannel: (state, channel: Channel | null) => {
      state.currentChannel = channel;
    },
  },
});

export const sendingCommandStore = createStore({
  state: {
    currentOption: undefined as CommandOption | undefined,
    dataOptions: [] as (CommandOption & { value: string })[],
  },
  actions: {
    selectedOptionByIndex: (state, index: number) => {
      const option = state.dataOptions[index];
      if (option) {
        state.currentOption = option;
      }
    },
    submitOption: (state, value: string) => {
      const { currentOption, dataOptions } = state;
      if (currentOption) {
        const index = state.dataOptions.findIndex(
          (opt) => opt.name === currentOption.name,
        );
        if (index > -1) {
          state.dataOptions[index].value = value;
        } else {
          state.dataOptions = [...dataOptions, { ...currentOption, value }];
        }
        store.clearInput();
        const nextOpt = store.state.currentCommand?.options?.find(
          (opt) => opt.name !== currentOption.name,
        );
        if (nextOpt) {
          state.currentOption = nextOpt;
        }
      }
    },
  },
});

subscribeKey(store.state, "currentCommand", (command) => {
  if (command && command.options?.length) {
    const firstOption = command.options[0];
    sendingCommandStore.state.currentOption = firstOption;
    sendingCommandStore.state.dataOptions =
      command.options.map((opt) => ({
        ...opt,
        value: "",
      })) || [];
  } else {
    sendingCommandStore.state.currentOption = undefined;
    sendingCommandStore.state.dataOptions = [];
  }
});

subscribeKey(store.state, "input", (input) => {
  const { currentCommand, currentApp } = store.state;
  if (input.startsWith("/") && !currentCommand) store.state.isShowCmds = true;
  else store.state.isShowCmds = false;
  if (input.startsWith("@") && !currentApp) store.state.isShowApps = true;
  else store.state.isShowApps = false;
});
