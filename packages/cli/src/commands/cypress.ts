import { confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSpecDirectory } from '../utils/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to framework files (copied to dist/ during build)
const FRAMEWORK_ROOT = path.resolve(__dirname, '../..');

export async function cypressCommand(options: { withExamples?: boolean } = {}): Promise<void> {
  const cwd = process.cwd();

  console.log(chalk.bold('\n🧪 RootSpec - Cypress Testing Setup\n'));

  // Check if templates already exist
  const cypressDir = path.join(cwd, 'cypress');
  const configFile = path.join(cwd, 'cypress.config.ts');

  if (await fs.pathExists(cypressDir) || await fs.pathExists(configFile)) {
    console.log(chalk.yellow('⚠️  Cypress files already exist in this directory.'));
    const overwrite = await confirm({
      message: 'Overwrite existing Cypress configuration?',
      default: false,
    });
    if (!overwrite) {
      console.log(chalk.gray('Aborted.'));
      return;
    }
  }

  // Copy Cypress templates
  console.log(chalk.blue('📁 Copying Cypress configuration...'));

  const templatesSrc = path.join(FRAMEWORK_ROOT, 'templates');

  // Copy cypress.config.ts
  await fs.copy(
    path.join(templatesSrc, 'cypress.config.ts'),
    path.join(cwd, 'cypress.config.ts')
  );
  console.log(chalk.green('   ✓ cypress.config.ts'));

  // Copy cypress/ directory
  await fs.copy(
    path.join(templatesSrc, 'cypress'),
    path.join(cwd, 'cypress')
  );
  console.log(chalk.green('   ✓ cypress/'));

  // Get spec directory from config
  const specDir = await getSpecDirectory(cwd) || './spec';

  // Copy example user stories if --with-examples flag provided
  const userStoriesDir = path.join(cwd, specDir, '05.IMPLEMENTATION', 'USER_STORIES');
  if (options.withExamples) {
    if (await fs.pathExists(userStoriesDir)) {
      console.log(chalk.yellow('⚠️  User stories directory already exists, skipping examples'));
    } else {
      console.log(chalk.blue('📄 Copying example user stories...'));
      await fs.copy(
        path.join(templatesSrc, 'USER_STORIES'),
        userStoriesDir
      );
      console.log(chalk.green(`   ✓ ${specDir}/05.IMPLEMENTATION/USER_STORIES/ (examples)`));
    }
  }

  // Success message
  console.log(chalk.bold.green('\n✅ Cypress templates installed!\n'));

  // Show example location if not copied
  if (!options.withExamples) {
    console.log(chalk.bold('Example user stories available at:'));
    console.log(chalk.gray('  node_modules/rootspec/dist/templates/USER_STORIES/\n'));
    console.log(chalk.bold('To copy examples to your spec directory:'));
    console.log(chalk.cyan(`  cp -r node_modules/rootspec/dist/templates/USER_STORIES/* ${specDir}/05.IMPLEMENTATION/USER_STORIES/`));
    console.log(chalk.gray('  or run: ') + chalk.cyan('rootspec cypress --with-examples\n'));
  }

  console.log(chalk.bold('Next steps:'));
  console.log(chalk.gray('1.') + ' Install dependencies:');
  console.log(chalk.cyan('   npm install --save-dev cypress cypress-vite js-yaml zod typescript'));
  console.log(chalk.gray('2.') + ' Implement Cypress tasks in cypress.config.ts:');
  console.log(chalk.gray('   - loginAs: Authentication logic'));
  console.log(chalk.gray('   - seedItem: Test data seeding'));
  console.log(chalk.gray('   - resetDatabase: Database cleanup'));
  console.log(chalk.gray('3.') + ` Create user stories in ${specDir}/05.IMPLEMENTATION/USER_STORIES/`);
  console.log(chalk.gray('4.') + ' Run tests: ' + chalk.cyan('npx cypress open'));

  console.log(chalk.gray('\nSee docs/CYPRESS_SETUP.md for detailed setup instructions.\n'));
}
