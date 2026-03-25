---
name: rs-feature
description: Add a feature to your spec with impact analysis across all levels
---

You are helping a developer add a new feature to their RootSpec product specification. This skill analyzes impact across all levels, validates pillar alignment, and guides multi-level updates.

## Phase 1: Context

Run scripts to understand current spec state:

```bash
bash ../rs-shared/scripts/scan-spec.sh .
bash ../rs-shared/scripts/extract-l1-pillars.sh <spec-dir>
bash ../rs-shared/scripts/list-l4-systems.sh <spec-dir>
```

If STATUS=no_spec, inform the developer: "No specification found. Run `/rs-init` to create one first."

Read `../rs-shared/fragments/framework-rules.md` for reference hierarchy rules.

Report current pillars and systems to the developer.

## Phase 2: Interview & Analysis

If the developer provided a feature description as a parameter, use it as context and skip asking "what feature do you want to add?"

If the feature description references a code path (file or directory), this is likely an **existing implementation** that needs spec coverage (e.g., from `/rs-review inverse`). Read the code at that path first, then pre-fill interview answers from what the code does. Present pre-filled answers for confirmation rather than asking open-ended questions. The developer corrects or approves, then proceed as normal.

Otherwise ask: "What feature do you want to add?"

### Step 1: Pillar Alignment Check

Immediately check: which Design Pillar(s) does this feature support?

- If it supports one or more pillars, state which and how
- If it doesn't support any pillar, challenge: "This feature doesn't clearly support any of your Design Pillars. Either reconsider the feature or consider whether a new pillar is needed."

Also check: does it contradict any Inviolable Principles?

### Step 2: Impact Analysis

Launch an Explore sub-agent to analyze impact across all levels:

Agent prompt: "Read the spec files 01-05 in the spec directory (do NOT read 00.SPEC_FRAMEWORK.md — it's too large). For the proposed feature '[feature description]', determine which levels need changes:
- L1: Does it require a new pillar or mission change? (rare)
- L2: Does it introduce a new strategy or trade-off?
- L3: Does it create a new interaction pattern or modify existing ones?
- L4: Which systems are affected? Does it need a new system?
- L5: What user stories and fine-tuning values are needed?

For each level, state: 'No change needed' or describe what changes are required. Be specific about which files and sections."

Present the impact analysis to the developer:

```
Impact Analysis for: [feature]

Pillar alignment: [which pillar(s)]

- L1: [no change / describe change]
- L2: [no change / describe change]
- L3: [no change / describe change]
- L4: [no change / describe change]
- L5: [describe new stories/parameters needed]
```

### Step 3: Decision Tree

Walk through the decision tree with the developer:

1. "Does this change WHY the product exists?" → If yes, update L1 (rare — usually means scope creep)
2. "Does it introduce a new strategic approach?" → If yes, add to L2
3. "Does it create a new interaction pattern?" → If yes, add to L3
4. "Does it require new systems or modify existing ones?" → If yes, update L4
5. Always → Add L5 user stories

### Step 4: Level-by-Level Updates

Walk through each impacted level sequentially, highest to lowest. For each:

1. Read the existing file
2. Interview the developer about the specifics for this level
3. Draft the changes
4. Present and iterate until approved
5. Write the file

**Level-specific questions:**

**L2** (if impacted):
- "What strategy or trade-off does this feature introduce?"
- "What approach are you rejecting?"

**L3** (if impacted):
- "Walk me through the interaction flow for this feature"
- "What triggers it? What feedback does the user receive?"
- "What happens when it fails?"

**L4** (if impacted):
- "What data does this feature manage?"
- "What rules govern its behavior?"
- "How does it interact with existing systems?"

**L5** (always):
- "What observable behaviors confirm this feature is working?"
- "What priority — MVP, SECONDARY, or ADVANCED?"
- "What numeric parameters need tuning?"

## Phase 3: Draft & Write

For each impacted level:
1. Draft the updated content
2. Show the developer what changed (diff-style)
3. Iterate until approved
4. Write the file

**Guardrails:**
- Maintain reference hierarchy — no upward references
- Use placeholders in L1-4, actual values only in L5
- Update SYSTEMS_OVERVIEW.md if a new system is added
- Ensure L5 user stories have @spec_source and @priority annotations

## Phase 4: Post-Implementation Validation

After all changes are written, verify:

- All changes flow downward (no upward references added)
- Placeholders used in L1-4
- L5 user stories created with proper annotations
- Cross-references updated in affected systems
- SYSTEMS_OVERVIEW.md updated if needed

Suggest: "Run `/rs-validate` to check full spec compliance."
