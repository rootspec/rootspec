# Derived Artifacts

Derived artifacts are implementation-ready documents generated from the specification. They are NOT part of the 5-level hierarchy — they are projections of it, written to `rootspec/DERIVED_ARTIFACTS/`.

## Generation Rules

1. Generate after validation passes (zero critical violations)
2. Only generate artifacts whose required source levels are complete
3. Always overwrite existing artifacts — they are ephemeral
4. If HAS_CODE=true from scan-project.sh, absorb existing project conventions
5. Create `rootspec/DERIVED_ARTIFACTS/` if it doesn't exist
6. Target 100-300 lines per artifact — guidance, not exhaustive documentation

## Progressive Generation

| Artifact | Required Levels | Optional Context |
|----------|----------------|-----------------|
| technical-design.md | L4 (Systems) | scan-project.sh output, L2 (trade-offs), L5 (stories) |
| visual-design.md | L1 (Pillars) + L3 (Interactions) | L5 (stories), scan-project.sh (existing UI libs) |

Generate only what's eligible. If neither set of required levels exists, skip silently.

## Traceability

Every section must trace back to its spec source using blockquotes:

```
> Source: 04.SYSTEMS/TASK_SYSTEM.md — data ownership
```

## Project Scenarios

Determine the scenario from scan-project.sh output:

- **Empty greenfield** (HAS_CODE=false, no FRAMEWORK detected): Derive purely from spec. Recommendations only — no assertions about stack.
- **Scaffolded greenfield** (HAS_CODE=false, FRAMEWORK detected): Document detected framework and its ecosystem. Fill gaps between what's scaffolded and what the spec needs.
- **Brownfield** (HAS_CODE=true): Document actual stack and conventions from existing code. Note where existing code aligns with or diverges from the spec.

---

## technical-design.md

### Sources

- **Primary:** `rootspec/04.SYSTEMS/` (all system docs, especially SYSTEMS_OVERVIEW.md)
- **Context:** scan-project.sh output (FRAMEWORK, SOURCE_DIRS, CONFIG_FILES)
- **Context:** `rootspec/02.TRUTHS.md` (trade-offs inform architecture choices)
- **Context:** `rootspec/05.IMPLEMENTATION/USER_STORIES/` (stories reveal required capabilities)

### Sections

**1. Technology Stack** — Framework, language, key libraries.
- Empty greenfield: recommend based on L4 system requirements, framed as suggestions
- Scaffolded: document what's detected + what L4 implies is needed
- Brownfield: document what exists, note gaps vs L4 requirements

**2. Architecture Patterns** — Module structure, state management, data flow.
- Derived from system boundaries and inter-system communication in L4

**3. Coding Conventions** — File naming, component structure, import patterns.
- Empty greenfield: recommend based on framework norms
- Scaffolded/Brownfield: extract from existing code and config (tsconfig, eslint, etc.)

**4. API Approach** — REST/GraphQL/tRPC, endpoint patterns, auth strategy.
- Derived from system interfaces defined in L4

**5. Data Model** — Entities, relationships, ownership boundaries.
- Derived from system data ownership in L4

**6. Testing Strategy** — Unit/integration/E2E split, coverage approach.
- Derived from user story patterns (E2E) and system complexity (unit/integration)

---

## visual-design.md

### Sources

- **Primary:** `rootspec/01.PHILOSOPHY.md` (design pillars, mission, emotional targets)
- **Primary:** `rootspec/03.INTERACTIONS.md` (interaction patterns, flows, feedback)
- **Context:** `rootspec/05.IMPLEMENTATION/USER_STORIES/` (concrete screens and elements)
- **Context:** scan-project.sh output (existing UI libraries like Tailwind, Material UI)

### Sections

**1. Design Principles** — Visual translation of L1 design pillars.
- Each pillar becomes a design principle with visual implications
- e.g., "Calm Clarity" → generous whitespace, muted palette, clear type hierarchy

**2. Component Patterns** — Reusable UI patterns from L3 interaction loops.
- Feedback components, navigation patterns, state transitions
- Derived from interaction triggers, responses, and failure modes

**3. Layout Approach** — Page structure, navigation model, information hierarchy.
- Derived from L3 user journeys and interaction flows

**4. Color & Typography Direction** — Mood, palette direction, type scale approach.
- Derived from L1 design pillars (emotional targets → visual mood)
- Directional guidance, not specific hex values or font names

**5. Responsive Strategy** — Breakpoint philosophy, mobile-first vs desktop-first.
- Derived from L3 interaction contexts (where and how users interact)

---

## Future Artifacts (do not generate)

The following are planned but not yet implemented:

- **analytics-plan.md** — Event taxonomy from L3 interaction patterns
- **config-schema.md** — JSON schemas from L5 fine-tuning parameters
