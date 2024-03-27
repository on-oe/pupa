import { LocalMessageEventType } from "@shared/constants";
import refreshOnUpdate from "virtual:reload-on-update-in-view";

refreshOnUpdate("pages/content");

function main() {
  chrome.runtime.sendMessage({
    type: LocalMessageEventType.PageLoaded,
    data: { url: location.href },
  });
}

main();
