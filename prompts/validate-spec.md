I have an existing specification and want to validate that it properly
follows RootSpec v4.4.1.

## My Specification Files

**Location:** {{SPEC_DIR}}/

**Found files:**
{{#EACH FOUND_FILES}}
- {{ITEM}}
{{/EACH}}

{{#IF MISSING_FILES}}
**Missing required files:**
{{#EACH MISSING_FILES}}
- {{ITEM}}
{{/EACH}}

{{/IF}}
## RootSpec Framework

Please fetch the framework definition:
https://raw.githubusercontent.com/rootspec/rootspec/main/00.SPEC_FRAMEWORK.md

## Validation Checklist

Please read my specification files and check:

**Reference Hierarchy Compliance:**
- Level 1 only references external resources
- Level 2 only references L1 + external
- Level 3 only references L1-2 + external
- Level 4 only references L1-3 + sibling L4 + external
- Level 5 can reference all levels
- NO lower-level references from higher levels

**Level 1 (Foundational Philosophy) Validation:**
- Has Mission statement
- Has 3-5 Design Pillars with proper structure
- Each pillar includes: name, emotional statement, explanation,
  user perspective, examples
- Has Inviolable Principles
- Has North-Star Experience
- No numeric values (only placeholders)
- No implementation details
- Pillars focus on FEELINGS not FEATURES

**Level 2 (Stable Truths) Validation:**
- Contains design philosophies and strategies
- No references to L3-5 systems or implementation
- Uses placeholders for numeric values
- Aligns with L1 mission and pillars

**Level 3 (Interaction Architecture) Validation:**
- Describes behavioral patterns, not UI implementation
- No references to L4-5 specifics
- Uses placeholders for numeric values
- Includes failure modes and edge cases

**Level 4 (Systems) Validation:**
- Clear system boundaries and responsibilities
- Conceptual rules, not code
- Uses placeholders for numeric values (e.g., [base_points])
- No references to L5 user stories or tuning values

**Level 5 (Implementation) Validation:**
- User stories follow "As a [user], I want [action], so that [outcome]"
- User stories have observable acceptance criteria
- User stories reference relevant L4 systems
- Fine-tuning YAML has @rationale and @spec_source annotations
- Actual numeric values only appear here

**Anti-Pattern Detection:**
- Features in L1 instead of purpose
- Vague emotional goals ("feel good" vs specific emotions)
- Too many design pillars (>8)
- Generic pillars that apply to everything
- Implementation constraints in L1-3
- Numeric values in L1-4

## COMMON VALIDATION FAILURES

Watch for these specific violations and apply the fixes shown:

### 1. Reference Hierarchy Violations

**Problem:** Level 2 references Level 4 system

```markdown
<!-- 02.STABLE_TRUTHS.md -->
We use the REWARD_SYSTEM.md to motivate users...
```

**Fix:** Reference concept, not specific system

```markdown
<!-- 02.STABLE_TRUTHS.md -->
We use variable reward schedules to motivate users...
```

**Why:** Higher levels can't depend on lower-level implementation details.

### 2. Numeric Values in Levels 1-4

**Problem:** Actual numbers in Level 3

```markdown
<!-- 03.INTERACTION_ARCHITECTURE.md -->
Points appear within 100ms of completion
```

**Fix:** Use placeholders

```markdown
<!-- 03.INTERACTION_ARCHITECTURE.md -->
Points appear within [brief duration] of completion
```

**Why:** Actual values belong in Level 5 FINE_TUNING where they can be adjusted.

### 3. Vague Design Pillars

**Problem:** Generic pillar that applies to everything

```markdown
### Make Users Happy
Users should enjoy the app
```

**Fix:** Specific emotion with context

```markdown
### Empowered Action
Users feel capable and in control, never overwhelmed or helpless.

**User perspective:** "I feel confident I can accomplish what I set out to do."
```

**Why:** Generic pillars don't guide design decisions. Specific emotions do.

### 4. Implementation Details in Philosophy

**Problem:** Technical details in Level 1

```markdown
## Mission
Build a React-based app using microservices...
```

**Fix:** Focus on why and what experience

```markdown
## Mission
Transform how people manage tasks by prioritizing sustainable
productivity over guilt-driven completion metrics.
```

**Why:** Level 1 is about purpose and experience, not technology choices.

### 5. Feature Lists Masquerading as Pillars

**Problem:** Features instead of emotions

```markdown
### Task Management
Users can create, edit, and complete tasks
```

**Fix:** Emotional experience

```markdown
### Flow State Achievement
Users experience frictionless task engagement, minimizing
cognitive overhead and decision fatigue.
```

**Why:** Pillars define experiences, not features. Features come later to support pillars.

## REPORTING FORMAT

Please report:
1. **All violations found** (with file:line references)
2. **Severity** (critical/warning/suggestion)
3. **Suggested fixes** for each issue using the patterns above
4. **Overall compliance score** (e.g., 85/100)
