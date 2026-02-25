import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

function detectPackageManager(cwd: string): string {
  if (fs.pathExistsSync(path.join(cwd, 'yarn.lock'))) return 'yarn';
  if (fs.pathExistsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  return 'npm';
}

export async function cypressCommand(options: { withExamples?: boolean } = {}): Promise<void> {
  const cwd = process.cwd();

  console.log(chalk.bold('\n🧪 RootSpec - Cypress Testing Setup\n'));

  // Detect package manager
  const pm = detectPackageManager(cwd);
  console.log(chalk.blue(`📦 Detected package manager: ${pm}`));

  // Install @rootspec/cypress as devDependency
  console.log(chalk.blue('📥 Installing @rootspec/cypress...'));

  const installCmd =
    pm === 'yarn' ? 'yarn add --dev @rootspec/cypress' :
    pm === 'pnpm' ? 'pnpm add --save-dev @rootspec/cypress' :
    'npm install --save-dev @rootspec/cypress';

  try {
    execSync(installCmd, { cwd, stdio: 'inherit' });
  } catch {
    console.error(chalk.red('✗ Failed to install @rootspec/cypress'));
    process.exit(1);
  }

  // Run rootspec-cypress init via npx
  const initArgs = options.withExamples ? '--with-examples' : '';
  const execCmd = `npx rootspec-cypress init ${initArgs}`.trim();

  console.log(chalk.blue(`\n🚀 Running: ${execCmd}\n`));
  try {
    execSync(execCmd, { cwd, stdio: 'inherit' });
  } catch {
    console.error(chalk.red('✗ Failed to initialize Cypress templates'));
    process.exit(1);
  }
}
