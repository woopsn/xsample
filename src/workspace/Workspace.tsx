import { useEffect } from "react";
import { find, landing } from "../examples";
import { App } from "./App";
import { useHash } from "./hash";

// The workspace of the example the URL names after its #, such as
// index.html#fourier-analysis/fourier-series, or if it names none, of the
// landing example.
export function Workspace() {
  const id = useHash();
  const example = find(id) ?? landing;

  useEffect(() => {
    document.title = `Xsample: ${example.title}`;
  }, [example.title]);

  return (
    <>
      <h1>{example.title}</h1>
      {example.blurb && <p className="blurb">{example.blurb}</p>}

      {/* a new example starts afresh, without the values set for the last */}
      <App key={id} script={example.script} description={example.description} />
    </>
  );
}
