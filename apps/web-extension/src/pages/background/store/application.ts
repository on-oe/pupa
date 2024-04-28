import bridge from '../bridge';
import type { Application } from '@pupa/universal/types';
import { atom } from 'jotai';
import { fetcher } from '../services/fetcher';
import { store } from './store';
import { tweaker } from '../services/tweaker';

export const applicationsAtom = atom<Application[]>([]);
export const applicationStore = {
  async load() {
    const apps = await fetcher.getInstalledApps();
    store.set(applicationsAtom, apps);
    tweaker.cache(apps);
  },
  addOrUpdateApp(app: Application) {
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
  get() {
    return store.get(applicationsAtom);
  },
  onOpenPage() {
    const apps = store.get(applicationsAtom);
    const items = apps
      .flatMap((app) =>
        app.tweaks.map((tweak) => ({
          ...tweak,
          applicationId: app.id,
        })),
      )
      .filter((tweaker) => tweaker.runAt === 'document-start');
    items.forEach((item) => {
      tweaker.execute({
        tweak: item,
        applicationId: item.applicationId,
      });
    });
  },
};

store.sub(applicationsAtom, () => {
  bridge.send('applicationsChanged', store.get(applicationsAtom));
});
