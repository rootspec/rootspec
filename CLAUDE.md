# CLAUDE.md

Guidance for Claude Code when working with RootSpec.

---

## What RootSpec Is

A specification language for software. Five hierarchical levels — philosophy, truths, interactions, systems, implementation — where each level can only reference higher levels. Four skills (`/rs-init`, `/rs-spec`, `/rs-impl`, `/rs-validate`) drive all workflows.

**Are you in the framework repository?**
- Files: `00.FRAMEWORK.md`, `skills/`, `CLAUDE.md`, `rootspec/` (self-hosted product spec)
- Purpose: Maintain the framework and skills

**Are you in a user's project?**
- User has installed the RootSpec plugin (skills available as `/rs-*`)
- User has or is creating specs: `01.PHILOSOPHY.md`, `02.TRUTHS.md`, etc.
- **Read the user's `00.FRAMEWORK.md` first** for complete framework rules

---

## Quick Start

When a user invokes a skill, the skill's SKILL.md contains all instructions. You don't need to memorize workflows — read the skill file.

If user asks about:
- "How do I start?" → `/rs-init` then `/rs-spec`
- "How do I add a feature?" → `/rs-spec add feature description`
- "Is my spec valid?" → `/rs-spec` (validates as part of its loop)
- "How do I implement?" → `/rs-impl`
- "Run my tests" → `/rs-validate`

---

## Usage

### Skills

| Skill | Description | Mode |
|-------|-------------|------|
| `/rs-init [focus]` | Initialize project — directories, base files, prerequisites | Interactive |
| `/rs-spec [focus]` | Create or update specification — interview + validation loop | Interactive (skippable) |
| `/rs-impl [focus]` | Implement from spec — test-driven, autonomous | Non-interactive |
| `/rs-validate [focus]` | Run tests and report results | Non-interactive |

### Scenarios

**New project (greenfield):** `/rs-init` then `/rs-spec` — interview walks through L1 → L5.

**Existing project (brownfield):** `/rs-init` then `/rs-spec` — skill auto-detects code and adapts.

**Existing spec needing refresh:** `/rs-spec reinterpret`

**Adding a feature:** `/rs-spec add feature description`

**Implementing:** `/rs-impl` or `/rs-impl MVP` or `/rs-impl US-101`

**Testing:** `/rs-validate` or `/rs-validate failing`

---

## In-Depth

### Reference Hierarchy

**CRITICAL:** Each level can only reference higher levels, never lower:

1. **Level 1** → External only
2. **Level 2** → L1 + External
3. **Level 3** → L1-2 + External
4. **Level 4** → L1-3 + Sibling L4 + External
5. **Level 5** → All levels + External

### Editing Rules

1. **Maintain hierarchy** — changes in lower levels shouldn't require changes in higher levels
2. **Preserve philosophy** — changes must align with Level 1
3. **Design pillar alignment** — features must support at least one design pillar
4. **Use placeholders at Levels 1-4** — actual numbers belong in Level 5 only
5. **Follow reference rules** — never violate hierarchical reference constraints

### Level 5 USER_STORIES (YAML)

Comment-annotated YAML with test DSL that auto-generates Cypress tests.

**Core structure:** `given` (setup), `when` (action), `then` (assertions)

**See 00.FRAMEWORK.md** (search for "Level 5 USER_STORIES YAML Format") for complete format rules, DSL steps, and examples. Do NOT read the whole file — it's too large. Use Grep to find specific sections.

### Level 5 FINE_TUNING (YAML)

Comment-annotated YAML with `@annotation: value` metadata.

**See 00.FRAMEWORK.md** (search for "Level 5 FINE_TUNING YAML Format") for complete annotation syntax and examples.

### Key Concepts

**Design Pillars** (L1) are 3-5 core experiences/emotions that define the product. Focus on user FEELINGS, not features. Every feature must support at least one pillar.

**Placeholder examples:** `[short duration]`, `[base_points]`, `[brief delay]` — use in L1-4. Actual values only in L5.

**Test DSL core steps:** `visit`, `click`, `fill`, `loginAs`, `seedItem`, `shouldContain`, `shouldExist`

**Common annotations:** `@spec_version`, `@priority`, `@journey`, `@systems`, `@spec_source`, `@rationale`

---

## Workflows

### Reading Order (user's specification)

1. `00.FRAMEWORK.md` — Framework reference
2. `01.PHILOSOPHY.md` — WHY & WHAT EXPERIENCE (mission, design pillars)
3. `02.TRUTHS.md` — WHAT strategies
4. `03.INTERACTIONS.md` — HOW (behavioral loops)
5. `04.SYSTEMS/SYSTEMS_OVERVIEW.md` — System interconnections
6. Specific system docs in `04.SYSTEMS/` as needed
7. `05.IMPLEMENTATION/USER_STORIES/` — YAML with Cypress tests
8. `05.IMPLEMENTATION/FINE_TUNING/` — Numeric parameter values (YAML)

### Releasing a New Framework Version

**Use the release script:** `scripts/release.sh`

**Version numbering:** Patch = bug fixes | Minor = new features | Major = breaking changes

```bash
./scripts/release.sh 6.0.1           # actual release
./scripts/release.sh 6.0.1 --dry-run # preview changes
```

Before running: update `CHANGELOG.md` and `UPGRADE.md`, commit feature changes first.

---

## Further Reading

- `skills/` — Skill definitions (the skills read their own SKILL.md at runtime)
- `skills/README.md` — Skill index and architecture overview
- `docs/WORKFLOWS.md` — Detailed user workflow walkthroughs
- `docs/IMPLEMENTATION_WORKFLOW.md` — Implementation guide
- `00.FRAMEWORK.md` — Complete framework specification
- `README.md` — Human-focused introduction
