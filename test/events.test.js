import { describe, expect, test } from "vitest";
import { events, run, scalar } from "./helpers";

describe("param", () => {
  test("declares a parameter over its range", () => {
    expect(events('param("n", [1, 2, 3], 2)')).toEqual([
      { type: "param", id: "n", range: Float64Array.of(1, 2, 3), value: 2 },
    ]);
  });

  test("evaluates to its initial value", () => {
    expect(run('x = param("n", [1, 2, 3], 2)').x).toEqual(scalar(2));
  });

  test("starts at the bottom of its range by default", () => {
    expect(run('x = param("n", [1, 2, 3])').x).toEqual(scalar(1));
  });

  test("is named by a string", () => {
    expect(() => run("param(0, [1, 2, 3])")).toThrow(
      "param: the name must be a string",
    );
  });

  test("evaluates to the value the host has set", () => {
    const [event] = events('param("n", [1, 2, 3], 2)', [["n", 3]]);

    expect(event.value).toBe(3);
  });

  test("takes a hint as its last argument", () => {
    const [event] = events('param("n", [1, 2, 3], 2, "Iterations")');

    expect(event).toMatchObject({ value: 2, hint: "Iterations" });
  });

  test("takes a hint without an initial value", () => {
    const [event] = events('param("n", [1, 2, 3], "Iterations")');

    expect(event).toMatchObject({ value: 1, hint: "Iterations" });
  });

  test("takes its hint last", () => {
    expect(() => run('param("n", [1, 2, 3], "Iterations", 2)')).toThrow(
      "param: the initial value must be a number",
    );
  });
});

describe("figure", () => {
  test("chooses a figure, setting none of its properties", () => {
    expect(events("figure(2)")).toEqual([
      { type: "figure", figure: 2, properties: {} },
    ]);
  });

  test("makes a figure the one that later calls draw on", () => {
    const [, plot, limits] = events("figure(2); plot([1], [2]); xlim([0 1])");

    expect([plot.figure, limits.figure]).toEqual([2, 2]);
  });

  test("makes a figure the one that later calls set the properties of", () => {
    const [, title] = events('figure(2); title("Orbits")');

    expect(title.figure).toBe(2);
  });

  test("takes only the figure's number", () => {
    expect(() => run('figure(1, "name", "Orbits")')).toThrow(
      "figure: takes only the figure's number",
    );
  });
});

describe("title, xlabel and ylabel", () => {
  test("set a property of the current figure", () => {
    expect(events('title("Orbits"); xlabel("x"); ylabel("r")')).toEqual([
      { type: "figure", figure: 1, properties: { title: "Orbits" } },
      { type: "figure", figure: 1, properties: { xlabel: "x" } },
      { type: "figure", figure: 1, properties: { ylabel: "r" } },
    ]);
  });

  test("take a string", () => {
    expect(() => run("title(2)")).toThrow("title: the text must be a string");
  });
});

describe("legend", () => {
  test("names the series of the current figure", () => {
    expect(events('legend("signal", "fit")')).toEqual([
      { type: "figure", figure: 1, properties: { legend: ["signal", "fit"] } },
    ]);
  });

  test("takes strings", () => {
    expect(() => run('legend("signal", 2)')).toThrow(
      "legend: each name must be a string",
    );
  });
});

describe("plot", () => {
  test("draws figure 1 until another is chosen", () => {
    expect(events("plot([1], [2])")[0].figure).toBe(1);
  });

  test("emits one series for each pair of arguments", () => {
    expect(events("plot([1, 2], [3, 4], [5, 6], [7, 8])")).toEqual([
      {
        type: "plot",
        figure: 1,
        chart: "line",
        series: [
          { x: Float64Array.of(1, 2), y: Float64Array.of(3, 4) },
          { x: Float64Array.of(5, 6), y: Float64Array.of(7, 8) },
        ],
      },
    ]);
  });

  test("scatter emits a scatter chart", () => {
    const [event] = events("scatter([1, 2], [3, 4])");

    expect(event).toMatchObject({ chart: "scatter" });
  });

  test("emits a frame each time a figure is plotted", () => {
    const frames = events("x = [1, 2]; plot(x, x); x(0) = 5; plot(x, x)");

    expect(frames.map((frame) => frame.series[0].x)).toEqual([
      Float64Array.of(1, 2),
      Float64Array.of(5, 2),
    ]);
  });
});

describe("xlim and ylim", () => {
  test("emit the limits of an axis", () => {
    expect(events("xlim([-3, 3]); ylim([0, 2])")).toEqual([
      { type: "limits", figure: 1, axis: "x", min: -3, max: 3 },
      { type: "limits", figure: 1, axis: "y", min: 0, max: 2 },
    ]);
  });
});
