---
name: rs-update
description: Upgrade a RootSpec project to the latest framework version — detects version gap, updates framework files, creates missing prerequisites, flags changed prerequisites for reconciliation. Run this after `npx skills add rootspec/rootspec`.
---

You are upgrading a RootSpec project to the latest framework version. Start by telling the developer what you're about to do:

"I'll check your project against the latest framework version and upgrade what's needed — framework files, prerequisites, and config."

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

Wait for the developer to confirm. They can exclude items (e.g., "skip dev.sh").

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

Run when `RULE_VIOLATIONS` from gap-analysis is non-empty. Each token names a project state that predates a framework rule. For each, present the fix and ask before applying — none of these auto-rewrite user code.

### `baseUrl_has_path`

The project's `cypress.config.ts` has `baseUrl: 'http://host:port/some/path'`. The framework now requires baseUrl to be host:port only; deploy paths belong in `visit:` targets and `cy.visit()` calls. Concatenation of both produces 404s like `/some/path/some/path/`.

Show the developer:
1. The current baseUrl line and the path that needs stripping (e.g., `/some/path`).
2. A grep over `cypress/` and `rootspec/05.IMPLEMENTATION/USER_STORIES/` for `visit:` and `cy.visit(` references.
3. Categorize the visit references:
   - **Already prefixed** (start with the path) — leave alone; they'll work once baseUrl is stripped.
   - **Unprefixed** (start with `/` but not the path) — offer to prepend the path.
   - **Relative** (don't start with `/`) — flag for manual review; relative paths break under both old and new contracts.

Apply only what the developer confirms. After: re-run `/rs-validate` to confirm.

### `testmode_implicit_dev`

The project's `scripts/test.sh` starts the dev server, but `.rootspec.json` has no `prerequisites.testMode`. Old projects defaulted to dev-mode E2E implicitly; the framework now defaults to preview mode (built artifact + preview server) for fewer flakes.

Offer two paths:
- **Preserve current behavior** — add `"testMode": "dev"` to `.rootspec.json` `prerequisites`. No other changes. Project keeps running dev-mode E2E by explicit choice.
- **Switch to preview default (recommended)** — copy `scripts/preview.sh` from the bundle (per `previewServer_missing` below), rewrite `scripts/test.sh` to the testMode-aware template (see `bootstrap-init.sh`), add `"testMode": "preview"` and `"previewServer": "./scripts/preview.sh"` to `.rootspec.json`. Verify `npm run build` works before committing.

If the developer picks "switch", note that the project may need an app-readiness implementation (see App Readiness in framework-rules.md) — preview mode exposes hydration timing bugs that dev mode hid.

### `legacy_body_ready`

The project's `cypress/support/steps.ts` waits for `<body data-ready="true">` after every visit (the pre-7.6.0 contract). The framework now expects `cy.appReady()` — project-defined readiness in `cypress/support/app-ready.ts`. Body-level readiness can't observe per-island hydration; on stacks with async islands, tests pass body-ready and then click into inert DOM.

Offer two paths:
- **Stub-only (minimal change)** — scaffold `cypress/support/app-ready.ts` with the throwing default and add `import './app-ready';` to `cypress/support/e2e.ts`. Leave `steps.ts` alone for now. The developer can adopt `cy.appReady()` later, story by story. Existing tests continue to use the body wait.
- **Full migration (recommended)** — same as stub-only, plus rewrite `safeVisit` in `steps.ts`: replace the `cy.get('body').should('have.attr', 'data-ready', 'true')` line with `cy.appReady()`. Add the `awaitReady` step to `runSetupSteps` and the schema. The developer must then implement `cy.appReady()` (a one-line no-op for static sites, or a real check for hydration-heavy sites). Existing pages that set `body[data-ready]` are untouched — they can keep doing so or stop, the framework no longer cares.

If full migration is chosen, advise the developer that the FIRST `npx cypress run` will fail with "cy.appReady() is not implemented" — that's the contract surfacing, not a regression.

### `previewServer_missing`

The project's `.rootspec.json` lacks a `previewServer` entry. If `testmode_implicit_dev` is being resolved with the "switch" path, fix this in the same step. Otherwise, add the entry pointing at `./scripts/preview.sh` (and copy the bundled template if missing) so the prerequisite is recorded — even projects that stay on dev mode benefit from having preview infra available.

### Reporting

For each violation, report what was reconciled (or skipped on developer's request) in Step 6's report.

## Step 6: Report

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

## Focus

If the developer passes an argument:
- A version number (e.g., `"6.2.2"`) → show what changed in that specific version only
- `"check"` → run gap analysis only, don't execute any changes (dry run)
- `"prerequisites"` → only handle prerequisite updates (skip framework files)

## Scope

- **CAN read:** all project files, all bundled skill files
- **CAN write:** `{specDirectory}/00.FRAMEWORK.md`, `{specDirectory}/00.AXIOMS.md`, `{specDirectory}/spec-status.json`, `.rootspec.json`, new prerequisite files
- **SHOULD NOT write:** spec files (01-05), application source code, existing test files
- **SHOULD NOT overwrite:** existing prerequisite files without developer confirmation
