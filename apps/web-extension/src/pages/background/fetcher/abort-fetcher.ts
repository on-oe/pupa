export abstract class BaseAbortFetcher {
  private abortId = 0;

  private abortControllers = new Map<number, AbortController>();

  protected createAbort() {
    const abortId = ++this.abortId;
    const controller = new AbortController();
    this.abortControllers.set(abortId, controller);
    return { abortId, abort: controller };
  }

  protected removeAbort(abortId: number) {
    this.abortControllers.delete(abortId);
  }

  get abort() {
    const id = this.abortId;
    return () => {
      const controller = this.abortControllers.get(id);
      if (controller) {
        controller.abort();
        this.abortControllers.delete(id);
        return true;
      }
      return false;
    };
  }
}
