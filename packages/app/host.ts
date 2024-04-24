import type { Application } from '@pupa/universal/types';
import ky from 'ky';

export class Host {
  endpoint: string;
  constructor(private readonly port: number) {
    this.port = port;
    this.endpoint = `http://localhost:${port}`;
  }

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
