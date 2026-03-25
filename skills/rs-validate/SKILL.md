---
name: rs-validate
description: Validate RootSpec specification compliance — checks hierarchy, content quality, and coverage in parallel
---

You are validating a developer's RootSpec specification for compliance with the framework rules. This skill uses parallel sub-agents to gather findings, then YOU apply deterministic severity and scoring.

## Phase 1: Context

Run the scan script to find the spec:

```bash
bash skills/rs-shared/scripts/scan-spec.sh .
```

If STATUS=no_spec, inform the developer: "No specification found. Run `/rs-init` to create one."

Read `skills/rs-shared/fragments/framework-rules.md` for the rules you'll be checking against.

## Phase 2: Parallel Validation

Launch 3 Explore sub-agents in parallel using the Agent tool. Each agent reports RAW FINDINGS only — no severity classification. You will classify severity in Phase 3.

### Agent 1: Hierarchy Check

Prompt for the agent:
"Read the spec files listed below (NOT 00.SPEC_FRAMEWORK.md — it's too large). Report every instance of:

1. DOWNWARD REFERENCES: A higher level mentioning a lower level's concept by name. Check:
   - L1 (01.FOUNDATIONAL_PHILOSOPHY.md) referencing L2-L5 concepts
   - L2 (02.STABLE_TRUTHS.md) referencing L3-L5 concepts (e.g., naming a specific L4 system like 'TASK_SYSTEM')
   - L3 (03.INTERACTION_ARCHITECTURE.md) referencing L4-L5 concepts
   - L4 (04.SYSTEMS/*.md) referencing L5 concepts (user stories, fine-tuning values)
   Note: referencing a concept abstractly ('task management') is fine. Referencing by L4 system name ('TASK_SYSTEM') is a violation.

2. HARDCODED NUMERICS in L1-L4: Any specific number with a unit (e.g., '500ms', '5 minutes', '100 points', '2 seconds'). Placeholders like '[brief duration]' are fine.

3. DUPLICATE STORY IDS in L5: Run `bash skills/rs-validate/scripts/check-duplicate-ids.sh <spec-dir>` and report any duplicates found.

For each finding, report: file, line number, the exact violating text. Do NOT assign severity — just report facts."

### Agent 2: Content Quality Check

Prompt for the agent:
"Read the spec files (01-05 only, NOT 00.SPEC_FRAMEWORK.md). For each level that exists, report what is PRESENT and what is MISSING. Do NOT assign severity — just report facts.

L1 checklist — report present/missing for each:
- Mission statement
- Design Pillars (count them; note if any describe features instead of feelings)
- Inviolable Principles
- North-Star Experience
- Any technology or implementation details (should not be present)

L2 checklist:
- Strategic commitments (count them)
- Explicit trade-offs ('we choose X over Y')
- Alignment citations to L1 pillars

L3 checklist:
- Does file exist?
- Behavioral patterns (not UI implementation)
- Failure modes and edge cases
- Multiple interaction scales (immediate, session, extended)

L4 checklist:
- Does SYSTEMS_OVERVIEW.md exist?
- Individual system files (list which exist and which are referenced but missing)
- System boundaries and responsibilities defined
- System interfaces/contracts defined
- Interconnection descriptions

L5 checklist:
- Do USER_STORIES files exist? (list them)
- Do FINE_TUNING files exist? (list them)
- Stories have @spec_source references
- Stories have @priority annotations
- Fine-tuning values have @rationale"

### Agent 3: Coverage Check

Prompt for the agent:
"Read the spec files (01-05 only, NOT 00.SPEC_FRAMEWORK.md). Report what is COVERED and what is NOT. Do NOT assign severity — just report facts.

1. Screen Coverage: List every screen/view named in L3. For each, note whether L5 has a user story that visits it.

2. CRUD Coverage: List each entity in L4 systems that supports mutation. For each, note which operations (Create, Update, Delete) have L5 stories.

3. System Coverage: List each L4 system. Note which have at least one L5 user story exercising them.

4. Journey Coverage: List main user journeys from L3. Note which have L5 stories.

5. Fine-Tuning Coverage: List time-based windows, thresholds, or limits from L3. Note which have corresponding L5 FINE_TUNING parameters.

If L3 or L5 is missing entirely, report that and skip the checks that require them."

## Phase 3: Classify & Score

After all 3 agents return findings, YOU apply the severity rules below. These rules are deterministic — the same findings always produce the same classification.

### Severity Rules

**CRITICAL (deduct 10 points each):**
- A required level file is entirely missing (L3, L5)
- A downward reference violation (higher level names a lower level concept)
- L2 has no explicit trade-offs
- L4 system files referenced in SYSTEMS_OVERVIEW but don't exist
- L4 systems lack defined boundaries/responsibilities
- L1 has fewer than 2 or more than 8 Design Pillars
- L1 pillar describes a feature instead of a feeling
- Duplicate story ID (same ID appears twice in one file or across files in same view directory)

**WARNING (deduct 5 points each):**
- Hardcoded numeric value in L1-L4
- L2 truths not linked back to L1 pillars
- L4 SYSTEMS_OVERVIEW lacks interconnection description
- L5 user story missing @spec_source or @priority
- L5 fine-tuning value missing @rationale
- Coverage gap: L3 screen not visited by any L5 story
- Coverage gap: L4 entity missing CRUD operation in L5
- Coverage gap: L4 system has no L5 story exercising it

**SUGGESTION (deduct 2 points each):**
- L1 has only 2 pillars (valid but could be stronger with 3-5)
- L2 could benefit from more strategic commitments
- L5 stories could be organized by journey

### Scoring

Start at 100. Apply deductions per the rules above. Minimum score is 0.

Present the score with a breakdown table:

```
Score: XX/100

| Severity   | Count | Deduction |
|------------|-------|-----------|
| Critical   | N     | -N*10     |
| Warning    | N     | -N*5      |
| Suggestion | N     | -N*2      |
```

### Report Format

```
Validation Results:

HIERARCHY:
  PASS/FAIL/WARN  [description] — [severity per rules above]

CONTENT:
  PASS/FAIL/WARN  [description] — [severity per rules above]

COVERAGE:
  PASS/FAIL/WARN  [description] — [severity per rules above]
```

Then list all issues in a table sorted by severity (critical first), with: file, line, issue description, fix suggestion.

## Phase 4: Fix Suggestions

After presenting the report, suggest next steps:

- For hierarchy violations: "Fix with `/rs-level <N>` where N is the violating level"
- For content quality issues: "Fix with `/rs-level <N>`"
- For coverage gaps: "Fix with `/rs-level 5` to add missing user stories"
- For missing files: "Create with `/rs-level <N>` or `/rs-init` for full spec"

If the spec scores 90+: "Your spec is in good shape. Consider `/rs-extend <type>` to generate derived artifacts."
