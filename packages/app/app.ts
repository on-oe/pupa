import fs from 'node:fs/promises';
import path from 'node:path';
import {
  CommandType,
  type Interaction,
  type InteractionResponse,
  InteractionType,
} from '@pupa/universal/types';
import OpenAI from 'openai';
import { InteractionContext } from './interaction';
import type { Commander } from './command';
import { host } from './host';
import express, { type Express } from 'express';
import cors from 'cors';

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

  async serve(options: { port?: number; fetch: (host: Express) => void }) {
    const { port = 6700 } = options;
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.json({ type: 'application/json' }));
    options.fetch(app);
    await this.loadCommands();
    this.run(app, port);
    console.log('App is running on port', port);
    await this.served();
  }

  private run(app: Express, port: number) {
    app.post('*', (req, res) => {
      const ircData = req.body;
      // const send = (msg: InteractionResponse) => {
      //   res.json(msg);
      // };
      const interaction = new InteractionContext(ircData);
      this.onInteraction(interaction);
      res.end();
    });
    app.get(/\/dist\/.*/, (req, res) => {
      const filePath = path.join(process.cwd(), req.url);
      res.sendFile(filePath);
    });

    app.listen(port);
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
    if (!interaction.commandName) return null;
    let commander: Commander | undefined;
    if (interaction.type === InteractionType.PAGE_FUNCTION_MESSAGE) {
      commander = this.pfCommanders.get(interaction.commandName);
    } else if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      commander = this.commanders.get(interaction.commandName);
    }
    return commander;
  }

  private async loadCommands() {
    const dirPath = path.join(process.cwd(), 'commands');
    const files = await fs.readdir(dirPath);
    const cmdFiles = files.filter(
      (file) =>
        file.endsWith('.ts') &&
        !file.endsWith('.d.ts') &&
        !file.endsWith('.test.ts'),
    );
    const tasks = cmdFiles.map(async (file) => {
      const { default: commander } = (await import(`${dirPath}/${file}`)) as {
        default: Commander;
      };
      this.attachCommander(commander);
    });
    return Promise.all(tasks);
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
    }
  }

  private async served() {
    const app = {
      id: '',
      name: this.options.name,
      description: this.options.description,
      icon: this.options.icon,
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
