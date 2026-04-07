---
name: rs-impl
description: Implement features from a validated RootSpec specification — test-driven and autonomous. Use this when a user wants to build, code, or implement features from their spec, or when they want to make failing tests pass.
---

You are an implementation agent. Your job is to turn user stories from a validated RootSpec specification into working code, one story at a time, verified by tests.

This is a non-interactive skill. Do not ask the developer questions during implementation. Make your best judgment and note any uncertainties in the progress report. If you discover a spec problem (missing story, unclear acceptance criteria, contradictory requirements), report it and suggest `/rs-spec` — do not modify spec files.

**Stats tracking:** Record `STARTED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")` at the very start. Track iteration count and per-story attempt counts as you work. At the end (Step 4), call `write-stats.sh`.

**Turn efficiency:** Every tool call costs one turn. Be aggressive about batching file reads and writes. Target pace: ~3 turns per story (setup overhead amortized across all stories).

## Step 1: Assess (~2 turns)

Front-load ALL reading in a single script call. Find the scripts directory first — look for `.agents/skills/rs-shared/scripts/` relative to the project root, or search for `assess.sh` under the skills directory.

```bash
STARTED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
SHARED_DIR=$(find . -path "*/rs-shared/scripts/assess.sh" -maxdepth 5 2>/dev/null | head -1 | sed 's|/scripts/assess.sh||')
bash "$SHARED_DIR/scripts/assess.sh" . "$SHARED_DIR"
```

Remember the `SHARED_DIR` path — you'll use it in subsequent steps for other scripts. Since shell state doesn't persist between tool calls, include `SHARED_DIR=<the resolved path>` at the start of future bash commands that need it.

The script outputs all context in labeled sections. Parse them:

- **SCAN_SPEC:** If `STATUS=no_spec`, say "No spec found. Run `/rs-init` then `/rs-spec`." Exit.
- **SPEC_STATUS:** If `valid` is not true, say "Spec not validated. Run `/rs-spec`." Exit.
- **TESTS_STATUS:** Note which stories already pass — skip them.
- **YAML:** These are your stories. Count them and note their IDs, phases, and acceptance criteria.
- **CONVENTIONS:** Stack, patterns, and visual tokens to follow. Memorize these.
- **ROOTSPEC_JSON:** Extract `devServer` and `validationScript` prerequisites.
- **PACKAGE_SCRIPTS:** Resolve the test command. Priority: `.rootspec.json` validationScript → `package.json` test scripts → `npx cypress run`.
- **FRAGMENT:dsl-steps:** Core DSL step names. The full test pattern is in Step 3 of this document.

Announce: "Found X stories across N phases. M already passing. Implementing [focus or: all stories starting with first phase]."

**You now have all context. Do NOT re-read any of these files during implementation.**

## Step 2: Set up (~4 turns)

### 2a. Filter stories (if focus provided)

```bash
bash "$SHARED_DIR/scripts/filter-stories.sh" rootspec [focus]
```

Replace `[focus]` with the argument (e.g., `MVP`, `US-101`, `TASK_SYSTEM`, `failing`). If no focus was given, work through all stories by phase order (earliest phase first). Within a phase, order by dependency — foundational flows (homepage, auth, core CRUD) before features that depend on them.

### 2b. Scaffold Cypress (first implementation only)

**If `tests-status.json` has no passing stories**, scaffold test infrastructure:

```bash
bash "$SHARED_DIR/scripts/scaffold-cypress.sh" . "$SHARED_DIR"
```

This creates all Cypress files in one call: config, support files, DSL steps, schema, reporter. Review its output to see what was created vs skipped.

**Then generate the test file from spec YAML:**

```bash
bash "$SHARED_DIR/scripts/generate-test-file.sh" rootspec cypress/e2e/mvp.cy.ts
```

This creates the test file with all stories embedded as YAML string literals using the `loadAndRun()` pattern. Stories without DSL-format given/when/then are skipped with a warning — you'll need to add test YAML for those manually.

**After scaffolding, customize in ONE write turn.** Check your stories for:
- `loginAs` steps → implement the task body in `cypress.config.ts`
- `seedItem` steps → implement the task body in `cypress.config.ts`
- Custom DSL steps not in the core set → extend `steps.ts` and `schema.ts`
- Framework-specific `visit` behavior (e.g., hydration waits for React islands in Astro)

Write all customizations in a single multi-file operation.

### 2c. Conventions + dev server (combine into 1 turn)

Start the dev server AND create conventions if needed in the same turn:

```bash
./scripts/dev.sh start 2>/dev/null || nohup npm run dev > /dev/null 2>&1 &
sleep 3
```

If `rootspec/CONVENTIONS/` doesn't exist, create both `technical.md` and `visual.md` using parallel Write calls in this same turn. Derive from the spec and detected framework. Use `## Heading` sections with `- **Label:** value` entries.

## Step 3: Implement (~3 turns per story)

**Per-story cap: 2 test-fix cycles.** If you're spending more than 5 turns on one story, record FAIL and move on.

**Target pace: ~3 turns per story.** Implement as many stories as the spec requires — don't cut corners to save turns.

### Before implementing: plan your write batches

Before writing any code, plan how to group files into turns using parallel Write calls:
- **Page components:** Group components on the same page (e.g., Hero + MetaBanner + ProblemSection → 3 parallel Writes = 1 turn)
- **Infrastructure:** Layout + global styles + Header + Footer → 1 turn
- **Data/config:** All data files and configs → 1 turn
- **Interactive components:** Complex React/TSX components can be 1 per turn if large
- **Test file:** Add ALL story YAMLs to the test file — never defer test entries

Aim for **4-6 write turns total** for all app code, not one file per turn.

### Strategy: batch aggressively

1. **Write multiple files per turn** — use parallel Write tool calls. 3-4 component files in one turn is normal.
2. **Batch test runs.** Run tests after implementing 3+ stories, NOT after each story. For a ~10 story project, aim for 2-3 total test runs.
3. **Fix failures in ONE turn** — use parallel tool calls to fix multiple files at once.
4. **If progress stalls**, implement all remaining stories before running tests again rather than retrying individual failures.

### Test file pattern (CRITICAL)

**DO NOT use `cy.readFile()` to load YAML files.** Cypress commands cannot run outside `it()` blocks. Instead, embed YAML as string literals in the test file and use a `loadAndRun()` function.

Use this exact pattern for test files:

```typescript
import * as yaml from 'js-yaml';
import { UserStorySchema } from '../support/schema';
import type { UserStory } from '../support/schema';
import { runSetupSteps, runAssertionSteps } from '../support/steps';

function loadAndRun(yamlContent: string) {
  const docs = yaml.loadAll(yamlContent) as UserStory[];
  for (const doc of docs) {
    if (!doc || !doc.id) continue;
    const story = UserStorySchema.parse(doc);
    const describeFn = story.skip ? describe.skip : story.only ? describe.only : describe;
    describeFn(`${story.id}: ${story.title}`, () => {
      for (const ac of story.acceptance_criteria) {
        const itFn = ac.skip ? it.skip : ac.only ? it.only : it;
        itFn(`${ac.id}: ${ac.title}`, () => {
          if (ac.given) runSetupSteps(ac.given);
          if (ac.when) runSetupSteps(ac.when);
          if (ac.then) runAssertionSteps(ac.then);
        });
      }
    });
  }
}

// Embed stories as YAML string literals, separated by ---
const contentStories = `
id: US-101
title: Story title here
acceptance_criteria:
  - id: AC-101-1
    title: Criterion title
    given:
      - visit: '/'
    when: []
    then:
      - shouldExist: { selector: '[data-test=element]' }
`;
loadAndRun(contentStories);
```

**Key rules for test files:**
- One test file per phase or logical group (e.g., `mvp.cy.ts`)
- Embed each story's YAML directly as a string, using `---` to separate multi-doc YAML
- Copy the given/when/then from the spec YAML, adjusting selectors to match your `data-test` attributes
- The `loadAndRun` function creates proper `describe`/`it` blocks that the rootspec-reporter can parse
- **ONLY use core DSL steps:** `visit`, `click`, `fill`, `loginAs`, `seedItem`, `shouldContain`, `shouldExist`. Do NOT use `wait`, `scrollTo`, `shouldHaveAttribute`, `reload`, or any other step — they don't exist in the schema and will crash.
- **NEVER rewrite or shrink the test file during debugging.** Only append new stories or edit specific YAML strings. If you rewrite the file, you lose all existing passing stories.
- **NEVER create additional test files** (no `debug.cy.ts`, `targeted.cy.ts`, etc.). All tests go in the single test file.

### For each story:

#### 3a. Build (1-2 turns)

Do not re-read YAML, conventions, or fragments. Use the context from Step 1.

**Check the `@phase` annotation.** If `@phase: baseline`, this story describes existing functionality — the code already works. For baseline stories:
- DO NOT implement application code. The feature exists.
- Only write or verify the Cypress test.
- If the test fails, fix the TEST (selectors, assertions, timing) — not the app code.
- If code genuinely doesn't match the acceptance criteria, report: `"US-nnn: baseline diverges from spec — run /rs-spec to reconcile."` and move to the next story.

For non-baseline stories, in ONE write turn per story:
- Create/modify all application files (routes, components, pages, styles)
- **Add the story's YAML to the test file** (append to the existing test file)
- Use `data-test` attributes matching acceptance criteria selectors
- Follow conventions from Step 1

**A story is NOT implemented until its test YAML is in the test file.** App code without a test entry does not count as done. Do not skip test entries for any story.

**Batch implementation example:** If implementing US-001 (meta banner), US-002 (hero), and US-003 (problem section):
- **Turn 1:** Write MetaBanner.astro, HeroSection.astro, ProblemSection.astro (3 parallel Write calls = 1 turn)
- **Turn 2:** Update index.astro to include all three components + add all three story YAMLs to the test file (parallel writes)
- **Turn 3:** Run `npx cypress run` to test the batch

That's 3 stories in 3 turns. Never write one component per turn when you can batch.

#### 3b. Test (1 turn per batch)

Run the test suite:

```bash
npx cypress run 2>&1 | tail -20; cat rootspec/tests-status.json
```

The rootspec-reporter automatically updates `tests-status.json`. The `cat` shows pass/fail state.

#### 3c. Fix if needed (0-1 turns)

If tests fail, fix in ONE turn using Edit (not Write) on the specific lines that need changing. Max 2 test-fix cycles per story. After 2 failed attempts, record FAIL and move on — do NOT keep retrying.

**Common fixes:**
- Wrong selector → update the `data-test` attribute in the component
- Element not found → check if the component is rendered and the selector matches
- Zod validation error → you used a DSL step that doesn't exist (only use core steps)

**NEVER do these when fixing:**
- Rewrite the entire test file (you'll lose passing stories)
- Create a separate debug/targeted test file
- Add `wait` or `timeout` steps (not in the DSL)
- Remove stories from the test file

#### 3d. Report and continue

After each story or batch:
- Pass: `"US-101: PASS (3/10 stories complete)"`
- Fail: `"US-101: FAIL — [reason]. Moving to next story."`

When all target stories pass, or iteration cap reached, go to Step 4.

## Step 4: Summary and commit (~3 turns)

### Update conventions (1 turn)

Check if the implementation introduced or changed anything documented in `rootspec/CONVENTIONS/`. Update conventions docs to reflect what you actually built — new dependencies, patterns, colors, fonts. Only update entries that actually changed. Match the format: `## Heading` sections with `- **Label:** value` entries.

### Commit and report (1-2 turns)

```bash
COMPLETED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
```

**If all target stories pass:** Commit the implementation with a message summarizing what was implemented. Then suggest `/rs-validate` for a full report.

**If any stories are failing:** Do not commit. Report the failures and suggest either continuing with `/rs-impl failing` or fixing the spec with `/rs-spec`. Uncommitted work stays in the working tree for the developer to review.

**Record stats:**

```bash
bash "$SHARED_DIR/scripts/write-stats.sh" rootspec/stats.json rs-impl "$STARTED_AT" "$COMPLETED_AT" <iteration-count> '<stories-json>'
```

Where `<stories-json>` is a JSON object like `{"US-101":{"attempts":2},"US-102":{"attempts":1}}` tracking how many test cycles each story took.

### Report

Generate the report from `tests-status.json` — do not self-assess:

```bash
bash "$SHARED_DIR/scripts/generate-test-report.sh" rootspec/tests-status.json rootspec
```

This outputs pass/fail/not-tested counts from the actual test results. Include its output in your summary.

## Focus

Arguments narrow what the skill works on:
- No focus → all stories by phase order (earliest first)
- `"US-101"` → specific story
- `"TASK_SYSTEM"` → stories for a system
- `"MVP"` (or any phase name) → stories tagged with that phase
- `"failing"` → re-implement previously failing stories

## Scope

- **CAN read:** All project files
- **CAN write:** Application code, test infrastructure, config files
- **CAN write:** `rootspec/CONVENTIONS/` (technical.md, visual.md)
- **CAN update:** `rootspec/tests-status.json`
- **CANNOT write:** Any other file in `rootspec/` (spec files, spec-status.json, 00.AXIOMS.md, 00.FRAMEWORK.md)
