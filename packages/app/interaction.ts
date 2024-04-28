import {
  InteractionType,
  type Interaction,
  type InteractionResponse,
  InteractionResponseType,
  type PageTweak,
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
  };
}

async function getSettings(applicationId: string, userId: string) {
  const data = (await fetch(
    `http://localhost:3000/api/application/settings/${applicationId}/${userId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + process.env.PUPA_API_KEY,
      },
    },
  ).then((res) => res.json())) as { value: string };

  return JSON.parse(data.value);
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

  get data() {
    return this.dto.data;
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

  get settings() {
    return {
      get: () => {
        if (!this.dto.user) return null;
        return getSettings(this.dto.application_id, this.dto.user.id);
      },
      set: (data: unknown) => {
        if (!this.dto.user) return null;
        this.send({
          type: InteractionResponseType.UPDATE_SETTINGS,
          data: { value: JSON.stringify(data) },
        });
        // return setSettings(this.dto.application_id, this.dto.user.id, data);
      },
    };
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

  async execPageTweak(tweak: PageTweak) {
    await this.send(
      {
        type: InteractionResponseType.EXECUTE_PAGE_FUNCTION,
        data: tweak,
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
