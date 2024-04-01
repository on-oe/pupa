import { createRoot } from "react-dom/client";
import { ConfigProvider } from "antd";
import App from "./app";
import "./index.css";

function init() {
  const appContainer = document.querySelector("#app-container");
  if (!appContainer) {
    throw new Error("Can not find #app-container");
  }
  const root = createRoot(appContainer);
  root.render(
    <ConfigProvider
      theme={{
        components: {
          List: {
            itemPaddingSM: "4px 8px",
            avatarMarginRight: 8,
            descriptionFontSize: 12,
          },
        },
      }}
    >
      <App />
    </ConfigProvider>,
  );
}

init();
