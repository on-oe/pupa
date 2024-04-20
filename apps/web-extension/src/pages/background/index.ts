import { admin } from './services/admin';
import { socker } from './services/socker';
import { applicationStore, channelStore } from './store';

async function main() {
  await admin.login();

  socker.connect();

  applicationStore.load();
  channelStore.load();

  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
}

main();
