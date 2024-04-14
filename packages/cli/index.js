#!/usr/bin/env node

import { build } from './build-fn.js';
import { Command } from 'commander';
import { checkBunInstallation } from './bun.js';
import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const program = new Command();

program
  .command('new')
  .description('Create a new app')
  .argument('[appName]', 'app name')
  .action(async (appName) => {
    try {
      const templatePath = path.join(import.meta.url, '../template');
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
  .action(async (entry) => {
    await checkBunInstallation();
    await build();
    execSync(`bun run ${entry}`, {
      env: {
        ...process.env,
        NODE_ENV: 'development',
        DEV_ENDPOINT: 'http://localhost:6700',
      },
      stdio: 'inherit',
    });
  });

program.parse();
