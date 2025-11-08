# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a **Specification Framework Repository** - a hierarchical design document system template that can be used for any software project.

This is NOT a code repository. It contains the framework definition and documentation only.

## Framework Repository Contents

**This repository contains:**
- **00.SPEC_FRAMEWORK.md** - The framework definition (users copy this to their projects)
- **README.md** - Usage guide and AI prompts
- **CLAUDE.md** - This file (AI assistant guidance)
- **CHANGELOG.md** - Version history and migration guides
- **LICENSE** - MIT License

**This repository does NOT contain:**
- User specification files (01-05)
- Project-specific content
- Implementation examples

## How Users Work with This Framework

1. **Users copy `00.SPEC_FRAMEWORK.md`** to their project directory
2. **Users (with AI assistance) create their specification files** (01-05) based on the framework
3. **User project structure:**
   - `00.SPEC_FRAMEWORK.md` (copied reference)
   - `01.FOUNDATIONAL_PHILOSOPHY.md` (user's Level 1 spec)
   - `02.STABLE_TRUTHS.md` (user's Level 2 spec)
   - `03.INTERACTION_ARCHITECTURE.md` (user's Level 3 spec)
   - `04.SYSTEMS/` (user's Level 4 specs)
   - `05.IMPLEMENTATION/` (user's Level 5 specs)

## User Specification Structure

When working with a **user's specification** (not this framework repository), you'll encounter:

- **01.FOUNDATIONAL_PHILOSOPHY.md** - WHY the project exists & WHAT core experiences (mission, design pillars, constraints)
- **02.STABLE_TRUTHS.md** - WHAT strategies (design commitments, behavioral science)
- **03.INTERACTION_ARCHITECTURE.md** - HOW interactions work (behavioral patterns)
- **04.SYSTEMS/** - Implementation details (system specifications)
- **05.IMPLEMENTATION/** - Validation and tuning
  - **USER_STORIES/** - User perspective validation (markdown)
  - **FINE_TUNING/** - Numeric parameters (comment-annotated YAML)

## Reference Hierarchy Rules

**CRITICAL**: Each level has strict reference constraints:

1. **Level 1** can only reference external resources
2. **Level 2** can reference Level 1 + external resources
3. **Level 3** can reference Levels 1-2 + external resources
4. **Level 4** can reference Levels 1-3 + sibling 04.SYSTEMS/ docs + external resources
5. **Level 5** can reference all levels + external resources

**NEVER reference lower levels from higher levels** (e.g., don't reference 04.SYSTEMS from 03.INTERACTION_ARCHITECTURE)

## Editing Guidelines

When modifying specifications:

1. **Maintain hierarchy**: Ensure changes in lower levels don't require changes in higher levels
2. **Preserve philosophy**: Changes must align with Foundational Philosophy (Level 1)
3. **Design pillar alignment**: Features must support at least one design pillar from Level 1
4. **Use placeholders at Levels 1-4**: Actual numbers belong in Level 5
5. **Keep systems isolated**: Changes to one system shouldn't break others
6. **Document dependencies**: When systems interact, make it explicit in SYSTEMS_OVERVIEW.md
7. **Follow reference rules**: Never violate the hierarchical reference constraints
8. **Interaction architecture first**: Changes to behavioral/interaction patterns should update 03.INTERACTION_ARCHITECTURE.md before system docs

### Working with Level 5 FINE_TUNING (YAML)

Level 5 FINE_TUNING files use **comment-annotated YAML** format:

**Format Rules:**
- YAML structure contains ONLY actual configuration values
- All metadata, rationale, and context goes in comments
- Use `# @annotation: value` syntax for structured metadata
- Every value should have `@rationale` and `@spec_source` annotations

**Standard Annotations:**
- `@spec_version` - Version of spec this implements
- `@system` - Which L4 system this configures
- `@spec_source` - Reference to spec docs (e.g., `04.SYSTEMS/REWARD_SYSTEM.md:45`)
- `@rationale` - Why this specific value was chosen
- `@reference` - External research or documentation
- `@alternatives` - Other values that were considered
- `@test_result` - Supporting data from testing
- `@constraints` - Validation rules (min/max/type)
- `@inviolable` - Set to `true` if from L1 (cannot be changed)
- `@review_date` - When to revisit this value
- `@impact` - Which systems are affected by this value

**Example:**
```yaml
# =============================================================================
# LEVEL 5: FINE TUNING - Reward System
# =============================================================================
# @spec_version: 1.0.0
# @system: REWARD_SYSTEM
# @spec_source: 04.SYSTEMS/REWARD_SYSTEM.md

points:
  base: 10
  # @rationale: Testing showed 10 points optimal for engagement
  # @test_result: engagement_score=8.7/10 (n=100)
  # @alternatives: [5, 15, 20]
  # @constraints: min=1, max=100, type=integer
  # @spec_source: 04.SYSTEMS/REWARD_SYSTEM.md:45
  # @review_date: 2024-04-15
```

**When editing FINE_TUNING YAML:**
1. Always update `@last_updated` timestamp in file header
2. Document `@rationale` for any value change
3. Add to `@alternatives` if testing multiple values
4. Never change `@inviolable: true` values (from L1)
5. Maintain traceability via `@spec_source` references
6. Keep YAML structure clean - metadata only in comments

## Reading Order

**For understanding the framework itself:**
1. This repository's `README.md` - Overview and getting started
2. `00.SPEC_FRAMEWORK.md` - Complete framework definition

**When working with a user's specification:**
1. User's `00.SPEC_FRAMEWORK.md` - Framework reference (copied to their project)
2. User's `01.FOUNDATIONAL_PHILOSOPHY.md` - WHY & WHAT EXPERIENCE (mission, design pillars, principles)
3. User's `02.STABLE_TRUTHS.md` - WHAT strategies
4. User's `03.INTERACTION_ARCHITECTURE.md` - HOW (behavioral loops)
5. User's `04.SYSTEMS/SYSTEMS_OVERVIEW.md` - System interconnections
6. Specific system docs in user's `04.SYSTEMS/` as needed
7. User's `05.IMPLEMENTATION/USER_STORIES/` - User validation stories
8. User's `05.IMPLEMENTATION/FINE_TUNING/` - Numeric parameter values (YAML)

## Key Concepts

### Design Pillars (Level 1)

Design Pillars are 3-5 core experiences or emotions that define what the product IS. They serve as decision filters throughout development.

**Characteristics of good design pillars:**
- Focus on user FEELINGS, not features ("Empowered Action" not "Task Management")
- Short, emotional phrases (one sentence max)
- Specific enough to guide decisions, broad enough to inspire creativity
- Typically 3-5 pillars (more dilutes focus, fewer lacks nuance)

**Using pillars as decision filters:**
- Every feature must support at least one pillar
- When evaluating trade-offs, ask which option better supports the pillars
- Pillars help teams say "no" to feature creep

**Bad pillar examples:**
- Too generic: "Make users happy" (applies to everything)
- Too specific: "Combat system" (that's a feature, not an experience)
- Implementation detail: "React-based" (that's technology, not experience)
- Too many: 8+ pillars (dilutes focus)

**Good pillar examples:**
- "Empowered Action" - users feel capable and in control
- "Sustainable Engagement" - energizing focus, not draining obligation
- "Cascading Discovery" - one insight leads naturally to the next
