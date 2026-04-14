import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import type { Phase } from "../types.js";
import type { OrchestratorConfig } from "../config.js";
import type { OrchestratorState } from "../types.js";

const SKILL_DIRS: Record<Phase, string> = {
  init: "rs-init",
  spec: "rs-spec",
  impl: "rs-impl",
  validate: "rs-validate",
  review: "rs-review",
};

function resolveSharedDir(config: OrchestratorConfig): string | null {
  // Check project's installed skills first, then framework repo
  const paths = [
    join(config.projectDir, ".agents", "skills", "rs-shared"),
    join(config.rootspecDir, "skills", "rs-shared"),
  ];
  for (const p of paths) {
    const resolved = resolve(p);
    if (existsSync(resolved)) return resolved;
  }
  return null;
}

function readSkillMd(rootspecDir: string, phase: Phase): string {
  const skillDir = SKILL_DIRS[phase];
  // Try framework repo first, then project's installed skills
  const paths = [
    join(rootspecDir, "skills", skillDir, "SKILL.md"),
    join(".agents", "skills", skillDir, "SKILL.md"),
  ];
  for (const p of paths) {
    const resolved = resolve(p);
    if (existsSync(resolved)) {
      return readFileSync(resolved, "utf-8");
    }
  }
  throw new Error(
    `SKILL.md not found for ${phase}. Searched: ${paths.join(", ")}`
  );
}

function phaseContext(
  phase: Phase,
  state: OrchestratorState
): string {
  const lines: string[] = [];

  if (phase === "spec" && state.completedPhases.includes("init")) {
    lines.push("## Prior Phase: Init");
    lines.push("Init completed successfully. The rootspec/ directory exists with framework files.");
    lines.push("Prerequisites (dev server, test runner) are configured in .rootspec.json.");
    lines.push("");
  }

  if (phase === "impl" && state.completedPhases.includes("spec")) {
    lines.push("## Prior Phase: Spec");
    lines.push("Specification has been created and validated (spec-status.json valid=true).");
    lines.push("All five levels (L1-L5) are written. User stories exist in rootspec/05.IMPLEMENTATION/USER_STORIES/.");
    lines.push("You will read the spec via assess.sh — do not re-read files already covered by the assessment.");
    lines.push("");
  }

  if (phase === "validate" && state.completedPhases.includes("impl")) {
    lines.push("## Prior Phase: Impl");
    lines.push("Implementation phase completed. Code and tests have been written.");
    const implResult = state.phaseResults.impl;
    if (implResult?.errors.length) {
      lines.push(`Note: impl had some errors: ${implResult.errors.join("; ")}`);
    }
    lines.push("");
  }

  // When impl re-runs after review found blockers, inject the review findings.
  // This is handled specially in buildPrompt — we return early with a focused
  // fix prompt instead of the full SKILL.md. Set a flag here for buildPrompt.
  if (phase === "impl" && state.gateResults.review && !state.gateResults.review.passed) {
    lines.push("__REVIEW_FIX_MODE__");
  }

  if (phase === "review" && state.completedPhases.includes("validate")) {
    lines.push("## Prior Phase: Validate");
    lines.push("All tests pass. Your job is to review the implementation quality.");
    lines.push("Screenshots are available in cypress/screenshots/ for visual inspection.");
    lines.push("");
  }

  return lines.join("\n");
}

const ORCHESTRATOR_PREAMBLE = `## Orchestrator Mode

You are running inside an automated orchestrator. No human is present.
- Do NOT ask questions or wait for approval.
- Do NOT use AskUserQuestion.
- Execute fully and autonomously.
- Write files directly without presenting drafts.
- If you encounter ambiguity, make your best judgment and proceed.
`;

function buildReviewFixPrompt(
  config: OrchestratorConfig,
  state: OrchestratorState
): string {
  const parts: string[] = [ORCHESTRATOR_PREAMBLE];

  parts.push("## Review Fix Mode");
  parts.push("");
  parts.push("The review phase found quality issues. Your ONLY job is to fix these issues.");
  parts.push("Do NOT re-assess stories, re-scaffold, or re-implement from scratch.");
  parts.push("Make targeted edits to the specific files listed below, then run tests.");
  parts.push("");

  // Read review-status.json and inject blocker details directly
  const reviewPath = join(config.projectDir, "rootspec", "review-status.json");
  if (existsSync(reviewPath)) {
    try {
      const review = JSON.parse(readFileSync(reviewPath, "utf-8"));
      const blockers = (review.issues ?? []).filter(
        (i: Record<string, unknown>) => i.severity === "blocker"
      );
      const warnings = (review.issues ?? []).filter(
        (i: Record<string, unknown>) => i.severity === "warning"
      );

      if (blockers.length > 0) {
        parts.push("### BLOCKERS — Must Fix\n");
        for (const b of blockers) {
          parts.push(`**${b.id}** — ${b.description}`);
          parts.push(`- File: \`${b.file}\` line ${b.line}`);
          if (b.expected) parts.push(`- Expected: ${b.expected}`);
          if (b.actual) parts.push(`- Actual: ${b.actual}`);
          if (b.suggestion) parts.push(`- Fix: ${b.suggestion}`);
          parts.push("");
        }
      }

      if (warnings.length > 0) {
        parts.push("### WARNINGS — Fix if time permits\n");
        for (const w of warnings) {
          parts.push(`**${w.id}** — ${w.description}`);
          parts.push(`- File: \`${w.file}\` line ${w.line}`);
          if (w.suggestion) parts.push(`- Fix: ${w.suggestion}`);
          parts.push("");
        }
      }
    } catch {
      parts.push("Could not read review-status.json — check the file manually.");
      parts.push("");
    }
  }

  parts.push("### Instructions");
  parts.push("");
  parts.push("1. Read each file mentioned above");
  parts.push("2. Make the specific fix described for each blocker");
  parts.push("3. Run `npx cypress run --spec cypress/e2e/mvp.cy.ts` to confirm tests still pass");
  parts.push("4. If tests break, fix the test or revert the change — never leave tests failing");
  parts.push("");

  return parts.join("\n");
}

export function buildPrompt(
  phase: Phase,
  config: OrchestratorConfig,
  state: OrchestratorState
): string {
  const context = phaseContext(phase, state);

  // Review-fix mode: skip SKILL.md entirely, use focused fix prompt
  if (context.includes("__REVIEW_FIX_MODE__")) {
    return buildReviewFixPrompt(config, state);
  }

  const skillMd = readSkillMd(config.rootspecDir, phase);
  const parts: string[] = [ORCHESTRATOR_PREAMBLE];

  // Phase-specific seed content
  if (phase === "init" || phase === "spec") {
    parts.push("## Product Vision (SEED.md)\n");
    parts.push(config.seedContent);
    parts.push("");
  }

  // Prior phase context
  if (context) {
    parts.push(context);
  }

  // Shared scripts path — skills reference these via relative paths
  const sharedScriptsDir = resolveSharedDir(config);
  if (sharedScriptsDir) {
    parts.push("## Shared Scripts Location");
    parts.push(`The RootSpec shared scripts are installed at: ${sharedScriptsDir}`);
    parts.push(`When SKILL.md references \`$(dirname "$0")/../rs-shared/scripts/\`, use this path instead.`);
    parts.push(`Set SHARED_DIR="${sharedScriptsDir}" before running any shared scripts.`);
    parts.push("");
  }

  // The skill instructions
  parts.push("## Skill Instructions\n");
  parts.push(skillMd);
  parts.push("");

  // Phase-specific directives
  if (phase === "spec") {
    parts.push("## Spec Phase Directives");
    parts.push("- Non-interactive mode is active. Skip the interview (Step 3).");
    parts.push("- Draft all levels L1 through L5 directly from the SEED.md content above.");
    parts.push("- After writing, run validation. Fix up to 3 cycles if validation fails.");
    parts.push("- Record spec-status.json when done.");
    parts.push("");
  }

  if (phase === "init") {
    parts.push("## Init Phase Directives");
    parts.push("- Create all prerequisites (dev server script, test runner script, pre-commit hook).");
    parts.push("- If package.json doesn't exist, initialize the project.");
    parts.push("- Do not install dependencies yet — impl phase handles that.");
    parts.push("");
  }

  if (phase === "impl") {
    parts.push("## Impl Phase Directives");
    parts.push("- Implement all stories unless a specific focus was provided.");
    parts.push("- Follow the skill's step sequence exactly.");
    parts.push("- If a story fails after 2 test-fix cycles, move on to the next story.");
    parts.push("");
  }

  if (phase === "validate") {
    parts.push("## Validate Phase Directives");
    parts.push("- Run the full test suite and produce a report.");
    parts.push("- Do NOT modify application code or spec files.");
    parts.push("- Only write to rootspec/tests-status.json.");
    parts.push("");
  }

  if (phase === "review") {
    parts.push("## Review Phase Directives");
    parts.push(`- Turn budget: ~${config.turnLimits[phase]} turns. Plan to finish well within this limit.`);
    parts.push("- Review the IMPLEMENTATION, not the spec. The spec is truth.");
    parts.push("- Group stories by YAML file (section). Review each section as a batch.");
    parts.push("- Read all screenshots for a section in one parallel read, then judge all stories together.");
    parts.push("- Check rendered HTML for broken links, placeholder text, accessibility.");
    parts.push("- Write rootspec/review-status.json INCREMENTALLY — after each section, not just at the end.");
    parts.push("- If you are cut off mid-review, the file must contain valid results for completed sections.");
    parts.push("- Do NOT modify application code, spec files, or test files.");
    parts.push("");
  }

  // Invoke the skill
  parts.push(`Now execute /rs-${phase}.`);

  return parts.join("\n");
}
