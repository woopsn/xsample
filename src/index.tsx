import "./index.scss";

import { createRoot } from "react-dom/client";
import { App } from "./workspace/App";

const source =
  document.querySelector<HTMLTextAreaElement>("#lab_script_source");
const display = document.querySelector(".display-area");
const params = document.querySelector("[data-params]");

// about.html has no script, and loads this for its styles
if (source && display && params)
  createRoot(params).render(<App source={source} display={display} />);
