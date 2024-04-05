import type { ApplicationWithCommands } from "@pupa/universal/types";
import { createStore } from "./store";

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
