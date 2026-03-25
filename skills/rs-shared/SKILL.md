---
name: rs-shared
description: Shared scripts and fragments used by all RootSpec skills — not meant to be invoked directly
---

This skill contains shared resources for all RootSpec skills. Do not invoke directly.

## Scripts
- `scripts/scan-spec.sh` — Find spec directory and detect version
- `scripts/scan-project.sh` — Detect framework and source directories
- `scripts/extract-l1-pillars.sh` — Extract L1 design pillars
- `scripts/extract-l2-truths.sh` — Extract L2 stable truths
- `scripts/extract-l3-patterns.sh` — Extract L3 interaction patterns
- `scripts/extract-l5-journeys.sh` — Extract L5 journey names
- `scripts/list-l4-systems.sh` — List L4 systems
- `scripts/list-l5-stories.sh` — List L5 user story files
- `scripts/list-l5-fine-tuning.sh` — List L5 fine-tuning files

## Bundled Files
- `00.SPEC_FRAMEWORK.md` — Latest framework reference (used by rs-update to replace outdated copies)

## Fragments
- `fragments/framework-rules.md` — Reference hierarchy and placeholder rules
- `fragments/interview-protocol.md` — Interview methodology
- `fragments/cascade-protocol.md` — Downstream cascade procedures
- `fragments/anti-patterns.md` — Common anti-patterns by level
- `fragments/l5-yaml-format.md` — YAML syntax for user stories and fine-tuning
- `fragments/l5-test-dsl.md` — Test DSL step reference and extensions
