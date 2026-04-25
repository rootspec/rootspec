# Test Runner Contract

Two implicit test-runner decisions that, if mismatched, silently produce 404s
or run against the wrong server. Made explicit here so generation enforces
both ends. App readiness (the third test-runner contract) lives in
`framework-rules.md` → App Readiness, and is enforced by the `safeVisit`
helper calling `cy.appReady()` after every visit. The project owns the
`cy.appReady()` implementation; the framework owns the call site.

## baseUrl ↔ visit target

**baseUrl is host:port only.** No path component. Examples:
`http://localhost:4321` ✓ — `http://localhost:4321/sub/path` ✗

**visit targets are absolute, site-relative, and include any deploy subpath.**
Examples for a project deployed under `/sub/path/`:
`/sub/path/` ✓ — `/sub/path/about/` ✓ — `/about/` ✗ — `./about/` ✗

**Why both ends matter:** if baseUrl carries the subpath AND visit targets
share the prefix, the runner concatenates them: `http://localhost:4321/sub/path`
+ `/sub/path/about/` → `/sub/path/sub/path/about/`. Silent 404. The bug only
appears when the deploy subpath exists, so it slips through projects deployed
at root and explodes in production-like ones.

**Enforcement:**
- Generation: `scaffold-cypress.sh` strips any path from the auto-detected
  baseUrl when writing `cypress.config.ts`.
- Runtime: generated `steps.ts` exports a `safeVisit` wrapper that throws a
  clear error if baseUrl contains a path AND the visit target starts with it.
  Fails loud rather than silently fixing — the contract stays visible.

## Test mode

**E2E runs against a built artifact + preview server by default.** Dev
servers add hot-reload, lazy compile, and looser URL handling that don't
exist in production — categories of flake that don't reflect real failure
modes.

**Opt-in to dev mode:** set `prerequisites.testMode: "dev"` in
`.rootspec.json`. Generated `test.sh` branches on this; default is
`"preview"`.
