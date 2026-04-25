# Framework Rules

## Never Overwrite User Work

All spec files (01-05) and Cypress files belong to the user once created. Never overwrite, replace, or regenerate them without explicit approval. When making changes:
- Present diffs and get approval before writing
- Preserve all existing content — only add or modify what was discussed
- For Cypress files: merge additions, never replace

Conventions docs (`rootspec/CONVENTIONS/`) are created by `/rs-spec` and maintained by `/rs-impl`. Once created, they are never overwritten — `/rs-spec` skips creation if they already exist.

The only file that may be replaced during upgrades is `00.FRAMEWORK.md`.

## Reference Hierarchy

Each level can ONLY reference higher levels, never lower:

- **L1** → External sources only
- **L2** → L1 + External
- **L3** → L1-2 + External
- **L4** → L1-3 + Sibling L4 + External
- **L5** → All levels (1-4) + External

Referencing a lower level from a higher level is a violation.

## Placeholder Rule

Levels 1-4 must NOT contain numeric values. Use descriptive placeholders:
- `[short duration]` not `500ms`
- `[base_points]` not `100`
- `[brief delay]` not `2 seconds`

Only Level 5 (FINE_TUNING YAML) contains actual numeric values.

## Design Pillar Quality

Design Pillars (L1) must describe **feelings**, not features:
- Good: "Effortless Relief", "Empowered Action", "Calm Clarity"
- Bad: "Fast Search", "Social Features", "Dashboard Analytics"

Each pillar = one sentence describing an emotional experience.
Products typically have 3-5 pillars.

## Single Source of Truth

Each concern lives at exactly one level. No duplication across levels.
Changes flow downward through abstraction layers.

## Decision Filter

Every feature must support at least one Design Pillar from Level 1.
If a feature doesn't support any pillar, it doesn't belong.

## App Readiness

E2E tests must wait for **app readiness** — not DOM readiness, not body readiness — before driving interactions. Server-rendered inert DOM is not sufficient. The page shell being in the DOM and the application being interactive are different moments for any framework with asynchronous islands, lazy hydration, or code-splitting.

**The framework makes no claim about HOW an app signals readiness.** The application owns the definition. What "ready" means depends on the stack: all islands hydrated, a store rehydrated, fonts loaded, an event fired, a global set, etc.

**Contract:**

- The framework provides a Cypress primitive `cy.appReady()` and a DSL step `awaitReady`.
- The project provides the implementation in `cypress/support/app-ready.ts`.
- The shared `visit` step calls `cy.appReady()` automatically after every visit; tests can also use `awaitReady` mid-flow after a click or route change that triggers async work.
- Until the project defines `cy.appReady()`, the scaffolded stub throws a clear error — silent no-ops re-create the flake the contract is meant to prevent.

**Hydration-aware readiness (mandatory).** If the rendered output contains any *deferred-execution boundary* — a component, region, or module whose interactive code is loaded or executed *after* the initial document arrives — `cy.appReady()` MUST wait for a signal those boundaries emit when fully active. Document-level signals (`document.readyState`, `DOMContentLoaded`, body presence) and unconditional resolution (`cy.wrap(true)`) are insufficient: they fire *before* deferred boundaries become interactive, and tests that visit-then-click pass intermittently and fail loud on the first miss. A no-op or document-only check is acceptable ONLY when the rendered output has zero post-document execution.

This is enforced by `scripts/check-app-ready.sh`, which runs as a pre-flight in `scripts/test.sh`. If the project contains deferred-execution markers (client directives, lazy/Suspense, dynamic imports, RSC `'use client'` islands, etc.) AND `cypress/support/app-ready.ts` resolves on a shallow signal, the gate hard-fails before Cypress starts.

**Conventions-first ordering.** Before writing `cypress/support/app-ready.ts`, fill in `CONVENTIONS/technical.md` → App Readiness with: (1) the deferred-execution boundaries the project uses, with file references; (2) for each, the signal it emits when fully active. The implementation flows from (2). The implementation file itself stays terse — no multi-line rationalization comments; reasoning lives in the conventions doc where it can be reviewed against this rule.

How a specific app satisfies the contract belongs in `CONVENTIONS/technical.md`, not here.
