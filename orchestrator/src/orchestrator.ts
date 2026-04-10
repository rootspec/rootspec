import type {
  Phase,
  OrchestratorState,
  OrchestratorResult,
  Reporter,
} from "./types.js";
import { PHASE_ORDER } from "./types.js";
import type { OrchestratorConfig } from "./config.js";
import { executePhase } from "./agent/agent-factory.js";
import { executeInit } from "./phases/init.js";
import { runGate } from "./quality-gates/gate.js";
import {
  createInitialState,
  saveState,
  loadState,
  saveReport,
} from "./agent/session-store.js";
import {
  existsSync,
  writeFileSync,
  readFileSync,
  appendFileSync,
} from "node:fs";
import { join } from "node:path";

export async function orchestrate(
  config: OrchestratorConfig,
  reporter: Reporter
): Promise<OrchestratorResult> {
  // Load or create state
  let state: OrchestratorState;
  if (config.resume) {
    const saved = loadState(config.outputDir);
    if (saved) {
      state = saved;
      reporter.emit({
        type: "message",
        timestamp: new Date().toISOString(),
        data: {
          text: `Resuming run ${state.runId} from ${state.currentPhase ?? "start"}`,
        },
      });
    } else {
      state = createInitialState();
    }
  } else {
    state = createInitialState();
  }

  // Determine which phases to run
  const phases = config.phases.filter((p): p is Phase =>
    PHASE_ORDER.includes(p as Phase)
  );

  // If resuming from a specific phase, skip completed phases
  let startIndex = 0;
  if (config.resumeFrom) {
    startIndex = phases.indexOf(config.resumeFrom);
    if (startIndex < 0) startIndex = 0;
  } else if (config.resume && state.completedPhases.length > 0) {
    const lastCompleted = state.completedPhases[state.completedPhases.length - 1];
    startIndex = phases.indexOf(lastCompleted) + 1;
  }

  reporter.emit({
    type: "run_started",
    timestamp: new Date().toISOString(),
    data: {
      runId: state.runId,
      budget: config.maxBudgetUsd,
      phases: phases.slice(startIndex),
    },
  });

  // Bootstrap: install skills into target project
  if (startIndex === 0 && !config.resume) {
    await bootstrap(config, reporter);
  }

  // Review runs in its own loop after the main phases — exclude it here
  const mainPhases = phases.filter((p) => p !== "review");
  const includeReview = phases.includes("review" as Phase);

  // Run main phases (init → spec → impl → validate)
  for (let i = startIndex; i < mainPhases.length; i++) {
    const phase = mainPhases[i];
    state.currentPhase = phase;
    saveState(config.outputDir, state);

    // Check remaining budget
    const remaining = config.maxBudgetUsd - state.totalCostUsd;
    if (remaining <= 0) {
      reporter.emit({
        type: "run_completed",
        timestamp: new Date().toISOString(),
        data: { status: "budget_exhausted" },
      });
      const result: OrchestratorResult = {
        status: "budget_exhausted",
        state,
      };
      reporter.summary(result);
      saveReport(config.outputDir, state as unknown as Record<string, unknown>);
      return result;
    }

    // Inject screenshot hook before validate — impl may have overwritten e2e.ts
    if (phase === "validate") {
      injectScreenshotHook(config.projectDir);
    }

    // Execute phase — init is programmatic, others use Agent SDK
    const phaseResult =
      phase === "init"
        ? await executeInit(config, reporter)
        : await executePhase({ phase, config, state, reporter });

    // Accumulate costs across retries — don't overwrite previous attempt data
    const prevResult = state.phaseResults[phase];
    if (prevResult) {
      // Merge: keep the latest status but sum costs and turns
      phaseResult.costUsd += prevResult.costUsd;
      phaseResult.numTurns += prevResult.numTurns;
      phaseResult.durationMs += prevResult.durationMs;
      phaseResult.errors = [...prevResult.errors, ...phaseResult.errors];
    }
    state.phaseResults[phase] = phaseResult;
    state.totalCostUsd += phaseResult.costUsd - (prevResult?.costUsd ?? 0);
    if (phaseResult.sessionId) {
      state.sessionIds[phase] = phaseResult.sessionId;
    }

    // Handle phase failure with retry
    if (
      phaseResult.status !== "success" &&
      phaseResult.status !== "skipped"
    ) {
      // Don't retry budget-exhausted phases — same budget will fail the same way
      const retryable = phaseResult.status !== "max_budget";
      const canRetry = retryable && state.attempt[phase] < config.maxRetries;
      if (canRetry && phase !== "validate") {
        state.attempt[phase]++;
        reporter.emit({
          type: "retry",
          phase,
          timestamp: new Date().toISOString(),
          data: { attempt: state.attempt[phase] },
        });
        i--; // Retry same phase
        continue;
      }

      // For impl, continue to validate even on failure
      if (phase !== "impl") {
        const result: OrchestratorResult = {
          status: "failed",
          state,
          failedPhase: phase,
        };
        reporter.emit({
          type: "run_completed",
          timestamp: new Date().toISOString(),
          data: { status: "failed", failedPhase: phase },
        });
        reporter.summary(result);
        saveState(config.outputDir, state);
        return result;
      }
    }

    state.completedPhases.push(phase);

    // Run quality gate
    reporter.emit({
      type: "gate_started",
      phase,
      timestamp: new Date().toISOString(),
      data: {},
    });

    const gateResult = await runGate(phase, config, state.attempt[phase]);
    state.gateResults[phase] = gateResult;

    reporter.emit({
      type: "gate_completed",
      phase,
      timestamp: new Date().toISOString(),
      data: {
        passed: gateResult.passed,
        checks: gateResult.checks,
        action: gateResult.action,
      },
    });

    if (!gateResult.passed) {
      if (gateResult.action === "retry" && state.attempt[phase] < config.maxRetries) {
        state.attempt[phase]++;
        // Remove from completedPhases since we're retrying
        state.completedPhases = state.completedPhases.filter((p) => p !== phase);
        reporter.emit({
          type: "retry",
          phase,
          timestamp: new Date().toISOString(),
          data: { attempt: state.attempt[phase], reason: "gate_failed" },
        });
        i--; // Retry same phase
        continue;
      }

      if (gateResult.action === "abort") {
        const result: OrchestratorResult = {
          status: "gate_failed",
          state,
          failedGate: phase,
        };
        reporter.emit({
          type: "run_completed",
          timestamp: new Date().toISOString(),
          data: { status: "gate_failed", failedGate: phase },
        });
        reporter.summary(result);
        saveState(config.outputDir, state);
        return result;
      }
      // action === "proceed" — continue despite gate failure (e.g., impl gate)
    }

    state.attempt[phase] = 0; // Reset for any future retries
    saveState(config.outputDir, state);
  }

  // --- Review-fix loop ---
  // After main phases complete, run review. If blockers found,
  // feed them back to impl, re-validate, re-review. Max N cycles.
  // Review NEVER fails the build — it improves quality but doesn't gate.
  if (includeReview && state.completedPhases.includes("validate")) {
    const maxFixCycles = config.gates.review?.maxFixCycles ?? 2;

    for (let cycle = 0; cycle <= maxFixCycles; cycle++) {
      // Check budget
      if (config.maxBudgetUsd - state.totalCostUsd <= 0) break;

      // Run review
      state.currentPhase = "review";
      saveState(config.outputDir, state);

      const reviewResult = await executePhase({
        phase: "review",
        config,
        state,
        reporter,
      });

      // Accumulate review costs
      const prevReview = state.phaseResults.review;
      if (prevReview) {
        reviewResult.costUsd += prevReview.costUsd;
        reviewResult.numTurns += prevReview.numTurns;
        reviewResult.durationMs += prevReview.durationMs;
        reviewResult.errors = [...prevReview.errors, ...reviewResult.errors];
      }
      state.phaseResults.review = reviewResult;
      state.totalCostUsd += reviewResult.costUsd - (prevReview?.costUsd ?? 0);

      // Run review gate
      reporter.emit({
        type: "gate_started",
        phase: "review",
        timestamp: new Date().toISOString(),
        data: {},
      });
      const gateResult = await runGate("review", config, cycle);
      state.gateResults.review = gateResult;
      reporter.emit({
        type: "gate_completed",
        phase: "review",
        timestamp: new Date().toISOString(),
        data: {
          passed: gateResult.passed,
          checks: gateResult.checks,
          action: gateResult.action,
        },
      });

      if (gateResult.passed || cycle >= maxFixCycles) {
        // Either no blockers, or we've exhausted fix cycles.
        // Either way, the build succeeds — review doesn't gate.
        state.completedPhases.push("review");
        break;
      }

      // Blockers found — feed to impl for targeted fixes
      reporter.emit({
        type: "retry",
        phase: "impl",
        timestamp: new Date().toISOString(),
        data: { attempt: cycle + 1, reason: "review_blockers" },
      });

      // Re-run impl (targeted fix)
      const implFixResult = await executePhase({
        phase: "impl",
        config,
        state,
        reporter,
      });
      const prevImpl = state.phaseResults.impl;
      if (prevImpl) {
        implFixResult.costUsd += prevImpl.costUsd;
        implFixResult.numTurns += prevImpl.numTurns;
        implFixResult.durationMs += prevImpl.durationMs;
        implFixResult.errors = [...prevImpl.errors, ...implFixResult.errors];
      }
      state.phaseResults.impl = implFixResult;
      state.totalCostUsd += implFixResult.costUsd - (prevImpl?.costUsd ?? 0);

      // Re-validate (make sure tests still pass)
      injectScreenshotHook(config.projectDir);
      const revalidateResult = await executePhase({
        phase: "validate",
        config,
        state,
        reporter,
      });
      const prevValidate = state.phaseResults.validate;
      if (prevValidate) {
        revalidateResult.costUsd += prevValidate.costUsd;
        revalidateResult.numTurns += prevValidate.numTurns;
        revalidateResult.durationMs += prevValidate.durationMs;
        revalidateResult.errors = [...prevValidate.errors, ...revalidateResult.errors];
      }
      state.phaseResults.validate = revalidateResult;
      state.totalCostUsd += revalidateResult.costUsd - (prevValidate?.costUsd ?? 0);

      saveState(config.outputDir, state);
      // Loop back for re-review
    }
  }

  const result: OrchestratorResult = { status: "success", state };
  reporter.emit({
    type: "run_completed",
    timestamp: new Date().toISOString(),
    data: { status: "success" },
  });
  reporter.summary(result);
  saveState(config.outputDir, state);
  saveReport(config.outputDir, state as unknown as Record<string, unknown>);
  return result;
}

async function bootstrap(
  config: OrchestratorConfig,
  reporter: Reporter
): Promise<void> {
  const { execSync } = await import("node:child_process");
  const { existsSync, cpSync, mkdirSync } = await import("node:fs");
  const { join } = await import("node:path");

  // Check if skills are already installed
  const skillsDir = join(config.projectDir, ".agents", "skills", "rs-spec");
  if (existsSync(skillsDir)) {
    reporter.emit({
      type: "message",
      timestamp: new Date().toISOString(),
      data: { text: "Skills already installed, skipping bootstrap" },
    });
    return;
  }

  reporter.emit({
    type: "message",
    timestamp: new Date().toISOString(),
    data: { text: "Installing RootSpec skills..." },
  });

  // Try npx skills first (with --yes for non-interactive)
  try {
    execSync(`npx -y skills add rootspec/rootspec --skill '*' --yes`, {
      cwd: config.projectDir,
      timeout: 120_000,
      stdio: "pipe",
    });
    if (existsSync(skillsDir)) {
      reporter.emit({
        type: "message",
        timestamp: new Date().toISOString(),
        data: { text: "Skills installed via npx skills" },
      });
      return;
    }
  } catch {
    // Fall through to direct copy
  }

  // Fallback: copy skills directly from rootspec framework repo
  const srcSkills = join(config.rootspecDir, "skills");
  if (existsSync(srcSkills)) {
    const destSkills = join(config.projectDir, ".agents", "skills");
    mkdirSync(destSkills, { recursive: true });
    const skillDirs = ["rs-init", "rs-spec", "rs-impl", "rs-validate", "rs-review", "rs-shared"];
    for (const dir of skillDirs) {
      const src = join(srcSkills, dir);
      const dest = join(destSkills, dir);
      if (existsSync(src)) {
        cpSync(src, dest, { recursive: true });
      }
    }
    reporter.emit({
      type: "message",
      timestamp: new Date().toISOString(),
      data: { text: "Skills copied from framework repo" },
    });
  } else {
    reporter.emit({
      type: "message",
      timestamp: new Date().toISOString(),
      data: { text: "WARNING: Could not install skills — shared scripts will be unavailable" },
    });
  }
}

/**
 * Write the Cypress screenshot hook and ensure e2e.ts imports it.
 * Called before each validate phase — impl may have overwritten e2e.ts,
 * so we re-inject every time. The hook file is always overwritten to
 * pick up framework changes.
 */
function injectScreenshotHook(projectDir: string): void {
  const supportDir = join(projectDir, "cypress", "support");
  if (!existsSync(supportDir)) return; // No Cypress setup — nothing to inject

  // Write screenshot-hook.ts (always overwrite)
  const hookPath = join(supportDir, "screenshot-hook.ts");
  writeFileSync(
    hookPath,
    `// Capture a full-page screenshot after each passing criterion.
// Screenshots land at cypress/screenshots/<spec>/US-101--AC-101-1.png
// Used by /rs-review for visual quality inspection.
afterEach(function () {
  if (this.currentTest?.state === 'passed') {
    const titles: string[] = (this.currentTest as any).titlePath?.() ?? [];
    const joined = titles.join(' ');
    const storyMatch = joined.match(/US-\\d+/);
    const critMatch = joined.match(/AC-\\d+-\\d+/);
    if (storyMatch) {
      const name = critMatch
        ? \`\${storyMatch[0]}--\${critMatch[0]}\`
        : storyMatch[0];
      cy.screenshot(name, { capture: 'fullPage' });
    }
  }
});
`
  );

  // Ensure e2e.ts imports it
  const e2ePath = join(supportDir, "e2e.ts");
  if (existsSync(e2ePath)) {
    const content = readFileSync(e2ePath, "utf-8");
    if (!content.includes("screenshot-hook")) {
      appendFileSync(e2ePath, '\nimport "./screenshot-hook";\n');
    }
  }
}
