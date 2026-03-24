---
name: rs-level
description: Edit any spec level (1-5) — provide level number and optional change description
---

You are helping a developer edit a specific level of their RootSpec product specification. The developer must provide a level number (1-5). They may also describe what they want to change.

## Phase 1: Context

Parse the skill arguments:
- First argument: level number (1-5) — REQUIRED
- Remaining arguments: description of what to change — OPTIONAL

If no level number is provided, ask: "Which level do you want to edit? (1-5)"

Run context scripts:

```bash
bash skills/rs-shared/scripts/scan-spec.sh .
```

Then run the level-specific extraction script:

| Level | Script |
|-------|--------|
| 1 | `bash skills/rs-shared/scripts/extract-l1-pillars.sh <spec-dir>` |
| 2 | `bash skills/rs-shared/scripts/extract-l2-truths.sh <spec-dir>` |
| 3 | `bash skills/rs-shared/scripts/extract-l3-patterns.sh <spec-dir>` |
| 4 | `bash skills/rs-shared/scripts/list-l4-systems.sh <spec-dir>` |
| 5 | `bash skills/rs-shared/scripts/list-l5-stories.sh <spec-dir>` and `bash skills/rs-shared/scripts/list-l5-fine-tuning.sh <spec-dir>` |

Read the existing file(s) for the target level. If the file doesn't exist, you're creating it from scratch.

Read `skills/rs-shared/fragments/framework-rules.md` for reference hierarchy and placeholder rules.

Report current state to the developer before proceeding.

## Phase 2: Interview

Read `skills/rs-shared/fragments/interview-protocol.md` for interview guidelines.
Read `skills/rs-shared/fragments/anti-patterns.md` for level-specific anti-patterns.

If the developer provided a change description, skip the "what do you want to change?" question and begin with deeper questions about the change.

If no change description was provided, ask: "What do you want to change at this level?"

### Level 1: Foundational Philosophy

Interview questions (ask one at a time, adapt based on answers):

- "Which Design Pillars still ring true? Which feel wrong?"
- "Has your mission evolved?"
- For new pillars: "What specific feeling are you creating?"
- "Does this change affect your Inviolable Principles or North Star?"

**Guardrails:**
- Pillars must describe FEELINGS, not features
- Maximum 5 pillars — challenge if adding more
- No numeric values — use placeholders
- No technology mentions — redirect to purpose
- No references to L2-L5 concepts

### Level 2: Stable Truths

Interview questions:

- "What strategy or commitment are you adding/changing?"
- "What trade-off does this introduce? What are you choosing over what?"
- "How does this align with your L1 Design Pillars?"
- "What existing approaches are you rejecting?"

**Guardrails:**
- Can reference L1 + external only
- No implementation details (belongs in L4)
- No numeric values
- Each truth should be a strategic commitment, not a feature description

### Level 3: Interaction Architecture

Interview questions:

- "What interaction pattern or user journey are you adding/changing?"
- "What triggers this interaction? What feedback does the user receive?"
- "At what scale does this operate — immediate, session, extended, lifetime?"
- "What happens when it fails or the user skips steps?"

**Guardrails:**
- Can reference L1-2 + external only
- No L4 system names (use conceptual language)
- No numeric values
- Describe behavioral patterns, not UI implementation

### Level 4: Systems

Interview questions:

- "What system are you adding/changing? What is it responsible for?"
- "What data does it manage? Key entities?"
- "What rules govern its behavior?"
- "How does it interact with other systems?"
- "What values are calculated, and from what inputs?"

**Guardrails:**
- Can reference L1-3 + sibling L4 + external
- No L5 references (user stories, fine-tuning values)
- No numeric values — use placeholders
- Conceptual rules, not code

For new systems: create both the system file AND update `SYSTEMS_OVERVIEW.md`.

### Level 5: Implementation

Read `skills/rs-shared/fragments/l5-yaml-format.md` for YAML syntax rules, story structure, and fine-tuning format.
Read `skills/rs-shared/fragments/l5-test-dsl.md` for test DSL step reference and extension patterns.

Interview questions:

- "What user stories or fine-tuning values are you adding/changing?"
- "What observable behavior confirms this is working?"
- "What priority tier — MVP, SECONDARY, or ADVANCED?"
- "What journey does this belong to?"

**Guardrails:**
- This is the ONLY level with actual numeric values
- User stories need `@spec_source` referencing higher levels
- User stories need `@priority` annotation
- YAML format with given/when/then structure — see `l5-yaml-format.md` for syntax

## Phase 3: Draft & Write

1. Draft the updated file content
2. Present to the developer with a clear diff of what changed
3. Iterate until approved
4. Write the file(s)

For Level 4: if adding a new system, create both `04.SYSTEMS/<SYSTEM_NAME>.md` and update `04.SYSTEMS/SYSTEMS_OVERVIEW.md`.

For Level 5: organize user stories in the appropriate subdirectory (`by_priority/`, `by_journey/`, `by_system/`).

## Phase 4: Cascade

Read `skills/rs-shared/fragments/cascade-protocol.md`.

After writing changes, present the cascade prompt:

```
Changes to Level {N} may affect downstream levels {N+1} through 5.

1. Review next level now → /rs-level {N+1}
2. Skip — handle downstream later
3. Show what might need changing (read-only)
```

If the developer chooses option 3: read each downstream file and list sections that may need revision. Do NOT edit them.

If Level 5 was edited, skip the cascade prompt (L5 is terminal).
