#!/usr/bin/env node

import { build } from './build-fn.js';
import { Command } from 'commander';
import { checkBunInstallation } from './bun.js';
import { execSync } from 'node:child_process';

const program = new Command();

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
