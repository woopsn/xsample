// The worker thread that runs scripts. It is sent a Request for each run,
// and posts back each event the script emits, an "error" if the script
// fails to compile or run, then "done".

import type { Statement } from "../fpu/ast";
import type { Event, ParamId } from "../fpu/events";
import { constants, library } from "../fpu/library";
import { Machine, ScriptError } from "../fpu/vm";
import { Script } from "./script";

export interface Request {
  source: string;
  // The values the host has set for the script's parameters.
  params: Map<ParamId, number>;
}

// A script that fails to compile has a syntax error; one that fails as it
// runs, a runtime error.
export type Failure = {
  type: "error";
  kind: "syntax" | "runtime";
  line?: number;
  message: string;
};

export type Message = Event | Failure | { type: "done" };

function post(message: Message): void {
  postMessage(message);
}

// The script last run, compiled: a run that changes only a parameter
// reuses it.
let compiled: { source: string; statements: Statement[] } | undefined;

function compile(source: string): Statement[] {
  if (compiled?.source != source)
    compiled = { source, statements: new Script({ value: source }).compile() };

  return compiled.statements;
}

// Calls `f`, posting what it throws as an error of the given kind.
function attempt<T>(kind: Failure["kind"], f: () => T): T | undefined {
  try {
    return f();
  } catch (error) {
    const line = error instanceof ScriptError ? error.line : undefined;
    const message = error instanceof Error ? error.message : String(error);
    post({ type: "error", kind, line, message });
  }
}

onmessage = ({ data }: MessageEvent<Request>) => {
  const statements = attempt("syntax", () => compile(data.source));

  if (statements)
    attempt("runtime", () => {
      const machine = new Machine(library, constants, post);
      machine.params = data.params;
      machine.exec(statements);
    });

  post({ type: "done" });
};
