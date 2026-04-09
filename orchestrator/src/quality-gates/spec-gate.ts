import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import type { GateResult, GateCheck } from "../types.js";
import type { OrchestratorConfig } from "../config.js";

export async function runSpecGate(
  config: OrchestratorConfig,
  attempt: number
): Promise<GateResult> {
  const dir = config.projectDir;
  const specDir = join(dir, "rootspec");
  const checks: GateCheck[] = [];

  // Check spec-status.json
  const statusPath = join(specDir, "spec-status.json");
  if (existsSync(statusPath)) {
    const status = JSON.parse(readFileSync(statusPath, "utf-8"));
    checks.push({
      name: "spec-status.json valid",
      passed: status.valid === true,
      message: status.valid ? "Spec is valid" : `Spec invalid: ${JSON.stringify(status)}`,
    });
  } else {
    checks.push({
      name: "spec-status.json exists",
      passed: false,
      message: "Missing spec-status.json",
    });
  }

  // Check L1-L3 files exist
  const requiredFiles = [
    "01.PHILOSOPHY.md",
    "02.TRUTHS.md",
    "03.INTERACTIONS.md",
  ];
  for (const file of requiredFiles) {
    const exists = existsSync(join(specDir, file));
    checks.push({
      name: `${file} exists`,
      passed: exists,
      message: exists ? "Found" : `Missing ${file}`,
    });
  }

  // Check L4 systems overview
  const systemsOverview = existsSync(
    join(specDir, "04.SYSTEMS", "SYSTEMS_OVERVIEW.md")
  );
  checks.push({
    name: "SYSTEMS_OVERVIEW.md exists",
    passed: systemsOverview,
    message: systemsOverview ? "Found" : "Missing 04.SYSTEMS/SYSTEMS_OVERVIEW.md",
  });

  // Check L5 user stories exist — search recursively since stories
  // may be in subdirectories (by_phase/MVP/, by_journey/, etc.)
  const storiesDir = join(specDir, "05.IMPLEMENTATION", "USER_STORIES");
  let storyCount = 0;
  if (existsSync(storiesDir)) {
    const yamlFiles = findYamlFilesRecursive(storiesDir);

    // Count actual stories by scanning for "id:" patterns
    for (const file of yamlFiles) {
      const content = readFileSync(file, "utf-8");
      const matches = content.match(/^id:\s+\S+/gm);
      if (matches) storyCount += matches.length;
    }
  }

  const minStories = config.gates.spec.minStoryCount;
  checks.push({
    name: `At least ${minStories} user stories`,
    passed: storyCount >= minStories,
    message: `Found ${storyCount} stories (need ${minStories})`,
  });

  // Run validate-spec.sh if available
  if (config.gates.spec.requireAllValidationChecks) {
    const validateScript = findValidateScript(config);
    if (validateScript) {
      try {
        const output = execSync(`bash "${validateScript}" "${specDir}"`, {
          cwd: dir,
          timeout: 30_000,
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "pipe"],
        });
        checks.push({
          name: "validate-spec.sh passes",
          passed: true,
          message: "All validation checks passed",
        });
      } catch (err) {
        const stderr =
          err instanceof Error && "stderr" in err
            ? (err as { stderr: string }).stderr
            : String(err);
        checks.push({
          name: "validate-spec.sh passes",
          passed: false,
          message: `Validation failed: ${stderr.slice(0, 500)}`,
        });
      }
    }
  }

  const passed = checks.every((c) => c.passed);
  const maxRetries = config.maxRetries;

  return {
    passed,
    phase: "spec",
    checks,
    action: passed ? "proceed" : attempt < maxRetries ? "retry" : "abort",
  };
}

function findYamlFilesRecursive(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findYamlFilesRecursive(full));
    } else if (entry.endsWith(".yaml") || entry.endsWith(".yml")) {
      results.push(full);
    }
  }
  return results;
}

function findValidateScript(config: OrchestratorConfig): string | null {
  const paths = [
    join(config.projectDir, ".agents", "skills", "rs-shared", "scripts", "validate-spec.sh"),
    join(config.rootspecDir, "skills", "rs-shared", "scripts", "validate-spec.sh"),
  ];
  for (const p of paths) {
    if (existsSync(p)) return p;
  }
  return null;
}
