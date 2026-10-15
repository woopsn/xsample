// The example scripts in examples/, grouped by the directory each is in.
// The plugin in vite.config.js compiles each file into its frontmatter and
// its script.

export interface Example {
  // the path in examples/, without the extension: "fourier-analysis/dft"
  id: string;
  title: string;
  blurb?: string;
  script: string;
}

export interface Category {
  name: string;
  examples: Example[];
}

const files = import.meta.glob<Omit<Example, "id">>("../examples/*/*.xs", {
  eager: true,
  import: "default",
});

const examples: Example[] = Object.entries(files)
  .map(([path, file]) => ({
    id: path.replace(/^\.\.\/examples\/(.*)\.xs$/, "$1"),
    ...file,
  }))
  .sort((a, b) => a.title.localeCompare(b.title));

// "fourier-analysis" is named "Fourier Analysis"
function label(directory: string) {
  return directory
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function categorize() {
  const categories = new Map<string, Category>();

  for (const example of examples) {
    const name = label(example.id.split("/")[0]);
    const category = categories.get(name) ?? { name, examples: [] };

    category.examples.push(example);
    categories.set(name, category);
  }

  return [...categories.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export const categories: Category[] = categorize();

export function find(id: string) {
  return examples.find((example) => example.id === id);
}
