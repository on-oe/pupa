import path from 'node:path';
import { CommandType, InteractionType } from '@pupa/universal/types';
import OpenAI from 'openai';
import { InteractionContext } from './interaction';
import type { Commander } from './command';
import { Host } from './host';
import express, { type Express } from 'express';
import cors from 'cors';

const llm = new OpenAI();

interface CreateAppOptions {
  name: string;
  description: string;
  icon: string;
  matches?: string[];
  commanders?: Commander[];
  onMessage?: (interaction: InteractionContext) => void;
  onPing?: (interaction: InteractionContext) => void;
}

export function createApp(options: CreateAppOptions) {
  return new App(options);
}

class App {
  private commanders = new Map<string, Commander>();

  private pfCommanders = new Map<string, Commander>();

  private prCommanders = new Map<string, Commander>();

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
        name: commander.name,
        description: commander.description,
      }),
    );
    const commanderPrompt = commanderList.join('\n');
    const res = await llm.chat.completions.create({
      model: 'gpt-3.5-turbo',
      response_format: { type: 'json_object' },
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `Please help user to find the commander for the user input: ${content}.\nif user input is not related to any commander, response with json object: {commanderName: null}.\n\n##commanders\n ${commanderPrompt}.\n response with json object: {commanderName: string, score: number}, score is the confidence of the commander.`,
        },
      ],
    });
    const data = res.choices[0].message.content;
    if (!data) {
      return null;
    }
    const { commanderName, score } = JSON.parse(data);
    if (!commanderName || score < threshold) {
      return null;
    }
    return allCommanders.find((commander) => commander.name === commanderName);
  }

  async serve(
    options: { port?: number; fetch?: (host: Express) => void } = {},
  ) {
    const { port = 6700 } = options;

    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.json({ type: 'application/json' }));
    options.fetch?.(app);
    await this.loadCommands();
    const finalPort = await this.run(app, port);
    await this.served(finalPort);
  }

  private run(app: Express, port: number) {
    let finalPort = port;
    return new Promise<number>((resolve, reject) => {
      app.post('*', (req, res) => {
        const ircData = req.body;
        const interaction = new InteractionContext(ircData, {
          endpoint: `http://localhost:${finalPort}`,
        });
        this.onInteraction(interaction);
        res.end();
      });
      app.get(/\/dist\/.*/, (req, res) => {
        const filePath = path.join(process.cwd(), req.url);
        res.sendFile(filePath);
      });

      const startServer = (port: number) => {
        app
          .listen(port, () => {
            console.log('App is running on port', port);
            finalPort = port;
            resolve(port);
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .on('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
              console.log(
                `Port ${port} is already in use, trying port ${port + 1}`,
              );
              startServer(port + 1);
            } else {
              console.error(`Error starting server: ${err}`);
              reject(err);
            }
          });
      };

      startServer(port);
    });
  }

  private async onInteraction(interaction: InteractionContext) {
    switch (interaction.type) {
      case InteractionType.PING:
        this.options.onPing?.(interaction);
        break;
      case InteractionType.APPLICATION_COMMAND:
      case InteractionType.PAGE_FUNCTION_MESSAGE:
      case InteractionType.PAGE_RECYCLE:
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
    if (!interaction.commandName) return null;
    let commander: Commander | undefined;
    if (interaction.type === InteractionType.PAGE_FUNCTION_MESSAGE) {
      commander = this.pfCommanders.get(interaction.commandName);
    } else if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      commander = this.commanders.get(interaction.commandName);
    } else if (interaction.type === InteractionType.PAGE_RECYCLE) {
      commander = this.prCommanders.get(interaction.commandName);
    }
    return commander;
  }

  private async loadCommands() {
    const commandFilePath = path.join(process.cwd(), 'commands', 'index.ts');
    const module = await import(commandFilePath);
    Object.keys(module).forEach((key) => {
      const commander = module[key];
      this.attachCommander(commander);
    });
  }

  private attachCommander(commander: Commander) {
    switch (commander.type) {
      case CommandType.CHAT_INPUT:
        if (this.commanders.has(commander.name)) {
          throw new Error(`Duplicate commander name: ${commander.name}`);
        }
        this.commanders.set(commander.name, commander);
        console.log('Loaded slash command:', commander.name);
        break;
      case CommandType.PAGE_FUNCTION:
        if (this.pfCommanders.has(commander.name)) {
          throw new Error(`Duplicate commander name: ${commander.name}`);
        }
        this.pfCommanders.set(commander.name, commander);
        console.log('Loaded page function:', commander.name);
        break;
      case CommandType.PAGE_RECYCLE:
        if (this.prCommanders.has(commander.name)) {
          throw new Error(`Duplicate commander name: ${commander.name}`);
        }
        this.prCommanders.set(commander.name, commander);
        console.log('Loaded page recycle:', commander.name);
        break;
    }
  }

  private async served(port: number) {
    const host = new Host(port);
    const app = {
      id: '',
      name: this.options.name,
      description: this.options.description,
      icon: this.options.icon,
      interactionEndpoint: host.endpoint,
      commands: Array.from(this.commanders.values()).map((commander) => ({
        name: commander.name,
        description: commander.description,
        type: commander.type,
      })),
    };
    await host.devStart(app);

    process.on('exit', () => {
      host.devStop(app.id);
    });
  }
}
