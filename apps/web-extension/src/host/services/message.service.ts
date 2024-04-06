import {
  type User,
  type MessageElement,
  InteractionResponseType,
  type Interaction,
  MessageType,
  type InteractionResponse,
} from "@pupa/universal/types";
import { Repository } from "../repository";

export class MessageService {
  constructor(private readonly repository: Repository) {
    this.repository = repository;
  }

  async createMessageFromInteraction<R extends InteractionResponse>(
    interaction: Interaction,
    response: R,
  ) {
    const { type, data } = response;
    const app = await this.repository.getInstalledApp(
      interaction.application_id,
    );
    const author = {
      id: app!.id,
      username: app!.name,
      avatar: app!.icon,
    };
    switch (type) {
      case InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE:
        return this.createMessage({
          content: data.content,
          channelId: interaction.channel_id,
          author,
        });
      case InteractionResponseType.EXECUTE_PAGE_FUNCTION:
        return this.createMessage({
          content:
            data.content || `Executing page function: ${data.page_fn.name}`,
          channelId: interaction.channel_id,
          author,
        });
      case InteractionResponseType.AGENT_MESSAGE:
        return this.createMessage({
          content: "",
          channelId: interaction.channel_id,
          author,
        });
      default:
        return null;
    }
  }

  private createMessage(data: {
    content: string;
    channelId: string;
    author: User;
    type?: MessageType;
    components?: MessageElement[];
    interaction_id?: string;
  }) {
    const message = {
      ...data,
      type: data.type ?? MessageType.DEFAULT,
      channel_id: data.channelId,
      created_at: Date.now(),
    };
    return this.repository.appendMessage(message);
  }
}

export const messageService = new MessageService(new Repository());
