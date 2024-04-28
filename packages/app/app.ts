import path from 'node:path';
import {
  InteractionType,
  type Application,
  type PageTweak,
} from '@pupa/universal/types';
import { InteractionContext } from './interaction';
import type { Commander } from './command';
import { Host, host } from './host';
import express, { type Express } from 'express';
import cors from 'cors';
import { Volume } from 'memfs';
import fs from 'node:fs';
import { createServer } from 'vite';
import reactPlugin from '@vitejs/plugin-react';
import type { PageTweakDef } from './tweak';
import { findAvailablePort } from './utils/port';
import { rollup } from 'rollup';
import replacePlugin from '@rollup/plugin-replace';
import aliasPlugin from '@rollup/plugin-alias';

const vol = new Volume();
vol.mkdirSync('/tweak');

interface CreateAppOptions {
  name: string;
  description: string;
  icon: string;
  matches?: string[];
  commanders?: Commander[];
  onMessage?: (interaction: InteractionContext) => void;
}

export async function createApp(options: CreateAppOptions) {
  const app = new App(options);
  return app;
}

export class App {
  private commanders: Map<string, Commander> = new Map();
  private tweaks: Map<string, PageTweak> = new Map();
  private port: number = 6700;
  private server = express();

  constructor(private readonly options: CreateAppOptions) {
    this.initServer();
  }

  async serve(
    options: { port?: number; fetch?: (host: Express) => void } = {},
  ) {
    const { port } = options;
    if (port) {
      this.port = port;
    }

    this.port = await findAvailablePort(this.port);

    options.fetch?.(this.server);

    await this.run(this.server);

    const app = await host.createApp({
      name: this.options.name,
      description: this.options.description,
      icon: this.options.icon,
      tweaks: [],
      commands: [],
      interactionEndpoint: `http://localhost:${this.port}`,
    });

    await this.resolveCommanders();
    await this.resolveTweaks(app.id);

    await this.served(app);
  }

  private initServer() {
    const { server } = this;
    server.use(cors());
    server.use(express.json());
    server.use(express.json({ type: 'application/json' }));
  }

  private async resolveTweaks(applicationId: string) {
    const { port: appPort } = this;
    const tweakDefs = new Map<string, PageTweakDef>();
    const tweakIndex = path.join(process.cwd(), 'tweaks', 'index.ts');
    if (fs.existsSync(tweakIndex)) {
      const module = await import(tweakIndex);
      Object.keys(module).forEach((key) => {
        const config = module[key];
        if (!config.input) {
          throw new Error(`Tweak ${key} must have input`);
        }
        tweakDefs.set(key, config);
      });
    }
    for (const key of tweakDefs.keys()) {
      const def = tweakDefs.get(key)!;
      const destFilePath = `/tweak/${def.name}.js`;
      const filePath = path.join(process.cwd(), 'tweaks', def.input);
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      if (fs.lstatSync(filePath).isDirectory()) {
        const port = await findAvailablePort(7100);
        await createServer({
          configFile: false,
          root: filePath,
          define: {
            'import.meta.env.VITE_APP_HOST': JSON.stringify(
              `http://localhost:${appPort}`,
            ),
          },
          plugins: [
            reactPlugin(),
            replacePlugin({
              __PUPA_APPLICATION_ID__: applicationId,
              __PUPA_TWEAK_NAME__: def.name,
              include: /tweak\/index.js/,
              preventAssignment: true,
            }),
          ],
          server: {
            port,
            hmr: {
              protocol: 'ws',
            },
          },
        })
          .then((server) => {
            return server.listen();
          })
          .then((server) => {
            server.printUrls();
            const output = `await import('http://localhost:${port}/@vite/client');\nawait import('http://localhost:${port}/@react-refresh').then(({default: RefreshRuntime}) => {RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$ = () => {};window.$RefreshSig$ = () => (type) => type;window.__vite_plugin_react_preamble_installed__ = true;}); await import('http://localhost:${port}/index.tsx');
            `;
            vol.writeFileSync(destFilePath, output);
          })
          .catch((err) => {
            console.error(err);
            process.exit(1);
          });
      } else if (filePath.match(/\.ts|js?$/)) {
        const bundle = await rollup({
          input: filePath,
          external: (id) => id.startsWith('https://'),
          plugins: [
            replacePlugin({
              __PUPA_APPLICATION_ID__: applicationId,
              __PUPA_TWEAK_NAME__: def.name,
              preventAssignment: true,
            }),
            aliasPlugin({
              entries: [
                {
                  find: '@pupa/tweak',
                  replacement: '/Users/boomyao/po/pupa/packages/tweak/index.js',
                },
              ],
            }),
          ],
        });
        const { output } = await bundle.generate({ format: 'esm' });
        vol.writeFileSync(destFilePath, output[0].code);
      } else {
      }
      this.tweaks.set(def.name, {
        name: def.name,
        runAt: def.runAt,
        once: def.once,
      });
    }
  }

  private async resolveCommanders() {
    const commandIndex = path.join(process.cwd(), 'commands', 'index.ts');
    const module = await import(commandIndex);
    Object.keys(module).forEach((key) => {
      const commander = module[key];
      if (this.commanders.has(commander.name)) {
        throw new Error(`Duplicate commander name: ${commander.name}`);
      }
      this.commanders.set(commander.name, commander);
    });
  }

  private run(app: Express) {
    return new Promise<number>((resolve, reject) => {
      app.post('*', (req, res) => {
        const ircData = req.body;
        const interaction = new InteractionContext(ircData);
        this.onInteraction(interaction);
        res.end();
      });
      app.get(/\/tweak\/.*/, (req, res) => {
        try {
          const stream = vol.createReadStream(req.path).on('error', (error) => {
            throw error;
          });
          stream.pipe(res);
        } catch (err) {
          res.status(404).end();
        }
      });

      app
        .listen(this.port, () => {
          console.log(`Server is running on http://localhost:${this.port}`);
          resolve(this.port);
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }

  private async onInteraction(interaction: InteractionContext) {
    switch (interaction.type) {
      case InteractionType.APPLICATION_COMMAND:
        {
          if (interaction.commandName) {
            const commander = this.commanders.get(interaction.commandName);
            commander?.execute(interaction);
          }
        }
        break;
      default:
        this.options.onMessage?.(interaction);
    }
  }

  private async served(app: Application) {
    const { port } = this;
    const { commanders, tweaks } = this;
    const host = new Host();
    Object.assign(app, {
      interactionEndpoint: `http://localhost:${port}`,
      commands: Array.from(commanders.values()).map((commander) => ({
        name: commander.name,
        description: commander.description,
        type: commander.type,
        options: commander.options,
      })),
      tweaks: Array.from(tweaks.values()).map((tweak) => ({
        name: tweak.name,
        runAt: tweak.runAt,
        once: tweak.once,
      })),
    });
    await host.devStart(app);

    process.on('exit', () => {
      host.devStop(app.id);
    });

    console.log('synced app info to remote server.');
  }
}
