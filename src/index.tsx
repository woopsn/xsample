import "./index.scss";

import { createRoot } from "react-dom/client";
import { App } from "./workspace/App";
import { Workspace } from "./workspace/workspace.js";

const source =
  document.querySelector<HTMLTextAreaElement>("#lab_script_source");
const params = document.querySelector("[data-params]");

// about.html has no script, and loads this for its styles
if (source && params)
  createRoot(params).render(<App source={source} figures={new Workspace()} />);
