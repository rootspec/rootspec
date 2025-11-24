#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { cypressCommand } from './commands/cypress.js';
import { validateCommand } from './commands/validate.js';
import { promptsCommand } from './commands/prompts.js';

const program = new Command();

program
  .name('rootspec')
  .description('RootSpec - Hierarchical Specification Framework')
  .version('4.1.0')
  .addHelpText('before', `
╭───────────────────────────────────────────────────────────╮
│  RootSpec - Hierarchical Specification Framework         │
│  Philosophy guides implementation, never vice versa.      │
╰───────────────────────────────────────────────────────────╯
`)
  .addHelpText('after', `
About:
  RootSpec is a 5-level hierarchical specification framework that ensures
  your product philosophy cascades down through architecture to implementation.

  Level 1 (WHY)         - Foundational Philosophy & Design Pillars
  Level 2 (WHAT)        - Stable Truths & Core Strategies
  Level 3 (HOW conceptual) - Interaction Architecture & Behavioral Loops
  Level 4 (HOW implemented) - Systems & Technical Architecture
  Level 5 (HOW MUCH)    - Implementation Details & Parameters

  Each level can only reference higher levels, ensuring philosophy always
  guides implementation decisions.

Quick Start:
  $ rootspec init              Initialize RootSpec in your project
  $ rootspec prompts           List all available AI workflow prompts
  $ rootspec prompts init      Get AI prompt to create your specification

Documentation:
  https://github.com/rootspec/rootspec
`);

program
  .command('init')
  .description('Initialize RootSpec in your project')
  .option('-p, --path <path>', 'Installation path (default: ./spec)')
  .option('-f, --full', 'Install everything (framework + Cypress templates)')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .addHelpText('after', `
Examples:
  $ rootspec init                    # Interactive setup with default path (./spec)
  $ rootspec init --path ./docs      # Install to custom directory
  $ rootspec init --full --yes       # Non-interactive, install everything
`)
  .action(initCommand);

program
  .command('cypress')
  .description('Add Cypress testing templates for YAML user story testing')
  .option('-e, --with-examples', 'Copy example user stories to spec directory')
  .addHelpText('after', `
Description:
  Installs Cypress configuration and test generators that automatically
  create E2E tests from your YAML user stories (Level 5).

  Includes:
  - cypress.config.ts with RootSpec tasks (loginAs, seedItem, resetDatabase)
  - Test generators (by_priority, by_journey, by_system)
  - DSL schema and step implementations

  Example user stories are available in:
    node_modules/rootspec/dist/templates/USER_STORIES/

Examples:
  $ rootspec cypress                 # Install Cypress config only
  $ rootspec cypress --with-examples # Install config + copy examples to spec/
`)
  .action(cypressCommand);

program
  .command('validate')
  .description('Validate your specification against framework rules')
  .addHelpText('after', `
Description:
  Checks your specification for common issues:
  - Reference hierarchy violations (no upward references)
  - Design Pillars quality (focus on feelings, not features)
  - Placeholder usage in Levels 1-4
  - YAML format compliance in Level 5

Examples:
  $ rootspec validate                # Validate current specification
`)
  .action(validateCommand);

program
  .command('prompts [name]')
  .description('List or view workflow prompts for AI assistants')
  .option('-o, --open', 'Open prompt in browser')
  .addHelpText('after', `
Description:
  Access AI assistant prompts for every stage of specification work.
  Many prompts auto-detect your project context and generate ready-to-use
  prompts with your actual paths and settings filled in.

Available Prompts:
  init          - Create specification for new project
  adopt         - Adopt framework for existing project
  add-feature   - Add new feature to specification
  review        - Review feature against specification
  validate      - Validate specification compliance
  migrate       - Migrate to newer framework version
  cypress-merge - Merge Cypress templates with existing config
  implement     - Implement features from YAML user stories
  generate-docs - Generate PRD, TDD, or other documentation
  tips          - Tips and best practices

Examples:
  $ rootspec prompts                 # List all available prompts
  $ rootspec prompts init            # Interactive prompt for new project
  $ rootspec prompts adopt           # Auto-detects codebase for adoption
  $ rootspec prompts review -o       # Open review prompt in browser
`)
  .action(promptsCommand);

program.parse();
