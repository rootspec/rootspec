# Prerequisites

Prerequisites are project infrastructure that RootSpec skills depend on. They are NOT part of the specification — they're the operational plumbing that makes implementation and validation possible.

## The four prerequisites

### Dev server script
**What:** A command or script that starts the development server.
**Why:** rs-impl and rs-validate need a running app to test against.
**Detect:** Look for `package.json` scripts (`dev`, `start`, `serve`), `Makefile` targets, shell scripts in `scripts/`.
**Template:** A simple shell script that runs the project's dev server command.
**Example path:** `./scripts/dev.sh`, or record `"npm run dev"` as the command.

### Pre-commit hook
**What:** A git hook that runs before commits.
**Why:** Catches spec violations and test failures before they're committed.
**Detect:** Look for `.husky/pre-commit`, `.git/hooks/pre-commit`, `lefthook.yml`, `lint-staged` config.
**Template:** A husky-based pre-commit hook that runs spec validation.

### Release script
**What:** A script that handles versioning and release.
**Why:** Ensures spec version and app version stay in sync.
**Detect:** Look for `scripts/release.sh`, `release-it` config, `semantic-release` config.
**Template:** A shell script that bumps version, updates changelog, tags, and pushes.

### Validation/testing script
**What:** A command that runs the full test suite.
**Why:** rs-validate needs to know how to invoke tests.
**Detect:** Look for `package.json` scripts (`test`, `test:e2e`, `cypress`), `Makefile` targets, CI config.
**Template:** A shell script that starts the dev server and runs Cypress.
**Example path:** `./scripts/test.sh`, or record `"npm run test:e2e"` as the command.

## Detection strategy

For each prerequisite:
1. Check common locations and patterns
2. If found → confirm with developer, record path in `.rootspec.json`
3. If not found → ask: "No dev server script detected. Want me to create a template, or skip for now?"
4. If created → write the template, record path
5. If skipped → record `null` in `.rootspec.json`

## `.rootspec.json` prerequisites section

```json
{
  "prerequisites": {
    "devServer": "./scripts/dev.sh",
    "preCommitHook": ".husky/pre-commit",
    "releaseScript": null,
    "validationScript": "npm run test:e2e"
  }
}
```

Values can be file paths (for scripts) or shell commands (for npm scripts, etc.). Null means not configured.

## Advisory for interactive use

When running skills interactively (Claude Code), developers may want to configure permissions to match skill scopes:
- rs-spec: allow writes to `rootspec/` only
- rs-impl: allow writes everywhere except `rootspec/` spec files
- rs-validate: read-only (except `rootspec/tests-status.json`)

This is not enforced by the skills — it's operational guidance for security-conscious teams.
