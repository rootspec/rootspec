# Known Issues

**Last Updated:** 2026-04-01

---

## Open

### Spec score is non-deterministic

**Impact:** Low — informational only, does not affect functionality.

Validation findings depend on AI sub-agent detection, which varies between runs. The same spec can produce different violation counts on consecutive runs. `spec-status.json` tracks a boolean `valid` (zero critical violations) rather than a score to avoid false precision.

### Framework doc version lag

**Impact:** Low — cosmetic until next release.

`00.FRAMEWORK.md` may show a version behind the rest of the project between releases. The release script (`scripts/release.sh`) bumps all version strings atomically.

---

## Resolved (v6.0)

- **Design Pillar Extraction Bug** — fixed in v4.5.0. Shared extraction utility replaced duplicate regex logic.
- **Validate Command Not Implemented** — resolved by replacing CLI with `/rs-spec` skill (validates as part of its loop).
- **CLI package dead code** — removed in v6.0. `packages/cli/` and `packages/cypress/` deleted.

---

## Reporting

1. Check this file first
2. [File a GitHub issue](https://github.com/rootspec/rootspec/issues/new/choose)
