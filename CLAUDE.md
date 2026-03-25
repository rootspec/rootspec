# CLAUDE.md

Brief guidance for Claude Code when working in this repository.

## Quick Context Check

**Are you in the framework repository?**
- This repo contains the framework definition + skills
- Files: `00.SPEC_FRAMEWORK.md`, `skills/`, `README.md`, `CLAUDE.md`, `CHANGELOG.md`, `packages/`
- Does NOT contain user specification files (01-05)
- Purpose: Maintain the framework and skills

**Are you in a user's project?**
- User has installed the RootSpec plugin (skills available as `/rs-*`)
- User has or is creating specs: `01.FOUNDATIONAL_PHILOSOPHY.md`, `02.STABLE_TRUTHS.md`, etc.
- **Read the user's `00.SPEC_FRAMEWORK.md` first** for complete framework rules
- Purpose: Create/maintain/validate their product specification

---

## Skills-Based Interface (v5.0+)

RootSpec uses Claude Code skills for all specification workflows. Users invoke skills with `/rs-*` commands.

### Available Skills

| Skill | Description |
|-------|-------------|
| `/rs-init [product desc]` | Create, adopt, or reinterpret a spec — auto-detects project state |
| `/rs-level <1-5> [change]` | Edit any spec level by number |
| `/rs-feature [description]` | Add a feature with impact analysis across all levels |
| `/rs-review [target]` | Review feature-to-spec alignment, or `inverse` to find unspecced code |
| `/rs-validate` | Validate spec: hierarchy, content quality, coverage |
| `/rs-implement [story ID]` | Implement from YAML user stories (test-driven) |
| `/rs-docs [type]` | Generate PRD, TDD, backlog, pillar matrix, API docs |
| `/rs-extend <type>` | Derive artifact: tdd, ux, ui, brand, analytics, config |
| `/rs-update` | Update framework + migrate spec to latest version |
| `/rs-cypress` | Install/merge Cypress test templates |
| `/rs-help` | Show available skills, tips, best practices |

### When to Suggest Skills

If user asks about:
- "How do I start?" → `/rs-init`
- "How do I add a feature?" → `/rs-feature`
- "Is my spec valid?" → `/rs-validate`
- "How do I implement from stories?" → `/rs-implement`

---

## User's Project Scenario

**Is this a NEW project (greenfield)?**
- Starting from scratch with new product concept
- Use `/rs-init my product description`
- Generate specs level-by-level: L1 → L2 → L3 → L4 → L5

**Is this an EXISTING project (brownfield)?**
- Has existing codebase or partially-built product
- Use `/rs-init my existing product description`
- Skill auto-detects code and adapts questions

**Is this an existing spec needing refresh?**
- Use `/rs-init` — skill detects existing spec and offers reinterpret path

---

## Repository Purpose

This is a **Specification Framework Repository** — a hierarchical design document system for software projects.

**This repository provides:**
- `00.SPEC_FRAMEWORK.md` — Complete framework definition
- `skills/` — Claude Code skills for all specification workflows
- `README.md` — Human-focused introduction and philosophy
- `packages/cypress/` — `@rootspec/cypress` package with Cypress test harness templates

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

1. **Maintain hierarchy** — Changes in lower levels shouldn't require changes in higher levels
2. **Preserve philosophy** — Changes must align with Level 1
3. **Design pillar alignment** — Features must support at least one design pillar
4. **Use placeholders at Levels 1-4** — Actual numbers belong in Level 5 only
5. **Follow reference rules** — Never violate hierarchical reference constraints

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

1. `/rs-init my product description`
2. Skill auto-detects project state (greenfield/brownfield/existing spec)
3. Interview process walks through each level
4. Work level-by-level: L1 → L2 → L3 → L4 → L5

### Validating a Spec

1. `/rs-validate` — parallel checks: hierarchy, content, coverage
2. Fix issues with `/rs-level <N>` for the violating level

### Modifying a Spec

1. Identify appropriate level (WHY=L1, WHAT=L2, HOW conceptual=L3, HOW implemented=L4, HOW MUCH=L5)
2. `/rs-level <N> what you want to change`
3. Skill handles interview, drafting, and cascade prompt

### Adding a Feature

1. `/rs-feature description of the feature`
2. Skill runs impact analysis across all levels
3. Walks through each impacted level with developer

### Implementing from Tests

1. `/rs-cypress` to set up test templates (if needed)
2. `/rs-implement` to start test-driven implementation from YAML stories
3. Work MVP stories first, then SECONDARY, then ADVANCED

### Updating Framework Version

1. `/rs-update` — auto-detects version mismatch
2. Walks through breaking changes and new features

### Releasing a New Framework Version

**ALWAYS use the release script** at `scripts/release.sh` when releasing a new version.

**Version numbering:** Patch (4.4.1) = bug fixes | Minor (4.5.0) = new features | Major (5.0.0) = breaking changes

**Before running the script:**
1. Update `CHANGELOG.md` with new version section at top
2. Update `UPGRADE.md` with migration instructions (if needed for minor/major)
3. Commit feature changes first

**Run the release:**
```bash
./scripts/release.sh 4.4.1           # actual release
./scripts/release.sh 4.4.1 --dry-run # preview changes
```

**The script handles:**
- Finding and updating all version references
- Checking for stale version strings
- Committing version updates
- Creating and pushing git tag
- Creating GitHub release with changelog notes

**If you need to retag:** `git tag -d vX.Y.Z` then recreate and `git push --tags --force`

---

## Reading Order

**When working with a user's specification:**

1. User's `00.SPEC_FRAMEWORK.md` — Framework reference
2. User's `01.FOUNDATIONAL_PHILOSOPHY.md` — WHY & WHAT EXPERIENCE (mission, design pillars)
3. User's `02.STABLE_TRUTHS.md` — WHAT strategies
4. User's `03.INTERACTION_ARCHITECTURE.md` — HOW (behavioral loops)
5. User's `04.SYSTEMS/SYSTEMS_OVERVIEW.md` — System interconnections
6. Specific system docs in user's `04.SYSTEMS/` as needed
7. User's `05.IMPLEMENTATION/USER_STORIES/` — User validation stories (YAML with Cypress tests)
8. User's `05.IMPLEMENTATION/FINE_TUNING/` — Numeric parameter values (YAML)

---

## Key Concepts

### Design Pillars (Level 1)

Design Pillars are 3-5 core experiences or emotions that define what the product IS.

**Key characteristics:**
- Focus on user FEELINGS, not features
- Specific enough to guide decisions
- Typically 3-5 pillars

### YAML Formats (Level 5)

Both USER_STORIES and FINE_TUNING use comment-annotated YAML:
- YAML structure contains values only
- Metadata in comments with `@annotation: value` syntax
- Maintains traceability via `@spec_source` references

---

## Quick Reference

**Decision filter:** Every feature must support at least one Design Pillar from Level 1.

**Placeholder examples:** `[short duration]`, `[base_points]`, `[brief delay]` (use in L1-4)

**Actual values:** Only appear in Level 5 FINE_TUNING YAML files.

**Test DSL core steps:** `visit`, `click`, `fill`, `loginAs`, `seedItem`, `shouldContain`, `shouldExist`

**Common annotations:** `@spec_version`, `@priority`, `@journey`, `@systems`, `@spec_source`, `@rationale`

---

For detailed guidance, see:
- `skills/` directory for all skill definitions
- `skills/README.md` for skill index and quick start
- `docs/IMPLEMENTATION_WORKFLOW.md` for implementation guide (humans)
- `00.SPEC_FRAMEWORK.md` for complete framework specification
- `README.md` for human-focused introduction and philosophy
