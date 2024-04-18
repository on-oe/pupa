import {
  InteractionType,
  type Interaction,
  type InteractionResponse,
  InteractionResponseType,
} from '@pupa/universal/types';

function send(id: string, token: string) {
  return (data: unknown) => {
    fetch(`http://localhost:3000/api/interaction/${id}/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }
}

export class InteractionContext {
  private send: (msg: InteractionResponse, isClose?: boolean) => void;
  constructor(private dto: Interaction) {
    this.dto = dto;
    this.send = send(dto.id, dto.token);
  }

  private replied = false;

  private deferred = false;

  get id() {
    return this.dto.id;
  }

  get type() {
    return this.dto.type;
  }

  get commandName() {
    return this.dto.data?.name;
  }

  get commandOptions() {
    return this.dto.data?.options;
  }

  get message() {
    return this.dto.message;
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
      throw new Error('Already replied');
    }
    this.replied = true;
    this.deferred = false;
    return msg;
  }

  defer(msg: InteractionResponse) {
    if (this.replied) {
      throw new Error('Already replied');
    }
    this.replied = true;
    this.deferred = true;
    return msg;
  }

  async reply(msg: InteractionResponse) {
    if (this.replied) {
      throw new Error('Already replied');
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
    const uri = process.env.DEV_ENDPOINT + '/dist/' + name + '.js';
    await this.send(
      {
        type: InteractionResponseType.EXECUTE_PAGE_FUNCTION,
        data: { name, uri },
      },
      true,
    );
  }

  createAgent(prompt: string) {
    return {
      reply: (msg: string) => {
        return this.reply({
          type: InteractionResponseType.AGENT_MESSAGE,
          data: { content: msg, prompt, stream: true },
        });
      },
    };
  }
}
