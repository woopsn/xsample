import "./index.scss";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./workspace/App";

const workspace = document.querySelector("#workspace");
const script = document.querySelector("#script");

// about.html has no workspace, and loads this for its styles
if (workspace && script)
  createRoot(workspace).render(
    <StrictMode>
      <App script={script.textContent.trim()} />
    </StrictMode>,
  );
