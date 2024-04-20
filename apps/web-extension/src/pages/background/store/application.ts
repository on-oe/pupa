import bridge from '../bridge';
import type { ApplicationWithCommands } from '@pupa/universal/types';
import { atom } from 'jotai';
import { fetcher } from '../services/fetcher';
import { store } from './store';

export const applicationsAtom = atom<ApplicationWithCommands[]>([]);
export const applicationStore = {
  async load() {
    const apps = await fetcher.getInstalledApps();
    store.set(applicationsAtom, apps);
  },
  addOrUpdateApp(app: ApplicationWithCommands) {
    store.set(applicationsAtom, (apps) => {
      const index = apps.findIndex((a) => a.id === app.id);
      if (index === -1) {
        return [...apps, app];
      }
      apps[index] = app;
      return [...apps];
    });
  },
  removeApp(appId: string) {
    store.set(applicationsAtom, (apps) =>
      apps.filter((app) => app.id !== appId),
    );
  },
};

store.sub(applicationsAtom, () => {
  bridge.send('applicationsChanged', store.get(applicationsAtom));
});
