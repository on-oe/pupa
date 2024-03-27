import type { Repository } from "./repository";

export class WsHost {
  constructor(private repository: Repository) {
    this.repository = repository;
  }

  private handlers: Record<string, ((data: unknown) => void)[]> = {};

  on(event: string, listener: (data: unknown) => void) {
    const handler = this.handlers[event] || [];
    handler.push(listener);
    this.handlers[event] = handler;
  }

  emit(event: string, data: unknown) {
    const handler = this.handlers[event];
    if (handler) {
      handler.forEach((fn) => fn(data));
    }
  }
}
