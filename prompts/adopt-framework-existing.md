# Adopt Framework for Existing Project

Complete prompt for applying the Hierarchical Specification Framework v3.5.2 to an existing codebase or partially-built product.

## Prerequisites

Before using this prompt, ensure you have:

- [ ] Copied `00.SPEC_FRAMEWORK.md` to your project directory
- [ ] Existing codebase or partially-built product
- [ ] Understanding of current architecture and key systems
- [ ] Access to existing documentation (even if incomplete/outdated)
- [ ] Time to work through discovery and mapping (4-8 hours for initial draft)
- [ ] Chosen your adoption approach (see below)

## When to Use This Prompt

Use this prompt when:

- Applying the framework to an existing codebase or product
- Formalizing implicit architectural decisions
- Creating specification docs for brownfield projects
- Establishing philosophical foundations retroactively
- Migrating from scattered docs to unified specification
- Preparing for major refactoring or evolution

## Choose Your Approach

### Approach A: Specification-First ✅ Recommended

**Define ideal architecture first, then refactor toward it**

**Best for:**
- Projects with technical debt to address
- Teams willing to refactor over time
- Long-term vision matters more than current state
- Want to improve architecture while documenting

**Process:**
1. Define ideal philosophy and architecture
2. Document what SHOULD exist (not what does)
3. Create gap analysis (ideal vs. current)
4. Plan incremental migration
5. Refactor toward spec over months

**Time commitment:**
- Initial spec: 4-8 hours
- Gap analysis: 2-4 hours
- Migration: 3-12 months of gradual refactoring

### Approach B: Reverse-Engineering

**Document current state first, derive philosophy retroactively**

**Best for:**
- Current architecture is good enough
- Just need comprehensive documentation
- Can't afford refactoring time
- Want to formalize implicit decisions
- Spec should match reality exactly

**Process:**
1. Document existing architecture (Level 4)
2. Infer interaction patterns (Level 3)
3. Extract implicit strategies (Level 2)
4. Articulate retrospective philosophy (Level 1)
5. Validate spec matches implementation

**Time commitment:**
- Initial spec: 4-8 hours
- Validation: 1-2 hours
- Ongoing maintenance only

---

## The Prompt

Copy and paste the text below, replacing placeholders with your project details:

```
I have copied 00.SPEC_FRAMEWORK.md (Hierarchical Specification Framework v3.5.2)
into my EXISTING project directory.

Please read 00.SPEC_FRAMEWORK.md to understand the framework structure.

## My Project Details

**Domain/Type:** [e.g., task management SaaS, mobile RPG game, analytics platform]

**Current State:** [e.g., MVP in production for 6 months, 2 years of active development, prototype with 500 users]

**Key Existing Systems:** [e.g., user authentication, task CRUD, notification system, reporting dashboard]

**Existing Documentation:** [e.g., scattered README files, outdated PRD from 2023, API docs, none]

**Team Size:** [e.g., solo developer, 3 engineers, 10-person team]

**Technical Debt Level:** [e.g., low - well architected, medium - some refactoring needed, high - significant debt]

**Adoption Approach:** [Choose one: Specification-First OR Reverse-Engineering]

## My Goal

Help me create a specification for this existing project using the chosen approach.
Generate specification files following the examples in 00.SPEC_FRAMEWORK.md:

1. 01.FOUNDATIONAL_PHILOSOPHY.md - Use Level 1 examples as guide
2. 02.STABLE_TRUTHS.md - Use Level 2 examples
3. 03.INTERACTION_ARCHITECTURE.md - Use Level 3 examples
4. 04.SYSTEMS/ - Use Level 4 examples
5. 05.IMPLEMENTATION/ - Use Level 5 examples

## DISCOVERY QUESTION FRAMEWORK

Tailor your questions to my chosen approach:

### IF Specification-First Approach:

#### Level 1: Foundational Philosophy (Ideal)
Ask me:
- "What problem was this product originally meant to solve?"
- "What 3-5 core experiences SHOULD users feel (ideal state)?"
- "What principles do you wish you'd followed from the start?"
- "Looking at your current implementation, what implicit values do you see?"
- "If you could rebuild from scratch, what would guide every decision?"
- "What makes this product unique compared to alternatives?"

Focus on the IDEAL philosophy, not current reality.

#### Level 2: Stable Truths (Ideal Strategy)
Ask me:
- "What design philosophy SHOULD guide your approach going forward?"
- "What are you optimizing for in the future state?"
- "What current approaches would you reject if starting over?"
- "What patterns from your current implementation should be preserved?"
- "How should success be defined, ideally?"

Define the ideal strategy, noting where current state diverges.

#### Level 3: Interaction Architecture (Ideal Patterns)
Ask me:
- "What are the CURRENT user journeys from start to finish?"
- "What are the IDEAL user journeys you'd design today?"
- "Where do current interaction patterns create friction?"
- "What behavioral loops exist today? Which should exist?"
- "How should different systems coordinate (vs. how they do today)?"

Map both current and ideal interaction patterns.

#### Level 4: Systems (Current + Ideal Architecture)
Ask me:
- "What systems exist today? What are their boundaries?"
- "What responsibilities do current systems have (even if wrong)?"
- "What's the ideal system architecture if you could refactor?"
- "What data models exist? What should they be?"
- "How do systems currently interact? How should they interact?"
- "What technical debt exists in system boundaries?"

Document IDEAL architecture, note current state divergence in comments.

#### Level 5: Implementation (Gap Analysis)
Ask me:
- "What critical user journeys exist in production today?"
- "Which features are working well vs. need improvement?"
- "What would MVP look like if starting over?"
- "Which current features align with ideal philosophy?"
- "What parameters need tuning to achieve ideal experience?"

Create user stories for IDEAL state, noting which exist vs. need building.

**After all levels, create gap analysis:**
- What exists today
- What should exist (from spec)
- Migration priorities
- Refactoring roadmap

---

### IF Reverse-Engineering Approach:

#### Level 4: Systems (Document Current)
**Start from implementation, work backward to philosophy**

Ask me:
- "What systems exist in your codebase today?"
- "What is each system responsible for?"
- "What data models exist? What are the key entities?"
- "How do systems currently interact?"
- "What APIs or interfaces do systems expose?"
- "What calculated values exist, and from what inputs?"

Document EXACTLY what exists, not what should exist.

#### Level 3: Interaction Architecture (Infer Patterns)
Ask me:
- "Walk me through actual user journeys in your current product"
- "What triggers each interaction? What feedback occurs?"
- "What are the actual behavioral loops users experience?"
- "What happens when things fail in the current system?"
- "How do systems coordinate to create user experiences?"

Extract the actual patterns from implementation.

#### Level 2: Stable Truths (Extract Strategy)
Ask me:
- "Looking at your implementation, what trade-offs were made?"
- "What design patterns are consistently used?"
- "What does the code optimize for (speed, flexibility, simplicity)?"
- "What approaches were chosen vs. rejected?"
- "What implicit philosophy guides the current architecture?"

Infer the strategic decisions from what exists.

#### Level 1: Foundational Philosophy (Derive Retrospectively)
Ask me:
- "What problem does the current product actually solve for users?"
- "What experiences do users currently have? What do they feel?"
- "Looking at implementation choices, what 3-5 values emerge?"
- "What principles does the current code seem to uphold?"
- "What makes this product different from alternatives?"
- "If this product succeeds as-is, how will users' lives improve?"

Articulate the philosophy that the current implementation reveals.

#### Level 5: Implementation (Document Current State)
Ask me:
- "What are the complete user journeys users can take today?"
- "What features exist in production?"
- "How would you organize current features by priority/journey/system?"
- "What parameters are already tuned? What values are they?"

Create user stories that match what's actually implemented.

**After all levels, validate alignment:**
- Does the philosophy match the implementation?
- Do the systems reflect the strategic decisions?
- Are there contradictions to address?

---

## COMMON MISTAKES TO AVOID

Watch for these anti-patterns when applying framework to existing projects:

### Specification-First Approach:

1. **Creating spec that's wildly disconnected from current code**
   - Fix: Be realistic about migration path; spec should be achievable

2. **Documenting current state instead of ideal state**
   - Fix: Remember - this is what SHOULD exist, create gap analysis separately

3. **Skipping gap analysis**
   - Fix: Must document delta between current and ideal to plan migration

4. **Being too ambitious with ideal architecture**
   - Fix: Ideal should be achievable in 6-12 months, not require complete rewrite

### Reverse-Engineering Approach:

1. **Idealizing what exists instead of documenting reality**
   - Fix: Document actual implementation, warts and all

2. **Mixing "what exists" with "what we wish existed"**
   - Fix: Stay true to current state; add comments about future improvements separately

3. **Deriving generic philosophy that doesn't match decisions**
   - Fix: Philosophy must explain actual architectural choices in code

4. **Forgetting to document technical debt**
   - Fix: Note in comments where current implementation diverges from best practices

### Both Approaches:

1. **Not involving the team in philosophy definition**
   - Fix: Philosophy should reflect team values, not individual preferences

2. **Creating Design Pillars that don't match current feature decisions**
   - Fix: Test pillars against actual roadmap/backlog - do they explain choices?

3. **Overcomplicating Level 4 with implementation details**
   - Fix: Even documenting existing systems, stay conceptual

---

## FRAMEWORK COMPLIANCE RULES

Follow 00.SPEC_FRAMEWORK.md rules strictly:
- Each level only references higher levels
- Use placeholders for numbers in Levels 1-4 (e.g., `[brief duration]`)
- Actual numeric values only in Level 5
- Design Pillars focus on user feelings/experiences, not features
- Maintain hierarchy even when documenting existing code

**For Specification-First:** Spec describes ideal, not current
**For Reverse-Engineering:** Spec describes current, not ideal

---

## PROCESS

### Specification-First Process:

1. Start with Level 1 - define IDEAL philosophy
2. Continue through Levels 2-5 - define IDEAL architecture
3. Create gap analysis document:
   - What exists today
   - What spec defines
   - Delta between them
   - Migration priorities
4. Validate each level before proceeding
5. Get team buy-in on migration roadmap

### Reverse-Engineering Process:

1. Start with Level 4 - document CURRENT systems
2. Work backward to Level 3 - extract interaction patterns
3. Continue to Level 2 - infer strategic decisions
4. Finish with Level 1 - articulate philosophy
5. Create Level 5 - document current features
6. Validate spec matches implementation
7. Identify contradictions or technical debt

---

## ADDITIONAL CONTEXT TO PROVIDE

To help me generate an accurate specification, please share:

**For Specification-First:**
- Major pain points in current architecture
- Features you wish you'd built differently
- Technical debt areas
- Team's vision for future state
- Constraints (can't change X, must keep Y)

**For Reverse-Engineering:**
- Links to existing docs (API specs, READMEs, etc.)
- Key files/directories in codebase structure
- Major architectural decisions made
- Features users love vs. tolerate
- Known bugs or limitations

**For Both:**
- User feedback or complaints
- Analytics or usage data
- Competitive landscape
- Business constraints
- Team composition and skills

Let's begin!
```

---

## What to Expect

### Specification-First Timeline:

- **Level 1: Ideal Philosophy** (45-60 min) - Define what the product should be
- **Level 2: Ideal Strategy** (30-45 min) - Establish aspirational approach
- **Level 3: Ideal Patterns** (45-60 min) - Design better interaction flows
- **Level 4: Ideal Systems** (60-90 min) - Define target architecture
- **Level 5: Current + Ideal** (45-60 min) - Map features and gap
- **Gap Analysis** (30-60 min) - Document delta and create migration plan

**Total time:** 4-8 hours for specification + gap analysis

### Reverse-Engineering Timeline:

- **Level 4: Current Systems** (60-90 min) - Document what exists
- **Level 3: Current Patterns** (45-60 min) - Extract interaction flows
- **Level 2: Implicit Strategy** (30-45 min) - Infer decisions
- **Level 1: Emergent Philosophy** (45-60 min) - Articulate values
- **Level 5: Current Features** (45-60 min) - Map implementation
- **Validation** (30-45 min) - Check spec matches reality

**Total time:** 4-8 hours for specification + validation

---

## Tips for Success

### Do

- **Be honest** about current state (warts and all)
- **Involve your team** in defining philosophy
- **Gather evidence** - look at actual code, not memory
- **Test against decisions** - does philosophy explain your roadmap?
- **Be pragmatic** - spec should be achievable, not fantasy

### Don't

- **Rationalize bad decisions** - acknowledge technical debt
- **Create aspirational spec disguised as current state** - pick one approach
- **Skip team alignment** - specification needs buy-in
- **Forget about users** - even existing products should center on user experience
- **Rush the process** - thorough discovery creates better specs

---

## Expected Outcome

After completing this process, you will have:

**Specification Files:**
- **01.FOUNDATIONAL_PHILOSOPHY.md** - Ideal or emergent philosophy
- **02.STABLE_TRUTHS.md** - Target or extracted strategy
- **03.INTERACTION_ARCHITECTURE.md** - Desired or current patterns
- **04.SYSTEMS/** - Ideal or existing architecture
- **05.IMPLEMENTATION/** - User stories and parameters

**Additional Deliverables:**

*If Specification-First:*
- Gap analysis document
- Migration roadmap (priorities, timeline)
- Refactoring plan
- Team alignment on ideal state

*If Reverse-Engineering:*
- Validation report (spec vs. implementation)
- Technical debt documentation
- Architectural decision records (implicit → explicit)

---

## Next Steps After Adoption

### For Specification-First:

1. **Share gap analysis** with team and stakeholders
2. **Prioritize migration** - What to refactor first?
3. **Plan incrementally** - Quarterly or monthly milestones
4. **Update spec** as you migrate (should become current state)
5. **Use for new features** - Build new work according to spec
6. **Validate** - Use [validate-spec.md](validate-spec.md) periodically

**Timeline:** 3-12 months of gradual alignment

### For Reverse-Engineering:

1. **Validate** with team - Does spec match their understanding?
2. **Share with stakeholders** - Formalize architectural knowledge
3. **Use for onboarding** - New developers read spec first
4. **Use for new features** - Reference spec when adding features
5. **Update as you build** - Keep spec in sync with code
6. **Consider improvements** - Note areas for future enhancement

**Timeline:** Specification complete immediately, maintenance ongoing

---

## Troubleshooting

**Q: My current architecture doesn't match any design philosophy**
- A: Common with organic growth. For Specification-First, define the philosophy you want. For Reverse-Engineering, be honest about the mess and document it as technical debt.

**Q: I can't decide between Specification-First and Reverse-Engineering**
- A: Ask: "Do we want to improve architecture?" Yes → Specification-First. "Do we just need docs?" Yes → Reverse-Engineering.

**Q: The gap between current and ideal is overwhelming**
- A: Normal! Break migration into phases. You don't have to fix everything at once. Prioritize high-impact, low-effort improvements first.

**Q: Team disagrees on what the philosophy should be**
- A: This is valuable! Surface disagreements now. Facilitate discussion. Philosophy must reflect team consensus, not individual vision.

**Q: Current code contradicts what we say we value**
- A: If Specification-First: Document ideal and plan migration. If Reverse-Engineering: Admit the contradiction, update philosophy to match decisions, or note technical debt.

**Q: Some existing features don't fit any Design Pillar**
- A: If Specification-First: These are candidates for removal or redesign. If Reverse-Engineering: Your pillars may be wrong - they must explain actual features.

**Q: How detailed should gap analysis be?**
- A: High-level for 80% of gaps, detailed for highest-priority migration items. Don't document every small difference.

---

## Success Criteria

You'll know this worked when:

**Specification-First:**
- ✅ Team aligned on ideal philosophy and architecture
- ✅ Gap analysis clearly shows current vs. ideal
- ✅ Migration roadmap has quarterly milestones
- ✅ Spec guides new feature development starting now
- ✅ Team can explain why ideal is better than current

**Reverse-Engineering:**
- ✅ Spec accurately documents current implementation
- ✅ Team agrees specification matches reality
- ✅ New developers can onboard from specification
- ✅ Spec explains architectural decisions
- ✅ Technical debt is documented honestly

**Both:**
- ✅ Single source of truth for product philosophy
- ✅ Design Pillars guide roadmap decisions
- ✅ Specifications stay in sync with code
- ✅ Team references spec in planning and reviews
