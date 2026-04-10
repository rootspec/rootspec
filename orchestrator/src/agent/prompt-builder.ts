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

  // When impl re-runs after review found blockers, inject the review findings
  if (phase === "impl" && state.gateResults.review && !state.gateResults.review.passed) {
    lines.push("## Review Feedback — Fix These Issues");
    lines.push("");
    lines.push("The review phase found quality issues in your implementation.");
    lines.push("Your job this cycle is to fix ONLY these issues — do NOT re-implement everything.");
    lines.push("Make targeted fixes to the specific files and lines identified.");
    lines.push("");
    lines.push("Read `rootspec/review-status.json` for the full structured issue list.");
    lines.push("Focus on issues with severity `blocker` — these must be fixed.");
    lines.push("Warnings are nice-to-fix but not required.");
    lines.push("");
    lines.push("Common fix patterns:");
    lines.push("- **placeholder_text**: Replace literal text with actual icons/symbols (→ not 'Next Arrow')");
    lines.push("- **broken_links**: Fix URLs to match SEED.md or remove hallucinated links");
    lines.push("- **impl_error**: Update copy to match what SEED.md/spec says");
    lines.push("- **visual_quality**: Fix CSS/layout issues visible in screenshots");
    lines.push("- **accessibility**: Add alt text, semantic HTML, ARIA labels");
    lines.push("");
    lines.push("After fixing, run the full test suite to confirm nothing broke.");
    lines.push("");
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

export function buildPrompt(
  phase: Phase,
  config: OrchestratorConfig,
  state: OrchestratorState
): string {
  const skillMd = readSkillMd(config.rootspecDir, phase);
  const context = phaseContext(phase, state);
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
    parts.push("- Review the IMPLEMENTATION, not the spec. The spec is truth.");
    parts.push("- Read each passing story's YAML to understand what was specified.");
    parts.push("- Read each story's screenshots to see what was actually built.");
    parts.push("- Judge: did impl faithfully deliver what the story specifies?");
    parts.push("- Check source files for broken links, placeholder text, accessibility.");
    parts.push("- Write rootspec/review-status.json with categorized issues and quality score.");
    parts.push("- Do NOT modify application code, spec files, or test files.");
    parts.push("");
  }

  // Invoke the skill
  parts.push(`Now execute /rs-${phase}.`);

  return parts.join("\n");
}
