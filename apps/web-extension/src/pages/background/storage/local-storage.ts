import type { Application } from "@pupa/universal/types";

export class LocalStorage {
  private storage = chrome.storage.local;

  private installedAppsKey = "local:dev_installed_apps";

  async getInstalledApps(): Promise<Application[]> {
    const apps = await this.getAppsStorage();
    return Object.values(apps);
  }

  async appendInstalledApp(app: Application) {
    const apps = await this.getAppsStorage();
    apps[app.id] = app;
    await this.saveAppsStorage(apps);
    return app;
  }

  async removeInstalledApp(appId: string) {
    const apps = await this.getAppsStorage();
    delete apps[appId];
    return this.saveAppsStorage(apps);
  }

  private async getAppsStorage(): Promise<Record<string, Application>> {
    const res = await this.storage.get(this.installedAppsKey);
    return res[this.installedAppsKey] ?? {};
  }

  private saveAppsStorage(apps: Record<string, Application>) {
    return this.storage.set({ [this.installedAppsKey]: apps });
  }
}
