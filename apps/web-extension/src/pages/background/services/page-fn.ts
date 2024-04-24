import {
  InteractionType,
  type Interaction,
  type IRCResponseDataOfPageFn,
  type InteractionData,
  CommandType,
} from "@pupa/universal/types";
import { fetcher } from "./fetcher";

export interface ExecutePageFnOptions {
  interaction: Interaction;
  data: IRCResponseDataOfPageFn;
}

const enum PageFnMessageType {
  PAGE_FN_EVENT = "page_fn_event",
}

interface PageFnMessage {
  type: PageFnMessageType;
  data: {
    channel_id: string;
    application_id: string;
    data: InteractionData;
  };
}

class PageFnService {
  // private executer = chrome.userScripts;
  private executer = chrome.scripting;

  private receiver = chrome.runtime.onUserScriptMessage;

  private readonly USER_SCRIPT_EVENT = "page_fn_event";

  constructor() {
    chrome.userScripts.configureWorld({
      csp: "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https://esm.run https://cdn.jsdelivr.net/npm/*",
      messaging: true,
    });

    chrome.userScripts.register([
      {
        id: "pupa",
        js: [
          {
            code: `document.addEventListener("${this.USER_SCRIPT_EVENT}", function(e) { eval(e.detail); });`,
          },
        ],
        matches: ["<all_urls>"],
        world: "USER_SCRIPT",
      },
    ]);
    this.receiver.addListener((message: PageFnMessage) => {
      if (message.type === PageFnMessageType.PAGE_FN_EVENT) {
        fetcher.postPageMessage(
          message.data.application_id,
          message.data.channel_id,
          message.data.data,
        );
      }
    });
  }

  execute(options: ExecutePageFnOptions) {
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
        args: [this.USER_SCRIPT_EVENT, await assembleJsCode(options)],
      });
    });
  }
}

async function assembleJsCode(options: ExecutePageFnOptions) {
  const { channel_id: cid, application_id: appid } = options.interaction;
  const { name, uri } = options;
  const code = await fetch(uri).then((res) => res.text());
  return `
    (function() {
      const page = {
        sendMessage(data) {
          const options = Object.keys(data).map(key => ({ name: key, value: data[key] }));
          postResult({ type: ${InteractionType.PAGE_FUNCTION_MESSAGE}, options });
        },
        env: {
          ENDPOINT: "http://localhost:6700",
        }
      }
      globalThis.page = page;

      function postResult(result) {
        const data = { type: result.type, data: { type: ${CommandType.PAGE_FUNCTION}, name: "${name}", options: result.options }, channel_id: "${cid}", application_id: "${appid}"};
        chrome.runtime.sendMessage({ type: "${PageFnMessageType.PAGE_FN_EVENT}", data });
      }

      (async function() {
        ${code}
      })()
    })();
  `;
}

export const pageFn = new PageFnService();
