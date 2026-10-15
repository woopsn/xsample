import { defineConfig } from "vite";
import peggy from "peggy";
import { parse } from "yaml";

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

// Compiles an example into its frontmatter and script when it is imported.
function example() {
  return {
    name: "example",
    transform(source, id) {
      if (!id.endsWith(".xs")) return null;

      const match = source.match(/^---\n(.*?)\n---\n(.*)$/s);
      if (!match) throw new Error(`${id}: expected frontmatter between ---`);

      const [, frontmatter, script] = match;
      const example = { ...parse(frontmatter), script: script.trim() };

      return { code: `export default ${JSON.stringify(example)}`, map: null };
    },
  };
}

export default defineConfig({
  plugins: [grammar(), example()],
  // the worker is bundled separately, and imports the grammar too
  worker: { plugins: () => [grammar()] },
});
