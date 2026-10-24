import { categories, find } from "../examples";
import { useHash } from "./hash";

// The header of every page: a link to the blank workspace, a menu of the
// examples, grouped by category, and a link to the about page. The menu
// shows the example the URL names, if it names one.
export function Examples() {
  const id = useHash();

  return (
    <nav>
      <a href="index.html">Workspace</a> | Examples:{" "}
      <select
        value={find(id) ? id : ""}
        aria-label="Examples"
        onChange={(e) => location.assign(`index.html#${e.target.value}`)}
      >
        {/* shown when the URL names no example */}
        <option value="" disabled hidden>
          Choose an example
        </option>

        {categories.map((category) => (
          <optgroup key={category.name} label={category.name}>
            {category.examples.map((example) => (
              <option key={example.id} value={example.id}>
                {example.title}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      | <a href="about.html">About</a>
    </nav>
  );
}
