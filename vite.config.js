import { defineConfig } from "vite";
import peggy from "peggy";

// Compiles the Peggy grammar into a parser module when it is imported.
function grammar() {
  return {
    name: "grammar",
    transform(source, id) {
      if (!id.endsWith(".p")) return null;

      const code = peggy.generate(source, {
        output: "source",
        format: "es",
        grammarSource: id,
      });

      return { code, map: null };
    },
  };
}

export default defineConfig({
  plugins: [grammar()],
  // the worker is bundled separately, and imports the grammar too
  worker: { plugins: () => [grammar()] },
});
