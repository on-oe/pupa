import { bridge } from "./bridge";

function main() {
  bridge.connect();
}

main();

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
