import type { Application } from '@pupa/universal/types';
import ky from 'ky';

class Host {
  private host = ky.create({
    prefixUrl: 'http://localhost:3000/api/',
    headers: {
      Authorization: `Bearer ${process.env.PUPA_API_KEY}`,
    },
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

  devStop(id: string) {
    return this.host.post(`application/dev-application-stopped/${id}`).json();
  }
}

export const host = new Host();
