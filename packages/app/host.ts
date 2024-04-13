import type { Application } from '@pupa/universal/types';
import ky from 'ky';

class Host {
  private host = ky.create({
    prefixUrl: 'http://localhost:3000/api/',
  });

  devStart(app: Partial<Application>) {
    return this.host
      .post('application/dev-application-started', {
        json: {
          endpoint: process.env.DEV_ENDPOINT,
          application: app,
        },
      })
      .json<{ id: string }>();
  }

  devUpdate(app: Partial<Application>) {
    return this.host
      .post('application/dev-application-updated', {
        json: {
          shouldRefresh: false,
          application: app,
        },
      })
      .json();
  }
}

export const host = new Host();
