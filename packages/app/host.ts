import type { Application } from '@pupa/universal/types';
import ky from 'ky';

export class Host {
  constructor() {}

  private host = ky.create({
    prefixUrl: 'http://localhost:3000/api/',
    headers: {
      Authorization: `Bearer ${process.env.PUPA_API_KEY}`,
    },
  });

  createApp(app: Partial<Application & { interactionEndpoint: string }>) {
    return this.host
      .post('application/create-dev-application', {
        json: app,
      })
      .json<Application>();
  }

  devStart(app: Application) {
    return this.host
      .post('application/dev-application-started', {
        json: app,
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
