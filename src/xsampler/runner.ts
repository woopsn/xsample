import type { Message, Request } from "./worker";

// Runs scripts off the page's thread, one at a time, on a worker kept from
// one run to the next: starting a run abandons the one before it, and only
// a run still in progress costs its worker.
export class Runner {
  private worker?: Worker;

  // Whether the worker has yet to post "done" for the run it was given.
  private busy = false;

  // `listener` receives each message of this run.
  run(request: Request, listener: (message: Message) => void): void {
    if (this.busy) this.stop();

    this.worker ??= new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });

    // a finished run has delivered all its messages, so none reach this one
    this.busy = true;
    this.worker.onmessage = ({ data }: MessageEvent<Message>) => {
      if (data.type == "done") this.busy = false;
      listener(data);
    };
    this.worker.postMessage(request);
  }

  // Abandons the run in progress, if there is one, and its worker.
  stop(): void {
    if (!this.worker) return;

    // messages it has already posted may still be on their way
    this.worker.onmessage = null;
    this.worker.terminate();
    this.worker = undefined;
    this.busy = false;
  }
}
