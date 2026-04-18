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
import { writeStaticReviewStatus } from "./quality-gates/static-review.js";
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
  readdirSync,
  statSync,
} from "node:fs";
import { execSync } from "node:child_process";
import { join, relative } from "node:path";

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

    // Inject hooks before validate — impl may have overwritten e2e.ts
    if (phase === "validate") {
      injectScreenshotHook(config.projectDir);
      injectRuntimeChecksHook(config.projectDir);
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
      if (canRetry) {
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
  // Two-stage: static review (deterministic, authoritative) → optional LLM
  // review (advisory). Only static blockers can trigger a fix-cycle.
  // Review NEVER fails the build.
  if (includeReview) {
    const maxFixCycles = config.gates.review?.maxFixCycles ?? 1;
    const runLlmStage = config.gates.review?.runLlmStage ?? true;

    // Build the project once so static review has rendered HTML to scan.
    // Cypress runs against the dev server; without this, the build output
    // is empty in CI and static review degenerates to 0 pages scanned.
    // The returned dir is framework-detected from what the build produced.
    const buildOutputDir = runProjectBuild(config.projectDir, reporter);

    for (let cycle = 0; cycle <= maxFixCycles; cycle++) {
      if (config.maxBudgetUsd - state.totalCostUsd <= 0) break;

      state.currentPhase = "review";
      saveState(config.outputDir, state);

      // Stage 1: static review writes review-status.json authoritatively
      const staticStart = Date.now();
      const staticResult = await writeStaticReviewStatus(config, buildOutputDir);
      reporter.emit({
        type: "message",
        phase: "review",
        timestamp: new Date().toISOString(),
        data: {
          text: `Static review: ${staticResult.blockers.length} blocker(s), ${staticResult.warnings.length} warning(s), ${staticResult.pages.length} page(s)`,
        },
      });

      // Stage 2: optional LLM advisory review — only on first cycle to save cost
      if (runLlmStage && cycle === 0) {
        const reviewResult = await executePhase({
          phase: "review",
          config,
          state,
          reporter,
        });
        const prevReview = state.phaseResults.review;
        if (prevReview) {
          reviewResult.costUsd += prevReview.costUsd;
          reviewResult.numTurns += prevReview.numTurns;
          reviewResult.durationMs += prevReview.durationMs;
          reviewResult.errors = [...prevReview.errors, ...reviewResult.errors];
        }
        state.phaseResults.review = reviewResult;
        state.totalCostUsd += reviewResult.costUsd - (prevReview?.costUsd ?? 0);
      } else if (!state.phaseResults.review) {
        // Record a synthetic phase result so reporting knows review ran
        state.phaseResults.review = {
          phase: "review",
          status: "success",
          costUsd: 0,
          numTurns: 0,
          durationMs: Date.now() - staticStart,
          errors: [],
        };
      }

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
        if (!state.completedPhases.includes("review")) {
          state.completedPhases.push("review");
        }
        break;
      }

      // Static blockers found — feed to impl for targeted fixes
      reporter.emit({
        type: "retry",
        phase: "impl",
        timestamp: new Date().toISOString(),
        data: { attempt: cycle + 1, reason: "review_blockers" },
      });

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

      injectScreenshotHook(config.projectDir);
      injectRuntimeChecksHook(config.projectDir);
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
      // Loop back: static review re-runs on next iteration
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
  writeStats(config.projectDir, state);
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
 * Build the project so static review has rendered HTML to scan.
 *
 * Snapshots top-level dirs before the build, runs `npm run build`, then
 * returns the dir that the build wrote to (new or mtime-advanced). This
 * is framework-agnostic — works for Astro/Vite (`dist/`), Next-export
 * (`out/`), SvelteKit (`build/`), Eleventy (`_site/`), etc. — and
 * detects stub build scripts as a side effect (no dir changed).
 *
 * Returns the absolute path to the discovered output dir, or null if
 * none was produced. Build failure is non-fatal.
 */
function runProjectBuild(
  projectDir: string,
  reporter: Reporter
): string | null {
  const pkgPath = join(projectDir, "package.json");
  if (!existsSync(pkgPath)) return null;

  let hasBuildScript = false;
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    hasBuildScript = typeof pkg?.scripts?.build === "string";
  } catch {
    return null;
  }
  if (!hasBuildScript) return null;

  // Top-level dirs to ignore when looking for build output. Source dirs,
  // tooling caches, and runtime artifacts that aren't user-facing HTML.
  const IGNORE = new Set([
    "node_modules", ".git", ".github", "cypress", "coverage",
    "src", "app", "pages", "components", "lib", "test", "tests",
    "scripts", "rootspec", ".agents", ".claude",
    ".cache", ".parcel-cache", ".rootspec-orchestrator",
  ]);

  const snapshot = snapshotDirs(projectDir, IGNORE);

  reporter.emit({
    type: "message",
    phase: "review",
    timestamp: new Date().toISOString(),
    data: { text: "Building project for static review (npm run build)..." },
  });

  const start = Date.now();
  try {
    execSync("npm run build", {
      cwd: projectDir,
      timeout: 5 * 60 * 1000,
      stdio: "pipe",
      encoding: "utf-8",
    });
  } catch (err) {
    reporter.emit({
      type: "message",
      phase: "review",
      timestamp: new Date().toISOString(),
      data: {
        text: `WARNING: build failed (${Math.round((Date.now() - start) / 1000)}s) — proceeding to review with existing HTML. Error: ${(err as Error).message.slice(0, 200)}`,
      },
    });
  }

  const changed = findChangedDirs(projectDir, IGNORE, snapshot);
  const outputDir = pickBuildOutputDir(changed);
  const elapsed = Math.round((Date.now() - start) / 1000);

  if (!outputDir) {
    reporter.emit({
      type: "message",
      phase: "review",
      timestamp: new Date().toISOString(),
      data: {
        text: `WARNING: build (${elapsed}s) produced no new output dir — likely a stub script or framework misconfiguration. Static review will scan existing HTML only.`,
      },
    });
    return null;
  }

  reporter.emit({
    type: "message",
    phase: "review",
    timestamp: new Date().toISOString(),
    data: { text: `Build complete (${elapsed}s) — output dir: ${relative(projectDir, outputDir) || "."}` },
  });
  return outputDir;
}

function snapshotDirs(
  root: string,
  ignore: Set<string>
): Map<string, number> {
  const out = new Map<string, number>();
  let entries: string[] = [];
  try {
    entries = readdirSync(root);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (ignore.has(name) || name.startsWith(".")) continue;
    const abs = join(root, name);
    try {
      const st = statSync(abs);
      if (st.isDirectory()) out.set(abs, st.mtimeMs);
    } catch {
      // ignore
    }
  }
  return out;
}

function findChangedDirs(
  root: string,
  ignore: Set<string>,
  before: Map<string, number>
): string[] {
  const after = snapshotDirs(root, ignore);
  const changed: string[] = [];
  for (const [abs, mtime] of after) {
    const prior = before.get(abs);
    if (prior === undefined || mtime > prior) changed.push(abs);
  }
  return changed;
}

function pickBuildOutputDir(candidates: string[]): string | null {
  if (candidates.length === 0) return null;
  // Prefer a candidate that actually contains an index.html.
  const withIndex = candidates.filter((d) => existsSync(join(d, "index.html")));
  if (withIndex.length > 0) {
    // If multiple, pick the shortest path (likely the canonical output root)
    return withIndex.sort((a, b) => a.length - b.length)[0];
  }
  // Otherwise pick any candidate that contains *some* HTML somewhere.
  for (const dir of candidates) {
    if (containsHtml(dir)) return dir;
  }
  return null;
}

function containsHtml(dir: string): boolean {
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return false;
  }
  for (const e of entries) {
    if (e.endsWith(".html")) return true;
    const abs = join(dir, e);
    try {
      const st = statSync(abs);
      if (st.isDirectory() && containsHtml(abs)) return true;
    } catch {
      // ignore
    }
  }
  return false;
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

/**
 * Inject a runtime-checks hook that records console errors and network 404s
 * to rootspec/runtime-issues.json during Cypress tests. The static review
 * phase picks these up and surfaces them as review warnings.
 */
function injectRuntimeChecksHook(projectDir: string): void {
  const supportDir = join(projectDir, "cypress", "support");
  if (!existsSync(supportDir)) return;

  // Initialize the output file — fresh each run
  const rootspecDir = join(projectDir, "rootspec");
  if (existsSync(rootspecDir)) {
    writeFileSync(join(rootspecDir, "runtime-issues.json"), "[]");
  }

  const hookPath = join(supportDir, "runtime-checks-hook.ts");
  writeFileSync(
    hookPath,
    `// Track console errors and network failures during tests.
// Injected by the orchestrator before each validate phase.
// Results are read by the static review phase.
// Self-initializing — works even outside the orchestrator (e.g. validate-deploy CI).

const allIssues: Array<{ type: string; test: string; message: string }> = [];

Cypress.on('uncaught:exception', (err) => {
  allIssues.push({ type: 'console_error', test: '', message: err.message });
  return false;
});

let currentNetwork404s: string[] = [];

beforeEach(() => {
  currentNetwork404s = [];
  cy.intercept('**/*', (req) => {
    req.continue((res) => {
      if (res.statusCode >= 400) {
        currentNetwork404s.push(\`\${res.statusCode} \${req.url}\`);
      }
    });
  });
});

afterEach(function () {
  const testName = this.currentTest?.title ?? '';
  for (const msg of currentNetwork404s) {
    allIssues.push({ type: 'network_404', test: testName, message: msg });
  }
});

after(() => {
  cy.writeFile('rootspec/runtime-issues.json', allIssues, { log: false });
});
`
  );

  const e2ePath = join(supportDir, "e2e.ts");
  if (existsSync(e2ePath)) {
    const content = readFileSync(e2ePath, "utf-8");
    if (!content.includes("runtime-checks-hook")) {
      appendFileSync(e2ePath, '\nimport "./runtime-checks-hook";\n');
    }
  }
}

/**
 * Write rootspec/stats.json with run results.
 * Appends to existing runs array if the file exists.
 */
function writeStats(projectDir: string, state: OrchestratorState): void {
  const statsPath = join(projectDir, "rootspec", "stats.json");

  // Overwrite — skill agents may have written partial entries during the run;
  // the orchestrator's entry is the single source of truth.
  const stats: { runs: unknown[] } = { runs: [] };

  // Build phase breakdown
  const phases: Record<string, unknown> = {};
  for (const [phase, r] of Object.entries(state.phaseResults)) {
    if (!r) continue;
    phases[phase] = {
      status: r.status,
      costUsd: Math.round(r.costUsd * 100) / 100,
      turns: r.numTurns,
      durationSeconds: Math.round(r.durationMs / 1000),
    };
  }

  // Read review summary (static + LLM) from review-status.json
  let reviewSummary: {
    staticBlockers: number;
    staticWarnings: number;
    llmAssessment: string;
  } | null = null;
  const reviewPath = join(projectDir, "rootspec", "review-status.json");
  if (existsSync(reviewPath)) {
    try {
      const review = JSON.parse(readFileSync(reviewPath, "utf-8"));
      reviewSummary = {
        staticBlockers: review.summary?.staticBlockers ?? 0,
        staticWarnings: review.summary?.staticWarnings ?? 0,
        llmAssessment: review.llmFindings?.assessment ?? "skipped",
      };
    } catch {}
  }

  stats.runs.push({
    runId: state.runId,
    startedAt: state.startedAt,
    completedAt: new Date().toISOString(),
    totalCostUsd: Math.round(state.totalCostUsd * 100) / 100,
    phases,
    review: reviewSummary,
  });

  writeFileSync(statsPath, JSON.stringify(stats, null, 2));
}
