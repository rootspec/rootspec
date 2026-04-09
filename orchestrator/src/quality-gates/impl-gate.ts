import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { GateResult, GateCheck } from "../types.js";
import type { OrchestratorConfig } from "../config.js";

export async function runImplGate(
  config: OrchestratorConfig
): Promise<GateResult> {
  const dir = config.projectDir;
  const checks: GateCheck[] = [];

  // Check tests-status.json has results
  const testsStatusPath = join(dir, "rootspec", "tests-status.json");
  if (existsSync(testsStatusPath)) {
    const testsStatus = JSON.parse(readFileSync(testsStatusPath, "utf-8"));
    const stories = testsStatus.stories ?? {};
    const storyCount = Object.keys(stories).length;

    checks.push({
      name: "tests-status.json has results",
      passed: storyCount > 0,
      message:
        storyCount > 0
          ? `${storyCount} stories have test results`
          : "No test results found",
    });

    // Check pass rate
    let passing = 0;
    let total = 0;
    for (const [, story] of Object.entries(stories)) {
      total++;
      if ((story as Record<string, unknown>).status === "pass") passing++;
    }

    const passRate = total > 0 ? passing / total : 0;
    const minRate = config.gates.impl.minPassRate;

    checks.push({
      name: `Pass rate ≥ ${Math.round(minRate * 100)}%`,
      passed: passRate >= minRate,
      message: `${passing}/${total} stories passing (${Math.round(passRate * 100)}%)`,
    });
  } else {
    checks.push({
      name: "tests-status.json exists",
      passed: false,
      message: "Missing tests-status.json — tests may not have run",
    });
  }

  const passed = checks.every((c) => c.passed);
  return {
    passed,
    phase: "impl",
    checks,
    // Impl gate failure doesn't abort — we still want to run validate for a report
    action: passed ? "proceed" : "proceed",
  };
}
