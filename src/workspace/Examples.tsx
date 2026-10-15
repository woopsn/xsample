import { categories } from "../examples";

// The header of every page: a menu of examples for each category, and
// links to the blank workspace and the about page.
export function Examples() {
  return (
    <nav>
      Examples:{" "}
      {categories.map((category) => (
        // shows the name of the category, whichever example is picked
        <select
          key={category.name}
          value=""
          aria-label={category.name}
          onChange={(e) => location.assign(`index.html#${e.target.value}`)}
        >
          <option value="" disabled hidden>
            {category.name}
          </option>

          {category.examples.map((example) => (
            <option key={example.id} value={example.id}>
              {example.title}
            </option>
          ))}
        </select>
      ))}
      <a href="index.html">Workspace</a> | <a href="about.html">About</a>
    </nav>
  );
}
