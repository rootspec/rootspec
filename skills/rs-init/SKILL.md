---
name: rs-init
description: Create, adopt, or reinterpret a RootSpec product specification — auto-detects project state
---

You are helping a developer create or reinterpret their product specification using the RootSpec framework. This skill adapts based on project state: greenfield (no code), brownfield (existing code, no spec), or reinterpret (existing spec).

## Phase 1: Context

Run these scripts to understand the current project state:

```bash
bash ../rs-shared/scripts/scan-spec.sh .
bash ../rs-shared/scripts/scan-project.sh .
```

Read `../rs-shared/fragments/framework-rules.md` for the reference hierarchy and placeholder rules. Do NOT read `00.SPEC_FRAMEWORK.md` directly — it is too large. The fragments contain all the rules you need. If you need format examples for a specific level, search for that level's section heading in `00.SPEC_FRAMEWORK.md` using Grep rather than reading the whole file.

Based on results, determine the path:

- **STATUS=no_spec + HAS_CODE=false** → GREENFIELD path
- **STATUS=no_spec + HAS_CODE=true** → BROWNFIELD path (or framework_only)
- **STATUS=has_spec** → REINTERPRET path

Report what you found to the developer before proceeding.

If the developer provided a product description as a parameter, use it as context and skip asking "what is this product?"

## Phase 2: Interview

Read `../rs-shared/fragments/interview-protocol.md` for how to conduct the interview. Ask ONE question at a time. Wait for the answer before continuing.

Read `../rs-shared/fragments/anti-patterns.md` to catch problems as they arise.

### GREENFIELD Path

Work level by level. Complete each level before moving to the next.

**Level 1 — Foundational Philosophy (WHY & WHAT EXPERIENCE)**

Start with market context to ground the conversation:

1. "What similar products exist in this space? What do they get wrong?"
2. "What are the table-stakes features users expect in this category?"
3. "What specific pain points do existing solutions have?"
4. "What products or experiences from any domain inspire your approach?"

Then move to core philosophy:

5. "What problem does this product solve, and why must it exist?"
6. "What 3-5 core feelings should users experience? Think emotions, not features — 'relieved' not 'dashboard.'"
7. For each proposed pillar: "What specific feeling are you creating? How would a user describe it?"
8. "What principles would you never violate, even if it cost features or users?"
9. "Who is this NOT for? What will it explicitly NOT do?"
10. "If this succeeds, how will users' lives be different in 6 months?"

**Guardrails:**
- If a pillar describes a feature, challenge it: "That sounds like a feature. What feeling does it create?"
- If more than 5 pillars, ask which to consolidate
- If mission mentions technology, redirect to purpose
- No numeric values — use placeholders like [brief duration]

After the developer is satisfied, draft `01.FOUNDATIONAL_PHILOSOPHY.md` and present it. Iterate until approved, then write the file.

Offer cascade: "Level 1 changes cascade to all lower levels. Ready to work on Level 2?"

**Level 2 — Stable Truths (WHAT strategies)**

1. "What design philosophy or framework guides your approach?"
2. "What are you optimizing for, and what trade-offs will you accept?"
3. "What patterns from other domains apply here?"
4. "What existing approaches are you rejecting, and why?"
5. "How do you define success for this product?"

Draft `02.STABLE_TRUTHS.md`. Iterate. Write. Offer cascade to L3.

**Level 3 — Interaction Architecture (HOW users interact)**

1. "Walk me through a complete user journey from start to finish"
2. "What triggers each interaction, and what feedback does the user receive?"
3. "Are there different scales? Immediate reactions? Session-level flows? Cross-session arcs?"
4. "What happens when things fail or users skip steps?"
5. "How do different parts of the system coordinate to create coherent experiences?"

Draft `03.INTERACTION_ARCHITECTURE.md`. Iterate. Write. Offer cascade to L4.

**Level 4 — Systems (HOW it's built)**

1. "What are the major subsystems, and what is each responsible for?"
2. "What data does each system manage? What are the key entities?"
3. "What rules govern state transitions and behavior?"
4. "How do systems interact? What do they expose to each other?"
5. "What values are calculated, and from what inputs?"

Draft `04.SYSTEMS/SYSTEMS_OVERVIEW.md` and individual system files. Iterate. Write. Offer cascade to L5.

**Level 5 — Implementation (HOW MUCH)**

1. "What would a user want to accomplish in the first 5 minutes? First day? First week?"
2. "For each feature, what observable behaviors confirm it's working?"
3. "Which features are essential (MVP) vs. nice-to-have vs. future?"
4. "What are the complete user journeys from entry to exit?"
5. "How would you know if the system is delivering the intended experience?"

Draft user stories in YAML format. Draft fine-tuning parameters. Iterate. Write.

Before finalizing L5, verify coverage:
- Every screen from L3 has at least one user story
- Each mutable L4 entity has create/update/delete stories (or explicit scope-out)
- Navigation between main views is tested
- All L3/L4 variants are covered or deferred with justification

### BROWNFIELD Path

Use the same level-by-level interview, but adapt questions:

1. First, launch an Explore sub-agent to scan the codebase:
   - "Read the project's source code, package.json, and any existing documentation. Identify: frameworks used, main directories, key data models, API routes, and UI components. Return a structured project profile."

2. Present findings to the developer.

3. Ask: "Do you want to define the ideal state and plan migration (specification-first), or document what currently exists (reverse-engineering)?"

4. For each level, ground questions in what the code reveals:
   - L1: "Based on the code, what user problems is it solving? What implicit philosophy do the patterns reveal?"
   - L2: "What patterns repeat across the codebase? What trade-offs has the team consistently made?"
   - L3: "What's the main user journey as it exists today?"
   - L4: "What are the major modules? What data flows between them?"
   - L5: "What are the critical user paths? Do any existing tests document acceptance criteria?"

5. If specification-first: after creating the spec, produce a gap analysis noting what's implemented vs. what the spec envisions.

### REINTERPRET Path

1. Read all existing spec files.
2. Run extraction scripts to summarize current state:
   ```bash
   bash ../rs-shared/scripts/extract-l1-pillars.sh <spec-dir>
   bash ../rs-shared/scripts/extract-l2-truths.sh <spec-dir>
   bash ../rs-shared/scripts/list-l4-systems.sh <spec-dir>
   ```

3. Present current pillars, truths, and systems to the developer.

4. Ask reflection questions, one level at a time:

   **L1:** "Which Design Pillars still ring true? Which feel wrong or outdated?"
   **L1:** "Has your mission evolved since the spec was written?"
   **L1:** "What has the product taught you that the original spec got wrong?"
   **L1:** "If you were defining this product today for the first time, what would the pillars be?"

   **L2:** "Which Stable Truths have been validated by experience? Which turned out to be false?"
   **L2:** "Have new non-negotiables emerged?"

   **L3:** "Do the documented behavioral loops still match how users actually use the product?"
   **L3:** "What new patterns have emerged organically?"

   **L4:** "Has the system architecture changed significantly? New, merged, or deleted systems?"

   **L5:** "Do existing user stories still reflect the right outcomes? New critical paths not covered?"

5. For each level, categorize items as: Keep / Revise / Replace / Remove

6. Rebuild level by level, starting with L1 (if pillars change, everything below changes).

## Phase 3: Draft & Write

For each level:
1. Draft the complete file following RootSpec conventions (search `00.SPEC_FRAMEWORK.md` for the specific level's example section if needed — do not read the whole file)
2. Present draft to the developer
3. Iterate until approved
4. Write the file

Create these files:
- `01.FOUNDATIONAL_PHILOSOPHY.md`
- `02.STABLE_TRUTHS.md`
- `03.INTERACTION_ARCHITECTURE.md`
- `04.SYSTEMS/SYSTEMS_OVERVIEW.md` + individual system files
- `05.IMPLEMENTATION/USER_STORIES/` (YAML)
- `05.IMPLEMENTATION/FINE_TUNING/` (YAML)

If a `.rootspecrc.json` doesn't exist, create one with the spec directory path.

## Phase 4: Cascade

Since `/rs-init` covers all levels sequentially, the cascade happens naturally between levels during the interview. After completing all 5 levels, suggest:

"Spec complete. You can run `/rs-validate` to check compliance, or `/rs-extend <type>` to generate derived artifacts (tdd, ux, brand, analytics, config)."
