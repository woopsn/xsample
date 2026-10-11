import { describe, expect, test } from "vitest";
import { events, run, scalar } from "./helpers";

describe("param", () => {
  test("declares a parameter over its range", () => {
    expect(events("param(0, [1, 2, 3], 2)")).toEqual([
      { type: "param", id: 0, range: Float64Array.of(1, 2, 3), value: 2 },
    ]);
  });

  test("evaluates to its initial value", () => {
    expect(run("x = param(0, [1, 2, 3], 2)").x).toEqual(scalar(2));
  });

  test("starts at the bottom of its range by default", () => {
    expect(run("x = param(0, [1, 2, 3])").x).toEqual(scalar(1));
  });

  test("evaluates to the value the host has set", () => {
    const [event] = events("param(0, [1, 2, 3], 2)", [[0, 3]]);

    expect(event.value).toBe(3);
  });
});

describe("plot", () => {
  test("emits one series for each pair of arguments", () => {
    expect(events("plot(0, [1, 2], [3, 4], [5, 6], [7, 8])")).toEqual([
      {
        type: "plot",
        figure: 0,
        chart: "line",
        series: [
          { x: Float64Array.of(1, 2), y: Float64Array.of(3, 4) },
          { x: Float64Array.of(5, 6), y: Float64Array.of(7, 8) },
        ],
      },
    ]);
  });

  test("scatter emits a scatter chart", () => {
    const [event] = events("scatter(1, [1, 2], [3, 4])");

    expect(event).toMatchObject({ figure: 1, chart: "scatter" });
  });

  test("emits a frame each time a figure is plotted", () => {
    const frames = events("x = [1, 2]; plot(0, x, x); x(0) = 5; plot(0, x, x)");

    expect(frames.map((frame) => frame.series[0].x)).toEqual([
      Float64Array.of(1, 2),
      Float64Array.of(5, 2),
    ]);
  });
});

describe("xlim and ylim", () => {
  test("emit the limits of an axis", () => {
    expect(events("xlim(0, [-3, 3]); ylim(1, [0, 2])")).toEqual([
      { type: "limits", figure: 0, axis: "x", min: -3, max: 3 },
      { type: "limits", figure: 1, axis: "y", min: 0, max: 2 },
    ]);
  });
});
