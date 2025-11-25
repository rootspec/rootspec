import { input } from '@inquirer/prompts';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { exec } from 'child_process';
import { getSpecDirectory, loadConfig } from '../utils/config.js';
import { replaceTemplates } from '../utils/template.js';

// Get CLI version from package.json
const require = createRequire(import.meta.url);
const CLI_VERSION = require('../../package.json').version;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to framework files (copied to dist/ during build)
const FRAMEWORK_ROOT = path.resolve(__dirname, '..');
const PROMPTS_DIR = path.join(FRAMEWORK_ROOT, 'prompts');

const GITHUB_PROMPTS_URL = 'https://github.com/rootspec/rootspec/tree/main/prompts';

interface PromptsOptions {
  open?: boolean;
}

interface PromptInfo {
  file: string;
  description: string;
  generated?: boolean;  // Auto-generates prompt based on project context
}

// Map of prompt names to files and descriptions
const PROMPTS: Record<string, PromptInfo> = {
  'init': {
    file: 'initialize-spec.md',
    description: 'Create specification for a new project (level-by-level)',
    generated: true,  // Prompts for product description
  },
  'adopt': {
    file: 'adopt-framework-existing.md',
    description: 'Adopt framework for existing project (reverse-engineer from code)',
    generated: true,  // Auto-generates prompt based on detected codebase
  },
  'add-feature': {
    file: 'add-feature.md',
    description: 'Add a new feature to your specification',
    generated: true,  // Auto-generates prompt with current spec context
  },
  'review': {
    file: 'review-feature.md',
    description: 'Review a feature against your specification',
    generated: true,  // Auto-generates prompt with current spec context
  },
  'validate': {
    file: 'validate-spec.md',
    description: 'Validate specification against framework rules',
    generated: true,  // Auto-generates validation report based on detected issues
  },
  'migrate': {
    file: 'migrate-spec.md',
    description: 'Migrate specification to a newer framework version',
    generated: true,  // Prompts for old version
  },
  'generate-docs': {
    file: 'generate-docs.md',
    description: 'Generate PRD, TDD, or backlog from specification',
    generated: true,  // Prompts for document type selection
  },
  'implement': {
    file: 'implement-from-tests.md',
    description: 'Implement features using test-driven development',
  },
  'cypress-merge': {
    file: 'cypress-merge.md',
    description: 'Merge RootSpec Cypress templates with existing config',
    generated: true,  // Auto-generates prompt based on detected files
  },
  'tips': {
    file: 'tips-and-best-practices.md',
    description: 'Tips and best practices for working with AI',
  },
};

export async function promptsCommand(name?: string, options?: PromptsOptions): Promise<void> {
  try {
    await runPromptsCommand(name, options);
  } catch (error) {
    // Handle Ctrl+C gracefully
    if (error instanceof Error && error.name === 'ExitPromptError') {
      console.log(chalk.gray('\nCancelled.'));
      process.exit(0);
    }
    throw error;
  }
}

async function runPromptsCommand(name?: string, options?: PromptsOptions): Promise<void> {
  // If no name provided, list all prompts
  if (!name) {
    console.log(chalk.bold('\n📚 Available RootSpec Prompts\n'));

    for (const [key, info] of Object.entries(PROMPTS)) {
      console.log(chalk.cyan(`  ${key.padEnd(15)}`), chalk.gray(info.description));
    }

    console.log(chalk.gray('\nUsage:'));
    console.log(chalk.gray('  rootspec prompts <name>      Print prompt to stdout'));
    console.log(chalk.gray('  rootspec prompts <name> -o   Open in browser'));
    console.log(chalk.gray('\nExample:'));
    console.log(chalk.cyan('  rootspec prompts add-feature'));
    console.log();
    return;
  }

  // Look up the prompt
  const prompt = PROMPTS[name];
  if (!prompt) {
    console.log(chalk.red(`\n❌ Unknown prompt: ${name}`));
    console.log(chalk.gray(`\nAvailable prompts: ${Object.keys(PROMPTS).join(', ')}`));
    console.log();
    return;
  }

  // Open in browser
  if (options?.open) {
    const url = `${GITHUB_PROMPTS_URL}/${prompt.file}`;
    console.log(chalk.gray(`Opening ${url}...`));

    // Cross-platform open command
    const cmd = process.platform === 'darwin' ? 'open' :
                process.platform === 'win32' ? 'start' : 'xdg-open';
    exec(`${cmd} ${url}`);
    return;
  }

  // Handle generated prompts (auto-detect project context)
  if (prompt.generated) {
    if (name === 'init') {
      await runInitPrompt();
      return;
    } else if (name === 'cypress-merge') {
      await runCypressMergePrompt();
      return;
    } else if (name === 'adopt') {
      await runAdoptPrompt();
      return;
    } else if (name === 'validate') {
      await runValidatePrompt();
      return;
    } else if (name === 'add-feature') {
      await runAddFeaturePrompt();
      return;
    } else if (name === 'review') {
      await runReviewPrompt();
      return;
    } else if (name === 'migrate') {
      await runMigratePrompt();
      return;
    } else if (name === 'generate-docs') {
      await runGenerateDocsPrompt();
      return;
    }
  }

  // Print static prompt to stdout
  const promptPath = path.join(PROMPTS_DIR, prompt.file);
  try {
    const content = await fs.readFile(promptPath, 'utf-8');
    console.log(content);
  } catch (error) {
    console.log(chalk.red(`\n❌ Could not read prompt file: ${prompt.file}`));
    console.log(chalk.gray(`Try: rootspec prompts ${name} -o  (open in browser)`));
    console.log();
  }
}

/**
 * Interactive prompt for cypress-merge
 * Asks for file paths, reads contents, and outputs filled prompt
 */
// Files that might need merging, with their typical locations
const CYPRESS_FILES = [
  { name: 'cypress.config', paths: ['./cypress.config.ts', './cypress.config.js'] },
  { name: 'e2e support', paths: ['./cypress/support/e2e.ts', './cypress/support/e2e.js'] },
  { name: 'steps', paths: ['./cypress/support/steps.ts', './cypress/support/steps.js'] },
  { name: 'schema', paths: ['./cypress/support/schema.ts', './cypress/support/schema.js'] },
  { name: 'by_priority tests', paths: ['./cypress/e2e/by_priority.cy.ts', './cypress/e2e/by_priority.cy.js'] },
  { name: 'by_journey tests', paths: ['./cypress/e2e/by_journey.cy.ts', './cypress/e2e/by_journey.cy.js'] },
  { name: 'by_system tests', paths: ['./cypress/e2e/by_system.cy.ts', './cypress/e2e/by_system.cy.js'] },
];

async function runCypressMergePrompt(): Promise<void> {
  const cwd = process.cwd();

  console.log(chalk.bold('\n🧪 Cypress Merge Prompt\n'));
  console.log(chalk.gray('Detecting existing Cypress files...\n'));

  // Auto-detect existing files
  const filesToRead: string[] = [];

  for (const file of CYPRESS_FILES) {
    for (const p of file.paths) {
      if (await fs.pathExists(path.join(cwd, p))) {
        filesToRead.push(p);
        console.log(chalk.green(`  ✓ Found ${p}`));
        break;
      }
    }
  }

  if (filesToRead.length === 0) {
    console.log(chalk.yellow('  No existing Cypress files detected.'));
  }

  console.log();

  // Build the filled prompt
  console.log(chalk.green('\n✅ Prompt ready! Copy and paste into your AI assistant:\n'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log();

  // Read and fill template
  const templatePath = path.join(PROMPTS_DIR, 'cypress-merge.md');
  const template = await fs.readFile(templatePath, 'utf-8');

  const filledPrompt = replaceTemplates(template, {
    CYPRESS_FILES: filesToRead,
    NO_CYPRESS_FILES: filesToRead.length === 0,
  });

  console.log(filledPrompt);

  console.log();
  console.log(chalk.gray('─'.repeat(60)));
  console.log();
}

/**
 * Interactive prompt for adopt
 * Scans codebase and generates contextualized adoption prompt
 */
async function runAdoptPrompt(): Promise<void> {
  const cwd = process.cwd();

  console.log(chalk.bold('\n🌳 Adopt RootSpec Framework\n'));
  console.log(chalk.gray('Analyzing your existing codebase...\n'));

  // Common source directories to check
  const commonSrcDirs = ['src', 'lib', 'app', 'server', 'client', 'components', 'pages'];
  const foundDirs: string[] = [];

  for (const dir of commonSrcDirs) {
    const fullPath = path.join(cwd, dir);
    if (await fs.pathExists(fullPath)) {
      const stats = await fs.stat(fullPath);
      if (stats.isDirectory()) {
        foundDirs.push(dir);
        console.log(chalk.green(`  ✓ Found ${dir}/`));
      }
    }
  }

  // Detect package.json and framework
  let framework: string | null = null;
  const packageJsonPath = path.join(cwd, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    try {
      const pkg = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps['next']) framework = 'Next.js';
      else if (deps['nuxt']) framework = 'Nuxt';
      else if (deps['react']) framework = 'React';
      else if (deps['vue']) framework = 'Vue';
      else if (deps['@angular/core']) framework = 'Angular';
      else if (deps['express']) framework = 'Express';
      else if (deps['fastify']) framework = 'Fastify';

      if (framework) {
        console.log(chalk.green(`  ✓ Detected framework: ${framework}`));
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  // Detect main config files
  const configFiles = [
    'tsconfig.json',
    'package.json',
    'vite.config.ts', 'vite.config.js',
    'next.config.js', 'next.config.mjs',
    'tailwind.config.js', 'tailwind.config.ts',
  ];
  const foundConfigs: string[] = [];
  for (const file of configFiles) {
    if (await fs.pathExists(path.join(cwd, file))) {
      foundConfigs.push(file);
    }
  }
  if (foundConfigs.length > 0) {
    console.log(chalk.green(`  ✓ Found config files: ${foundConfigs.join(', ')}`));
  }

  if (foundDirs.length === 0) {
    console.log(chalk.yellow('  No common source directories detected.'));
  }

  console.log();

  // Build the filled prompt
  console.log(chalk.green('\n✅ Prompt ready! Copy and paste into your AI assistant:\n'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log();

  const approach = await getAdoptionApproach();
  const specDir = await getSpecDirectory(cwd) || './spec';

  // Read and fill template
  const templatePath = path.join(PROMPTS_DIR, 'adopt-framework-existing.md');
  const template = await fs.readFile(templatePath, 'utf-8');

  const filledPrompt = replaceTemplates(template, {
    FRAMEWORK: framework || '',
    NO_FRAMEWORK: !framework,
    SOURCE_DIRS: foundDirs.map(d => `${d}/`),
    NO_SOURCE_DIRS: foundDirs.length === 0,
    CONFIG_FILES: foundConfigs,
    NO_CONFIG_FILES: foundConfigs.length === 0,
    SPEC_DIR: specDir,
    ADOPTION_APPROACH: approach,
  });

  console.log(filledPrompt);

  console.log();
  console.log(chalk.gray('─'.repeat(60)));
  console.log();
}

async function getAdoptionApproach(): Promise<string> {
  // Check if spec files already exist
  const cwd = process.cwd();

  // Try config first
  const configDir = await getSpecDirectory(cwd);
  if (configDir) {
    const fullPath = path.join(cwd, configDir, '01.FOUNDATIONAL_PHILOSOPHY.md');
    if (await fs.pathExists(fullPath)) {
      return 'Specification-First (update existing spec to match ideal state, then plan migration)';
    }
  }

  // Fall back to scanning
  for (const specDir of ['./spec', './docs/spec', '.']) {
    const fullPath = path.join(cwd, specDir, '01.FOUNDATIONAL_PHILOSOPHY.md');
    if (await fs.pathExists(fullPath)) {
      return 'Specification-First (update existing spec to match ideal state, then plan migration)';
    }
  }

  return 'Reverse-Engineering (extract specification from current implementation)';
}

/**
 * Interactive prompt for validate
 * Scans spec files and generates validation report
 */
async function runValidatePrompt(): Promise<void> {
  const cwd = process.cwd();

  console.log(chalk.bold('\n✅ Validate RootSpec\n'));
  console.log(chalk.gray('Scanning for specification files...\n'));

  // Spec file structure
  const specFiles = [
    { level: '00', file: '00.SPEC_FRAMEWORK.md', required: true },
    { level: '01', file: '01.FOUNDATIONAL_PHILOSOPHY.md', required: true },
    { level: '02', file: '02.STABLE_TRUTHS.md', required: true },
    { level: '03', file: '03.INTERACTION_ARCHITECTURE.md', required: true },
    { level: '04', file: '04.SYSTEMS/SYSTEMS_OVERVIEW.md', required: true },
    { level: '05', file: '05.IMPLEMENTATION/', required: false },
  ];

  // Try config first
  let specDir = await getSpecDirectory(cwd);
  let foundAny = false;

  if (specDir) {
    foundAny = true;
    console.log(chalk.green(`  ✓ Found specification in ${specDir}/`));
  } else {
    // Fall back to scanning
    const specDirs = ['./spec', './docs/spec', '.'];
    specDir = '.';

    for (const dir of specDirs) {
      const testPath = path.join(cwd, dir, '00.SPEC_FRAMEWORK.md');
      if (await fs.pathExists(testPath)) {
        specDir = dir;
        foundAny = true;
        console.log(chalk.green(`  ✓ Found specification in ${dir}/`));
        break;
      }
    }
  }

  if (!foundAny) {
    console.log(chalk.yellow('  ⚠️  No specification found. Run `rootspec init` first.'));
    console.log();
    return;
  }

  // Check each spec file
  const foundFiles: string[] = [];
  const missingFiles: string[] = [];

  for (const spec of specFiles) {
    const fullPath = path.join(cwd, specDir, spec.file);
    if (await fs.pathExists(fullPath)) {
      foundFiles.push(spec.file);
      console.log(chalk.green(`  ✓ ${spec.file}`));
    } else if (spec.required) {
      missingFiles.push(spec.file);
      console.log(chalk.red(`  ✗ ${spec.file} (missing)`));
    } else {
      console.log(chalk.gray(`  - ${spec.file} (optional)`));
    }
  }

  console.log();

  // Build the filled prompt
  console.log(chalk.green('\n✅ Prompt ready! Copy and paste into your AI assistant:\n'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log();

  // Read and fill template
  const templatePath = path.join(PROMPTS_DIR, 'validate-spec.md');
  const template = await fs.readFile(templatePath, 'utf-8');

  const filledPrompt = replaceTemplates(template, {
    SPEC_DIR: specDir,
    FOUND_FILES: foundFiles,
    MISSING_FILES: missingFiles,
  });

  console.log(filledPrompt);

  console.log();
  console.log(chalk.gray('─'.repeat(60)));
  console.log();
}

/**
 * Interactive prompt for add-feature
 * Reads spec files and generates contextualized prompt
 */
async function runAddFeaturePrompt(): Promise<void> {
  const cwd = process.cwd();

  console.log(chalk.bold('\n✨ Add Feature to Specification\n'));
  console.log(chalk.gray('Reading your specification files...\n'));

  // Find spec directory
  const specInfo = await findSpecDirectory();
  if (!specInfo.found) {
    console.log(chalk.yellow('  ⚠️  No specification found. Run `rootspec init` first.'));
    console.log();
    return;
  }

  console.log(chalk.green(`  ✓ Found specification in ${specInfo.dir}/`));

  // Extract design pillars from Level 1
  const designPillars = await extractDesignPillars(specInfo.dir);
  if (designPillars.length > 0) {
    console.log(chalk.green(`  ✓ Found ${designPillars.length} design pillars`));
  }

  // List systems from Level 4
  const systems = await listSystems(specInfo.dir);
  if (systems.length > 0) {
    console.log(chalk.green(`  ✓ Found ${systems.length} systems`));
  }

  console.log();

  // Build the filled prompt
  console.log(chalk.green('\n✅ Prompt ready! Copy and paste into your AI assistant:\n'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log();

  // Read and fill template
  const templatePath = path.join(PROMPTS_DIR, 'add-feature.md');
  const template = await fs.readFile(templatePath, 'utf-8');

  const filledPrompt = replaceTemplates(template, {
    SPEC_DIR: specInfo.dir,
    DESIGN_PILLARS: designPillars,
    NO_DESIGN_PILLARS: designPillars.length === 0,
    SYSTEMS: systems,
    NO_SYSTEMS: systems.length === 0,
  });

  console.log(filledPrompt);

  console.log();
  console.log(chalk.gray('─'.repeat(60)));
  console.log();
}

/**
 * Interactive prompt for review
 * Reads spec files and generates contextualized prompt
 */
async function runReviewPrompt(): Promise<void> {
  const cwd = process.cwd();

  console.log(chalk.bold('\n🔍 Review Feature\n'));
  console.log(chalk.gray('Reading your specification files...\n'));

  // Find spec directory
  const specInfo = await findSpecDirectory();
  if (!specInfo.found) {
    console.log(chalk.yellow('  ⚠️  No specification found. Run `rootspec init` first.'));
    console.log();
    return;
  }

  console.log(chalk.green(`  ✓ Found specification in ${specInfo.dir}/`));

  // Extract design pillars from Level 1
  const designPillars = await extractDesignPillars(specInfo.dir);
  if (designPillars.length > 0) {
    console.log(chalk.green(`  ✓ Found ${designPillars.length} design pillars`));
  }

  // Extract stable truths from Level 2
  const stableTruths = await extractStableTruths(specInfo.dir);
  if (stableTruths.length > 0) {
    console.log(chalk.green(`  ✓ Found ${stableTruths.length} stable truths`));
  }

  console.log();

  // Build the filled prompt
  console.log(chalk.green('\n✅ Prompt ready! Copy and paste into your AI assistant:\n'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log();

  // Read and fill template
  const templatePath = path.join(PROMPTS_DIR, 'review-feature.md');
  const template = await fs.readFile(templatePath, 'utf-8');

  const filledPrompt = replaceTemplates(template, {
    SPEC_DIR: specInfo.dir,
    DESIGN_PILLARS: designPillars,
    NO_DESIGN_PILLARS: designPillars.length === 0,
    STABLE_TRUTHS: stableTruths,
    NO_STABLE_TRUTHS: stableTruths.length === 0,
  });

  console.log(filledPrompt);

  console.log();
  console.log(chalk.gray('─'.repeat(60)));
  console.log();
}

// Helper functions

interface SpecInfo {
  found: boolean;
  dir: string;
}

async function findSpecDirectory(): Promise<SpecInfo> {
  const cwd = process.cwd();

  // Try getting from config first
  const configDir = await getSpecDirectory(cwd);
  if (configDir) {
    return { found: true, dir: configDir };
  }

  // Fall back to scanning (for projects without config)
  const specDirs = ['./spec', './docs/spec', '.'];
  for (const dir of specDirs) {
    const testPath = path.join(cwd, dir, '00.SPEC_FRAMEWORK.md');
    if (await fs.pathExists(testPath)) {
      return { found: true, dir };
    }
  }

  return { found: false, dir: '.' };
}

async function extractDesignPillars(specDir: string): Promise<string[]> {
  const cwd = process.cwd();
  const l1Path = path.join(cwd, specDir, '01.FOUNDATIONAL_PHILOSOPHY.md');

  if (!await fs.pathExists(l1Path)) {
    return [];
  }

  try {
    const content = await fs.readFile(l1Path, 'utf-8');
    const pillars: string[] = [];

    // Look for Design Pillars section and extract pillar names
    const pillarSection = content.match(/##\s+Design Pillars[\s\S]*?(?=\n##\s|\n#\s|$)/i);
    if (pillarSection) {
      // Match markdown headers (### Pillar Name) within the section
      const pillarMatches = pillarSection[0].matchAll(/###\s+(.+?)(?:\n|$)/g);
      for (const match of pillarMatches) {
        pillars.push(match[1].trim());
      }
    }

    return pillars;
  } catch (e) {
    return [];
  }
}

async function extractStableTruths(specDir: string): Promise<string[]> {
  const cwd = process.cwd();
  const l2Path = path.join(cwd, specDir, '02.STABLE_TRUTHS.md');

  if (!await fs.pathExists(l2Path)) {
    return [];
  }

  try {
    const content = await fs.readFile(l2Path, 'utf-8');
    const truths: string[] = [];

    // Extract section headers (## Truth Name)
    const truthMatches = content.matchAll(/##\s+(.+?)(?:\n|$)/g);
    for (const match of truthMatches) {
      const truth = match[1].trim();
      // Skip common meta-sections
      if (!truth.match(/^(Overview|Introduction|Summary)/i)) {
        truths.push(truth);
      }
    }

    return truths;
  } catch (e) {
    return [];
  }
}

async function listSystems(specDir: string): Promise<string[]> {
  const cwd = process.cwd();
  const systemsDir = path.join(cwd, specDir, '04.SYSTEMS');

  if (!await fs.pathExists(systemsDir)) {
    return [];
  }

  try {
    const files = await fs.readdir(systemsDir);
    return files
      .filter(f => f.endsWith('.md') && f !== 'SYSTEMS_OVERVIEW.md')
      .map(f => f.replace('.md', ''));
  } catch (e) {
    return [];
  }
}

interface VersionSources {
  config: string | null;      // from .rootspecrc.json
  framework: string | null;   // from 00.SPEC_FRAMEWORK.md
  package: string | null;     // from package.json rootspec dep
}

/**
 * Detect RootSpec version from multiple sources
 */
async function detectAllVersions(specDir: string): Promise<VersionSources> {
  const cwd = process.cwd();
  const versions: VersionSources = { config: null, framework: null, package: null };

  // 1. Check .rootspecrc.json
  const config = await loadConfig(cwd);
  if (config?.version) {
    versions.config = config.version.startsWith('v') ? config.version : `v${config.version}`;
  }

  // 2. Parse 00.SPEC_FRAMEWORK.md header
  const frameworkPath = path.join(cwd, specDir, '00.SPEC_FRAMEWORK.md');
  if (await fs.pathExists(frameworkPath)) {
    try {
      const content = await fs.readFile(frameworkPath, 'utf-8');
      const match = content.match(/^\*\*Version:\*\*\s*([\d.]+)/m);
      if (match) {
        versions.framework = `v${match[1]}`;
      }
    } catch (e) {
      // Ignore read errors
    }
  }

  // 3. Check package.json for rootspec dependency
  const pkgPath = path.join(cwd, 'package.json');
  if (await fs.pathExists(pkgPath)) {
    try {
      const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['rootspec']) {
        const ver = deps['rootspec'].replace(/^[\^~]/, '');
        versions.package = ver.startsWith('v') ? ver : `v${ver}`;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  return versions;
}

/**
 * Interactive prompt for init
 * Asks for product description
 */
async function runInitPrompt(): Promise<void> {
  console.log(chalk.bold('\n🌱 Initialize New Specification\n'));

  const productIdea = await input({
    message: 'Brief description of your product concept:',
    default: 'A productivity app that helps users...',
  });

  console.log();
  console.log(chalk.green('✅ Prompt ready! Copy and paste into your AI assistant:\n'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log();

  const promptContent = await fs.readFile(path.join(PROMPTS_DIR, 'initialize-spec.md'), 'utf-8');
  const filledPrompt = promptContent.replace(
    '[Brief description of your product concept]',
    productIdea
  );

  console.log(filledPrompt);
  console.log();
  console.log(chalk.gray('─'.repeat(60)));
  console.log();
}

/**
 * Interactive prompt for migrate
 * Auto-detects versions from project files
 */
async function runMigratePrompt(): Promise<void> {
  console.log(chalk.bold('\n📦 Migrate Specification\n'));
  console.log(chalk.gray('Scanning for specification files...\n'));

  // Find spec directory
  const specInfo = await findSpecDirectory();
  if (!specInfo.found) {
    console.log(chalk.yellow('  ⚠️  No specification found. Run `rootspec init` first.'));
    console.log();
    return;
  }

  console.log(chalk.green(`  ✓ Found specification in ${specInfo.dir}/`));
  console.log();

  // Detect versions from all sources
  const versions = await detectAllVersions(specInfo.dir);
  const detectedVersions: string[] = [];

  console.log(chalk.gray('Version sources detected:'));

  if (versions.framework) {
    console.log(chalk.green(`  ✓ 00.SPEC_FRAMEWORK.md: ${versions.framework}`));
    detectedVersions.push(versions.framework);
  } else {
    console.log(chalk.gray('  - 00.SPEC_FRAMEWORK.md: (no version found)'));
  }

  if (versions.config) {
    console.log(chalk.green(`  ✓ .rootspecrc.json: ${versions.config}`));
    detectedVersions.push(versions.config);
  } else {
    console.log(chalk.gray('  - .rootspecrc.json: (no version field)'));
  }

  if (versions.package) {
    console.log(chalk.green(`  ✓ package.json (rootspec): ${versions.package}`));
    detectedVersions.push(versions.package);
  } else {
    console.log(chalk.gray('  - package.json: (no rootspec dependency)'));
  }

  // Check for version mismatches
  const uniqueVersions = [...new Set(detectedVersions)];
  if (uniqueVersions.length > 1) {
    console.log();
    console.log(chalk.yellow(`  ⚠️  Version mismatch detected: ${uniqueVersions.join(' vs ')}`));
  }

  // Determine current version (prefer framework file, then config, then package)
  const currentVersion = versions.framework || versions.config || versions.package || 'unknown';
  const targetVersion = `v${CLI_VERSION}`;

  console.log();
  console.log(chalk.cyan(`Migrating: ${currentVersion} → ${targetVersion}`));
  console.log();

  console.log(chalk.green('✅ Prompt ready! Copy and paste into your AI assistant:\n'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log();

  // Read and fill template
  const promptContent = await fs.readFile(path.join(PROMPTS_DIR, 'migrate-spec.md'), 'utf-8');
  const filledPrompt = replaceTemplates(promptContent, {
    OLD_VERSION: currentVersion,
    TARGET_VERSION: targetVersion,
    SPEC_DIR: specInfo.dir,
    HAS_CONFIG: !!versions.config,
    HAS_PACKAGE: !!versions.package,
  });

  console.log(filledPrompt);
  console.log();
  console.log(chalk.gray('─'.repeat(60)));
  console.log();
}

/**
 * Interactive prompt for generate-docs
 * Asks which document types to generate
 */
async function runGenerateDocsPrompt(): Promise<void> {
  console.log(chalk.bold('\n📄 Generate Documentation\n'));

  const docType = await input({
    message: 'Which document type(s) do you want to generate?',
    default: 'PRD (Product Requirements Document)',
  });

  console.log();
  console.log(chalk.green('✅ Prompt ready! Copy and paste into your AI assistant:\n'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log();

  const promptContent = await fs.readFile(path.join(PROMPTS_DIR, 'generate-docs.md'), 'utf-8');
  const filledPrompt = promptContent.replace(
    '[Select one or more document types from above, or specify custom requirements]',
    docType
  );

  console.log(filledPrompt);
  console.log();
  console.log(chalk.gray('─'.repeat(60)));
  console.log();
}
