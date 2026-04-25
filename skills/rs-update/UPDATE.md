# RootSpec Update Guide

Per-version upgrade instructions. Read by `/rs-update` and `gap-analysis.sh` to determine what project-side changes are needed after `npx skills add rootspec/rootspec`.

Prerequisite entries are tagged:
- `NEW:` — create if missing in project (same logic as `/rs-init`)
- `CHANGED:` — existing prerequisite has updated requirements, reconcile with project

---

## 7.8.0

Summary: Viewport-aware test generation + vacuous-assertion detection. Closes the "looks tested, isn't tested" gap from 7.7.0 field testing — mobile/tablet stories tagged with `@journey:` now get `setViewport` auto-injected; geometry assertions (`shouldHaveNoOverflowX`, `shouldFitViewport`) replace the structurally-valid-but-semantically-empty `shouldExist: { selector: 'body' }` for layout criteria; `/rs-spec` flags vacuous patterns after validation.
Framework files: Replace
Prerequisites:
  NEW: skills/rs-shared/viewport-defaults.json — framework defaults: MOBILE_JOURNEY 375x667, TABLET_JOURNEY 768x1024
  NEW: skills/rs-shared/scripts/read-viewport-defaults.sh — emits JOURNEY=WxH lines; CONVENTIONS/technical.md → "Test Viewports" overrides framework defaults
  NEW: skills/rs-shared/scripts/check-vacuous-assertions.sh — scans user stories for layout-class titles paired with universal-selector assertions; emits VACUOUS=storyId:acId:reason
  CHANGED: skills/rs-shared/scripts/generate-test-file.sh — auto-injects setViewport from journey + warns on vacuous patterns; CORE_SETUP_STEPS gains setViewport (and awaitReady, fixing a pre-existing strip bug); CORE_ASSERT_STEPS gains shouldHaveNoOverflowX + shouldFitViewport
  CHANGED: skills/rs-shared/scripts/scaffold-cypress.sh — schema.ts and steps.ts templates extended with the new step types
  CHANGED: rootspec/CONVENTIONS/technical.md — Test Viewports section (under Testing) when project has any MOBILE_*/TABLET_* journey; /rs-impl writes the framework defaults on first scaffold
Manual: After upgrading, /rs-update Step 5 reconciles viewport_missing if applicable:
  - viewport_missing — auto-extend schema.ts and steps.ts with setViewport + geometry assertions (idempotent), auto-add Test Viewports section to CONVENTIONS/technical.md if missing. Existing cypress/e2e/*.cy.ts files were generated WITHOUT viewport injection — delete them and re-run /rs-impl to regenerate. CI mode auto-applies the file edits (idempotent) and emits WARN=cypress_e2e_needs_regen so the regen happens on the next developer-led run.
  - /rs-spec runs check-vacuous-assertions.sh after validation. Findings are advisory (don't block); interactive mode prompts per-finding for replacement. The right replacement depends on what the criterion is actually about, so /rs-spec doesn't auto-rewrite.
Breaking: false (additive — old generated tests keep running, new test generations get viewport injection automatically; vacuous-assertion check is advisory)

## 7.7.0

Summary: Dev-server wrapper layering fix (no more `npm run dev` recursion / wrapper bypass) and `rs-update` CI mode (transactional, non-interactive, structured report). Two failures from CI runs of 7.6.1 — `dev.sh` recursing through `npm run dev`, and `rs-update` hanging on confirmation prompts then leaving projects in half-broken state — both closed.
Framework files: Replace
Prerequisites:
  NEW: scripts/detect-stack.sh — emits STACK/DEV_CMD/PREVIEW_CMD/PORT for the project's framework; sourced by /rs-impl, scaffold-cypress.sh, and /rs-update dev_cmd_recursive reconciliation
  CHANGED: scripts/dev.sh — DEV_CMD ships empty with a hard-fail recursion guard. /rs-impl populates from detected stack. Existing projects with DEV_CMD="npm run dev" routing through the wrapper trigger dev_cmd_recursive (see Manual)
  CHANGED: scripts/preview.sh — same treatment as dev.sh (PREVIEW_CMD empty + recursion guard)
  CHANGED: .rootspec.json — bootstrap-init.sh now writes prerequisites.detected.devCmd / .previewCmd capturing the project's pre-bootstrap package.json scripts so detect-stack.sh can preserve custom flags (port, host, env wiring) when /rs-impl populates the wrappers
  CHANGED: rootspec/CONVENTIONS/technical.md — must include "Dev Server" section with detected stack + literal command (DEV_CMD/PREVIEW_CMD); /rs-impl writes this on first run
Manual: After upgrading, /rs-update Step 5 reconciles new violations:
  - dev_cmd_recursive — detect-stack.sh resolves the framework binary; rs-update overwrites scripts/dev.sh and scripts/preview.sh with the new templates (empty DEV_CMD/PREVIEW_CMD + recursion guard) and substitutes the detected command. CI mode auto-applies if detection succeeds; aborts if the stack is unknown.
  CI mode is opt-in via `/rs-update ci` or `ROOTSPEC_CI=1` (also auto-detected via `CI=true`). Transactional: all pre-flights pass or no files written. Structured key=value report at end (RESULT/APPLIED/SKIPPED/ABORTED_ON/EXIT) for CI scripts to parse. legacy_body_ready in CI mode is always full migration but pre-flight aborts if cy.appReady() is the throwing stub or shallow against deferred-execution boundaries — refusing to ship known-broken state was the whole point.
Breaking: false (existing dev.sh/preview.sh user copies stay on the old templates and keep working — they only migrate via dev_cmd_recursive reconciliation when the developer runs /rs-update; CI mode is opt-in)

## 7.6.1

Summary: Pre-flight gate detects shallow `cy.appReady()` against deferred-execution boundaries. Hydration-aware-readiness rule added to framework. Scaffold stops priming the cheap no-op default. Conventions-first ordering: `CONVENTIONS/technical.md` → App Readiness must list deferred-execution boundaries and their signals BEFORE `app-ready.ts` is written.
Framework files: Replace
Prerequisites:
  NEW: scripts/check-app-ready.sh — pre-flight gate; run by scripts/test.sh and rs-validate before Cypress starts
  CHANGED: scripts/test.sh — invokes ./scripts/check-app-ready.sh before mode branch; old test.sh works fine, just lacks the gate
  CHANGED: cypress/support/app-ready.ts — scaffold no longer includes the three "Examples" comment block (incl. cy.wrap(true) static-site shortcut); existing project files untouched
  CHANGED: rootspec/CONVENTIONS/technical.md — must include "App Readiness" section with (1) deferred-execution boundaries + file refs, (2) signal each boundary emits when active
Manual: After upgrading, /rs-update Step 5 reconciles `shallow_app_ready` interactively if the project's app-ready.ts uses document.readyState / cy.wrap(true) / body-presence against a project that contains client directives, lazy/Suspense, dynamic imports, or 'use client' islands. The agent must rewrite app-ready.ts to wait on a real readiness signal from those boundaries, and add/expand the App Readiness section in technical.md to match.
Breaking: false (existing correct projects unaffected; existing wrong projects start failing the pre-flight, which is the intent — they were producing flaky greens before)

## 7.6.0

Summary: App-readiness contract replaces body-level data-ready prescription. The framework no longer dictates HOW an app signals readiness — the project defines it in `cypress/support/app-ready.ts`.
Framework files: Replace
Prerequisites:
  NEW: cypress/support/app-ready.ts — project-owned `cy.appReady()` implementation; scaffolded stub throws until customized
  CHANGED: cypress/support/steps.ts — `safeVisit` now calls `cy.appReady()` after `cy.visit()` instead of waiting for `<body data-ready="true">`. New DSL step `awaitReady` for mid-flow gating.
  CHANGED: cypress/support/e2e.ts — add `import './app-ready';` so the Cypress command registers
  CHANGED: cypress/support/schema.ts — add `awaitReady: z.literal(true)` to StepSchema
Manual: After upgrading, /rs-update Step 5 reconciles `legacy_body_ready` interactively:
  - Stub-only — scaffold app-ready.ts + e2e.ts import; leave steps.ts alone (existing body wait keeps working)
  - Full migration — also rewrite `safeVisit` to call `cy.appReady()` and add the `awaitReady` step
  After full migration, the project must implement `cy.appReady()` — one-line no-op for static sites, real check for hydration-heavy sites. Document the chosen mechanism in `CONVENTIONS/technical.md`.
Breaking: false (untouched projects keep the body wait in their user-owned steps.ts; migration is opt-in)

## 7.5.0

Summary: Three framework-level test-correctness rules (baseUrl/visit contract, peer-dep discipline, preview-mode E2E default) — interactivity contract already shipped in 7.4.0
Framework files: Replace
Prerequisites:
  NEW: previewServer (./scripts/preview.sh) — preview-server template; mirrors dev.sh surface (start/stop/restart/status/logs/url)
  NEW: testMode (.rootspec.json prerequisites.testMode = "preview" | "dev"; default "preview")
  CHANGED: scripts/test.sh — branches on testMode; preview default builds + serves preview, dev opt-in starts dev server. Sets CYPRESS_BASE_URL per-mode so cypress.config.ts default doesn't have to match either port.
  CHANGED: scripts/dev.sh — adds `url` subcommand for symmetry with preview.sh
  CHANGED: cypress/support/steps.ts — visit step rejects baseUrl-with-path (throws clear error); the body[data-ready] wait shipped in 7.4.0 stays unchanged
  CHANGED: cypress.config.ts — auto-detected baseUrl is stripped to host:port (no path component)
Manual: After upgrading, /rs-update Step 5 reconciles violations interactively:
  - baseUrl_has_path — strip path from cypress.config.ts baseUrl; re-prefix any unprefixed visit references in test files and spec YAML
  - testmode_implicit_dev — choose: preserve dev mode (add `"testMode": "dev"`) or switch to preview default (rewrite test.sh, add preview.sh)
  - previewServer_missing — add previewServer entry; copy bundled preview.sh
Breaking: false (existing dev-mode behavior preservable via explicit `"testMode": "dev"`)

## 7.4.0

Summary: Interactive readiness contract — pages must set `<body data-ready="true">` when fully interactive. Shared `visit` step waits for this before proceeding. Fixes intermittent flake on hydration-gap renderers (SSR-then-hydrate, lazy islands, code-splitting).
Framework files: Replace.
Prerequisites: None new.
Manual: CHANGED — `cypress/support/steps.ts` is user-owned and will not be overwritten by the scaffold. Existing projects must manually update the `visit` handler to wait for the readiness attribute:

```ts
if ('visit' in s) {
  cy.visit(s.visit);
  cy.get('body', { timeout: 10000 }).should('have.attr', 'data-ready', 'true');
}
```

Every route referenced by a `visit:` DSL step must set `<body data-ready="true">` once its interactive handlers are attached. Choice of mechanism is implementation-specific (e.g., post-hydration effect, defer rendering until ready, mount-time attribute set). Record the chosen mechanism in `CONVENTIONS/technical.md`.

Skipping this migration: tests will hang 10s at each visit, then fail with "expected body to have attribute data-ready with value true".


## 7.3.7

Summary: Fix deploy_path false positive for frameworks emitting relative asset refs (SvelteKit)
Framework files: Replace (version bump only)
Prerequisites: None
Manual: None — orchestrator-side change only.

## 7.3.6

Summary: Proactive deploy-base directive in impl prompt; category-aware review fix hints
Framework files: Replace (version bump only)
Prerequisites: None
Manual: None — orchestrator-side change only.

## 7.3.5

Summary: Review phase no longer requires validate — runs whenever it's in the phase list
Framework files: Replace (version bump only)
Prerequisites: None
Manual: None — orchestrator-side change only.

## 7.3.4

Summary: Runtime-checks hook self-initializes; no cy.readFile dependency
Framework files: Replace (version bump only)
Prerequisites: None
Manual: None — orchestrator-side change only.

## 7.3.3

Summary: Runtime checks (console errors, 404s) + deploy-path cross-check in review
Framework files: Replace (version bump only)
Prerequisites: None
Manual: None — orchestrator-side change only.

## 7.3.2

Summary: Framework-agnostic build output detection; rs-impl wires the build script
Framework files: Replace (version bump only)
Prerequisites: None
Manual: None — projects whose impl phase already wired a real `build` script need no change. Future runs of `rs-impl` will replace the `rs-init` stub automatically.

## 7.3.1

Summary: Static review now runs after a project build; LLM screenshot picker dedupes
Framework files: Replace (version bump only)
Prerequisites: None
Manual: None — orchestrator-side change only.

## 7.3.0

Summary: Hybrid review — deterministic static stage owns blockers, LLM stage advisory only
Framework files: Replace (version bump only)
Prerequisites: None
Manual: None — orchestrator-side change. The `rs-review` skill now writes only under `llmFindings` in `review-status.json`; the `summary` and `issues` keys are owned by the orchestrator's static review pass. Existing project files are unaffected.

## 7.2.4

Summary: Heartbeat timeout — kill hung SDK processes after 5min of silence
Framework files: Replace (version bump only)
Prerequisites: None
Manual: None

## 7.2.3

Summary: Review gate resilience — initialize review-status.json in bash before agent reads
Framework files: Replace (version bump only)
Prerequisites: None
Manual: None

## 7.2.2

Summary: Review skill turn efficiency — section-based batching, incremental output, turn budget awareness
Framework files: Replace (version bump only)
Prerequisites: None
Manual: None

## 7.0.10

Summary: Stronger package.json hard rule in rs-impl preamble and Scope
Framework files: Replace (version bump only)
Prerequisites: None
Manual: None

## 7.0.9

Summary: Fix package.json bloat — agent must use npm install, not write deps directly
Framework files: Replace (version bump only)
Prerequisites: None
Manual: None

## 7.0.8

Summary: Preflight script for rs-impl; YAML scanning dedup; DSL step constraint for rs-spec
Framework files: Replace (version bump only)
Prerequisites: None
Manual: None

## 7.0.7

Summary: rs-impl TDD loop with regression detection
Framework files: Replace (version bump only)
Prerequisites: None
Manual: None

## 7.0.6

Summary: rs-init handles missing package.json in non-interactive mode
Framework files: Replace (version bump only)
Prerequisites: None
Manual: None

## 7.0.5

Summary: Deterministic scripts for test files, conventions, and reporting; L4 system file fix; write batching
Framework files: Replace (version bump only)
Prerequisites: None
Manual: None — new scripts and skill improvements take effect immediately

## 7.0.4

Summary: rs-impl turn efficiency — 70 turns down to 35 with new batching scripts
Framework files: Replace (version bump only)
Prerequisites: None
Manual: None — skill improvements and new scripts take effect immediately

## 7.0.3

Summary: Fix rootspec-reporter for nested test describes, rs-validate fallback
Framework files: Replace (version bump only)
Prerequisites:
  CHANGED: cypress/support/rootspec-reporter.ts — updated to handle nested describe blocks. Diff project copy against bundled version and reconcile.
Manual: Copy updated rootspec-reporter.ts from skills bundle into cypress/support/

## 7.0.2

Summary: Skill turn efficiency for CI runs, Astro detection
Framework files: Replace (version bump only)
Prerequisites: None
Manual: None — skill improvements take effect immediately

## 7.0.1

Summary: Conventions ownership fix
Framework files: Replace (version bump only)
Prerequisites: None
Manual: None

## 7.0.0

Summary: Derived artifacts replaced by conventions docs, brownfield baseline behavior
Framework files: Replace
Breaking:
  - `rootspec/DERIVED_ARTIFACTS/` removed — replaced by `rootspec/CONVENTIONS/`
  - `/rs-spec` no longer generates derived artifacts (Step 6 removed)
  - `/rs-impl` now creates and maintains `rootspec/CONVENTIONS/technical.md` and `visual.md`
  - `@phase: baseline` stories are now behavioral — `/rs-impl` skips implementation, only writes tests
  - `scan-spec.sh` no longer outputs `ELIGIBLE_TECHNICAL_DESIGN` / `ELIGIBLE_VISUAL_DESIGN`
Prerequisites: None
Manual:
  - Delete `rootspec/DERIVED_ARTIFACTS/` if it exists
  - Run `/rs-impl` to create `rootspec/CONVENTIONS/` (auto-created on first run)
  - If you had manual edits in old artifacts, review and apply to new conventions docs

## 6.3.1

Summary: Commit conventions, release notification workflow
Framework files: Replace (version bump only)
Prerequisites: None
Manual: Run `git config core.hooksPath .githooks` to activate commit hooks

## 6.3.0

Summary: /rs-update skill for framework version upgrades
Framework files: Replace (version bump only)
Prerequisites: None
Manual: None — /rs-update is now available after upgrading

## 6.2.3

Summary: Stronger brownfield spec derivation
Framework files: Replace
Prerequisites: None
Manual: Re-run `/rs-spec` for improved brownfield drafts

## 6.2.2

Summary: Cypress reporter plugin, stats tracking
Framework files: Replace
Prerequisites:
  NEW: cypress/support/rootspec-reporter.ts — copy from bundled template
  CHANGED: cypress.config.ts — wire rootspec-reporter into setupNodeEvents
Manual: Remove custom result parsing if present; `/rs-impl` and `/rs-validate` no longer manually parse Cypress results

## 6.2.1

Summary: Managed dev server script with process management
Framework files: Replace
Prerequisites:
  CHANGED: scripts/dev.sh — internal logic rewritten (process mgmt, port detection, log output)
  CHANGED: package.json — add dev:start/dev:stop/dev:restart scripts
Manual: Review DEV_CMD and PORT in scripts/dev.sh after update

## 6.2.0

Summary: Derived artifacts auto-generated by /rs-spec
Framework files: Replace
Prerequisites: None
Manual: Re-run `/rs-spec` to generate `DERIVED_ARTIFACTS/technical-design.md` and `visual-design.md`

## 6.1.0

Summary: User-defined phases, new axioms, methodology distinction
Framework files: Replace (axioms 7-9 added, @priority renamed to @phase)
Prerequisites: None
Manual: Rename `@priority` to `@phase` in L5 USER_STORIES YAML; rename `by_priority/` dirs to `by_phase/`

## 6.0.0

Summary: Four-skill architecture, complete restructure
Framework files: Replace
Breaking:
  - Spec files renamed: 01.FOUNDATIONAL_PHILOSOPHY.md → 01.PHILOSOPHY.md, 02.STABLE_TRUTHS.md → 02.TRUTHS.md, 03.INTERACTION_ARCHITECTURE.md → 03.INTERACTIONS.md
  - Spec directory: files must live inside rootspec/ directory
  - Config: .rootspecrc.json → .rootspec.json with prerequisites section
  - Status: test-ledger.json replaced by rootspec/spec-status.json and rootspec/tests-status.json
Prerequisites:
  NEW: scripts/dev.sh — managed dev server template
  NEW: validation script — Cypress test runner
  NEW: pre-commit hook — optional but recommended
Manual: Rename spec files, move into rootspec/ directory, recreate .rootspec.json
