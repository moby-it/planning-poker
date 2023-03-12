import { Router } from "@solidjs/router";
import { render } from "solid-js/web";
import { App } from "./app";
import "./styles/reset.css";
import "./styles/normalize.css";
import "./styles/colors.css";
import "./styles/typography.css";
import "./styles/layout.css";
import "./styles/input.css";
const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?"
  );
}

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  root!
);
