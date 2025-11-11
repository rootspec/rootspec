# Review Feature Against Specification

Prompt for validating a proposed feature or implementation against your specification.

## Prerequisites

- [ ] Complete specification (01-05 files)
- [ ] 00.SPEC_FRAMEWORK.md in your project directory
- [ ] Feature proposal or implementation to review

## When to Use This Prompt

Use this prompt when:

- Evaluating a new feature proposal
- Reviewing code/design before merge
- Assessing third-party suggestions
- Ensuring implementation matches spec
- Conducting design reviews

## The Prompt

```
I have a feature proposal/implementation and want to validate it
against my specification.

Feature/Implementation: [Describe or paste code/design]

My specification follows Hierarchical Specification Framework v3.0.0.

Please read 00.SPEC_FRAMEWORK.md to understand the framework validation
rules and compliance criteria.

## REVIEW CRITERIA BY LEVEL

### Level 1: Pillar Alignment

**Questions to ask:**
- Does this feature make users feel the way our pillars describe?
- Does it contradict any inviolable principles?
- Is it aligned with our mission?

**Red flags:**
- Feature doesn't support any pillar
- Feature violates a principle
- Feature dilutes product vision

**Example violation:**
- Pillar: "Sustainable Engagement" (no guilt)
- Feature: Streak counter that resets if user misses a day
- **Verdict:** ❌ Violates - creates guilt for missing days

### Level 2: Strategy Compliance

**Questions to ask:**
- Does this match our strategic design approach?
- Are we accepting the right trade-offs?
- Does it align with our definition of success?

**Red flags:**
- Uses rejected patterns or approaches
- Optimizes for wrong metrics
- Conflicts with architectural philosophy

**Example violation:**
- Strategy: "Complexity must be emergent, not imposed"
- Feature: Complex configuration wizard with 20 steps
- **Verdict:** ❌ Violates - imposes complexity upfront

### Level 3: Interaction Pattern

**Questions to ask:**
- Does the interaction flow match our documented patterns?
- Are feedback loops properly implemented?
- Does it handle failure modes as specified?

**Red flags:**
- Creates new interaction pattern not in L3
- Skips expected feedback loops
- Doesn't handle specified edge cases

**Example violation:**
- L3 Pattern: "Immediate feedback within [brief duration]"
- Implementation: No feedback, silent failure
- **Verdict:** ❌ Violates - missing feedback loop

### Level 4: System Design

**Questions to ask:**
- Does it follow system boundaries?
- Are interactions between systems as specified?
- Does it maintain system isolation?

**Red flags:**
- Violates system boundaries
- Creates tight coupling not in spec
- Skips required system interactions

**Example violation:**
- L4: TASK_SYSTEM and REWARD_SYSTEM are separate
- Implementation: TASK_SYSTEM directly modifies reward points
- **Verdict:** ❌ Violates - tight coupling, bypasses interface

### Level 5: Parameter Validation

**Questions to ask:**
- Do hardcoded values match L5 fine-tuning specs?
- Are configurable values actually configurable?
- Is there justification for value choices?

**Red flags:**
- Magic numbers not in L5
- Wrong values from L5
- Values that should be configurable are hardcoded

**Example violation:**
- L5 FINE_TUNING: `feedback_delay: 100ms`
- Implementation: `setTimeout(showFeedback, 500)`
- **Verdict:** ⚠️ Needs Changes - wrong delay value

## REVIEW OUTCOMES

### ✅ Approved

Feature aligns with all specification levels. Proceed with implementation.

**Next steps:**
- Merge/implement feature
- Update any relevant documentation
- Add to backlog/roadmap

### ⚠️ Needs Changes

Feature has potential but requires modifications to align with spec.

**Next steps:**
- Make recommended changes
- Re-review after changes
- Update feature proposal if needed

### ❌ Violates Spec

Feature fundamentally conflicts with specification.

**Options:**
1. **Reject feature** - If it violates inviolable principles
2. **Modify feature** - If it can be redesigned to align
3. **Update spec** - If feature reveals spec is wrong (rare, requires full review)

## COMMON REVIEW SCENARIOS

### Scenario 1: Feature Creep

**Situation:** Feature doesn't support any design pillar

**Review:**
- L1: ❌ No pillar alignment
- **Verdict:** ❌ Reject - feature creep

**Action:** Reject or challenge proposer to explain pillar alignment

### Scenario 2: Good Idea, Wrong Approach

**Situation:** Feature supports pillars but uses wrong pattern

**Review:**
- L1: ✅ Supports "Empowered Action"
- L3: ❌ Uses modal dialog (L3 specifies non-blocking patterns)
- **Verdict:** ⚠️ Needs Changes

**Action:** Redesign interaction to match L3 patterns

### Scenario 3: Implementation Detail Mismatch

**Situation:** Feature is correct but implementation uses wrong values

**Review:**
- L1-4: ✅ All levels align
- L5: ❌ Uses 500ms instead of specified 100ms
- **Verdict:** ⚠️ Needs Changes - update timeout value

**Action:** Fix implementation to match L5 parameters

## REVIEW PROCESS

Please review my feature/implementation and answer:

1. **Pillar Alignment (L1):**
   - Which Design Pillar(s) does this support?
   - Does this violate any Inviolable Principles?
   - Does this align with the Mission and North-Star?

2. **Strategy Compliance (L2):**
   - Does this follow the design philosophies?
   - Are there trade-offs that conflict with L2 commitments?

3. **Interaction Pattern (L3):**
   - Does the interaction match L3 architecture?
   - Are behavioral loops properly implemented?

4. **System Design (L4):**
   - Does this follow the system boundaries and rules?
   - Are there unintended system interactions?

5. **Parameter Validation (L5):**
   - Do numeric values match L5 fine-tuning specs?
   - Are there values that should be configurable in L5?

**Final Verdict:**
- ✅ Approved / ⚠️ Needs Changes / ❌ Violates Spec
- List specific issues and suggested fixes
- Reference the review criteria and scenarios above
```

## Tips for Providing Context to the AI

1. **Be complete** - Provide the full feature description or implementation code
2. **Include rationale** - Explain why this feature was proposed and what problem it solves
3. **Note constraints** - Mention any technical or business constraints that influenced the design
4. **Highlight concerns** - If you have specific concerns about alignment, mention them upfront

## Expected Outcome

After the AI completes its review, you'll receive:

- **Clear verdict** - ✅ Approved / ⚠️ Needs Changes / ❌ Violates Spec
- **Level-by-level analysis** - How the feature aligns (or doesn't) with each specification level
- **Specific issues** - File and line references for violations
- **Actionable recommendations** - Concrete suggestions for fixes or improvements

## Next Steps

### If ✅ Approved:
1. Proceed with implementation or merge
2. Update any relevant documentation
3. Add to backlog/roadmap

### If ⚠️ Needs Changes:
1. Make the recommended changes
2. Re-review using this prompt again
3. Update feature proposal if needed

### If ❌ Violates Spec:
1. **Option A:** Reject the feature (if it violates inviolable principles)
2. **Option B:** Redesign the feature to align with the spec
3. **Option C:** Update the spec if the feature reveals the spec is wrong (rare, requires full review process)
