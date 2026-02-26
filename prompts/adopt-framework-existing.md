I have an existing {{#IF FRAMEWORK}}{{FRAMEWORK}} {{/IF}}project and want to adopt the RootSpec hierarchical specification framework. Please help me create my specification by analyzing my codebase.

## My Project Structure

**Source directories:**
{{#EACH SOURCE_DIRS}}
- {{ITEM}}
{{/EACH}}
{{#IF NO_SOURCE_DIRS}}(No common source directories detected — please explore the project root){{/IF}}

**Configuration files:**
{{#EACH CONFIG_FILES}}
- {{ITEM}}
{{/EACH}}
{{#IF NO_CONFIG_FILES}}(None detected){{/IF}}

**Framework/Stack:** {{#IF FRAMEWORK}}{{FRAMEWORK}}{{/IF}}{{#IF NO_FRAMEWORK}}(Not detected — please check package.json){{/IF}}

**Specification directory:** {{SPEC_DIR}}/

---

## RootSpec Framework

Please fetch the framework definition before proceeding:
https://raw.githubusercontent.com/rootspec/rootspec/main/00.SPEC_FRAMEWORK.md

---

## Step 1: Choose Your Approach

Before we begin, decide which approach fits your situation:

### Option A: Specification-First (Recommended)

**Choose this if:**
- You want to improve architecture or address technical debt
- The current codebase has grown organically without clear philosophy
- You want a long-term vision to refactor toward

**How it works:**
1. Define the ideal philosophy, strategy, and architecture (what SHOULD exist)
2. Document current state as a gap analysis (what EXISTS now)
3. Plan incremental migration toward the spec

**Note:** The spec will describe your *ideal* product, not just what's currently built.

### Option B: Reverse-Engineering (Pragmatic)

**Choose this if:**
- You just need to document existing architecture
- Current decisions are sound and you want to formalize them
- You can't afford refactoring or major changes

**How it works:**
1. Analyze the code to infer implicit design decisions
2. Extract retrospective philosophy from patterns already in use
3. Document current state accurately at each level

**Adoption approach:** {{ADOPTION_APPROACH}}

---

## Step 2: Discovery Questions

Before writing any spec files, please read my source code and answer these questions with me. Ask one level at a time.

### Level 1 — Foundational Philosophy (WHY & WHAT EXPERIENCE)

- What user problems is this code clearly solving? What pain points does it avoid or improve?
- What decisions are made repeatedly throughout the codebase that reveal an implicit philosophy?
- Are there patterns in naming, structure, or UI that suggest a consistent point of view?
- What do users of this product likely care most about? How do they want to *feel* while using it?
- What would a competitor need to do to win users away — what does this product do distinctly?

_From answers above, we will define: Mission, 3-5 Design Pillars (feelings, not features)_

### Level 2 — Stable Truths (WHAT strategies)

- What patterns repeat across the codebase? (e.g., "always optimistic update", "never block the user", "data is always validated server-side")
- What tradeoffs has the team consistently made? (e.g., performance vs. simplicity, flexibility vs. opinionation)
- What does the code *refuse* to do — what's consistently out of scope or avoided?
- What mental models does the user need to understand to use this product effectively?

_From answers above, we will define: Core strategies, design commitments, and non-negotiables_

### Level 3 — Interaction Architecture (HOW users interact)

- Walk me through the main user journey as it exists today (step by step)
- What triggers user actions? What feedback do users receive after acting?
- Are there any "modes" or states the product cycles through?
- What are the primary loops — what do users do repeatedly?
- Where do users get stuck or confused currently?

_From answers above, we will define: Behavioral loops, triggers, feedback patterns_

### Level 4 — Systems (Technical Architecture)

- What are the major subsystems or modules? (auth, data layer, UI layer, API, etc.)
- What data flows between them? What are the critical data structures?
- What external services or integrations exist?
- What are the system boundaries and contracts (APIs, events, shared state)?

_From answers above, we will define: System map, interfaces, data flows_

### Level 5 — Implementation Details

- What are the critical user paths? (the flows that, if broken, would break the product)
- Do any existing tests already document user stories or acceptance criteria?
- Are there configuration values or parameters scattered in the code that should be centralized?

_From answers above, we will define: YAML user stories, fine-tuning parameters_

---

## Step 3: Existing Tests → Level 5

If tests exist in the codebase (unit, integration, or E2E):

1. **Identify existing test files** and their coverage
2. **Map tests to user stories** — each meaningful test scenario becomes a YAML user story
3. **Convert to YAML format** using the Level 5 USER_STORIES schema from 00.SPEC_FRAMEWORK.md
4. **Don't create from scratch** — extract the intent from existing tests first

If no tests exist:
- Identify the 3-5 most critical user paths
- Write YAML user stories for those paths as the starting point

---

## Step 4: Create Specification Files

Please create these files in {{SPEC_DIR}}/:

1. **{{SPEC_DIR}}/01.FOUNDATIONAL_PHILOSOPHY.md**
   - Mission statement
   - Design Pillars (3-5, focus on user feelings, not features)
   - Anti-patterns section (what this product explicitly is NOT)

2. **{{SPEC_DIR}}/02.STABLE_TRUTHS.md**
   - Core strategies and design commitments
   - Non-negotiables and tradeoff decisions
   - Mental models the user must internalize

3. **{{SPEC_DIR}}/03.INTERACTION_ARCHITECTURE.md**
   - Primary user journeys (as they exist or as they should exist)
   - Behavioral loops (trigger → action → feedback)
   - System interaction patterns

4. **{{SPEC_DIR}}/04.SYSTEMS/SYSTEMS_OVERVIEW.md** + individual system files
   - System map and boundaries
   - Data flows and contracts
   - External integrations

5. **{{SPEC_DIR}}/05.IMPLEMENTATION/USER_STORIES/** (YAML)
   - Critical path user stories
   - Mapped from existing tests where possible
   - Given/when/then format for Cypress test generation

6. **{{SPEC_DIR}}/05.IMPLEMENTATION/FINE_TUNING/** (YAML)
   - Numeric parameters currently hardcoded in the codebase
   - Thresholds, limits, durations that belong in spec

---

## Gap Analysis (Specification-First only)

After creating the spec, document the gaps:

For each spec section, note:
- **Status:** Implemented / Partially implemented / Not yet implemented / Contradicted by code
- **Delta:** What would need to change in the code to match the spec
- **Priority:** Must-fix / Should-fix / Nice-to-have

This gap analysis becomes your migration roadmap.

---

## Anti-Patterns to Avoid

**Level 1 anti-patterns:**
- Design Pillars that describe features ("has a dashboard") instead of feelings ("feels effortless")
- Mission that describes the product category instead of the user benefit
- More than 5 Design Pillars (loses focus)

**Level 2 anti-patterns:**
- Strategies that contradict each other without acknowledging the tradeoff
- Stable Truths that reference implementation details (those belong in L4)
- Strategies that are actually Level 1 values (move them up)

**Level 3 anti-patterns:**
- Journeys that skip over user confusion points
- Assuming the current implementation IS the intended interaction pattern
- Behavioral loops with no feedback step

**Level 4 anti-patterns:**
- Systems that do too many things (split them)
- Missing contracts/interfaces between systems
- Documenting implementation details instead of system responsibilities

**Level 5 anti-patterns:**
- User stories that test implementation instead of user outcomes
- Fine-tuning values without rationale (`@rationale` annotation is required)
- Skipping `@spec_source` references (breaks traceability)

---

## Coverage Checklist

Before finishing, verify:

- [ ] Every existing screen/feature maps to at least one user story at Level 5
- [ ] Every user story references at least one Design Pillar (via `@spec_source`)
- [ ] Every system in L4 has at least one user story in L5
- [ ] No numeric values in L1-L4 (use placeholders like `[short duration]`)
- [ ] All L4 systems only reference L1-L3 (no circular references)
- [ ] Design Pillars describe feelings, not features

---

Please start by reading the source code, then work through the discovery questions with me before writing any spec files. Ask each level's questions before moving to the next.
