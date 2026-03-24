---
name: rs-extend
description: Derive a specialized artifact from your spec — types: tdd, ux, ui, brand, analytics, config
---

You are helping a developer generate a specialized artifact derived from their RootSpec specification. The developer must specify the artifact type.

## Phase 1: Context

Parse the skill argument — the artifact type is REQUIRED:

| Type | Full Name | Source Level | Output |
|------|-----------|-------------|--------|
| `tdd` | Technical Design Document | L4 Systems | Architecture diagrams, API specs, data models |
| `ux` | UX Design Document | L5 User Stories | Journey maps, wireframe specs, interaction flows |
| `ui` | UI Design Specification | UX artifact | Visual specs, component library, design tokens |
| `brand` | Brand Guidelines | L1 Pillars | Voice/tone guide, brand personality, do/don't |
| `analytics` | Analytics Plan | L3 Interaction | Event taxonomy, tracking specs, funnel definitions |
| `config` | Configuration Schema | L5 Fine-Tuning | JSON Schema with validation rules |

If no type provided, list the types above and ask: "Which artifact type?"

Run context scripts:

```bash
bash skills/rs-shared/scripts/scan-spec.sh .
```

Then run type-specific scripts:

- **tdd**: `bash skills/rs-shared/scripts/list-l4-systems.sh <spec-dir>`
- **ux**: `bash skills/rs-shared/scripts/list-l5-stories.sh <spec-dir>` and `bash skills/rs-shared/scripts/extract-l5-journeys.sh <spec-dir>`
- **ui**: `bash skills/rs-extend/scripts/find-ux-design.sh <spec-dir>` — requires UX artifact to exist
- **brand**: `bash skills/rs-shared/scripts/extract-l1-pillars.sh <spec-dir>`
- **analytics**: `bash skills/rs-shared/scripts/extract-l3-patterns.sh <spec-dir>`
- **config**: `bash skills/rs-shared/scripts/list-l5-fine-tuning.sh <spec-dir>`

If required source files are missing, inform the developer what's needed.

## Phase 2: Generate

Read all relevant source spec files for the artifact type.

### Type: tdd (Technical Design Document)

Read L4 SYSTEMS_OVERVIEW.md and all individual system files. Also read L2 for architectural philosophy.

Generate:
1. **Architecture Overview** — system interconnections (Mermaid diagram)
2. **API Specifications** — endpoint definitions with request/response contracts
3. **Data Models** — entity schemas and relationships (Mermaid ERD)
4. **Integration Contracts** — inter-system communication patterns
5. **Sequence Diagrams** — key flow visualizations (Mermaid sequence)
6. **State Machines** — system state transitions where applicable

Include `@spec_source` references tracing each section back to L4 files.

### Type: ux (UX Design Document)

Read all L5 USER_STORIES YAML files. Also read L3 for interaction patterns and L1 for pillar alignment.

Generate:
1. **User Journey Maps** — flow through the product by journey
2. **Screen Specifications** — layout and component specs for each screen visited in stories
3. **Interaction Flow Diagrams** — sequence of screens and transitions
4. **Component Inventory** — reusable UI patterns across stories
5. **Error States** — how each failure mode is communicated to users

Organize by journey. Include `@spec_source` references.

### Type: ui (UI Design Specification)

Requires UX artifact to exist first. Run `find-ux-design.sh` to locate it.

If not found: "UX design artifact not found. Run `/rs-extend ux` first."

Read UX artifact + L1 pillars for emotional context.

Generate:
1. **Visual Language** — colors, typography, spacing derived from pillar emotions
2. **Component Library** — detailed specs for each component from UX inventory
3. **Design Tokens** — codifiable values (colors, spacing, typography scales)
4. **Layout Templates** — page-level composition patterns
5. **Responsive Behavior** — how components adapt across screen sizes

### Type: brand (Brand Guidelines)

Read L1 FOUNDATIONAL_PHILOSOPHY.md — mission, pillars, principles.

Generate:
1. **Brand Personality** — derived from Design Pillars
2. **Voice & Tone Guide** — how the product communicates
3. **Writing Principles** — do/don't for copy
4. **Emotional Keywords** — per-pillar vocabulary
5. **Anti-Voice** — what the product does NOT sound like (from anti-patterns)

### Type: analytics (Analytics Plan)

Read L3 INTERACTION_ARCHITECTURE.md and L5 USER_STORIES.

Generate:
1. **Event Taxonomy** — events for each interaction pattern
2. **Funnel Definitions** — conversion funnels from user journeys
3. **Key Metrics** — per-pillar success indicators
4. **Tracking Specifications** — event properties and schemas
5. **Dashboard Wireframes** — suggested analytics views

### Type: config (Configuration Schema)

Read L5 FINE_TUNING YAML files.

Generate:
1. **JSON Schema** — with types, ranges, and validation rules
2. **Default Values** — from current FINE_TUNING values
3. **Environment Overrides** — suggested env-var mapping
4. **Documentation** — per-parameter description from @rationale annotations

## Phase 3: Draft & Write

Present the generated artifact. Iterate with the developer until satisfied.

Write to a conventional location:
- `tdd` → `DERIVED_ARTIFACTS/TECHNICAL_DESIGN.md`
- `ux` → `DERIVED_ARTIFACTS/UX_DESIGN.md`
- `ui` → `DERIVED_ARTIFACTS/UI_DESIGN.md`
- `brand` → `DERIVED_ARTIFACTS/BRAND_GUIDELINES.md`
- `analytics` → `DERIVED_ARTIFACTS/ANALYTICS_PLAN.md`
- `config` → `DERIVED_ARTIFACTS/CONFIG_SCHEMA.json`

## Phase 4: Next Steps

After generating, suggest related artifacts:
- After `tdd`: "Consider `/rs-extend ux` for UX design"
- After `ux`: "Consider `/rs-extend ui` for visual specs"
- After `brand`: "Consider `/rs-extend ux` to apply brand to wireframes"
