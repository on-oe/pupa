import { wsHost } from "@host";
import type {
  IRCResponseOfAgentMessage,
  Interaction,
} from "@pupa/universal/types";
import { OpenAI } from "openai";
import { Repository } from "../repository";

interface AgentPrompt {
  systemPrompt: string;
  temperature: number;
}

const systemPromptCache = new Map<string, AgentPrompt>();

export class AgentService {
  private client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  constructor(private readonly repository: Repository) {
    this.repository = repository;
  }

  async reply(interaction: Interaction, data: IRCResponseOfAgentMessage) {
    const { message } = interaction;
    if (!message) return;
    const { systemPrompt, temperature } = await this.createSystemPrompt(
      data.prompt,
    );
    const stream = await this.client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: data.content,
        },
      ],
      temperature,
      stream: true,
    });
    let content = "";
    for await (const chunk of stream) {
      content += chunk.choices[0].delta.content ?? "";
      wsHost.emit("update_message", {
        ...message,
        content,
      });
    }
    this.repository.updateMessage(message.channel_id, message.id, {
      content,
    });
  }

  private async createSystemPrompt(requirement: string): Promise<AgentPrompt> {
    if (systemPromptCache.has(requirement)) {
      const agentPrompt = systemPromptCache.get(requirement)!;
      return agentPrompt;
    }
    const res = await this.client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are skilled at creating system prompts for use with the OpenAI API.
          such as: "you are a xxx assistant, ..."
          Please help create prompts that meet the user's needs based on their requirements, and set an appropriate temperature parameter according to the needs.
          Finally, return the data in JSON format, as: {"system_prompt": string, "temperature": number}`,
        },
        {
          role: "user",
          content: requirement,
        },
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
    });
    const data = JSON.parse(res.choices[0].message.content!);
    const agentPrompt = {
      systemPrompt: data.system_prompt,
      temperature: data.temperature,
    };
    systemPromptCache.set(requirement, agentPrompt);
    return agentPrompt;
  }
}

export const agentService = new AgentService(new Repository());
