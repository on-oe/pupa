import type {
  ApplicationWithCommands,
  Command,
  CommandOption,
} from '@pupa/universal/types';
import { atom } from 'jotai';
import { store } from '../../store';

type CommandWithApplication = Command & { applicationId: string };

export const inputAtom = atom('');
export const isShowAppPanelAtom = atom(false);
export const isShowCommandPanelAtom = atom(false);

export const isOpenHistoryAtom = atom(false);
export const currentAppAtom = atom<ApplicationWithCommands | null>(null);
export const currentCommandAtom = atom<CommandWithApplication | null>(null);

export const currentOptionAtom = atom<CommandOption | null>(null);
export const currentCommandValOptsAtom = atom<
  (CommandOption & { value: string })[]
>([]);

store.sub(currentCommandAtom, () => {
  const currentCommand = store.get(currentCommandAtom);
  if (currentCommand && currentCommand.options?.length) {
    store.set(currentOptionAtom, currentCommand.options[0]);
    store.set(
      currentCommandValOptsAtom,
      currentCommand.options.map((opt) => ({
        ...opt,
        value: '',
      })),
    );
  } else {
    store.set(currentOptionAtom, null);
    store.set(currentCommandValOptsAtom, []);
  }
});

store.sub(inputAtom, () => {
  const input = store.get(inputAtom);
  const currentApp = store.get(currentAppAtom);
  const currentCommand = store.get(currentCommandAtom);

  if (input.startsWith('/') && !currentCommand) {
    store.set(isShowCommandPanelAtom, true);
  } else {
    store.set(isShowCommandPanelAtom, false);
  }

  if (input.startsWith('@') && !currentApp) {
    store.set(isShowAppPanelAtom, true);
  } else {
    store.set(isShowAppPanelAtom, false);
  }
});
