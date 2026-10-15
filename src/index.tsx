import "./index.scss";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Examples } from "./workspace/Examples";
import { Workspace } from "./workspace/Workspace";

const header = document.querySelector("#examples");
const workspace = document.querySelector("#workspace");
const script = document.querySelector("#script");

if (header)
  createRoot(header).render(
    <StrictMode>
      <Examples />
    </StrictMode>,
  );

// about.html has no workspace
if (workspace && script)
  createRoot(workspace).render(
    <StrictMode>
      <Workspace script={script.textContent.trim()} />
    </StrictMode>,
  );
