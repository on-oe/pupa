#!/usr/bin/env node

import { Command } from 'commander';
import { checkBunInstallation } from './bun.js';
import { exec, execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { getApiKey } from './utils.js';
import { dev } from './dev.js';

const program = new Command();

program
  .command('create')
  .description('Create a new app')
  .argument('[appName]', 'app name')
  .action(async (appName) => {
    try {
      const templatePath = path.join(
        new URL(import.meta.url).pathname,
        '../template',
      );
      const targetPath = path.join(process.cwd(), appName);

      if (existsSync(targetPath)) {
        console.error('The app already exists!');
        return;
      }

      await fs.cp(templatePath, targetPath, { recursive: true });

      await fs.rename(
        path.join(targetPath, '_gitignore'),
        path.join(targetPath, '.gitignore'),
      );

      const packageJsonPath = path.join(targetPath, 'package.json');
      const packageJson = JSON.parse(
        await fs.readFile(packageJsonPath, 'utf-8'),
      );
      packageJson.name = appName;
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

      console.log('App created successfully!');
    } catch (error) {
      console.error('Failed to create app:', error);
    }
  });

program
  .command('dev')
  .description('start the dev app')
  .argument('[entry]', 'entry file', 'index.ts')
  .option('-p, --port <port>', 'port', '7100')
  .action(async (entry, options) => {
    await dev(options.port);
    const key = await getApiKey();
    const serve = exec(`tsx ${entry}`, {
      env: {
        ...process.env,
        NODE_ENV: 'development',
        PUPA_API_KEY: key,
      },
      stdio: 'inherit',
    });
    serve.stdout.on('data', (data) => {
      console.log(data);
    });
    serve.stderr.on('data', (data) => {
      console.error(data);
    });
  });

program
  .command('login')
  .description('login to the app')
  .argument('[token]', 'token')
  .action(async (token) => {
    if (!token) {
      console.error('Token is required!');
      return;
    }
    const configPath = path.join(process.env.HOME, '.pupa');
    let config = {};
    if (!existsSync(configPath)) {
      await fs.mkdir(configPath);
    } else {
      config = JSON.parse(
        await fs.readFile(path.join(configPath, 'config.json'), 'utf-8'),
      );
    }

    config.token = token;

    await fs.writeFile(
      path.join(configPath, 'config.json'),
      JSON.stringify(config, null, 2),
    );
  });

program.parse();
