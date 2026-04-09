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

  // Run phases
  for (let i = startIndex; i < phases.length; i++) {
    const phase = phases[i];
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
    const skillDirs = ["rs-init", "rs-spec", "rs-impl", "rs-validate", "rs-shared"];
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
