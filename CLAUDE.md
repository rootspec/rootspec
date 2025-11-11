# CLAUDE.md

Brief guidance for Claude Code when working in this repository.

## Quick Context Check

**Are you in the framework repository?**
- This repo contains the framework definition only
- Files: `00.SPEC_FRAMEWORK.md`, `README.md`, `CLAUDE.md`, `CHANGELOG.md`, `templates/`, `prompts/`
- Does NOT contain user specification files (01-05)
- Purpose: Maintain the framework itself

**Are you in a user's project?**
- User has copied `00.SPEC_FRAMEWORK.md` to their project
- User has created their specs: `01.FOUNDATIONAL_PHILOSOPHY.md`, `02.STABLE_TRUTHS.md`, etc.
- **Read the user's `00.SPEC_FRAMEWORK.md` first** for complete framework rules
- Purpose: Create/maintain/validate their product specification

---

## Repository Purpose

This is a **Specification Framework Repository** - a hierarchical design document system template for software projects.

**This repository provides:**
- `00.SPEC_FRAMEWORK.md` - Complete framework definition (users copy this to their projects)
- `README.md` - Human-focused introduction and philosophy
- `prompts/` - Detailed AI assistant prompts for all use cases
- `templates/` - Cypress test templates for YAML user stories

**Users create their own specification files (01-05)** following the framework definition.

---

## Reference Hierarchy Rules

**CRITICAL:** Each level can only reference higher levels, never lower:

1. **Level 1** → External only
2. **Level 2** → L1 + External
3. **Level 3** → L1-2 + External
4. **Level 4** → L1-3 + Sibling L4 + External
5. **Level 5** → All levels + External

**Never reference lower levels from higher levels.**

---

## Editing Guidelines

When modifying specifications:

1. **Maintain hierarchy** - Changes in lower levels shouldn't require changes in higher levels
2. **Preserve philosophy** - Changes must align with Level 1
3. **Design pillar alignment** - Features must support at least one design pillar
4. **Use placeholders at Levels 1-4** - Actual numbers belong in Level 5 only
5. **Follow reference rules** - Never violate hierarchical reference constraints

### Working with Level 5 USER_STORIES (YAML)

User stories use comment-annotated YAML format with test DSL that auto-generates Cypress tests.

**Core structure:** `given` (setup), `when` (action), `then` (assertions)

**See 00.SPEC_FRAMEWORK.md** (after line 338 "Level 5 USER_STORIES YAML Format") for:
- Complete format rules and annotations (@priority, @journey, @systems)
- Core DSL steps and extension patterns
- Runtime test generation details
- Full examples

### Working with Level 5 FINE_TUNING (YAML)

Fine-tuning parameters use comment-annotated YAML with `@annotation: value` metadata.

**See 00.SPEC_FRAMEWORK.md** (after line 585 "Level 5 FINE_TUNING YAML Format") for:
- Complete annotation syntax and standard tags
- Full examples with all annotations
- Tooling recommendations

---

## Common Scenarios

### Creating a New Spec

1. Read `00.SPEC_FRAMEWORK.md` (complete framework definition)
2. Use prompt from `prompts/initialize-spec.md`
3. Follow AI Assistant Guidance section in 00.SPEC (after line 771)
4. Work level-by-level: L1 → L2 → L3 → L4 → L5

### Validating a Spec

1. Check reference hierarchy (L1→external, L2→L1+external, etc.)
2. Verify no numeric values in L1-4 (placeholders only)
3. Ensure Design Pillars focus on feelings, not features
4. See validation checklists in `00.SPEC_FRAMEWORK.md` or use `prompts/validate-spec.md`

### Modifying a Spec

1. Identify appropriate level (WHY=L1, WHAT=L2, HOW conceptual=L3, HOW implemented=L4, HOW MUCH=L5)
2. Make changes at that level
3. Propagate downward (never upward)
4. Verify no new reference violations
5. See `prompts/add-feature.md` for detailed guidance

### Migrating Spec Versions

1. Read `CHANGELOG.md` for breaking changes
2. Use prompt from `prompts/migrate-spec.md`
3. Follow migration guide for specific version (e.g., v2.x → v3.0)

---

## Reading Order

**When working with a user's specification:**

1. User's `00.SPEC_FRAMEWORK.md` - Framework reference
2. User's `01.FOUNDATIONAL_PHILOSOPHY.md` - WHY & WHAT EXPERIENCE (mission, design pillars)
3. User's `02.STABLE_TRUTHS.md` - WHAT strategies
4. User's `03.INTERACTION_ARCHITECTURE.md` - HOW (behavioral loops)
5. User's `04.SYSTEMS/SYSTEMS_OVERVIEW.md` - System interconnections
6. Specific system docs in user's `04.SYSTEMS/` as needed
7. User's `05.IMPLEMENTATION/USER_STORIES/` - User validation stories (YAML with Cypress tests)
8. User's `05.IMPLEMENTATION/FINE_TUNING/` - Numeric parameter values (YAML)

---

## Key Concepts

### Design Pillars (Level 1)

Design Pillars are 3-5 core experiences or emotions that define what the product IS.

**Key characteristics:**
- Focus on user FEELINGS, not features
- Specific enough to guide decisions
- Typically 3-5 pillars

**See 00.SPEC_FRAMEWORK.md** Level 1 examples for complete structure and good/bad examples.

### YAML Formats (Level 5)

Both USER_STORIES and FINE_TUNING use comment-annotated YAML:
- YAML structure contains values only
- Metadata in comments with `@annotation: value` syntax
- Maintains traceability via `@spec_source` references

**See 00.SPEC_FRAMEWORK.md** sections marked with HTML comments for complete details.

---

## Quick Reference

**Decision filter:** Every feature must support at least one Design Pillar from Level 1.

**Placeholder examples:** `[short duration]`, `[base_points]`, `[brief delay]` (use in L1-4)

**Actual values:** Only appear in Level 5 FINE_TUNING YAML files.

**Test DSL core steps:** `visit`, `click`, `fill`, `loginAs`, `seedItem`, `shouldContain`, `shouldExist`

**Common annotations:** `@spec_version`, `@priority`, `@journey`, `@systems`, `@spec_source`, `@rationale`

---

For detailed prompts and guidance, see:
- `prompts/` directory for all use cases
- `00.SPEC_FRAMEWORK.md` for complete framework specification
- `README.md` for human-focused introduction and philosophy
