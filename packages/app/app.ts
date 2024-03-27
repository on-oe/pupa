import fs from "node:fs/promises";
import path from "node:path";
import {
  CommandType,
  type Interaction,
  type InteractionResponse,
  InteractionType,
  type Application,
} from "@pupa/universal/types";
import { InteractionContext } from "./interaction";
import type { Commander } from "./command";
import { createAppId } from "./utils/id";

const CON_MAX_TIME = 30000;

interface CreateAppOptions {
  name: string;
  description: string;
  icon: string;
  matches?: string[];
}

export function createApp(options: CreateAppOptions) {
  return new App(options);
}

class App {
  private commanders = new Map<string, Commander>();

  private pfCommanders = new Map<string, Commander>();

  constructor(private options: CreateAppOptions) {
    this.options = options;
  }

  async serve(port = 6700) {
    await this.loadCommands();
    this.run(port);
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

        const params = Object.fromEntries(
          url.searchParams.entries(),
        ) as unknown as Interaction;

        const stream = new ReadableStream({
          start: (controller) => {
            const close = () => {
              if (controller.desiredSize === 0) {
                controller.close();
                clearTimeout(timeout);
              }
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

            const interaction = new InteractionContext(params, send);
            const commander = this.getCommander(interaction);
            commander?.execute(interaction);
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
    const cmdFiles = await fs.readdir(dirPath);
    const tasks = cmdFiles.map(async (file) => {
      const { default: command } = (await import(`${dirPath}/${file}`)) as {
        default: Commander;
      };
      switch (command.type) {
        case CommandType.CHAT_INPUT:
          this.commanders.set(command.id, command);
          break;
        case CommandType.PAGE_FUNCTION:
          this.pfCommanders.set(command.id, command);
          break;
      }
      console.log("Loaded command:", command.name);
    });
    await Promise.all(tasks);
  }
}
