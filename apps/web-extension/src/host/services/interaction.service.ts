import type {
  Application,
  InteractionData,
  InteractionType,
} from "@pupa/universal/types";
import { Repository } from "../repository";

class InteractionService {
  constructor(private repository: Repository) {
    this.repository = repository;
  }

  async createInteraction(
    type: InteractionType,
    app: Application,
    channelId: string,
    data?: InteractionData,
  ) {
    const interaction = await this.repository.createInteraction(
      type,
      app,
      channelId,
      data,
    );
    return interaction;
  }
}

export const interactionService = new InteractionService(new Repository());
