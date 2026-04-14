import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { GateResult, GateCheck } from "../types.js";
import type { OrchestratorConfig } from "../config.js";

/**
 * Review gate — reports blocker count but NEVER aborts.
 * Used by the orchestrator to decide whether to trigger a fix cycle,
 * not to fail the build. Review is quality improvement, not a gate.
 */
export async function runReviewGate(
  config: OrchestratorConfig
): Promise<GateResult> {
  const dir = config.projectDir;
  const checks: GateCheck[] = [];

  const reviewStatusPath = join(dir, "rootspec", "review-status.json");
  if (existsSync(reviewStatusPath)) {
    const reviewStatus = JSON.parse(readFileSync(reviewStatusPath, "utf-8"));

    // Detect the bash-initialized placeholder — the review agent never
    // updated the file. Treat as "review didn't run."
    if (reviewStatus.status === "incomplete") {
      checks.push({
        name: "Review completed",
        passed: false,
        message: "review-status.json has status 'incomplete' — review agent did not write results",
      });
    } else {
      const blockers = reviewStatus.summary?.blockers ?? 0;
      const warnings = reviewStatus.summary?.warnings ?? 0;
      const nitpicks = reviewStatus.summary?.nitpicks ?? 0;
      const score = reviewStatus.qualityScore?.score ?? "N/A";

      checks.push({
        name: "Review completed",
        passed: true,
        message: `Score: ${score}/100 | ${blockers} blockers, ${warnings} warnings, ${nitpicks} nitpicks`,
      });

      checks.push({
        name: "Zero blockers",
        passed: blockers === 0,
        message:
          blockers === 0
            ? "No blockers found"
            : `${blockers} blocker(s) — fix cycle recommended`,
      });
    }
  } else {
    checks.push({
      name: "review-status.json exists",
      passed: false,
      message: "Missing review-status.json — review phase may have failed",
    });
  }

  const passed = checks.every((c) => c.passed);
  // Review never aborts — always proceed. The orchestrator uses
  // `passed` to decide whether to trigger a fix cycle.
  return {
    passed,
    phase: "review",
    checks,
    action: "proceed",
  };
}
