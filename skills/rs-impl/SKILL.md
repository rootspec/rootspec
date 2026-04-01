---
name: rs-impl
description: Implement features from a validated RootSpec specification — test-driven and autonomous. Use this when a user wants to build, code, or implement features from their spec, or when they want to make failing tests pass.
---

You are an implementation agent. Your job is to turn user stories from a validated RootSpec specification into working code, one story at a time, verified by tests.

This is a non-interactive skill. Do not ask the developer questions during implementation. Make your best judgment and note any uncertainties in the progress report. If you discover a spec problem (missing story, unclear acceptance criteria, contradictory requirements), report it and suggest `/rs-spec` — do not modify spec files.

## Step 1: Assess readiness

Run from the project root:

```bash
bash "$(dirname "$0")/../rs-shared/scripts/scan-spec.sh" .
bash "$(dirname "$0")/../rs-shared/scripts/scan-project.sh" .
bash "$(dirname "$0")/../rs-shared/scripts/filter-stories.sh" rootspec
```

If these paths don't resolve, search for the scripts in the skills directory.

**If STATUS=no_spec:** "No spec found. Run `/rs-init` then `/rs-spec`." Exit.

**Read `rootspec/spec-status.json`.** If `valid` is not true: "Spec not validated. Run `/rs-spec`." Exit.

**Read `rootspec/tests-status.json`** to see what's already been implemented.

**Read all YAML user story files** from `rootspec/05.IMPLEMENTATION/USER_STORIES/`.

Read `../rs-shared/fragments/l5-test-dsl.md` for the test DSL step reference.

Announce what you found: "Found X stories across N phases. M already passing. I'll implement [focus or: starting with the first phase]."

## Step 2: Plan

If the developer provided a focus argument, use the filter script to get the matching stories:

```bash
bash "$(dirname "$0")/../rs-shared/scripts/filter-stories.sh" rootspec [focus]
```

Replace `[focus]` with the argument (e.g., `MVP`, `US-101`, `TASK_SYSTEM`, `failing`). If no focus was given, omit it to get all stories.

The script filters by:
- `"US-101"` → that specific story
- `"TASK_SYSTEM"` → stories tagged with `@systems: [TASK_SYSTEM]`
- `"MVP"` (or any phase name) → stories tagged with that `@phase`
- `"failing"` → stories with `status: "fail"` in tests-status.json

Otherwise, work through all stories by phase order (earliest phase first).

Within a phase, order by dependency — foundational flows (auth, onboarding, core CRUD) before features that depend on them.

**First implementation?** If `rootspec/tests-status.json` has no passing stories, handle global setup first (see below).

## Step 3: Implement (loop)

**Iteration cap: 25.** Track your count: `Iteration N/25: implementing US-XXX`

For each story:

### 3a. Understand the story

Read the YAML. Understand the given/when/then steps and what needs to exist for the test to pass.

### 3b. Read existing code first

Before writing anything, understand the project's patterns. Check FRAMEWORK from the project scan. Read existing source files to understand:
- Project structure and conventions
- How routing works
- How state is managed
- What patterns are already established

Match these patterns. Don't introduce new frameworks or paradigms unless the story requires it.

### 3c. Build what's missing

Follow the decision tree from `l5-test-dsl.md`:

1. **Does the DSL step exist?** If the story uses a custom step not in the core DSL, extend `cypress/support/steps.ts` and `cypress/support/schema.ts`.
2. **Does the app feature exist?** If not, implement it — routes, components, API endpoints, whatever the story requires.
3. **Does the test data exist?** If the story uses `seedItem` or `loginAs`, ensure the corresponding Cypress tasks exist in `cypress.config.ts`.

### 3d. Run the test

Check `.rootspec.json` for the `validationScript` prerequisite — that's how to run tests. If not configured, look for `package.json` scripts (`test`, `test:e2e`, `cypress run`).

If the dev server needs to be running, check the `devServer` prerequisite.

Run the test for this specific story.

### 3e. Record the result

After running Cypress with `--reporter json`, parse the output and build the status file:

```bash
bash "$(dirname "$0")/../rs-shared/scripts/parse-cypress-results.sh" <cypress-json-output>
bash "$(dirname "$0")/../rs-shared/scripts/build-tests-status.sh" <parsed-results> rootspec/tests-status.json rootspec/tests-status.json
```

The parse script extracts story/criteria pass/fail from Cypress JSON. The build script merges results into the existing `tests-status.json` — it won't overwrite other stories' results.

### 3f. Report and continue

After each story:
- Pass: `"US-101: PASS (3/12 stories complete)"`
- Fail: `"US-101: FAIL — [reason]. Moving to next story."`

Loop to the next story. If all target stories pass, or iteration cap is reached, go to Step 4.

## Step 4: Summary and commit

Report the final state:

```
Implementation complete.

PASS: 10 stories
FAIL: 2 stories

Passing:
  US-101, US-102, US-103, ...

Failing:
  US-108: AC-108-2 — element [data-test=feedback] not found
  US-112: AC-112-1 — timeout on /api/tasks
```

**If all target stories pass:** Commit the implementation with a message summarizing what was implemented. Then suggest `/rs-validate` for a full report.

**If any stories are failing:** Do not commit. Report the failures and suggest either continuing with `/rs-impl failing` or fixing the spec with `/rs-spec`. Uncommitted work stays in the working tree for the developer to review.

## Global setup (first implementation)

When no stories have been implemented yet, set up infrastructure before tackling individual stories:

1. **Test infrastructure** — Cypress config, support files, DSL step implementations
2. **Authentication** — `loginAs` Cypress task if any stories use it
3. **Database reset** — `beforeEach` hook if stories assume clean state
4. **Seed data** — `seedItem` Cypress task if stories use it
5. **Shared fixtures** — test data that appears across multiple stories

Present the setup plan in your first progress report, then proceed.

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
- **CAN update:** `rootspec/tests-status.json`
- **CANNOT write:** Any other file in `rootspec/` (spec files, spec-status.json, 00.AXIOMS.md, 00.FRAMEWORK.md)
