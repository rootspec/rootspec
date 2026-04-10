import type { Phase, GateResult, GateCheck } from "../types.js";
import type { OrchestratorConfig } from "../config.js";
import { runSpecGate } from "./spec-gate.js";
import { runImplGate } from "./impl-gate.js";
import { runValidateGate } from "./validate-gate.js";
import { runReviewGate } from "./review-gate.js";

export async function runGate(
  phase: Phase,
  config: OrchestratorConfig,
  attempt: number
): Promise<GateResult> {
  switch (phase) {
    case "init":
      return runInitGate(config);
    case "spec":
      return runSpecGate(config, attempt);
    case "impl":
      return runImplGate(config);
    case "validate":
      return runValidateGate(config);
    case "review":
      return runReviewGate(config);
    default:
      return { passed: true, phase, checks: [], action: "proceed" };
  }
}

async function runInitGate(config: OrchestratorConfig): Promise<GateResult> {
  const { existsSync } = await import("node:fs");
  const { join } = await import("node:path");
  const dir = config.projectDir;

  function check(name: string, path: string): GateCheck {
    const exists = existsSync(path);
    return { name, passed: exists, message: exists ? "Found" : `Missing: ${path}` };
  }

  const checks: GateCheck[] = [
    check(".rootspec.json", join(dir, ".rootspec.json")),
    check("rootspec/ directory", join(dir, "rootspec")),
    check("00.FRAMEWORK.md", join(dir, "rootspec", "00.FRAMEWORK.md")),
    check("00.AXIOMS.md", join(dir, "rootspec", "00.AXIOMS.md")),
    check("spec-status.json", join(dir, "rootspec", "spec-status.json")),
    check("tests-status.json", join(dir, "rootspec", "tests-status.json")),
    check("scripts/dev.sh", join(dir, "scripts", "dev.sh")),
    check("scripts/test.sh", join(dir, "scripts", "test.sh")),
    check("package.json", join(dir, "package.json")),
  ];

  const passed = checks.every((c) => c.passed);
  return {
    passed,
    phase: "init",
    checks,
    action: passed ? "proceed" : "retry",
  };
}
