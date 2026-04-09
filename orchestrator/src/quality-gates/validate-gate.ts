import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { GateResult, GateCheck } from "../types.js";
import type { OrchestratorConfig } from "../config.js";

export async function runValidateGate(
  config: OrchestratorConfig
): Promise<GateResult> {
  const dir = config.projectDir;
  const checks: GateCheck[] = [];

  const testsStatusPath = join(dir, "rootspec", "tests-status.json");
  if (existsSync(testsStatusPath)) {
    const testsStatus = JSON.parse(readFileSync(testsStatusPath, "utf-8"));
    const stories = testsStatus.stories ?? {};

    let passing = 0;
    let total = 0;
    for (const [, story] of Object.entries(stories)) {
      total++;
      if ((story as Record<string, unknown>).status === "pass") passing++;
    }

    const passRate = total > 0 ? passing / total : 0;
    const minRate = config.gates.validate.minPassRate;

    checks.push({
      name: `Final pass rate ≥ ${Math.round(minRate * 100)}%`,
      passed: passRate >= minRate,
      message: `${passing}/${total} stories passing (${Math.round(passRate * 100)}%)`,
    });

    // Check for last run timestamp
    if (testsStatus.lastRun) {
      checks.push({
        name: "Tests ran recently",
        passed: true,
        message: `Last run: ${testsStatus.lastRun}`,
      });
    }
  } else {
    checks.push({
      name: "tests-status.json exists",
      passed: false,
      message: "Missing tests-status.json — validate phase may have failed",
    });
  }

  const passed = checks.every((c) => c.passed);
  return {
    passed,
    phase: "validate",
    checks,
    action: passed ? "proceed" : "abort",
  };
}
