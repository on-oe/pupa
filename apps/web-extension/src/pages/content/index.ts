import { LocalMessageEventType } from "@shared/constants";

function main() {
  chrome.runtime.sendMessage({
    type: LocalMessageEventType.PageLoaded,
    data: { url: location.href },
  });
}

main();
