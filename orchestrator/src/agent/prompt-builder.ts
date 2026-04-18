import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import type { Phase } from "../types.js";
import type { OrchestratorConfig } from "../config.js";
import type { OrchestratorState } from "../types.js";
import { detectDeployBase } from "../quality-gates/static-review.js";

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

function categoryFixHint(category: string): string | null {
  switch (category) {
    case "deploy_path":
      return "The listed file is the symptom (built HTML), not the root cause. Find the framework config for this project and set its base path option — svelte.config.js `kit.paths.base`, astro.config.mjs `base`, next.config.js `basePath`, vite.config.ts `base`, etc. Also update `cypress.config.ts` `baseUrl` to include the subpath, or tests will hit the wrong route.";
    case "placeholder_text":
      return "Replace the placeholder with real content from SEED.md / the spec, or remove the element entirely if it's unused.";
    case "template_syntax":
      return "Unrendered template syntax in the build output means the view isn't being processed — check the component/page responsible for this route and ensure data is wired correctly.";
    case "literal_icon":
      return "Replace the literal `[icon]` text with a real icon (SVG, icon-font class, or component) or remove it.";
    case "broken_link":
      return "Either fix the URL to point at a real resource, or remove the link.";
    case "network_404":
    case "runtime_error":
      return "Runtime signal from Cypress — trace to the component/route that issued the request or threw the error.";
    default:
      return null;
  }
}

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
          parts.push(`**${b.id}** [${b.category}] — ${b.message}`);
          parts.push(`- File: \`${b.file}\``);
          if (b.excerpt) parts.push(`- Excerpt: \`${b.excerpt}\``);
          const hint = categoryFixHint(b.category as string);
          if (hint) parts.push(`- Fix hint: ${hint}`);
          parts.push("");
        }
      }

      if (warnings.length > 0) {
        parts.push("### WARNINGS — Fix if time permits\n");
        for (const w of warnings) {
          parts.push(`**${w.id}** [${w.category}] — ${w.message}`);
          parts.push(`- File: \`${w.file}\``);
          if (w.excerpt) parts.push(`- Excerpt: \`${w.excerpt}\``);
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
    const deployBase = detectDeployBase(config.projectDir);
    if (deployBase) {
      parts.push(`- **Deploy subpath declared:** \`${deployBase}\`. Configure the framework's base path setting to match (svelte.config.js \`kit.paths.base\`, astro.config.mjs \`base\`, next.config.js \`basePath\`, vite.config.ts \`base\`, etc. — whichever framework you chose). Update \`cypress.config.ts\` \`baseUrl\` to include the subpath so tests hit the real routes.`);
    }
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
    parts.push("- Static review has ALREADY run. Its findings are authoritative and live in rootspec/review-status.json under `summary` and `issues` — DO NOT overwrite them.");
    parts.push("- Your job: read the curated screenshots listed in `llmInputs.screenshots` and render an advisory visual assessment.");
    parts.push("- Write ONLY under the `llmFindings` key: `{ assessment: 'clean'|'needs_review'|'broken', observations: string[] }`.");
    parts.push("- 1–5 observations max. Each observation a single sentence. No quality score.");
    parts.push("- Do NOT modify application code, spec files, or test files.");
    parts.push("");
  }

  // Invoke the skill
  parts.push(`Now execute /rs-${phase}.`);

  return parts.join("\n");
}
