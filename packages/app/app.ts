import fs from "node:fs/promises";
import path from "node:path";
import {
  CommandType,
  type Interaction,
  type InteractionResponse,
  InteractionType,
  type Application,
} from "@pupa/universal/types";
import OpenAI from "openai";
import { InteractionContext } from "./interaction";
import type { Commander } from "./command";
import { createAppId } from "./utils/id";

const CON_MAX_TIME = 30000;

const llm = new OpenAI();

interface CreateAppOptions {
  name: string;
  description: string;
  icon: string;
  matches?: string[];
  commanders?: Commander[];
  onMessage?: (interaction: InteractionContext) => void;
}

export function createApp(options: CreateAppOptions) {
  return new App(options);
}

class App {
  private commanders = new Map<string, Commander>();

  private pfCommanders = new Map<string, Commander>();

  constructor(private options: CreateAppOptions) {
    this.options = options;
    this.options.commanders?.forEach((commander) => {
      this.attachCommander(commander);
    });
  }

  async findCommander(content: string, threshold = 0.8) {
    const commanders = Array.from(this.commanders.values());
    const pfCommanders = Array.from(this.pfCommanders.values());
    const allCommanders = commanders.concat(pfCommanders);
    const commanderList = allCommanders.map((commander) =>
      JSON.stringify({
        id: commander.id,
        name: commander.name,
        description: commander.description,
      }),
    );
    const commanderPrompt = commanderList.join("\n");
    const res = await llm.chat.completions.create({
      model: "gpt-3.5-turbo",
      response_format: { type: "json_object" },
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `Please help user to find the commander for the user input: ${content}.\nif user input is not related to any commander, response with json object: {commanderId: null}.\n\n##commanders\n ${commanderPrompt}.\n response with json object: {commanderId: string, score: number}, score is the confidence of the commander.`,
        },
      ],
    });
    const data = res.choices[0].message.content;
    if (!data) {
      return null;
    }
    const { commanderId, score } = JSON.parse(data);
    if (!commanderId || score < threshold) {
      return null;
    }
    return allCommanders.find((commander) => commander.id === commanderId);
  }

  async serve(port = 6700) {
    await this.loadCommands();
    this.run(port);
    console.log("App is running on port", port);
  }

  private run(port: number) {
    const appOptions = this.options;

    Bun.serve({
      port,
      fetch: (req) => {
        const url = new URL(req.url);
        if (url.pathname === "/install") {
          const app: Omit<Application, "interactions_endpoint_url"> = {
            ...appOptions,
            id: createAppId(appOptions.name),
          };
          return new Response(JSON.stringify(app), {
            headers: {
              "Content-Type": "application/json",
            },
          });
        }

        if (url.pathname === "/commands") {
          const commands = Array.from(this.commanders.values()).map(
            (commander) => ({
              id: commander.id,
              name: commander.name,
              description: commander.description,
              options: commander.options,
            }),
          );
          return new Response(JSON.stringify(commands), {
            headers: {
              "Content-Type": "application/json",
            },
          });
        }

        const bodyStr = url.searchParams.get("body");
        if (!bodyStr) {
          return new Response("Bad Request", {
            status: 400,
          });
        }

        const ircData = JSON.parse(bodyStr) as unknown as Interaction;

        const stream = new ReadableStream({
          start: (controller) => {
            const close = () => {
              controller.close();
              clearTimeout(timeout);
            };

            const timeout = setTimeout(() => {
              close();
            }, CON_MAX_TIME);

            const send = (msg: InteractionResponse, isClose = false) => {
              return new Promise((resolve) => {
                const dataString = `data: ${JSON.stringify(msg)}\n\n`;
                const dataBuffer = new TextEncoder().encode(dataString);
                controller.enqueue(dataBuffer);
                resolve(msg);
              }).then(() => {
                if (isClose) {
                  close();
                }
              });
            };

            const interaction = new InteractionContext(ircData, send);
            this.onInteraction(interaction);
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        });
      },
    });
  }

  private async onInteraction(interaction: InteractionContext) {
    switch (interaction.type) {
      case InteractionType.APPLICATION_COMMAND:
      case InteractionType.PAGE_FUNCTION_MESSAGE:
        {
          const commander = this.getCommander(interaction);
          commander?.execute(interaction);
        }
        break;
      default:
        this.options.onMessage?.(interaction);
    }
  }

  private getCommander(interaction: InteractionContext) {
    if (!interaction.commandId) return null;
    let commander: Commander | undefined;
    if (interaction.type === InteractionType.PAGE_FUNCTION_MESSAGE) {
      commander = this.pfCommanders.get(interaction.commandId);
    } else if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      commander = this.commanders.get(interaction.commandId);
    }
    return commander;
  }

  private async loadCommands() {
    const dirPath = path.join(process.cwd(), "commands");
    const files = await fs.readdir(dirPath);
    const cmdFiles = files.filter(
      (file) =>
        file.endsWith(".ts") &&
        !file.endsWith(".d.ts") &&
        !file.endsWith(".test.ts"),
    );
    const tasks = cmdFiles.map(async (file) => {
      const { default: commander } = (await import(`${dirPath}/${file}`)) as {
        default: Commander;
      };
      this.attachCommander(commander);
    });
    await Promise.all(tasks);
  }

  private attachCommander(commander: Commander) {
    switch (commander.type) {
      case CommandType.CHAT_INPUT:
        this.commanders.set(commander.id, commander);
        console.log("Loaded slash command:", commander.name);
        break;
      case CommandType.PAGE_FUNCTION:
        this.pfCommanders.set(commander.id, commander);
        console.log("Loaded page function:", commander.name);
        break;
    }
  }
}
