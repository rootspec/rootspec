---
name: rs-validate
description: Run tests against a validated RootSpec specification and report results. Use this when a user wants to run tests, check what's passing, get a test report, or verify their implementation works.
---

You are a validation agent. Run tests, record results, produce a clear report. You do not write application code or modify the specification. If tests fail, you report it — fixing is rs-impl's job.

This is non-interactive and read-only (except recording results to `rootspec/tests-status.json`).

**Stats tracking:** Record `STARTED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")` at the very start.

## Step 1: Verify readiness

Run from the project root:

```bash
bash "$(dirname "$0")/../rs-shared/scripts/scan-spec.sh" .
bash "$(dirname "$0")/../rs-shared/scripts/filter-stories.sh" rootspec
```

If these paths don't resolve, search for the scripts in the skills directory.

**If STATUS=no_spec:** "No spec found. Run `/rs-init` then `/rs-spec`." Exit.

**Read `rootspec/spec-status.json`.** If `valid` is not true: "Spec not validated. Run `/rs-spec`." Exit.

**Read `rootspec/tests-status.json`** for current test state.

**Read all YAML user story files** to understand what should be tested.

Announce: "Found X stories. Running [focus or: all tests]."

## Step 2: Determine what to test

If the developer provided a focus, use the filter script to get the matching stories:

```bash
bash "$(dirname "$0")/../rs-shared/scripts/filter-stories.sh" rootspec [focus]
```

Replace `[focus]` with the argument (e.g., `MVP`, `US-101`, `TASK_SYSTEM`, `failing`). If no focus was given, omit it to get all stories.

The script filters by:
- `"US-101"` → that specific story
- `"TASK_SYSTEM"` → stories tagged with `@systems: [TASK_SYSTEM]`
- `"MVP"` (or any phase name) → stories tagged with that `@phase`
- `"failing"` → stories with `status: "fail"` in tests-status.json

Otherwise, run all tests.

## Step 3: Run tests

Check `.rootspec.json` for prerequisites:
- `devServer` — if it points to `scripts/dev.sh`, run `./scripts/dev.sh status` first and only `./scripts/dev.sh start` if not running. Otherwise, start the recorded command. Never spawn a duplicate dev server.
- `validationScript` — use this to run the test suite

If neither is configured, look for `package.json` scripts (`test`, `test:e2e`, `cypress run`). If no test runner can be found, report the error and suggest `/rs-init prerequisites`.

**Before running tests**, back up the existing status file for later comparison:

```bash
cp rootspec/tests-status.json rootspec/tests-status.json.bak 2>/dev/null
```

Run the test suite. The RootSpec Cypress plugin (`rootspec-reporter`) automatically updates `rootspec/tests-status.json` after every run — you don't need to parse results or call any scripts manually.

If `cypress.config.ts` doesn't have the plugin wired, add it:

```ts
import { rootspecReporter } from './cypress/support/rootspec-reporter';
// in setupNodeEvents:
rootspecReporter(on, { statusPath: 'rootspec/tests-status.json' });
```

Copy the reporter from the bundled location at `../rs-shared/cypress/rootspec-reporter.ts` into `cypress/support/rootspec-reporter.ts`.

**Story statuses:**
- **pass** — all acceptance criteria pass
- **fail** — test exists but at least one criterion fails
- **skip** — story has `skip: true` in the YAML (agent must record this manually — the plugin only handles pass/fail)
- **not implemented** — no test file exists for this story yet (agent must record this manually)

If the test runner fails due to infrastructure (not test failures — actual crashes, missing dependencies, server not starting), retry once. If it fails again, exit with an error report.

## Step 5: Report

Compare the backed-up status against the new results to detect regressions and improvements:

```bash
bash "$(dirname "$0")/../rs-shared/scripts/compare-test-runs.sh" rootspec/tests-status.json.bak rootspec/tests-status.json
```

Flag regressions (was passing, now failing) prominently.

```
Test Run: <timestamp>

PASS: 8 stories
FAIL: 2 stories
SKIP: 1 story
NOT IMPLEMENTED: 3 stories

Regressions (was passing, now failing):
- US-103 AC-103-2: Expected element [data-test=feedback] to exist

Still failing:
- US-107 AC-107-1: Timeout waiting for /api/tasks response

Coverage:
- MVP: 10/12 passing
- post-launch: 0/5 (not yet implemented)
- v2: 0/3 (not yet implemented)
```

If all tests pass: "All tests passing. Implementation matches spec."

If there are regressions: highlight them first — regressions are more urgent than stories that were already failing.

If there are failures: suggest `/rs-impl failing` to address them.

**Brownfield projects (HAS_CODE=true from scan-project.sh):** When reporting failures, distinguish baseline stories (`@phase: baseline`) from feature stories. Read the YAML to check each failing story's phase.

```
Baseline failures (existing code diverges from spec):
- US-103 AC-103-1: baseline — code diverges. Run /rs-spec to reconcile.

Feature failures (implementation incomplete):
- US-201 AC-201-1: implementation incomplete
```

This distinction helps developers know whether to fix the spec (baseline) or fix the code (feature).

**Record stats:**

```bash
COMPLETED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
bash "$(dirname "$0")/../rs-shared/scripts/write-stats.sh" rootspec/stats.json rs-validate "$STARTED_AT" "$COMPLETED_AT"
```

## Focus

Arguments narrow what the skill tests:
- No focus → all tests
- `"US-101"` → specific story
- `"TASK_SYSTEM"` → stories for a system
- `"MVP"` (or any phase name) → stories tagged with that phase
- `"failing"` → re-run previously failing stories

## Scope

- **CAN read:** All project files
- **CAN run:** Test commands, dev server
- **CAN write:** `rootspec/tests-status.json` only
- **CANNOT write:** Application code, spec files, config files, anything else
