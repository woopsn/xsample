// The worker thread that runs a script. It is sent one Request, and posts
// back each event the script emits, then "done".

import type { Event, ParamId } from "../fpu/events";
import { constants, library } from "../fpu/library";
import { Machine } from "../fpu/vm";
import { Script } from "./script";

export interface Request {
  source: string;
  // The values the host has set for the script's parameters.
  params: Map<ParamId, number>;
}

export type Message = Event | { type: "done" };

function post(message: Message): void {
  postMessage(message);
}

onmessage = ({ data }: MessageEvent<Request>) => {
  const machine = new Machine(library, constants, post);
  machine.params = data.params;
  machine.exec(new Script({ value: data.source }).compile());

  post({ type: "done" });
};
