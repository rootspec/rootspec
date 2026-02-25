#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init.js';

const program = new Command();

program
  .name('rootspec-cypress')
  .description('RootSpec Cypress test harness installer')
  .version('4.6.2');

program
  .command('init')
  .description('Install Cypress test harness templates into current project')
  .option('--with-examples', 'Copy example user stories to spec directory')
  .action(async (options) => {
    await initCommand({ withExamples: options.withExamples });
  });

program.parse();
