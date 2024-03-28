import { createRoot } from "react-dom/client";
import { Theme } from "@radix-ui/themes";
import App from "./app";
import "./index.css";
import "@radix-ui/themes/styles.css";

function init() {
  const appContainer = document.querySelector("#app-container");
  if (!appContainer) {
    throw new Error("Can not find #app-container");
  }
  const root = createRoot(appContainer);
  root.render(
    <Theme>
      <App />
    </Theme>,
  );
}

init();
