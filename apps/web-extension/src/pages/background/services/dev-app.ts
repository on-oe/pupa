import { localStorage } from "../storage";
import type { LocalStorage } from "../storage/local-storage";

class DevAppService {
  constructor(private storage: LocalStorage) {
    this.storage = storage;
  }

  async installDevApp(port: number) {
    const endpoint = `http://localhost:${port}`;
    const app = await fetch(`${endpoint}/install`).then((res) => res.json());
    return this.storage.appendInstalledApp({
      ...app,
      interactions_endpoint_url: endpoint,
    });
  }

  getInstalledApps() {
    return this.storage.getInstalledApps();
  }
}

export const devApp = new DevAppService(localStorage);
