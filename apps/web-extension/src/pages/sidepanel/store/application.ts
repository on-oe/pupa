import type {
  Application,
  ApplicationWithCommands,
  Command,
} from "@pupa/universal/types";
import { GetInstalledAppsEvent } from "@shared/bridge/events/application";
import { builtInAppWithCommands } from "@shared/built-in-app";
import { createStore } from "./store";
import bridge from "../bridge";

function fetchCommand(app: Application): Promise<Command[]> {
  const url = app.interactions_endpoint_url;
  return fetch(`${url}/commands`).then((res) => res.json());
}

async function fetchCommands(apps: Application[]) {
  const list = await Promise.all(apps.map(fetchCommand));
  return list.map((commands, i) => ({
    ...apps[i],
    commands,
  }));
}

export const applicationStore = createStore({
  state: { applications: [] as ApplicationWithCommands[] },
  actions: {
    update(state, applications: ApplicationWithCommands[]) {
      Object.assign(state, { applications });
    },
    getApplication(state, id: string) {
      return state.applications.find((app) => app.id === id) || null;
    },
    getAppCommand(state, id: string, cmdId: string) {
      const app = state.applications.find((app) => app.id === id);
      return app?.commands.find((cmd) => cmd.id === cmdId) || null;
    },
    async fetchApplications(state) {
      const apps = await bridge.send<Application[]>(
        GetInstalledAppsEvent.create(),
      );
      fetchCommands(apps)
        .then((apps) => {
          state.applications = [...apps, builtInAppWithCommands];
        })
        .catch(() => {
          state.applications = [builtInAppWithCommands];
        });
    },
  },
  getters: {
    allCommands(state) {
      return state.applications
        .map((app) =>
          app.commands.map((cmd) => ({ applicationId: app.id, ...cmd })),
        )
        .flat();
    },
  },
});
