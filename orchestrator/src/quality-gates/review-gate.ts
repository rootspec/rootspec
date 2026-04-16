import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { GateResult, GateCheck } from "../types.js";
import type { OrchestratorConfig } from "../config.js";

/**
 * Review gate — authority is static review, not the LLM.
 *
 * Static review (deterministic, runs before the LLM agent) writes
 * `summary.staticBlockers`. That's the only signal that can trigger a
 * fix-cycle. LLM findings are reported in the gate message but never
 * change `passed`. Review never aborts the build — only prompts a
 * targeted impl retry via the orchestrator's review-fix loop.
 */
export async function runReviewGate(
  config: OrchestratorConfig
): Promise<GateResult> {
  const path = join(config.projectDir, "rootspec", "review-status.json");
  const checks: GateCheck[] = [];

  if (!existsSync(path)) {
    checks.push({
      name: "review-status.json exists",
      passed: false,
      message: "Missing review-status.json — static review did not run",
    });
    return { passed: false, phase: "review", checks, action: "proceed" };
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(readFileSync(path, "utf-8"));
  } catch (err) {
    checks.push({
      name: "review-status.json parseable",
      passed: false,
      message: `Could not parse review-status.json: ${(err as Error).message}`,
    });
    return { passed: false, phase: "review", checks, action: "proceed" };
  }

  const summary = (data.summary ?? {}) as Record<string, number>;
  const staticBlockers = summary.staticBlockers ?? 0;
  const staticWarnings = summary.staticWarnings ?? 0;
  const pages = summary.pagesScanned ?? 0;
  const llm = (data.llmFindings ?? {}) as { assessment?: string; observations?: unknown[] };
  const llmAssessment = llm.assessment ?? "skipped";
  const llmObservationCount = Array.isArray(llm.observations) ? llm.observations.length : 0;

  checks.push({
    name: "Static review",
    passed: staticBlockers === 0,
    message:
      staticBlockers === 0
        ? `Clean — ${pages} page(s), ${staticWarnings} warning(s)`
        : `${staticBlockers} blocker(s), ${staticWarnings} warning(s) across ${pages} page(s)`,
  });

  checks.push({
    name: "LLM review",
    passed: true, // advisory only
    message: `Assessment: ${llmAssessment} (${llmObservationCount} observations)`,
  });

  const passed = checks.every((c) => c.passed);
  return { passed, phase: "review", checks, action: "proceed" };
}
