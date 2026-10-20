import { describe, test } from "vitest";
import { categories } from "../src/examples";
import { compile, events } from "./helpers";

// Each parameter at the top of its range, which is where an example does the
// most work.
function heaviest(script) {
  return events(script)
    .filter((event) => event.type == "param")
    .map(({ id, range }) => [id, range[range.length - 1]]);
}

for (const { examples } of categories)
  describe.each(examples)("$id", ({ script }) => {
    test("compiles", async ({ bench }) => {
      await bench("compile", () => compile(script)).run();
    });

    test("runs at its heaviest", async ({ bench }) => {
      const params = heaviest(script);

      await bench("run", () => events(script, params)).run();
    });
  });
