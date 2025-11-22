import { confirm, input } from '@inquirer/prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { saveConfig } from '../utils/config.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Path to framework files (copied to dist/ during build)
const FRAMEWORK_ROOT = path.resolve(__dirname, '../..');
const DEFAULT_PATH = './spec';
export async function initCommand(options) {
    try {
        await runInit(options);
    }
    catch (error) {
        // Handle Ctrl+C gracefully
        if (error instanceof Error && error.name === 'ExitPromptError') {
            console.log(chalk.gray('\nCancelled.'));
            process.exit(0);
        }
        throw error;
    }
}
async function runInit(options) {
    const cwd = process.cwd();
    console.log(chalk.bold('\n🌳 RootSpec - Hierarchical Specification Framework\n'));
    // Determine installation path
    let installPath;
    if (options.path) {
        // Path provided via flag
        installPath = path.resolve(cwd, options.path);
    }
    else if (options.yes) {
        // Non-interactive mode: use default
        installPath = path.resolve(cwd, DEFAULT_PATH);
    }
    else {
        // Interactive: ask for path
        const inputPath = await input({
            message: 'Where should RootSpec be installed?',
            default: DEFAULT_PATH,
        });
        installPath = path.resolve(cwd, inputPath);
    }
    // Show where we're installing
    const relativePath = path.relative(cwd, installPath) || '.';
    console.log(chalk.gray(`Installing to: ${relativePath}/\n`));
    // Ensure directory exists
    await fs.ensureDir(installPath);
    // Check if already initialized
    const frameworkFile = path.join(installPath, '00.SPEC_FRAMEWORK.md');
    if (await fs.pathExists(frameworkFile)) {
        console.log(chalk.yellow('⚠️  00.SPEC_FRAMEWORK.md already exists in this location.'));
        const overwrite = options.yes || await confirm({
            message: 'Overwrite existing files?',
            default: false,
        });
        if (!overwrite) {
            console.log(chalk.gray('Aborted.'));
            return;
        }
    }
    // Step 1: Always copy framework definition
    console.log(chalk.blue('📘 Copying framework definition...'));
    await copyFrameworkFile(installPath);
    console.log(chalk.green('   ✓ 00.SPEC_FRAMEWORK.md'));
    // Step 1.5: Save config file
    await saveConfig(cwd, {
        specDirectory: relativePath,
        version: '4.0.0',
    });
    // Step 2: Ask about Cypress templates
    let includeCypress = options.full;
    if (!options.full && !options.yes) {
        includeCypress = await confirm({
            message: 'Include Cypress testing templates? (for automated user story testing)',
            default: false,
        });
    }
    let cypressSkipped = false;
    if (includeCypress) {
        console.log(chalk.blue('🧪 Copying Cypress templates...'));
        cypressSkipped = await copyCypressTemplates(cwd);
        // Update config with Cypress integration flag
        await saveConfig(cwd, {
            specDirectory: relativePath,
            version: '4.0.0',
            cypressIntegration: true,
        });
    }
    // Success message and next steps
    console.log(chalk.bold.green('\n✅ RootSpec initialized successfully!\n'));
    console.log(chalk.bold('Next steps:'));
    console.log(chalk.gray('1.') + ` Read ${relativePath}/00.SPEC_FRAMEWORK.md to understand the framework`);
    console.log(chalk.gray('2.') + ' Create your specification with AI assistance:');
    console.log(chalk.cyan('   rootspec prompts init') + chalk.gray('   (for new projects)'));
    console.log(chalk.cyan('   rootspec prompts adopt') + chalk.gray('  (for existing projects)'));
    console.log(chalk.gray('3.') + ' See all workflow guides: ' + chalk.cyan('rootspec prompts'));
    if (cypressSkipped) {
        console.log(chalk.gray('4.') + ' Run ' + chalk.cyan('rootspec prompts cypress-merge') + ' to update your existing Cypress config');
    }
    console.log();
}
async function copyFrameworkFile(destDir) {
    const src = path.join(FRAMEWORK_ROOT, '00.SPEC_FRAMEWORK.md');
    const dest = path.join(destDir, '00.SPEC_FRAMEWORK.md');
    await fs.copy(src, dest);
}
/**
 * Copy Cypress templates to project root.
 * Skips files that already exist.
 * @returns true if any files were skipped
 */
async function copyCypressTemplates(projectRoot) {
    const templatesSrc = path.join(FRAMEWORK_ROOT, 'templates');
    let skipped = false;
    // Copy cypress.config.ts
    const configSrc = path.join(templatesSrc, 'cypress.config.ts');
    const configDest = path.join(projectRoot, 'cypress.config.ts');
    if (await fs.pathExists(configDest)) {
        console.log(chalk.yellow('   ⚠️  cypress.config.ts already exists - skipped'));
        skipped = true;
    }
    else {
        await fs.copy(configSrc, configDest);
        console.log(chalk.green('   ✓ cypress.config.ts'));
    }
    // Copy cypress/ directory
    const cypressSrc = path.join(templatesSrc, 'cypress');
    const cypressDest = path.join(projectRoot, 'cypress');
    if (await fs.pathExists(cypressDest)) {
        console.log(chalk.yellow('   ⚠️  cypress/ already exists - skipped'));
        skipped = true;
    }
    else {
        await fs.copy(cypressSrc, cypressDest);
        console.log(chalk.green('   ✓ cypress/'));
    }
    // Copy example user stories to templates/ for reference
    const userStoriesSrc = path.join(templatesSrc, 'USER_STORIES');
    const userStoriesDest = path.join(projectRoot, 'templates', 'USER_STORIES');
    if (!await fs.pathExists(userStoriesDest)) {
        await fs.copy(userStoriesSrc, userStoriesDest);
        console.log(chalk.green('   ✓ templates/USER_STORIES/ (examples)'));
    }
    return skipped;
}
//# sourceMappingURL=init.js.map