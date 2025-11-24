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

## CLI-Aware Workflows (v4.0+)

**RootSpec v4.0+** includes a CLI that auto-generates prompts with project context.

### Using the CLI

When you see prompt references like `prompts/initialize-spec.md` in this guide:
- **Preferred**: User runs `rootspec prompts <name>` to get auto-filled prompt
- **Manual**: User reads template file directly (contains `{{PLACEHOLDERS}}`)

### What the CLI Does

The CLI automatically scans the user's codebase to fill in:
- **Framework detection**: Next.js, Nuxt, React, Vue, Angular, Express, Fastify, etc.
- **Source directories**: `src/`, `lib/`, `app/`, `components/`, `pages/`, etc.
- **Configuration files**: `tsconfig.json`, `package.json`, build configs, etc.
- **Specification directory**: Location from `.rootspecrc.json` or scanning

### CLI Commands for Common Tasks

- `rootspec init` - Initialize framework in project
- `rootspec prompts init` - New project prompt (auto-scanned)
- `rootspec prompts adopt` - Existing project prompt (auto-scanned)
- `rootspec prompts validate` - Validation prompt (scans spec files)
- `rootspec prompts add-feature` - Add feature prompt (scans spec)
- `rootspec prompts review` - Review feature prompt (scans spec)
- `rootspec cypress` - Install Cypress templates
- `rootspec validate` - Run validation checks

### When to Mention CLI

If user asks about:
- "How do I start?" → Suggest `rootspec init` + `rootspec prompts <name>`
- "How do I use prompts?" → Mention CLI auto-fills context
- "Can I do this manually?" → Yes, prompts/ files are templates

---

## User's Project Scenario

**Is this a NEW project (greenfield)?**
- Starting from scratch with new product concept
- No existing codebase or minimal implementation
- Use `rootspec prompts init` (or manually read `prompts/initialize-spec.md`)
- Generate specs level-by-level: L1 → L2 → L3 → L4 → L5
- Work top-down from philosophy to implementation

**Is this an EXISTING project (brownfield)?**
- Has existing codebase or partially-built product
- Applying framework retroactively
- Use `rootspec prompts adopt` (or manually read `prompts/adopt-framework-existing.md`)
- **Choose approach:**
  - **Specification-First (recommended):** Define ideal state, create gap analysis, refactor toward spec
  - **Reverse-Engineering:** Document current state, infer philosophy from implementation
- Handle technical debt and migration planning

**Key differences in approach:**
- Greenfield: Philosophy guides implementation (design first)
- Brownfield Spec-First: Define ideal, plan migration, refactor incrementally
- Brownfield Reverse-Eng: Extract philosophy from code, document as-is

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

1. Run `rootspec init` to initialize framework
2. Run `rootspec prompts init` to generate context-aware prompt (or read `prompts/initialize-spec.md`)
3. Paste generated prompt into AI assistant
4. Follow AI Assistant Guidance section in 00.SPEC (after line 771)
5. Work level-by-level: L1 → L2 → L3 → L4 → L5

### Validating a Spec

1. Run `rootspec validate` for automated checks
2. Run `rootspec prompts validate` for detailed AI validation (or read `prompts/validate-spec.md`)
3. Check reference hierarchy (L1→external, L2→L1+external, etc.)
4. Verify no numeric values in L1-4 (placeholders only)
5. Ensure Design Pillars focus on feelings, not features

### Modifying a Spec

1. Identify appropriate level (WHY=L1, WHAT=L2, HOW conceptual=L3, HOW implemented=L4, HOW MUCH=L5)
2. Make changes at that level
3. Propagate downward (never upward)
4. Verify no new reference violations
5. Use `rootspec prompts add-feature` for AI guidance (or read `prompts/add-feature.md`)

### Implementing from Tests

**Use when:** Implementing application iteratively from YAML user stories (spec-first development)

**For AI assistance:**
1. Use `rootspec prompts implement` (or read `prompts/implement-from-tests.md`)
2. **Phase 1:** Analyze all YAML tests, identify global setup needs
3. **Phase 2:** Implement global setup (auth, DB reset, seed data)
4. **Phase 3:** Iterate through MVP tests, implement one at a time

**For human developers:**
- See `docs/IMPLEMENTATION_WORKFLOW.md` for detailed guide
- Decision tree: Extend DSL → Modify app → Create fixtures
- Commit after each passing test
- Work MVP first, then POST_MVP

**Key patterns:**
- Global setup: `beforeEach` with database reset in `cypress/support/e2e.ts`
- Auth: `loginAs` task in `cypress.config.ts` + localStorage/cookies
- Seed data: `seedItem` task for on-demand test data
- DSL extension: Add steps to `cypress/support/steps.ts` + schema

### Migrating Spec Versions

1. Read `CHANGELOG.md` for breaking changes
2. Use prompt from `prompts/migrate-spec.md`
3. Follow migration guide for specific version (e.g., v2.x → v3.0)

### Releasing a New Framework Version

**When making framework changes,** follow this process to commit and tag a new version.

**Version numbering:** Patch (3.4.1) = bug fixes | Minor (3.5.0) = new features | Major (4.0.0) = breaking changes

**Steps:**

```bash
# 1. Update CHANGELOG.md with new version section at top (manually edit)

# 1.5. Update UPGRADE.md with migration instructions
# Add new section at top with version upgrade path
# Include: what changed, action required, breaking changes

# 2. Find and update all version references in docs
grep -r "v3\.[0-3]\.0" --include="*.md" . | grep -v ".git" | grep -v "CHANGELOG.md"
# Update: 00.SPEC_FRAMEWORK.md, README.md (2 places), CHANGELOG.md links, all prompts/*

# 3. Commit feature changes
git add CHANGELOG.md UPGRADE.md 00.SPEC_FRAMEWORK.md README.md prompts/ docs/ templates/
git commit -m "Add [feature name] (vX.Y.0)

[Description]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 4. Commit version number updates
git add .
git commit -m "Update all version references to X.Y.0 throughout documentation

- 00.SPEC_FRAMEWORK.md: [old] → X.Y.0
- README.md: [old] → X.Y.0
- CHANGELOG.md: Add version comparison links
- All prompts updated to vX.Y.0"

# 5. Create tag
git tag -a vX.Y.0 -m "Version X.Y.0: [Brief description]

New features:
- [List]

See CHANGELOG.md for details."

# 6. Verify
git log --oneline -5
git tag -l "v3.*" | tail -3
git status

# 7. Push
git push && git push origin vX.Y.0
```

**If you need to retag:** `git tag -d vX.Y.0` then recreate and `git push --tags --force`

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
- `prompts/implement-from-tests.md` for iterative implementation workflow (AI)
- `docs/IMPLEMENTATION_WORKFLOW.md` for implementation guide (humans)
- `00.SPEC_FRAMEWORK.md` for complete framework specification
- `README.md` for human-focused introduction and philosophy
