import type { ApplicationWithCommands, InteractionData } from '@pupa/universal/types';
import { atom } from 'jotai';
import { store } from './store';
import bridge from '../bridge';

export const applicationsAtom = atom([] as ApplicationWithCommands[]);

export const applicationStore = {
  getApplication: (id: string) => {
    return store.get(applicationsAtom).find((app) => app.id === id) || null;
  },
  getAppCommand: (appid: string, name: string) => {
    const app = applicationStore.getApplication(appid);
    return app?.commands.find((cmd) => cmd.name === name) || null;
  },
  execSlashCommand(data: {
    applicationId: string;
    channelId: string;
    data: InteractionData;
  }) {
    bridge.send('execSlashCommand', data);
  },
};
