// The worker thread that runs scripts. It is sent a Request for each run,
// and posts back each event the script emits, an "error" if the script
// fails to compile or run, then "done".

import type { Node } from "../fpu/ast";
import type { Event, ParamId } from "../fpu/events";
import { constants, library } from "../fpu/library";
import { Machine } from "../fpu/vm";
import { Script } from "./script";

export interface Request {
  source: string;
  // The values the host has set for the script's parameters.
  params: Map<ParamId, number>;
}

export type Message =
  Event | { type: "error"; message: string } | { type: "done" };

function post(message: Message): void {
  postMessage(message);
}

// The script last run, compiled: a run that changes only a parameter
// reuses it.
let compiled: { source: string; ast: Node[] } | undefined;

onmessage = ({ data }: MessageEvent<Request>) => {
  try {
    if (compiled?.source != data.source)
      compiled = {
        source: data.source,
        ast: new Script({ value: data.source }).compile(),
      };

    const machine = new Machine(library, constants, post);
    machine.params = data.params;
    machine.exec(compiled.ast);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    post({ type: "error", message });
  }

  post({ type: "done" });
};
