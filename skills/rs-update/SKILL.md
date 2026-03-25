---
name: rs-update
description: Update framework and migrate spec to latest version — auto-detects version mismatch
---

You are helping a developer update their RootSpec framework and migrate their specification to the latest version.

**CRITICAL — Never overwrite user work.** The only file this skill may replace is `00.SPEC_FRAMEWORK.md` (the framework reference). All other files — spec files (01-05), Cypress files, derived artifacts — belong to the user. For spec files, propose changes and get approval. For Cypress files, never touch them — if new DSL steps are available, mention them in release notes but let the user add them.

## Phase 1: Context

Run the scan script to find current spec and detect versions:

```bash
bash ../rs-shared/scripts/scan-spec.sh .
```

If STATUS=no_spec, inform: "No specification found. Run `/rs-init` to create one."

The scan output includes VERSION (the version in the user's `00.SPEC_FRAMEWORK.md`).

Also read the plugin's bundled `../rs-shared/00.SPEC_FRAMEWORK.md` to get the LATEST version. Compare:

- If versions match: "Your spec is up to date (version X)."
- If versions differ: proceed with migration.

Report the version mismatch to the developer.

## Phase 2: Analyze Changes

Read the CHANGELOG.md to understand what changed between the user's version and the latest:

1. Identify all version entries between old and new
2. Categorize changes:
   - **Breaking changes** — require spec file modifications
   - **New features** — optional sections/capabilities added
   - **Bug fixes** — no spec changes needed

Present a summary:

```
Updating from v{old} to v{new}

Breaking changes:
  - [list any breaking changes]

New features:
  - [list new optional features]

Files that need updating:
  - 00.SPEC_FRAMEWORK.md (always — will be replaced)
  - [list any spec files that need changes]
```

## Phase 3: Migration

### Step 1: Update Framework File

Replace the user's `00.SPEC_FRAMEWORK.md` with the latest version from `../rs-shared/00.SPEC_FRAMEWORK.md`.

### Step 2: Handle Breaking Changes

For each breaking change, walk the developer through the required modification:

1. Explain what changed and why
2. Show the current content in their spec file
3. Show what it needs to become
4. Draft the change
5. Get approval before writing

### Step 3: Add New Features

For each new optional feature:

1. Explain what's available
2. Ask if they want to adopt it
3. If yes, draft and add the new section

### Step 4: Update Configuration

If `.rootspecrc.json` exists, update the version field.

## Phase 4: Verify

After migration, suggest: "Run `/rs-validate` to check that your migrated spec is compliant with the new version."

### Migration Strategy by Change Type

**Major version (e.g., 4.x → 5.0)**: Methodical file-by-file migration. Create new files alongside old, migrate content section by section, validate, then remove old files.

**Minor version (e.g., 4.5 → 4.6)**: Incremental additions. Add new optional sections. Format is stable.

**Patch version (e.g., 4.6.1 → 4.6.2)**: Usually no spec changes needed. Just update framework file.
