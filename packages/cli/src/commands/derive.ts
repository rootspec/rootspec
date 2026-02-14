import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSpecDirectory } from '../utils/config.js';
import { replaceTemplates } from '../utils/template.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRAMEWORK_ROOT = path.resolve(__dirname, '..');
const PROMPTS_DIR = path.join(FRAMEWORK_ROOT, 'prompts');

interface DeriveOptions {
  open?: boolean;
}

interface SeedInfo {
  file: string;
  description: string;
  input: string;
  output: string;
}

const SEEDS: Record<string, SeedInfo> = {
  'technical-design': {
    file: 'derive-technical-design.md',
    description: 'Technical Design Document from Level 4 Systems',
    input: 'L4 Systems',
    output: 'Architecture diagrams, API specs, data models',
  },
  'ux-design': {
    file: 'derive-ux-design.md',
    description: 'UX Design artifacts from Level 5 User Stories',
    input: 'L5 USER_STORIES',
    output: 'Wireframes, user flows, screen specs',
  },
  'brand-guidelines': {
    file: 'derive-brand-guidelines.md',
    description: 'Brand Guidelines from Level 1 Design Pillars',
    input: 'L1 Design Pillars',
    output: 'Voice/tone guide, brand principles',
  },
  'ui-design': {
    file: 'derive-ui-design.md',
    description: 'UI Design specifications from UX Design artifacts',
    input: 'UX Design Document',
    output: 'Visual specs, component library design',
  },
  'analytics-plan': {
    file: 'derive-analytics-plan.md',
    description: 'Analytics event taxonomy from Level 3 Interaction Architecture',
    input: 'L3 Interaction Patterns',
    output: 'Event catalog, tracking specifications',
  },
  'config-schema': {
    file: 'derive-config-schema.md',
    description: 'JSON Schema from Level 5 Fine-Tuning parameters',
    input: 'L5 FINE_TUNING',
    output: 'JSON Schema with validation rules',
  },
};

export async function deriveCommand(name?: string, options?: DeriveOptions): Promise<void> {
  try {
    await runDeriveCommand(name, options);
  } catch (error) {
    if (error instanceof Error && error.name === 'ExitPromptError') {
      console.log(chalk.gray('\nCancelled.'));
      process.exit(0);
    }
    throw error;
  }
}

async function runDeriveCommand(name?: string, options?: DeriveOptions): Promise<void> {
  // No name = list all seeds
  if (!name) {
    console.log(chalk.bold('\n🌱 Available Derivation Seeds\n'));

    for (const [key, info] of Object.entries(SEEDS)) {
      console.log(chalk.cyan(`  ${key.padEnd(20)}`), info.description);
      console.log(chalk.gray(`  ${' '.repeat(20)} Input:  ${info.input}`));
      console.log(chalk.gray(`  ${' '.repeat(20)} Output: ${info.output}\n`));
    }

    console.log(chalk.gray('Usage:'));
    console.log(chalk.gray('  rootspec derive <name>        Generate derivation prompt\n'));
    console.log(chalk.gray('Examples:'));
    console.log(chalk.cyan('  rootspec derive technical-design'));
    console.log();
    return;
  }

  // Validate seed exists
  const seed = SEEDS[name];
  if (!seed) {
    console.log(chalk.red(`\n❌ Unknown seed: ${name}`));
    console.log(chalk.gray(`\nAvailable seeds: ${Object.keys(SEEDS).join(', ')}\n`));
    return;
  }

  // Generate prompt
  if (name === 'technical-design') {
    await runTechnicalDesignPrompt();
    return;
  }

  if (name === 'ux-design') {
    await runUXDesignPrompt();
    return;
  }

  if (name === 'brand-guidelines') {
    await runBrandGuidelinesPrompt();
    return;
  }

  if (name === 'ui-design') {
    await runUIDesignPrompt();
    return;
  }

  if (name === 'analytics-plan') {
    await runAnalyticsPlanPrompt();
    return;
  }

  if (name === 'config-schema') {
    await runConfigSchemaPrompt();
    return;
  }
}

async function runTechnicalDesignPrompt(): Promise<void> {
  console.log(chalk.bold('\n🏗️  Derive Technical Design\n'));
  console.log(chalk.gray('Analyzing your specification...\n'));

  // Find spec directory
  const cwd = process.cwd();
  const specDir = await getSpecDirectory(cwd);

  if (!specDir) {
    console.log(chalk.yellow('  ⚠️  No specification found. Run `rootspec init` first.\n'));
    return;
  }

  console.log(chalk.green(`  ✓ Found specification in ${specDir}/`));

  // List Level 4 systems
  const systems = await listSystems(cwd, specDir);
  if (systems.length > 0) {
    console.log(chalk.green(`  ✓ Found ${systems.length} system(s): ${systems.join(', ')}`));
  } else {
    console.log(chalk.yellow('  ⚠️  No Level 4 systems found'));
  }

  console.log();
  console.log(chalk.green('✅ Prompt ready! Copy and paste into your AI assistant:\n'));
  console.log(chalk.gray('─'.repeat(70)));
  console.log();

  // Load and fill template
  const templatePath = path.join(PROMPTS_DIR, 'derive-technical-design.md');
  const template = await fs.readFile(templatePath, 'utf-8');

  const filledPrompt = replaceTemplates(template, {
    SPEC_DIR: specDir,
    SYSTEMS: systems,
    NO_SYSTEMS: systems.length === 0,
  });

  console.log(filledPrompt);
  console.log();
  console.log(chalk.gray('─'.repeat(70)));
  console.log();
}

async function runUXDesignPrompt(): Promise<void> {
  console.log(chalk.bold('\n🎨 Derive UX Design\n'));
  console.log(chalk.gray('Analyzing your specification...\n'));

  const cwd = process.cwd();
  const specDir = await getSpecDirectory(cwd);

  if (!specDir) {
    console.log(chalk.yellow('  ⚠️  No specification found. Run `rootspec init` first.\n'));
    return;
  }

  console.log(chalk.green(`  ✓ Found specification in ${specDir}/`));

  // List user stories
  const userStories = await listUserStories(cwd, specDir);
  if (userStories.length > 0) {
    console.log(chalk.green(`  ✓ Found ${userStories.length} user story file(s)`));
  } else {
    console.log(chalk.yellow('  ⚠️  No Level 5 user stories found'));
  }

  // Extract journeys from user stories
  const journeys = await extractJourneys(cwd, specDir, userStories);
  if (journeys.length > 0) {
    console.log(chalk.green(`  ✓ Found ${journeys.length} journey(s): ${journeys.join(', ')}`));
  } else {
    console.log(chalk.yellow('  ⚠️  No journeys found (check @journey annotations)'));
  }

  console.log();
  console.log(chalk.green('✅ Prompt ready! Copy and paste into your AI assistant:\n'));
  console.log(chalk.gray('─'.repeat(70)));
  console.log();

  const templatePath = path.join(PROMPTS_DIR, 'derive-ux-design.md');
  const template = await fs.readFile(templatePath, 'utf-8');

  const filledPrompt = replaceTemplates(template, {
    SPEC_DIR: specDir,
    USER_STORIES: userStories,
    NO_USER_STORIES: userStories.length === 0,
    JOURNEYS: journeys,
    NO_JOURNEYS: journeys.length === 0,
  });

  console.log(filledPrompt);
  console.log();
  console.log(chalk.gray('─'.repeat(70)));
  console.log();
}

async function runBrandGuidelinesPrompt(): Promise<void> {
  console.log(chalk.bold('\n✨ Derive Brand Guidelines\n'));
  console.log(chalk.gray('Analyzing your specification...\n'));

  const cwd = process.cwd();
  const specDir = await getSpecDirectory(cwd);

  if (!specDir) {
    console.log(chalk.yellow('  ⚠️  No specification found. Run `rootspec init` first.\n'));
    return;
  }

  console.log(chalk.green(`  ✓ Found specification in ${specDir}/`));

  // Extract design pillars
  const designPillars = await extractDesignPillars(cwd, specDir);
  if (designPillars.length > 0) {
    console.log(chalk.green(`  ✓ Found ${designPillars.length} Design Pillar(s): ${designPillars.join(', ')}`));
  } else {
    console.log(chalk.yellow('  ⚠️  No Design Pillars found in Level 1'));
  }

  console.log();
  console.log(chalk.green('✅ Prompt ready! Copy and paste into your AI assistant:\n'));
  console.log(chalk.gray('─'.repeat(70)));
  console.log();

  const templatePath = path.join(PROMPTS_DIR, 'derive-brand-guidelines.md');
  const template = await fs.readFile(templatePath, 'utf-8');

  const filledPrompt = replaceTemplates(template, {
    SPEC_DIR: specDir,
    DESIGN_PILLARS: designPillars,
    NO_PILLARS: designPillars.length === 0,
  });

  console.log(filledPrompt);
  console.log();
  console.log(chalk.gray('─'.repeat(70)));
  console.log();
}

// Helper: List systems from 04.SYSTEMS/
async function listSystems(cwd: string, specDir: string): Promise<string[]> {
  const systemsDir = path.join(cwd, specDir, '04.SYSTEMS');

  if (!await fs.pathExists(systemsDir)) {
    return [];
  }

  const files = await fs.readdir(systemsDir);

  // Filter .md files, exclude SYSTEMS_OVERVIEW.md
  return files
    .filter(f => f.endsWith('.md') && f !== 'SYSTEMS_OVERVIEW.md')
    .map(f => f.replace('.md', ''));
}

// Helper: List user stories from 05.IMPLEMENTATION/USER_STORIES/
async function listUserStories(cwd: string, specDir: string): Promise<string[]> {
  const storiesDir = path.join(cwd, specDir, '05.IMPLEMENTATION/USER_STORIES');

  if (!await fs.pathExists(storiesDir)) {
    return [];
  }

  const files: string[] = [];

  async function scanDir(dir: string, prefix: string = '') {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        await scanDir(fullPath, relativePath);
      } else if (entry.name.endsWith('.yaml')) {
        files.push(relativePath);
      }
    }
  }

  await scanDir(storiesDir);
  return files;
}

// Helper: Extract journeys from user stories
async function extractJourneys(cwd: string, specDir: string, userStories: string[]): Promise<string[]> {
  const storiesDir = path.join(cwd, specDir, '05.IMPLEMENTATION/USER_STORIES');
  const journeys = new Set<string>();

  for (const storyFile of userStories) {
    const filePath = path.join(storiesDir, storyFile);
    try {
      const content = await fs.readFile(filePath, 'utf-8');

      // Look for @journey annotations in comments
      const journeyMatches = content.match(/@journey:\s*([^\n]+)/g);
      if (journeyMatches) {
        for (const match of journeyMatches) {
          const journey = match.replace(/@journey:\s*/, '').trim();
          journeys.add(journey);
        }
      }
    } catch (error) {
      // Skip files that can't be read
      continue;
    }
  }

  return Array.from(journeys);
}

// Helper: Extract design pillars from Level 1
async function extractDesignPillars(cwd: string, specDir: string): Promise<string[]> {
  const l1Path = path.join(cwd, specDir, '01.FOUNDATIONAL_PHILOSOPHY.md');

  if (!await fs.pathExists(l1Path)) {
    return [];
  }

  const content = await fs.readFile(l1Path, 'utf-8');

  // Find Design Pillars section and extract pillar names
  const pillarsMatch = content.match(/##\s+Design Pillars\s+([\s\S]*?)(?=\n##|$)/i);

  if (!pillarsMatch) {
    return [];
  }

  const pillarsSection = pillarsMatch[1];
  const pillarNames: string[] = [];

  // Match ### headings for pillar names
  const h3Matches = pillarsSection.match(/###\s+([^\n]+)/g);
  if (h3Matches) {
    pillarNames.push(...h3Matches.map(m => m.replace(/###\s+/, '').trim()));
  }

  return pillarNames;
}

// ============================================================================
// Phase 3 Seeds: UI Design, Analytics Plan, Config Schema
// ============================================================================

async function runUIDesignPrompt(): Promise<void> {
  console.log(chalk.bold('\n🎨 Derive UI Design\n'));
  console.log(chalk.gray('Analyzing your specification...\n'));

  const cwd = process.cwd();
  const specDir = await getSpecDirectory(cwd);

  if (!specDir) {
    console.log(chalk.yellow('  ⚠️  No specification found. Run `rootspec init` first.\n'));
    return;
  }

  console.log(chalk.green(`  ✓ Found specification in ${specDir}/`));

  // Check for UX Design document
  const uxDesignFile = await findUXDesignDocument(cwd);
  const uxDesignExists = uxDesignFile !== null;

  if (uxDesignExists && uxDesignFile) {
    console.log(chalk.green(`  ✓ Found UX Design document at ${uxDesignFile}`));
  } else {
    console.log(chalk.yellow('  ⚠️  No UX Design document found at conventional location'));
    console.log(chalk.gray('     Run `rootspec derive ux-design` first'));
  }

  console.log();
  console.log(chalk.green('✅ Prompt ready! Copy and paste into your AI assistant:\n'));
  console.log(chalk.gray('─'.repeat(70)));
  console.log();

  const templatePath = path.join(PROMPTS_DIR, 'derive-ui-design.md');
  const template = await fs.readFile(templatePath, 'utf-8');

  const filledPrompt = replaceTemplates(template, {
    SPEC_DIR: specDir,
    UX_DESIGN_FILE: uxDesignFile || 'DERIVED_ARTIFACTS/ux-design.md',
    UX_DESIGN_EXISTS: uxDesignExists,
  });

  console.log(filledPrompt);
  console.log();
  console.log(chalk.gray('─'.repeat(70)));
  console.log();
}

async function runAnalyticsPlanPrompt(): Promise<void> {
  console.log(chalk.bold('\n📊 Derive Analytics Plan\n'));
  console.log(chalk.gray('Analyzing your specification...\n'));

  const cwd = process.cwd();
  const specDir = await getSpecDirectory(cwd);

  if (!specDir) {
    console.log(chalk.yellow('  ⚠️  No specification found. Run `rootspec init` first.\n'));
    return;
  }

  console.log(chalk.green(`  ✓ Found specification in ${specDir}/`));

  // Check for L3 Interaction Architecture
  const l3Path = path.join(cwd, specDir, '03.INTERACTION_ARCHITECTURE.md');
  const l3Exists = await fs.pathExists(l3Path);

  if (l3Exists) {
    console.log(chalk.green(`  ✓ Found Level 3 Interaction Architecture`));
  } else {
    console.log(chalk.yellow('  ⚠️  No Level 3 Interaction Architecture found'));
  }

  // Extract interaction patterns
  const interactionPatterns = await extractInteractionPatterns(cwd, specDir);
  if (interactionPatterns.length > 0) {
    console.log(chalk.green(`  ✓ Found ${interactionPatterns.length} interaction pattern(s): ${interactionPatterns.slice(0, 3).join(', ')}${interactionPatterns.length > 3 ? '...' : ''}`));
  } else {
    console.log(chalk.yellow('  ⚠️  No interaction patterns found in L3'));
  }

  console.log();
  console.log(chalk.green('✅ Prompt ready! Copy and paste into your AI assistant:\n'));
  console.log(chalk.gray('─'.repeat(70)));
  console.log();

  const templatePath = path.join(PROMPTS_DIR, 'derive-analytics-plan.md');
  const template = await fs.readFile(templatePath, 'utf-8');

  const filledPrompt = replaceTemplates(template, {
    SPEC_DIR: specDir,
    L3_EXISTS: l3Exists,
    INTERACTION_PATTERNS: interactionPatterns,
  });

  console.log(filledPrompt);
  console.log();
  console.log(chalk.gray('─'.repeat(70)));
  console.log();
}

async function runConfigSchemaPrompt(): Promise<void> {
  console.log(chalk.bold('\n📋 Derive Config Schema\n'));
  console.log(chalk.gray('Analyzing your specification...\n'));

  const cwd = process.cwd();
  const specDir = await getSpecDirectory(cwd);

  if (!specDir) {
    console.log(chalk.yellow('  ⚠️  No specification found. Run `rootspec init` first.\n'));
    return;
  }

  console.log(chalk.green(`  ✓ Found specification in ${specDir}/`));

  // List Fine-Tuning files
  const fineTuningFiles = await listFineTuningFiles(cwd, specDir);
  if (fineTuningFiles.length > 0) {
    console.log(chalk.green(`  ✓ Found ${fineTuningFiles.length} Fine-Tuning file(s): ${fineTuningFiles.slice(0, 3).join(', ')}${fineTuningFiles.length > 3 ? '...' : ''}`));
  } else {
    console.log(chalk.yellow('  ⚠️  No Fine-Tuning files found'));
  }

  console.log();
  console.log(chalk.green('✅ Prompt ready! Copy and paste into your AI assistant:\n'));
  console.log(chalk.gray('─'.repeat(70)));
  console.log();

  const templatePath = path.join(PROMPTS_DIR, 'derive-config-schema.md');
  const template = await fs.readFile(templatePath, 'utf-8');

  const filledPrompt = replaceTemplates(template, {
    SPEC_DIR: specDir,
    FINE_TUNING_FILES: fineTuningFiles,
    NO_FINE_TUNING: fineTuningFiles.length === 0,
  });

  console.log(filledPrompt);
  console.log();
  console.log(chalk.gray('─'.repeat(70)));
  console.log();
}

// Helper: Find UX Design document at conventional location
async function findUXDesignDocument(cwd: string): Promise<string | null> {
  // Check conventional location first
  const conventionalPath = path.join(cwd, 'DERIVED_ARTIFACTS/ux-design.md');

  if (await fs.pathExists(conventionalPath)) {
    return 'DERIVED_ARTIFACTS/ux-design.md';
  }

  // Alternative: check spec directory root
  const specDir = await getSpecDirectory(cwd);
  if (specDir) {
    const specPath = path.join(specDir, 'DERIVED_ARTIFACTS/ux-design.md');
    const fullSpecPath = path.join(cwd, specPath);
    if (await fs.pathExists(fullSpecPath)) {
      return specPath;
    }
  }

  return null;
}

// Helper: Extract interaction patterns from L3
async function extractInteractionPatterns(cwd: string, specDir: string): Promise<string[]> {
  const l3Path = path.join(cwd, specDir, '03.INTERACTION_ARCHITECTURE.md');

  if (!await fs.pathExists(l3Path)) {
    return [];
  }

  const content = await fs.readFile(l3Path, 'utf-8');
  const patterns: string[] = [];

  // Extract pattern names from:
  // 1. Section headings (## Pattern Name, ### Pattern Name)
  // 2. Loop names (often in bold or as table headers)

  const headingMatches = content.match(/###?\s+([^\n]+)/g);
  if (headingMatches) {
    patterns.push(...headingMatches.map(m => m.replace(/###?\s+/, '').trim()));
  }

  // Also look for "Loop:" or "Pattern:" prefixed items
  const loopMatches = content.match(/(?:Loop|Pattern):\s*([^\n]+)/gi);
  if (loopMatches) {
    patterns.push(...loopMatches.map(m => m.replace(/(?:Loop|Pattern):\s*/i, '').trim()));
  }

  // Deduplicate and filter out common headings
  const filtered = [...new Set(patterns)]
    .filter(p => !['Overview', 'Introduction', 'Summary', 'Interaction Architecture', 'Level 3'].includes(p));

  return filtered;
}

// Helper: List Fine-Tuning files
async function listFineTuningFiles(cwd: string, specDir: string): Promise<string[]> {
  const fineTuningDir = path.join(cwd, specDir, '05.IMPLEMENTATION/FINE_TUNING');

  if (!await fs.pathExists(fineTuningDir)) {
    return [];
  }

  const files: string[] = [];

  async function scanDir(dir: string, prefix: string = '') {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        await scanDir(fullPath, relativePath);
      } else if (entry.name.endsWith('.yaml')) {
        files.push(relativePath);
      }
    }
  }

  await scanDir(fineTuningDir);
  return files;
}
