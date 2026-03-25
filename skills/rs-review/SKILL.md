---
name: rs-review
description: Review feature-to-spec alignment, or scan code to find unspecced behaviors
---

You are reviewing alignment between code and specification. This skill has two modes:

- **Review mode** (default): Check a feature/implementation against spec. Delivers a verdict.
- **Inverse mode** (`inverse`): Scan code to find user-visible behaviors not covered by spec. Produces a gap report.

## Phase 1: Context

Run scripts to gather spec context:

```bash
bash ../rs-shared/scripts/scan-spec.sh .
bash ../rs-shared/scripts/extract-l1-pillars.sh <spec-dir>
bash ../rs-shared/scripts/extract-l2-truths.sh <spec-dir>
bash ../rs-shared/scripts/list-l4-systems.sh <spec-dir>
```

If STATUS=no_spec, inform: "No specification found. Run `/rs-init` to create one first."

### Mode Detection

If the developer's argument starts with `inverse`:
- Extract the optional path after `inverse` (e.g., `inverse app/components/` → scope to `app/components/`)
- **Skip to Phase 2G** (inverse mode)

Otherwise, continue with review mode:

If the developer provided a target as a parameter (feature description, PR number, code path), use it as context.

Otherwise ask: "What feature or implementation do you want me to review?"

## Phase 2: Parallel Review

Launch 3 Explore sub-agents in parallel to check alignment at each level:

### Agent 1: Philosophy & Strategy Check (L1 + L2)

Agent prompt: "Read the L1 (01.FOUNDATIONAL_PHILOSOPHY.md) and L2 (02.STABLE_TRUTHS.md) spec files only (do NOT read 00.SPEC_FRAMEWORK.md). Then review the feature/code described as: '[target description]'.

Check:
- L1 Pillar Alignment: Which Design Pillar(s) does this support? Does it violate any Inviolable Principles? Is it aligned with the Mission?
- L2 Strategy Compliance: Does it follow documented design philosophies? Are trade-offs consistent with L2 commitments? Does it use any rejected approaches?

Report alignment or violations for each check."

### Agent 2: Interaction & System Check (L3 + L4)

Agent prompt: "Read the L3 (03.INTERACTION_ARCHITECTURE.md) and L4 (04.SYSTEMS/) spec files only (do NOT read 00.SPEC_FRAMEWORK.md). Then review the feature/code described as: '[target description]'.

Check:
- L3 Interaction Pattern: Does the interaction flow match documented patterns? Are feedback loops properly implemented? Does it handle specified failure modes?
- L4 System Design: Does it follow system boundaries? Are system interactions as specified? Does it maintain proper system isolation?

Report alignment or violations for each check."

### Agent 3: Implementation Check (L5)

Agent prompt: "Read the L5 (05.IMPLEMENTATION/) spec files — both USER_STORIES and FINE_TUNING (do NOT read 00.SPEC_FRAMEWORK.md). Then review the feature/code described as: '[target description]'.

Check:
- Do hardcoded values match L5 FINE_TUNING specs?
- Does the implementation match the acceptance criteria in relevant user stories?
- Are there values that should be configurable per L5 but are hardcoded?
- Are there new behaviors not covered by existing user stories?

Report alignment or violations for each check."

## Phase 3: Verdict

Compile sub-agent results into a review report:

```
Review: [feature/target]

L1 PILLAR ALIGNMENT:
  [PASS/FAIL] [details]

L2 STRATEGY COMPLIANCE:
  [PASS/FAIL] [details]

L3 INTERACTION PATTERN:
  [PASS/FAIL] [details]

L4 SYSTEM DESIGN:
  [PASS/FAIL] [details]

L5 PARAMETER VALIDATION:
  [PASS/FAIL] [details]

VERDICT: [Approved / Needs Changes / Violates Spec]
```

### Verdict Criteria

**Approved**: All levels align. No violations found.

**Needs Changes**: Feature has potential but requires modifications. Provide specific fixes.

**Violates Spec**: Feature fundamentally conflicts with specification. Options:
1. Reject the feature
2. Redesign to align with spec
3. Update the spec (rare — only if the feature reveals the spec is wrong)

## Phase 4: Next Steps

Based on verdict:

- **Approved**: "Feature aligns with spec. Proceed with implementation."
- **Needs Changes**: List specific changes needed, reference which spec levels are misaligned. Suggest `/rs-level <N>` if spec updates are warranted.
- **Violates Spec**: Explain the fundamental conflict. If the developer wants to proceed anyway, suggest `/rs-feature` to properly integrate the concept into the spec.

---

## Inverse Mode: Find Unspecced Code

### Phase 2G: Build Feature Catalog

Discover source directories:

```bash
bash ../rs-shared/scripts/scan-project.sh .
```

If the developer provided a path after `inverse`, scope to that path only. Otherwise use all SOURCE_DIRS from scan-project.

Launch 2 Explore sub-agents in parallel:

#### Agent A: Code Scan

Agent prompt: "Read source files in [scope]. For each file, extract user-visible features — behaviors that users can see, interact with, or that affect their experience. For each feature report:
- Feature name
- User-visible behavior (1-2 sentences)
- Parent system affinity (best guess based on the feature's domain)
- Code location (file path)

Group features by system affinity. Catalog pure internal plumbing (utility helpers, type definitions, internal adapters) separately — these are not gaps but should be listed for transparency.

Do NOT read spec files — only read code."

#### Agent B: Spec Inventory

Agent prompt: "Read the L3 (03.INTERACTION_ARCHITECTURE.md) and L4 (04.SYSTEMS/) spec files only (do NOT read 00.SPEC_FRAMEWORK.md). Build an inventory of what the spec covers:
- List every screen/view/page from L3
- List every interaction pattern from L3
- List every L4 system and its documented responsibilities/features
- List every entity and its documented operations

Output a structured checklist per system."

### Phase 3G: Cross-Reference & Classify

Compare the code feature catalog (Agent A) against the spec inventory (Agent B). Classify each unmatched feature:

- **Unspecced system** — code implements a system with no L4 spec file at all
- **Unspecced feature** — parent system is specced but this feature is not mentioned
- **Partially specced** — spec mentions the concept but implementation goes beyond it (extra states, modes, behaviors)

Apply the "user-visible behavior" test: if users can see or interact with it, it's a gap. Internal plumbing is excluded.

### Phase 4G: Gap Report & Next Steps

Present the report:

```
## Spec Gap Report

### Scan Scope
[Full codebase | specific path]

### Summary
- X unspecced systems
- Y unspecced features within specced systems
- Z partially specced features

### Unspecced Systems
| # | System | Code Location | User-Visible Behavior |
|---|--------|---------------|----------------------|

### Unspecced Features
| # | Feature | Parent System | Code Location | Behavior |
|---|---------|---------------|---------------|----------|

### Partially Specced
| # | Feature | Spec Section | Code Location | What's unspecced |
|---|---------|--------------|---------------|-----------------|

### Excluded (Implementation Details)
[Brief list of internal plumbing excluded from gap analysis]
```

For each gap, include a suggested `/rs-feature` command with the code path and behavior summary:

```
Suggested: /rs-feature <feature description> — see <code path>
```

This lets the developer hand off directly to `/rs-feature`, which will read the existing code and confirm intent before writing spec.
