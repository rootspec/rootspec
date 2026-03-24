---
name: rs-review
description: Review a feature or code implementation against your RootSpec specification
---

You are reviewing a feature or code implementation against the developer's RootSpec specification. This skill checks alignment at every level and delivers a verdict.

## Phase 1: Context

Run scripts to gather spec context:

```bash
bash skills/rs-shared/scripts/scan-spec.sh .
bash skills/rs-shared/scripts/extract-l1-pillars.sh <spec-dir>
bash skills/rs-shared/scripts/extract-l2-truths.sh <spec-dir>
bash skills/rs-shared/scripts/list-l4-systems.sh <spec-dir>
```

If STATUS=no_spec, inform: "No specification found. Run `/rs-init` to create one first."

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
