import path from "node:path";
import {
  InteractionType,
  type Interaction,
  type InteractionResponse,
  InteractionResponseType,
} from "@pupa/universal/types";

export class InteractionContext {
  constructor(
    private dto: Interaction,
    private send: (msg: InteractionResponse, isClose?: boolean) => void,
  ) {
    this.dto = dto;
    this.send = send;
  }

  private replied = false;

  private deferred = false;

  get id() {
    return this.dto.id;
  }

  get type() {
    return this.dto.type;
  }

  get commandId() {
    return this.dto.data?.id;
  }

  get commandName() {
    return this.dto.data?.name;
  }

  get commandOptions() {
    return this.dto.data?.options;
  }

  get isReplied() {
    return this.replied;
  }

  get isDeferred() {
    return this.deferred;
  }

  get isChatInputCommand() {
    return (
      this.dto.type === InteractionType.APPLICATION_COMMAND && !!this.dto.data
    );
  }

  get isPageFuncCommand() {
    return this.dto.type === InteractionType.PAGE_FUNCTION_MESSAGE;
  }

  followUp(msg: InteractionResponse) {
    if (this.replied) {
      throw new Error("Already replied");
    }
    this.replied = true;
    this.deferred = false;
    return msg;
  }

  defer(msg: InteractionResponse) {
    if (this.replied) {
      throw new Error("Already replied");
    }
    this.replied = true;
    this.deferred = true;
    return msg;
  }

  async reply(msg: InteractionResponse) {
    if (this.replied) {
      throw new Error("Already replied");
    }
    this.replied = true;
    this.deferred = false;
    await this.send(msg);
    return msg;
  }

  async end(content: string) {
    await this.send(
      {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: { content },
      },
      true,
    );
  }

  async execPageFn(name: string) {
    const filePath = path.join(process.cwd(), "pfn", `${name}.js`);
    const file = Bun.file(filePath);
    const code = await file.text;
    await this.send(
      {
        type: InteractionResponseType.EXECUTE_PAGE_FUNCTION,
        data: { content: JSON.stringify({ name, code }) },
      },
      true,
    );
  }
}
