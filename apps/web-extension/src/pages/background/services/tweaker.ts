import {
  InteractionType,
  PageTweakEvent,
  type Application,
  type PageTweak,
} from '@pupa/universal/types';
import { fetcher } from './fetcher';
import { openDB, type IDBPDatabase } from 'idb';
import { channelStore } from '../store';

export interface ExecTweakOptions {
  tweak: PageTweak;
  applicationId: string;
}

interface PageTweakMessage {
  type: PageTweakEvent;
  data: {
    applicationId: string;
    data: unknown;
  };
}

class TweakerService {
  private scriptManager = new UserScriptManager();

  private executer = chrome.scripting;

  private receiver = chrome.runtime.onUserScriptMessage;

  private readonly USER_SCRIPT_EVENT = 'page_fn_event';
  private readonly PUPA_MESSAGE_EVENT = 'pupa-message';

  constructor() {
    chrome.userScripts.configureWorld({
      csp: "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https://esm.run https://cdn.jsdelivr.net/npm/*",
      messaging: true,
    });

    chrome.userScripts.register([
      {
        id: 'pupa',
        js: [
          {
            code: `const __pupaExtListenerMgr__ = {};document.addEventListener("${this.USER_SCRIPT_EVENT}", function(e) { eval(e.detail); });`,
          },
        ],
        matches: ['<all_urls>'],
        world: 'USER_SCRIPT',
        runAt: 'document_start',
      },
    ]);
    this.receiver.addListener(async (message: PageTweakMessage) => {
      if (
        message.type === PageTweakEvent.MESSAGE ||
        message.type === PageTweakEvent.REPEAT
      ) {
        let channel = channelStore.currentChanel;
        if (!channel) {
          channel = await channelStore.addChannel();
        }
        const type =
          message.type === PageTweakEvent.MESSAGE
            ? InteractionType.PAGE_TWEAK_MESSAGE
            : InteractionType.PAGE_TWEAK_EVENT;
        fetcher.postTweakMessage({
          type,
          applicationId: message.data.applicationId,
          channelId: channel.id,
          data: message.data.data,
        });
      }
    });
  }

  async execute(options: ExecTweakOptions) {
    const runtimeCode = await this.assembleJsCode(options);
    this.injectScript(runtimeCode);
  }

  updateSettings(applicationId: string, settings: unknown) {
    const runtimeCode = `dispatchEvent(new CustomEvent('pupa-settings-change-${applicationId}', { detail: '${JSON.stringify(settings)}' }))`;
    this.injectScript(runtimeCode);
  }

  async cache(apps: Application[]) {
    const items = apps.flatMap((app) =>
      app.tweaks.map((tweak) => ({
        ...tweak,
        applicationId: app.id,
        endpoint: app.interactions_endpoint_url,
      })),
    );

    for (const item of items) {
      const url = `${item.endpoint}/tweak/${item.name}.js`;
      const code = await fetch(url).then((res) => res.text());
      this.scriptManager.setScript(item.applicationId, item.name, code);
    }
  }

  private async getScript(options: ExecTweakOptions) {
    const { applicationId } = options;
    const { name } = options.tweak;
    const code = this.scriptManager.getScript(applicationId, name);
    if (code) {
      return code;
    }
    return '';
  }

  private injectScript(code: string) {
    function func(event: string, code: string) {
      document.dispatchEvent(
        new CustomEvent(event, {
          detail: code,
        }),
      );
    }

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) {
        return;
      }
      this.executer.executeScript({
        target: { tabId: tab.id },
        func,
        injectImmediately: true,
        args: [this.USER_SCRIPT_EVENT, code],
      });
    });
  }

  private async assembleJsCode(options: ExecTweakOptions) {
    const code = await this.getScript(options);
    const { applicationId } = options;
    const { name, once } = options.tweak;
    return `
      (function() {
        if (!!${Number(once)} && __pupaExtListenerMgr__['${applicationId}:${name}']) {
          chrome.runtime.sendMessage({ type: "${PageTweakEvent.REPEAT}", data: { applicationId: "${applicationId}", data: { name: "${name}", type: ${PageTweakEvent.REPEAT} } } });
          return;
        }
        if (!__pupaExtListenerMgr__['${applicationId}:${name}']) {
          __pupaExtListenerMgr__['${applicationId}:${name}'] = true;
        }

        globalThis.addEventListener('pupa-tweak-message-${applicationId}-${name}', function(e) {
          chrome.runtime.sendMessage({ type: "${PageTweakEvent.MESSAGE}", data: { applicationId: "${applicationId}", data: e.detail } });
        });
  
        (async function() {
          ${code}
        })()
      })();
    `;
  }
}

class UserScriptManager {
  private db: Promise<IDBPDatabase>;

  constructor() {
    this.db = openDB('pupa', 1, {
      upgrade(db) {
        db.createObjectStore('user_scripts');
      },
    });
  }

  getScript(appid: string, name: string): Promise<string | void> {
    return this.db.then((db) => db.get('user_scripts', `${appid}:${name}`));
  }

  setScript(appid: string, name: string, script: string) {
    return this.db.then((db) =>
      db.put('user_scripts', script, `${appid}:${name}`),
    );
  }
}

export const tweaker = new TweakerService();
