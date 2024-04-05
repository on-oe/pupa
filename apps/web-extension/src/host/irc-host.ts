import {
  type Application,
  type InteractionData,
  type InteractionResponse,
  type InteractionType,
  InteractionResponseType,
  type IRCResponseDataOfMessage,
  type IRCResponseDataOfPageFn,
} from "@pupa/universal/types";
import { wsHost } from "@host";
import type { Repository } from "./repository";
import { createMessage } from "./repository";
import { interactionService } from "./services/interaction.service";

export class InteractionHost {
  constructor(private repository: Repository) {
    this.repository = repository;
  }

  async post(
    type: InteractionType,
    app: Application,
    channelId: string,
    data: InteractionData,
  ) {
    const interaction = await interactionService.createInteraction(
      type,
      app,
      channelId,
      data,
    );
    const endpoint = app.interactions_endpoint_url;
    const sse = new EventSource(
      `${endpoint}?body=${encodeURIComponent(JSON.stringify(interaction))}`,
    );

    const appendMessage = (data: IRCResponseDataOfMessage) => {
      const { content, components } = data;
      const message = createMessage({
        content,
        components,
        channelId,
        author: {
          id: app.id,
          username: app.name,
          avatar: app.icon,
        },
        interaction_id: interaction.id,
      });
      this.repository.appendMessage(message);
      wsHost.emit("message", message);
    };

    sse.onmessage = (event) => {
      const res = JSON.parse(event.data) as InteractionResponse;
      switch (res.type) {
        case InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE:
          appendMessage(res.data! as IRCResponseDataOfMessage);
          break;
        case InteractionResponseType.EXECUTE_PAGE_FUNCTION:
          {
            const data = res.data as IRCResponseDataOfPageFn;
            wsHost.emit("execute_page_fn", {
              interaction,
              data,
            });
            appendMessage({
              content:
                data.content || `Executing page function: ${data.page_fn.name}`,
            });
          }
          break;
        default:
          break;
      }
    };
    sse.onerror = (e) => {
      if (e.eventPhase === EventSource.CLOSED) {
        console.log("sse closed");
      } else {
        console.error("sse error", e);
      }
      sse.close();
    };

    return interaction;
  }
}
