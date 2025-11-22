I want to add a new feature to my existing specification.

## Current Specification

**Location:** {{SPEC_DIR}}/

**Design Pillars (from 01.FOUNDATIONAL_PHILOSOPHY.md):**
{{#EACH DESIGN_PILLARS}}
- {{ITEM}}
{{/EACH}}
{{#IF NO_DESIGN_PILLARS}}(Not yet defined){{/IF}}

**Existing Systems (from 04.SYSTEMS/):**
{{#EACH SYSTEMS}}
- {{ITEM}}
{{/EACH}}
{{#IF NO_SYSTEMS}}(Not yet defined){{/IF}}

## RootSpec Framework

Please fetch the framework definition:
https://raw.githubusercontent.com/rootspec/rootspec/main/00.SPEC_FRAMEWORK.md

## The Feature I Want to Add

[Describe your feature here]

## What I Need

Please help me:

1. **Validate alignment** - Ensure the feature supports at least one Design Pillar
2. **Determine appropriate level** - Where should this feature be documented?
   - L2 (STABLE_TRUTHS) - Core strategy or mental model
   - L3 (INTERACTION_ARCHITECTURE) - User journey or behavioral loop
   - L4 (SYSTEMS) - Technical system or component
   - L5 (IMPLEMENTATION) - Specific implementation detail

3. **Guide implementation** - Help me write the appropriate section(s)
4. **Maintain hierarchy** - Ensure no reference violations

Please read my existing specification files to understand the context, then guide me through adding this feature.

---

Below is additional guidance from the framework:

## DECISION TREE: WHERE DOES THIS FEATURE BELONG?

Follow this decision tree to determine which levels need updates:

### Does it change WHY the product exists?
**YES** → Update Level 1 (rare - usually means scope creep)
**NO** → Continue

### Does it introduce a new strategic approach?
**YES** → Add to Level 2 (new design truth)
**NO** → Continue

### Does it create a new interaction pattern?
**YES** → Add to Level 3 (new behavioral loop)
**NO** → Continue

### Does it require new systems or modify existing ones?
**YES** → Update Level 4 (system changes)
**ALWAYS** → Add Level 5 user stories for validation

## FEATURE TYPE CLASSIFICATION

Identify which category your feature falls into:

### 1. Enhancement to Existing System

**Example:** Add priority levels to tasks

**Impact:**
- L1: ✗ No change (doesn't change pillars)
- L2: ✗ No change (same strategy)
- L3: ✗ No change (same interaction pattern)
- L4: ✓ Update TASK_SYSTEM.md (add priority attribute)
- L5: ✓ Add user stories for priority workflows

### 2. New Interaction Pattern

**Example:** Add collaborative features

**Impact:**
- L1: ✗ No change (or ✓ if adding "Collaborative Discovery" pillar)
- L2: ✓ Add collaboration strategy
- L3: ✓ Add collaboration interaction loops
- L4: ✓ Add COLLABORATION_SYSTEM.md
- L5: ✓ Add collaboration user stories

### 3. Cross-System Feature

**Example:** Gamification with points and achievements

**Impact:**
- L1: ✗ No change (if supports existing "Empowered Action" pillar)
- L2: ✓ Add gamification philosophy
- L3: ✓ Add reward/progress interaction patterns
- L4: ✓ Add REWARD_SYSTEM.md + ACHIEVEMENT_SYSTEM.md, update others
- L5: ✓ Add extensive user stories + fine-tuning parameters

## PRE-FLIGHT VALIDATION CHECKLIST

Before proceeding, verify:
- [ ] Feature supports at least one existing Design Pillar
- [ ] Feature doesn't contradict Inviolable Principles
- [ ] Feature aligns with Level 2 design strategies
- [ ] Feature fits within existing interaction architecture OR justifies new patterns
- [ ] I understand which systems are affected

## FEATURE INTEGRATION PROCESS

Please help me:

1. **Design Pillar Check (Level 1):**
   - Which of my existing Design Pillars does this feature support?
   - If it doesn't support any pillar, should I reconsider the feature
     or add a new pillar?

2. **Determine Appropriate Levels:**
   - Use the decision tree above to identify which levels need changes
   - Does this require changes at Level 2 (new design strategy)?
   - Does this require changes at Level 3 (new interaction pattern)?
   - Which Level 4 systems are affected?
   - What Level 5 user stories and parameters are needed?

3. **Maintain Hierarchy:**
   - Ensure changes flow downward (L1→L2→L3→L4→L5)
   - Verify no upward references are introduced
   - Check that higher levels don't need changes for this feature

4. **Draft Specifications:**
   - Show me what to add/modify at each affected level
   - Use placeholders for numbers in L1-4
   - Actual values only in L5

## POST-IMPLEMENTATION VALIDATION CHECKLIST

After drafting changes, verify:
- [ ] All changes flow downward (no upward references added)
- [ ] Placeholders used in L1-4, actual values only in L5
- [ ] User stories created with test DSL
- [ ] Cross-references updated in affected systems
- [ ] SYSTEMS_OVERVIEW.md updated if new system added

## EXAMPLE: TASK SHARING FEATURE

**Feature:** Allow users to share tasks with other users

**Analysis:**
1. **Pillar Check:** Supports "Empowered Action" (users can delegate/collaborate)
2. **Level Assessment:**
   - L1: No change
   - L2: Add sharing philosophy (trust, privacy, control)
   - L3: Add sharing interaction loop
   - L4: Update TASK_SYSTEM.md (add sharing attributes), add ACCESS_CONTROL_SYSTEM.md
   - L5: Add sharing user stories (share task, accept shared task, permissions)

**Result:** Clear roadmap for implementing feature while maintaining spec integrity

Guide me through this systematically, starting with pillar alignment.
