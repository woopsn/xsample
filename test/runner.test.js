import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Runner } from "../src/xsampler/runner";

// Stands in for a worker thread: a test posts its messages with `reply`.
class FakeWorker {
  static created = [];

  constructor() {
    this.terminated = false;
    FakeWorker.created.push(this);
  }

  postMessage() {}

  terminate() {
    this.terminated = true;
  }

  reply(message) {
    this.onmessage?.({ data: message });
  }
}

const request = { source: "x = 1", params: new Map() };

describe("Runner", () => {
  beforeEach(() => {
    FakeWorker.created = [];
    vi.stubGlobal("Worker", FakeWorker);
  });

  afterEach(() => vi.unstubAllGlobals());

  test("reuses its worker once a run is done", () => {
    const runner = new Runner();

    runner.run(request, () => {});
    FakeWorker.created[0].reply({ type: "done" });
    runner.run(request, () => {});

    expect(FakeWorker.created).toHaveLength(1);
    expect(FakeWorker.created[0].terminated).toBe(false);
  });

  test("replaces its worker when a run is still in progress", () => {
    const runner = new Runner();
    const abandoned = vi.fn();

    runner.run(request, abandoned);
    runner.run(request, () => {});
    FakeWorker.created[0].reply({ type: "done" });

    expect(FakeWorker.created).toHaveLength(2);
    expect(FakeWorker.created[0].terminated).toBe(true);
    expect(abandoned).not.toHaveBeenCalled();
  });

  test("sends each run's messages to that run's listener", () => {
    const runner = new Runner();
    const first = vi.fn();
    const second = vi.fn();

    runner.run(request, first);
    FakeWorker.created[0].reply({ type: "done" });
    runner.run(request, second);
    FakeWorker.created[0].reply({ type: "done" });

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });
});
