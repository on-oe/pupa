import { admin } from './services/admin';
import { socker } from './services/socker';

function main() {
  admin.login().then(() => {
    socker.connect();
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error(error));
  });
}

main();
