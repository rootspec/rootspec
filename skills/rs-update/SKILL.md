---
name: rs-update
description: Upgrade a RootSpec project to the latest framework version — detects version gap, updates framework files, creates missing prerequisites, flags changed prerequisites for reconciliation. Run this after `npx skills add rootspec/rootspec`.
---

You are upgrading a RootSpec project to the latest framework version. Start by telling the developer what you're about to do:

"I'll check your project against the latest framework version and upgrade what's needed — framework files, prerequisites, and config."

## Mode

This skill runs in one of two modes:

- **Interactive (default)** — present plan, wait for confirmation, walk through each violation reconciliation with the developer. Suitable for human-in-the-loop runs.
- **CI** — auto-apply the plan without prompts; per-violation policy is the "recommended" path; the entire run is **transactional** (all pre-flights pass or no files are modified). Suitable for `claude -p` invocations in CI pipelines, scheduled rebuilds, or any unattended context.

Detect CI mode by either signal:

```bash
if [[ "${CI_FOCUS:-}" == "ci" || -n "${ROOTSPEC_CI:-}" || "${CI:-}" == "true" ]]; then
  CI_MODE="true"
else
  CI_MODE="false"
fi
```

(`CI_FOCUS` here means the literal string `ci` was passed as the focus arg to this skill — `/rs-update ci`.) Most CI runners set `CI=true` automatically; users who want CI mode locally can export `ROOTSPEC_CI=1`.

When `CI_MODE=true`, follow the **CI behavior** notes throughout this document and skip all confirmation prompts. When false, follow the interactive flow as written.

## Step 1: Detect the gap

Run the scanning and gap analysis scripts:

```bash
bash "$(dirname "$0")/../rs-shared/scripts/scan-spec.sh" .
bash "$(dirname "$0")/../rs-shared/scripts/gap-analysis.sh" .
```

If these paths don't resolve, find the scripts by searching for `gap-analysis.sh` in the skills directory.

Based on the output:

- **`GAP=no_project`** — No `.rootspec.json` found. Tell the developer: "No RootSpec project found. Run `/rs-init` first." Exit.
- **`GAP=none`** — Already on the latest framework version. **If `RULE_VIOLATIONS` is empty**, tell the developer: "Project is on version X.Y.Z and matches current framework rules. Nothing to update." Exit. **If `RULE_VIOLATIONS` is non-empty**, the project predates one or more framework rules — skip Steps 2-4 and jump to Step 5 (Reconcile framework rules).
- **`GAP=patch|minor|major`** — Upgrade needed. Continue. (Reconciliation in Step 5 still runs after the upgrade.)

## Step 2: Show what changed

Read the update guide:

```
skills/rs-update/UPDATE.md
```

Find it relative to this skill file: `"$(dirname "$0")/UPDATE.md"`

Extract all version sections between PROJECT_VERSION (exclusive) and BUNDLED_VERSION (inclusive). Present:

- The version gap (e.g., "6.2.1 → 6.2.3")
- Summary of each version's changes
- Any manual instructions
- Whether there are breaking changes

## Step 3: Present the upgrade plan

Based on the gap analysis output, present a clear plan:

```
Upgrade plan (6.2.1 → 6.2.3):

Will update:
  - rootspec/00.FRAMEWORK.md (replace with vX.Y.Z)
  - rootspec/00.AXIOMS.md (replace with latest)
  - .rootspec.json version field

Will create (new prerequisites):
  - [list from NEW_PREREQUISITES, if any]

Needs reconciliation (changed prerequisites):
  - [list from CHANGED_PREREQUISITES, if any]

Will NOT touch:
  - Spec files (01.PHILOSOPHY.md through 05.IMPLEMENTATION/)
  - CONVENTIONS/ (owned by /rs-impl)

[If HAS_BREAKING=true]
⚠ Breaking changes detected — see details above.
```

**Interactive:** wait for the developer to confirm. They can exclude items (e.g., "skip dev.sh").

**CI:** skip the confirmation. Run the **transactional pre-flight** (below) before applying anything. If pre-flight fails, abort the whole run with the structured report; otherwise apply the full plan.

### Transactional pre-flight (CI only)

Before writing any files, validate every planned action. If any check fails, emit the abort report (Step 6 CI format) and exit 1 — no partial application.

For each entry in `RULE_VIOLATIONS`, run its pre-flight check:

| Violation | Pre-flight check | Failure → |
|-----------|------------------|-----------|
| `baseUrl_has_path` | Categorize all `visit:` references; relative paths (don't start with `/`) require human disambiguation | Abort |
| `testmode_implicit_dev` | None — auto-pick "preserve current behavior" | Pass |
| `previewServer_missing` | None — additive | Pass |
| `legacy_body_ready` | `cypress/support/app-ready.ts` exists AND does not contain `'cy.appReady() is not implemented'` AND `check-app-ready.sh` passes against it | Abort |
| `shallow_app_ready` | None — auto-rewrite forbidden by framework rule | Abort |
| `dev_cmd_recursive` | `detect-stack.sh` returns non-empty `DEV_CMD` (and `PREVIEW_CMD` if preview also recursive) | Abort if undetected |

Abort messages must include the violation token, what was checked, why it failed, and what the developer needs to do before re-running. Concrete error templates:

- `legacy_body_ready` pre-flight failure:
  > Cannot apply legacy_body_ready migration: cy.appReady() is not implemented
  > (or is shallow). Implement cypress/support/app-ready.ts per
  > CONVENTIONS/technical.md → App Readiness, then re-run /rs-update ci.
  >
  > Wiring safeVisit to a throwing cy.appReady() is a known-broken state we
  > refuse to ship.

- `shallow_app_ready` pre-flight failure: relay the error from `check-app-ready.sh` verbatim, plus a note that CI mode does not auto-rewrite — implement per `CONVENTIONS/technical.md` → App Readiness and re-run.

- `dev_cmd_recursive` pre-flight failure (undetected stack):
  > Cannot reconcile dev_cmd_recursive: detect-stack.sh found no framework
  > (no astro/vite/next/nuxt/etc. config or devDependency). Set DEV_CMD and
  > PREVIEW_CMD in scripts/dev.sh / scripts/preview.sh manually, then re-run.

If any pre-flight fails: write nothing, emit the abort report, exit 1.

## Step 4: Execute the upgrade

For each item in the confirmed plan:

### Framework files

1. **`00.FRAMEWORK.md`** — Read from `../rs-shared/00.FRAMEWORK.md` (relative to this skill), write to `{specDirectory}/00.FRAMEWORK.md`.
2. **`00.AXIOMS.md`** — Read from `../rs-shared/00.AXIOMS.md`, write to `{specDirectory}/00.AXIOMS.md`.

### Config

3. **`.rootspec.json`** — Read the current file, update only the `version` field to BUNDLED_VERSION. Preserve all other fields (specDirectory, prerequisites).

### New prerequisites

4. For each entry in `NEW_PREREQUISITES`: check if the file/config exists in the project. If missing, create it using the same logic as `/rs-init`. Read `../rs-shared/fragments/prerequisites.md` for creation instructions.

### Changed prerequisites

5. For each entry in `CHANGED_PREREQUISITES`: the prerequisite exists but has updated requirements. Show the developer what changed and why (from UPDATE.md). Do NOT auto-overwrite — the developer's copy may have project-specific customizations.

   For template scripts (e.g., `scripts/dev.sh`): show a diff between the project's copy and the bundled template. Let the developer decide how to reconcile.

   For config wiring (e.g., `cypress.config.ts`): describe the required change and let the developer confirm before applying.

### Spec status

6. Run `write-spec-status.sh` to update the version in spec-status.json:

```bash
bash "$(dirname "$0")/../rs-shared/scripts/write-spec-status.sh" {specDirectory}
```

If breaking changes were detected (`HAS_BREAKING=true`): pass `false` as the second argument to mark the spec as invalid, and tell the developer to re-run `/rs-spec`.

```bash
bash "$(dirname "$0")/../rs-shared/scripts/write-spec-status.sh" {specDirectory} false
```

## Step 5: Reconcile framework rules

Run when `RULE_VIOLATIONS` from gap-analysis is non-empty. Each token names a project state that predates a framework rule.

**Interactive:** for each violation, present the fix and ask before applying — none of these auto-rewrite user code. **CI:** apply the recommended path automatically per the policy table below; pre-flight already validated each in Step 3.

### CI policy summary

| Violation | CI behavior |
|-----------|-------------|
| `baseUrl_has_path` | Auto-strip path from `baseUrl`; auto-prefix unprefixed visit references (relative references aborted in pre-flight). |
| `testmode_implicit_dev` | Auto-pick **"preserve current behavior"** — add `"testMode": "dev"`. Conservative — switching to preview can change behavior unexpectedly. Human flips later if desired. |
| `previewServer_missing` | Auto-add `"previewServer": "./scripts/preview.sh"`, copy bundled template if missing. |
| `legacy_body_ready` | **Always full migration.** Pre-flight already verified `cy.appReady()` is implemented. |
| `shallow_app_ready` | **Never auto-rewrite** — pre-flight already aborted the run. (This row exists only as a reminder; CI never reaches Apply phase if this violation is present.) |
| `dev_cmd_recursive` | Auto-populate `DEV_CMD`/`PREVIEW_CMD` from `detect-stack.sh` and overwrite the wrappers with the bundled templates (so the recursion guard ships). Pre-flight already confirmed detection succeeded. |

### `baseUrl_has_path`

The project's `cypress.config.ts` has `baseUrl: 'http://host:port/some/path'`. The framework now requires baseUrl to be host:port only; deploy paths belong in `visit:` targets and `cy.visit()` calls. Concatenation of both produces 404s like `/some/path/some/path/`.

Show the developer:
1. The current baseUrl line and the path that needs stripping (e.g., `/some/path`).
2. A grep over `cypress/` and `rootspec/05.IMPLEMENTATION/USER_STORIES/` for `visit:` and `cy.visit(` references.
3. Categorize the visit references:
   - **Already prefixed** (start with the path) — leave alone; they'll work once baseUrl is stripped.
   - **Unprefixed** (start with `/` but not the path) — offer to prepend the path.
   - **Relative** (don't start with `/`) — flag for manual review; relative paths break under both old and new contracts.

**Interactive:** apply only what the developer confirms. After: re-run `/rs-validate` to confirm.
**CI:** auto-strip the path; auto-prefix unprefixed visit references with the path; relative references already aborted in pre-flight.

### `testmode_implicit_dev`

The project's `scripts/test.sh` starts the dev server, but `.rootspec.json` has no `prerequisites.testMode`. Old projects defaulted to dev-mode E2E implicitly; the framework now defaults to preview mode (built artifact + preview server) for fewer flakes.

Offer two paths:
- **Preserve current behavior** — add `"testMode": "dev"` to `.rootspec.json` `prerequisites`. No other changes. Project keeps running dev-mode E2E by explicit choice.
- **Switch to preview default (recommended)** — copy `scripts/preview.sh` from the bundle (per `previewServer_missing` below), rewrite `scripts/test.sh` to the testMode-aware template (see `bootstrap-init.sh`), add `"testMode": "preview"` and `"previewServer": "./scripts/preview.sh"` to `.rootspec.json`. Verify `npm run build` works before committing.

If the developer picks "switch", note that the project may need an app-readiness implementation (see App Readiness in framework-rules.md) — preview mode exposes hydration timing bugs that dev mode hid.

**CI:** auto-pick "preserve current behavior" (add `"testMode": "dev"`). Switching to preview can change runtime behavior; CI's job is to upgrade safely, not to flip behavioral defaults. Human can switch later.

### `legacy_body_ready`

The project's `cypress/support/steps.ts` waits for `<body data-ready="true">` after every visit (the pre-7.6.0 contract). The framework now expects `cy.appReady()` — project-defined readiness in `cypress/support/app-ready.ts`. Body-level readiness can't observe per-island hydration; on stacks with async islands, tests pass body-ready and then click into inert DOM.

Offer two paths:
- **Stub-only (minimal change)** — scaffold `cypress/support/app-ready.ts` with the throwing default and add `import './app-ready';` to `cypress/support/e2e.ts`. Leave `steps.ts` alone for now. The developer can adopt `cy.appReady()` later, story by story. Existing tests continue to use the body wait.
- **Full migration (recommended)** — same as stub-only, plus rewrite `safeVisit` in `steps.ts`: replace the `cy.get('body').should('have.attr', 'data-ready', 'true')` line with `cy.appReady()`. Add the `awaitReady` step to `runSetupSteps` and the schema. The developer must then implement `cy.appReady()` (a one-line no-op for static sites, or a real check for hydration-heavy sites). Existing pages that set `body[data-ready]` are untouched — they can keep doing so or stop, the framework no longer cares.

If full migration is chosen, advise the developer that the FIRST `npx cypress run` will fail with "cy.appReady() is not implemented" — that's the contract surfacing, not a regression.

**CI:** always full migration. Pre-flight already verified `cy.appReady()` is implemented (not the throwing stub, not shallow against deferred-execution boundaries). Wiring `safeVisit` to a throwing stub is a known-broken state and is rejected at pre-flight, not silently shipped.

### `shallow_app_ready`

The project's `cypress/support/app-ready.ts` resolves on a document-level signal (`document.readyState`, body presence, `cy.wrap(true)`, etc.) but the project mounts deferred-execution boundaries — components or modules whose interactive code runs *after* the initial document arrives (Astro `client:*`, RSC `'use client'`, React.lazy/Suspense, Next.js `dynamic()`, Vue `defineAsyncComponent`, etc.). The shallow check fires before those boundaries are interactive; tests pass intermittently and fail on the first click into an unhydrated component. Same flake the 7.6.0 contract was meant to prevent, just lower in the stack.

Show the developer:
1. The current `cypress/support/app-ready.ts` body and which shallow pattern it matches.
2. The deferred-execution markers found in the project (file paths + matched directive/import).
3. The required fix: rewrite `cy.appReady()` to wait on a signal those boundaries emit when fully active (a global the framework or app sets after hydration, an attribute on a known node, polled component state, an event, etc.). Document the chosen mechanism in `CONVENTIONS/technical.md` → App Readiness with: (a) the boundaries listed in step 2, (b) the signal each emits when active.

Do NOT auto-rewrite `app-ready.ts` — the choice depends on the app's actual hydration mechanism. Walk the developer through the conventions section first; the implementation falls out of it.

If the project also lacks `scripts/check-app-ready.sh`, copy it from the bundled `rs-shared/scripts/` so future test runs gate on the same rule. After the rewrite, run `./scripts/check-app-ready.sh .` to confirm the gate passes.

**CI:** never auto-rewrite. Pre-flight aborts the whole run with the `check-app-ready.sh` error verbatim. Implement per `CONVENTIONS/technical.md` → App Readiness, then re-run.

### `dev_cmd_recursive`

The project's `scripts/dev.sh` and/or `scripts/preview.sh` has `DEV_CMD`/`PREVIEW_CMD` set to a recursion pattern (`npm run dev`, `./scripts/dev.sh`, equivalents) AND `package.json` routes its `dev`/`preview` script through the wrapper. As soon as anyone types `npm run dev`, this loops forever. The bypass that has been masking this in some projects (package.json calling the framework binary directly, skipping the wrapper) defeats the wrapper's port handling and single-instance guarantees.

Run `detect-stack.sh` to determine the framework binary command:

```bash
eval "$(bash "$(dirname "$0")/../rs-shared/scripts/detect-stack.sh" .)"
echo "Detected: $STACK"
echo "DEV_CMD=$DEV_CMD"
echo "PREVIEW_CMD=$PREVIEW_CMD"
```

`detect-stack.sh` prefers the captured-original from `.rootspec.json` `prerequisites.detected` (the project's pre-bootstrap `package.json` scripts), then falls back to framework config-file presence, then `package.json` devDependency inspection.

**Interactive:** show the developer the detected `DEV_CMD`/`PREVIEW_CMD` values and ask for confirmation. They may want to edit (e.g., add `--host 0.0.0.0`, change port). Apply only what they confirm. If `STACK=unknown`, walk them through identifying the framework binary manually.

**CI:** auto-apply if `DEV_CMD` is non-empty (pre-flight already validated). Abort the run if `STACK=unknown` (pre-flight failure).

Apply phase:
1. Overwrite `scripts/dev.sh` with the bundled template from `../rs-shared/scripts/dev.sh` (this ships the new recursion guard).
2. Overwrite `scripts/preview.sh` with the bundled template from `../rs-shared/scripts/preview.sh`.
3. Substitute the empty `DEV_CMD=""` line in the wrapper with `DEV_CMD="<detected command>"`. Same for `PREVIEW_CMD=""`.
4. Verify package.json `dev`/`preview` scripts route through the wrappers (they should already if this violation fired). If not, rewrite them.
5. Update `CONVENTIONS/technical.md` → Dev Server section with the chosen commands.

### `previewServer_missing`

The project's `.rootspec.json` lacks a `previewServer` entry. If `testmode_implicit_dev` is being resolved with the "switch" path, fix this in the same step. Otherwise, add the entry pointing at `./scripts/preview.sh` (and copy the bundled template if missing) so the prerequisite is recorded — even projects that stay on dev mode benefit from having preview infra available.

### Reporting

For each violation, report what was reconciled (or skipped on developer's request) in Step 6's report.

## Step 6: Report

### Interactive

Summarize what was done:

```
Update complete (6.2.1 → 6.2.3).

Updated:
  - rootspec/00.FRAMEWORK.md
  - rootspec/00.AXIOMS.md
  - .rootspec.json version

Created:
  - [any new prerequisites]

Flagged for review:
  - [any changed prerequisites with reconciliation notes]

Next steps:
  - [Re-run /rs-impl to update conventions if needed]
  - [Any manual instructions from UPDATE.md]
```

### CI

Emit a structured key=value report so CI scripts can grep:

```
RESULT=success
APPLIED=baseUrl_has_path,previewServer_missing,legacy_body_ready
SKIPPED=
ABORTED_ON=
EXIT=0
```

On abort:

```
RESULT=aborted
APPLIED=
SKIPPED=
ABORTED_ON=shallow_app_ready
EXIT=1
```

Field semantics:
- `RESULT` — `success` (all violations resolved or none present) or `aborted` (one or more pre-flights failed; nothing applied — transactional contract).
- `APPLIED` — comma-separated tokens for violations that were reconciled this run.
- `SKIPPED` — tokens not applied because the developer (in interactive mode) declined; always empty in CI.
- `ABORTED_ON` — comma-separated tokens whose pre-flight failed. Empty on success.
- `EXIT` — `0` success, `1` abort. The skill exits with this code.

Print the report to stdout on a clean newline so CI can pipe it to a parser.

## Focus

If the developer passes an argument:
- `"ci"` → activate **CI mode** (see Mode section): no confirmations, recommended path per violation, transactional pre-flight, structured key=value report. Equivalent to setting `ROOTSPEC_CI=1`.
- A version number (e.g., `"6.2.2"`) → show what changed in that specific version only
- `"check"` → run gap analysis only, don't execute any changes (dry run)
- `"prerequisites"` → only handle prerequisite updates (skip framework files)

## Scope

- **CAN read:** all project files, all bundled skill files
- **CAN write:** `{specDirectory}/00.FRAMEWORK.md`, `{specDirectory}/00.AXIOMS.md`, `{specDirectory}/spec-status.json`, `.rootspec.json`, new prerequisite files
- **SHOULD NOT write:** spec files (01-05), application source code, existing test files
- **SHOULD NOT overwrite:** existing prerequisite files without developer confirmation
