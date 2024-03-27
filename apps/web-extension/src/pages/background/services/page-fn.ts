import {
  InteractionType,
  type Interaction,
  type IRCResponseDataOfPageFn,
  type InteractionData,
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
  data: InteractionData & { channel_id: string; application_id: string };
}

const PAGE_FN_EVENT = "page_fn_event";

class PageFnService {
  private executer = chrome.userScripts;

  private receiver = chrome.runtime.onUserScriptMessage;

  constructor() {
    this.receiver.addListener((message: PageFnMessage) => {
      if (message.type === PAGE_FN_EVENT) {
        fetcher.postPageMessage(
          message.data.application_id,
          message.data.channel_id,
          message.data,
        );
      }
    });
  }

  execute(options: ExecutePageFnOptions) {
    this.executer.register([
      {
        id: options.interaction.id,
        js: [{ code: assembleJsCode(options) }],
      },
    ]);
  }
}

function assembleJsCode(options: ExecutePageFnOptions) {
  const { channel_id: cid, application_id: appid } = options.interaction;
  const { name, code } = options.data.page_fn;
  return `
    (function() {
      PupaPage = {
        sendMessage(data) {
          const options = Object.keys(data).map(key => ({ name: key, value: data[key] }));
          postResult({ type: ${InteractionType.PAGE_FUNCTION_MESSAGE}, options });
        }
      }

      function postResult(result) {
        const data = { type: result.type, data: { name: "${name}", options: result.options }, channel_id: "${cid}", application_id: "${appid}"};
        chrome.runtime.sendMessage({ type: "${PageFnMessageType.PAGE_FN_EVENT}", data });
      }

      ${code}
    })();
  `;
}

export const pageFn = new PageFnService();
