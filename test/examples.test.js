import { describe, expect, test } from "vitest";
import { categories, find } from "../src/examples";
import { events } from "./helpers";

describe("examples", () => {
  test("are grouped by directory, and sorted by name", () => {
    expect(
      categories.map(({ name, examples }) => [
        name,
        examples.map((example) => example.title),
      ]),
    ).toEqual([
      ["About Xsample", ["Basic Plot w/ Parameters"]],
      ["Dynamic Systems", ["Heat - 1D (Explicit)", "Logistic Map"]],
      [
        "Fourier Analysis",
        ["Approximate Identity", "Fourier Series", "Fourier Transform"],
      ],
    ]);
  });

  test("are found by their path in examples/", () => {
    expect(find("dynamic-systems/heat-equation").title).toBe(
      "Heat - 1D (Explicit)",
    );
    expect(find("dynamic-systems")).toBeUndefined();
  });

  for (const { examples } of categories)
    for (const example of examples)
      test(`${example.id} plots`, () => {
        expect(events(example.script)).toContainEqual(
          expect.objectContaining({ type: "plot" }),
        );
      });
});
