import { beforeAll, describe, expect, test, vi } from "vitest";

// The worker module installs its `onmessage` on the global scope, and replies
// through the global `postMessage`; both are stubbed for it here.
const posted = [];

beforeAll(async () => {
  vi.stubGlobal("onmessage", null);
  vi.stubGlobal("postMessage", (message) => posted.push(message));
  await import("../src/xsampler/worker");
});

// Runs a script on the worker and returns the messages it posts back.
function messages(source) {
  posted.length = 0;
  globalThis.onmessage({ data: { source, params: new Map() } });
  return posted.map((message) => message.type);
}

describe("worker", () => {
  test("posts a run's events, then done", () => {
    expect(messages('param("n", [1, 2])')).toEqual(["param", "done"]);
  });

  test("posts the error of a script that fails to compile, then done", () => {
    expect(messages("x = 1\nx = x +")).toEqual(["error", "done"]);
    expect(posted[0]).toMatchObject({ kind: "syntax", line: 2 });
  });

  test("posts the error of a script that fails to run, then done", () => {
    expect(messages('param("n", [1, 2])\nx = nosuch')).toEqual([
      "param",
      "error",
      "done",
    ]);
    expect(posted[1]).toEqual({
      type: "error",
      kind: "runtime",
      line: 2,
      message: "unknown symbol: nosuch",
    });
  });
});
