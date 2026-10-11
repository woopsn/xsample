import type { Message, Request } from "./worker";

// Runs scripts off the page's thread, one at a time: starting a run abandons
// the one before it.
export class Runner {
  private worker?: Worker;

  // `listener` receives each message of this run.
  run(request: Request, listener: (message: Message) => void): void {
    this.stop();

    this.worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker.onmessage = ({ data }: MessageEvent<Message>) => listener(data);
    this.worker.postMessage(request);
  }

  // Abandons the run in progress, if there is one.
  stop(): void {
    if (!this.worker) return;

    // messages it has already posted may still be on their way
    this.worker.onmessage = null;
    this.worker.terminate();
  }
}
