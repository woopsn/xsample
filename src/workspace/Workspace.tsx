import { useEffect, useSyncExternalStore } from "react";
import { find } from "../examples";
import { App } from "./App";

function subscribe(listener: () => void) {
  addEventListener("hashchange", listener);
  return () => removeEventListener("hashchange", listener);
}

// The workspace of the example the URL names after its #, such as
// index.html#fourier-analysis/fourier-series. Without one, the workspace
// starts with `script`.
export function Workspace({ script }: { script: string }) {
  const id = useSyncExternalStore(subscribe, () => location.hash.slice(1));
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
      <App key={id} script={example?.script ?? script} />
    </>
  );
}
