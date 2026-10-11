import type { Message, Request } from "./worker";

// Runs scripts off the page's thread, one at a time: starting a run abandons
// the one before it.
export class Runner {
  private listener: (message: Message) => void;
  private worker?: Worker;

  constructor(listener: (message: Message) => void) {
    this.listener = listener;
  }

  run(request: Request): void {
    this.abandon();

    this.worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker.onmessage = ({ data }: MessageEvent<Message>) =>
      this.listener(data);
    this.worker.postMessage(request);
  }

  private abandon(): void {
    if (!this.worker) return;

    // messages it has already posted may still be on their way
    this.worker.onmessage = null;
    this.worker.terminate();
  }
}
