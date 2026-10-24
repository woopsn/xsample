import "./index.scss";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { find, landing } from "./examples";
import { Examples } from "./workspace/Examples";
import { Workspace } from "./workspace/Workspace";

const header = document.querySelector("#examples");
const workspace = document.querySelector("#workspace");

if (header)
  createRoot(header).render(
    <StrictMode>
      <Examples />
    </StrictMode>,
  );

// about.html has no workspace
if (workspace) {
  // the URL names the example shown, so the menu shows it too
  if (!find(location.hash.slice(1)))
    history.replaceState(null, "", `#${landing.id}`);

  createRoot(workspace).render(
    <StrictMode>
      <Workspace />
    </StrictMode>,
  );
}
