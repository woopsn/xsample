import { useEffect } from "react";
import { find } from "../examples";
import { App } from "./App";
import { useHash } from "./hash";

// The workspace of the example the URL names after its #, such as
// index.html#fourier-analysis/fourier-series. Without one, the workspace
// starts with `script`.
export function Workspace({ script }: { script: string }) {
  const id = useHash();
  const example = find(id);
  const title = example?.title ?? "Workspace";

  useEffect(() => {
    document.title = `Xsample: ${title}`;
  }, [title]);

  return (
    <>
      <h1>{title}</h1>
      {example?.blurb && <p className="blurb">{example.blurb}</p>}

      {/* a new example starts afresh, without the values set for the last */}
      <App
        key={id}
        script={example?.script ?? script}
        description={example?.description}
      />
    </>
  );
}
