import { describe, expect, test } from "vitest";
import { draw, overlay } from "../src/workspace/figures";

const series = [{ x: Float64Array.of(1, 2), y: Float64Array.of(3, 4) }];

function plot(figure, chart = "line") {
  return { type: "plot", figure, chart, series };
}

function limits(figure, axis, min, max) {
  return { type: "limits", figure, axis, min, max };
}

// The figures of a run that emits the given events.
function drawn(...events) {
  const figures = new Map();
  for (const event of events) draw(figures, event);
  return figures;
}

describe("draw", () => {
  test("a plot adds a figure", () => {
    expect(drawn(plot(0, "scatter"))).toEqual(
      new Map([[0, { chart: "scatter", series }]]),
    );
  });

  test("plotting a figure again replaces its series", () => {
    const again = { ...plot(0), series: [] };

    expect(drawn(plot(0), again).get(0).series).toEqual([]);
  });

  test("limits fix the extent of an axis", () => {
    expect(drawn(plot(0), limits(0, "y", -1, 1)).get(0)).toEqual({
      chart: "line",
      series,
      y: [-1, 1],
    });
  });

  test("a figure keeps its limits when it is plotted again", () => {
    expect(drawn(plot(0), limits(0, "x", 0, 9), plot(0)).get(0).x).toEqual([
      0, 9,
    ]);
  });

  test("limits may come before the plot", () => {
    expect(drawn(limits(0, "x", 0, 9), plot(0)).get(0)).toEqual({
      chart: "line",
      series,
      x: [0, 9],
    });
  });
});

describe("overlay", () => {
  test("keeps the figures the run has not drawn yet", () => {
    const shown = drawn(plot(0), plot(1));

    expect([...overlay(shown, drawn(plot(1))).keys()]).toEqual([0, 1]);
  });

  test("a figure keeps the limits it was shown with", () => {
    const shown = drawn(plot(0), limits(0, "y", -1, 1));

    expect(overlay(shown, drawn(plot(0))).get(0).y).toEqual([-1, 1]);
  });

  test("the limits of the run replace those shown", () => {
    const shown = drawn(plot(0), limits(0, "y", -1, 1));
    const run = drawn(plot(0), limits(0, "y", 0, 5));

    expect(overlay(shown, run).get(0).y).toEqual([0, 5]);
  });
});
