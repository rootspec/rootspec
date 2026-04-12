import {
  existsSync,
  mkdirSync,
  cpSync,
  writeFileSync,
  readFileSync,
  appendFileSync,
} from "node:fs";
import { join } from "node:path";
import type { PhaseResult, Reporter } from "../types.js";
import type { OrchestratorConfig } from "../config.js";

/**
 * Init phase — done programmatically, no Agent SDK needed.
 *
 * Mirrors rs-init/SKILL.md steps:
 *   Step 1: Scan (skipped — greenfield assumed)
 *   Step 2: Create spec dir + base files
 *   Step 3: Detect/create prerequisites (bundled templates)
 *   Step 4: Write .rootspec.json
 *   Step 5: Verify (delegated to init gate)
 *
 * Agentic tasks we skip (only matter for brownfield):
 *   - Project scanning (scan-spec.sh, scan-project.sh)
 *   - Framework detection (choosing dev command from existing code)
 *   - Re-init / partial-init detection
 *
 * TODO: Add brownfield path — when project already has src/, use Agent SDK
 * to run scan-project.sh, detect framework, and adapt dev.sh DEV_CMD.
 */
export async function executeInit(
  config: OrchestratorConfig,
  reporter: Reporter
): Promise<PhaseResult> {
  const startTime = Date.now();
  const dir = config.projectDir;
  const errors: string[] = [];

  try {
    // Resolve shared skills directory (project-installed or framework repo)
    const projectShared = join(dir, ".agents", "skills", "rs-shared");
    const sharedDir = existsSync(projectShared)
      ? projectShared
      : join(config.rootspecDir, "skills", "rs-shared");

    // --- Step 2: Create spec directory and base files ---

    const specDir = join(dir, "rootspec");
    mkdirSync(specDir, { recursive: true });

    // 2.1 Copy 00.AXIOMS.md
    copyBundledFile(sharedDir, "00.AXIOMS.md", specDir, errors);

    // 2.2 Copy 00.FRAMEWORK.md
    copyBundledFile(sharedDir, "00.FRAMEWORK.md", specDir, errors);

    // 2.3 Create spec-status.json (initial state — not yet validated)
    const frameworkVersion = readFrameworkVersion(sharedDir);
    writeIfMissing(
      join(specDir, "spec-status.json"),
      JSON.stringify(
        { hash: null, validatedAt: null, valid: false, version: frameworkVersion },
        null,
        2
      )
    );

    // 2.4 Create tests-status.json (no tests run yet)
    writeIfMissing(
      join(specDir, "tests-status.json"),
      JSON.stringify({ lastRun: null, stories: {} }, null, 2)
    );

    // --- Step 3: Create prerequisites ---

    const scriptsDir = join(dir, "scripts");
    mkdirSync(scriptsDir, { recursive: true });

    // 3.1 Dev server — copy bundled template from rs-shared/scripts/dev.sh
    const bundledDevSh = join(sharedDir, "scripts", "dev.sh");
    if (!existsSync(join(scriptsDir, "dev.sh"))) {
      if (existsSync(bundledDevSh)) {
        cpSync(bundledDevSh, join(scriptsDir, "dev.sh"));
        // Make executable
        const { chmodSync } = await import("node:fs");
        chmodSync(join(scriptsDir, "dev.sh"), 0o755);
      } else {
        errors.push("Bundled dev.sh not found — will need manual setup");
      }
    }

    // 3.2 Validation script (test.sh)
    writeIfMissing(
      join(scriptsDir, "test.sh"),
      `#!/usr/bin/env bash
# Test runner — starts dev server, runs Cypress, stops server
set -euo pipefail
./scripts/dev.sh start
npx cypress run --config-file cypress.config.ts 2>&1
EXIT_CODE=$?
./scripts/dev.sh stop
exit $EXIT_CODE
`,
      0o755
    );

    // 3.3 Cypress reporter — copy bundled rootspec-reporter.ts
    const reporterSrc = join(sharedDir, "cypress", "rootspec-reporter.ts");
    if (existsSync(reporterSrc)) {
      const cypressSupport = join(dir, "cypress", "support");
      mkdirSync(cypressSupport, { recursive: true });
      cpSync(reporterSrc, join(cypressSupport, "rootspec-reporter.ts"));
    }

    // 3.4 .gitignore entries
    const gitignorePath = join(dir, ".gitignore");
    const gitignoreEntries = [
      "node_modules/",
      "dist/",
      ".dev-server.pid",
      ".dev-server.log",
    ];
    if (existsSync(gitignorePath)) {
      const existing = readFileSync(gitignorePath, "utf-8");
      const missing = gitignoreEntries.filter((e) => !existing.includes(e));
      if (missing.length > 0) {
        appendFileSync(gitignorePath, "\n" + missing.join("\n") + "\n");
      }
    } else {
      writeFileSync(gitignorePath, gitignoreEntries.join("\n") + "\n");
    }

    // --- Step 4: Write .rootspec.json ---

    const rootspecJson = {
      version: frameworkVersion,
      specDirectory: "rootspec",
      prerequisites: {
        devServer: "./scripts/dev.sh",
        preCommitHook: null,
        releaseScript: null,
        validationScript: "./scripts/test.sh",
      },
    };
    writeFileSync(
      join(dir, ".rootspec.json"),
      JSON.stringify(rootspecJson, null, 2)
    );

    // --- Package.json ---

    if (!existsSync(join(dir, "package.json"))) {
      writeFileSync(
        join(dir, "package.json"),
        JSON.stringify(
          {
            name: "rootspec-project",
            version: "0.1.0",
            private: true,
            type: "module",
            scripts: {
              dev: "./scripts/dev.sh start",
              "dev:start": "./scripts/dev.sh start",
              "dev:stop": "./scripts/dev.sh stop",
              "dev:restart": "./scripts/dev.sh restart",
              build: "echo 'No build configured yet'",
              test: "./scripts/test.sh",
            },
          },
          null,
          2
        )
      );
    }

    reporter.emit({
      type: "phase_completed",
      phase: "init",
      timestamp: new Date().toISOString(),
      data: {
        status: "success",
        cost: 0,
        turns: 0,
        duration: Date.now() - startTime,
      },
    });

    return {
      phase: "init",
      status: errors.length > 0 ? "error" : "success",
      costUsd: 0,
      numTurns: 0,
      durationMs: Date.now() - startTime,
      errors,
    };
  } catch (err) {
    return {
      phase: "init",
      status: "error",
      costUsd: 0,
      numTurns: 0,
      durationMs: Date.now() - startTime,
      errors: [err instanceof Error ? err.message : String(err)],
    };
  }
}

function readFrameworkVersion(sharedDir: string): string {
  const fw = join(sharedDir, "00.FRAMEWORK.md");
  if (existsSync(fw)) {
    const match = readFileSync(fw, "utf-8").match(/\*\*Version:\*\*\s+(\S+)/);
    if (match) return match[1];
  }
  return "0.0.0";
}

function copyBundledFile(
  sharedDir: string,
  filename: string,
  destDir: string,
  errors: string[]
): void {
  const src = join(sharedDir, filename);
  if (existsSync(src)) {
    cpSync(src, join(destDir, filename));
  } else {
    errors.push(`${filename} not found in ${sharedDir}`);
  }
}

function writeIfMissing(
  path: string,
  content: string,
  mode?: number
): void {
  if (!existsSync(path)) {
    writeFileSync(path, content, mode ? { mode } : undefined);
  }
}
