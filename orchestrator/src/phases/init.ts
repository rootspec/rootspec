import { existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import type { PhaseResult, Reporter } from "../types.js";
import type { OrchestratorConfig } from "../config.js";

/**
 * Init phase — runs the shared bootstrap-init.sh script.
 *
 * The script handles all file creation (spec dir, framework files,
 * prerequisites, .rootspec.json, package.json). Single source of truth
 * shared with the rs-init skill.
 *
 * What the skill adds beyond this:
 *   - Project scanning (scan-spec.sh, scan-project.sh)
 *   - Brownfield detection and framework adaptation
 *   - Interactive confirmation of prerequisites
 *   - Verification with verify-init.sh
 */
export async function executeInit(
  config: OrchestratorConfig,
  reporter: Reporter
): Promise<PhaseResult> {
  const startTime = Date.now();
  const dir = config.projectDir;
  const errors: string[] = [];

  try {
    // Resolve shared skills directory
    const projectShared = join(dir, ".agents", "skills", "rs-shared");
    const sharedDir = existsSync(projectShared)
      ? projectShared
      : join(config.rootspecDir, "skills", "rs-shared");

    const bootstrapScript = join(sharedDir, "scripts", "bootstrap-init.sh");
    if (!existsSync(bootstrapScript)) {
      throw new Error(`bootstrap-init.sh not found at ${bootstrapScript}`);
    }

    // Run the shared bootstrap script
    const output = execSync(`bash "${bootstrapScript}" "${dir}" "${sharedDir}"`, {
      timeout: 30_000,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    // Log output for debugging
    if (output.trim()) {
      reporter.emit({
        type: "message",
        timestamp: new Date().toISOString(),
        data: { text: output.trim() },
      });
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
      status: "success",
      costUsd: 0,
      numTurns: 0,
      durationMs: Date.now() - startTime,
      errors,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(message);
    return {
      phase: "init",
      status: "error",
      costUsd: 0,
      numTurns: 0,
      durationMs: Date.now() - startTime,
      errors,
    };
  }
}
