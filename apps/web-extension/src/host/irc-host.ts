import {
  type Application,
  type InteractionData,
  type InteractionResponse,
  type InteractionType,
  InteractionResponseType,
} from "@pupa/universal/types";
import { wsHost } from "@host";
import { interactionService } from "./services/interaction.service";
import { agentService } from "./services/agent.service";
import type { MessageService } from "./services/message.service";

export class InteractionHost {
  constructor(private readonly messageService: MessageService) {
    this.messageService = messageService;
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

    sse.onmessage = async (event) => {
      const res = JSON.parse(event.data) as InteractionResponse;
      switch (res.type) {
        case InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE:
          {
            const message =
              await this.messageService.createMessageFromInteraction(
                interaction,
                res,
              );
            wsHost.emit("message", message);
          }
          break;
        case InteractionResponseType.EXECUTE_PAGE_FUNCTION:
          {
            wsHost.emit("execute_page_fn", {
              interaction,
              data: res.data,
            });
            const message =
              await this.messageService.createMessageFromInteraction(
                interaction,
                res,
              );
            wsHost.emit("message", message);
          }
          break;
        case InteractionResponseType.AGENT_MESSAGE:
          {
            const message =
              await this.messageService.createMessageFromInteraction(
                interaction,
                res,
              );
            wsHost.emit("message", message);
            interaction.message = message!;
            agentService.reply(interaction, res.data);
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
