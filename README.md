<p align="center">
  <img src="assets/rootspec-banner.png" alt="RootSpec" width="600">
</p>

<h1 align="center">RootSpec</h1>

<p align="center">
  <strong>Hierarchical Specification Framework</strong><br>
  Philosophy guides implementation, never vice versa.
</p>

<p align="center">
  <a href="CHANGELOG.md">Changelog</a> •
  <a href="skills/">Skills</a> •
  <a href="00.SPEC_FRAMEWORK.md">Framework</a>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT"></a>
  <a href="https://github.com/rootspec/rootspec"><img src="https://img.shields.io/github/stars/rootspec/rootspec?style=flat-square" alt="GitHub stars"></a>
</p>

---

**Version v5.0.1**

A structured approach to software specification that enforces **dependency inversion**: foundational philosophy guides implementation, never vice versa.

**AI-First Design:** Built as Claude Code skills that interview you, create your spec, validate it, and drive test-first implementation.

## Quick Start

Install the plugin:

```
/plugin marketplace add rootspec/rootspec
/plugin install rootspec
```

Then:

```
/rs-init my productivity app for remote teams
```

The skill auto-detects your project state (greenfield, existing code, or existing spec) and interviews you level by level to create your specification.

## Skills

| Skill | Description |
|-------|-------------|
| `/rs-init [product desc]` | Create, adopt, or reinterpret a spec |
| `/rs-level <1-5> [change]` | Edit any spec level by number |
| `/rs-feature [description]` | Add feature with impact analysis across all levels |
| `/rs-review [target]` | Review feature/code against spec alignment |
| `/rs-validate` | Validate spec: hierarchy, content quality, coverage |
| `/rs-implement [story ID]` | Implement from YAML user stories (test-driven) |
| `/rs-docs [type]` | Generate PRD, TDD, backlog, pillar matrix, API docs |
| `/rs-extend <type>` | Derive artifact: tdd, ux, ui, brand, analytics, config |
| `/rs-update` | Update framework + migrate spec to latest version |
| `/rs-cypress` | Install/merge Cypress test templates |
| `/rs-help` | Show skills, tips, best practices |

## The Five Levels

| Level | Purpose | Key Question | References |
|-------|---------|-------------|------------|
| **1: Foundational Philosophy** | WHY & WHAT EXPERIENCE | "What problem must we solve? What should users feel?" | External only |
| **2: Stable Truths** | Design strategies & commitments | "What approach will we take?" | L1 + External |
| **3: Interaction Architecture** | HOW users and product interact | "What's the behavioral pattern?" | L1-2 + External |
| **4: Systems** | Implementation architecture | "How do we build this?" | L1-3 + Sibling L4 + External |
| **5: Implementation** | Validation (YAML + Cypress) & tuning | "Does it work? What values?" | All levels + External |

### Reference Rules

Each level can only reference higher levels, never lower. This prevents circular dependencies and keeps philosophy stable when implementation changes.

## How It Works

### 1. Interview-Driven Spec Creation

Skills guide you through a conversational interview, one question at a time. They challenge anti-patterns (features masquerading as feelings, hardcoded numbers in the wrong level) and help you build a spec that's structurally sound.

```
/rs-init meal planning app for busy families

> No existing spec. Let's build from the ground up.
> What 3-5 similar products exist? What do they get wrong?
```

### 2. Cascading Changes

When you edit a level, the skill offers to review downstream levels:

```
/rs-level 2 add a new trade-off

> Level 2 updated. Changes may affect levels 3-5.
> 1. Review next level → /rs-level 3
> 2. Skip
> 3. Show what might need changing (read-only)
```

### 3. Parallel Validation

`/rs-validate` launches sub-agents to check hierarchy, content quality, and coverage simultaneously:

```
/rs-validate

> Score: 72/100
> FAIL  L2:45 references "INVENTORY_SYSTEM" (L4 concept)
> WARN  L3:78 "500ms" should be placeholder [brief duration]
> Fix with /rs-level 2 for the hierarchy violation.
```

### 4. Test-Driven Implementation

YAML user stories auto-generate Cypress E2E tests. The test ledger tracks pass/fail history per acceptance criterion.

```
/rs-cypress          # Install test templates
/rs-implement        # Implement from stories, one at a time
```

## Project Structure (After Setup)

```
your-project/
├── 00.SPEC_FRAMEWORK.md           # Framework definition (reference)
├── 01.FOUNDATIONAL_PHILOSOPHY.md  # L1: WHY & WHAT EXPERIENCE
├── 02.STABLE_TRUTHS.md            # L2: Design strategies
├── 03.INTERACTION_ARCHITECTURE.md # L3: Interaction patterns
├── 04.SYSTEMS/                    # L4: System specs
│   ├── SYSTEMS_OVERVIEW.md
│   └── [YOUR_SYSTEMS].md
├── 05.IMPLEMENTATION/             # L5: User stories + parameters
│   ├── USER_STORIES/              # YAML → Cypress tests
│   └── FINE_TUNING/               # Numeric parameter YAML
├── test-ledger.json               # Test pass/fail tracking
└── DERIVED_ARTIFACTS/             # Generated docs (from /rs-extend)
```

## Why This Framework?

### Validation in an AI-Driven World

AI can generate code and specs trivially. The real value is **validation and proof**.

This framework provides proof through:
1. **Top-down goal fulfillment** — start with Design Pillars (the "why")
2. **Strategic clarity** — determine "what" fulfills the philosophy
3. **Behavioral patterns** — define "how" users interact
4. **System architecture** — figure out what systems are needed
5. **User validation** — executable tests that prove it works

Every detail traces back to a user need, which traces to a Design Pillar, which serves the mission. The framework transforms AI-generated code from "unverifiable claims" into "proven implementations."

### Philosophy

Traditional spec approaches suffer from circular dependencies and implementation-driven design. This framework solves it through dependency inversion:

```
Philosophy (Level 1)
    ↓ guides
Strategy (Level 2)
    ↓ guides
Interaction Patterns (Level 3)
    ↓ guides
System Architecture (Level 4)
    ↓ guides
Implementation & Tests (Level 5)
```

**Key benefits:**
- Stable foundations — philosophy doesn't change when you adjust implementation
- Clear decision-making — Design Pillars filter feature requests
- Living documentation — YAML user stories auto-generate tests
- Team alignment — shared understanding from "why" to "how much"

### When to Use

**Good for:** Complex products, long-lived systems, team collaboration, AI-assisted development

**Not ideal for:** Throwaway prototypes, single-developer experiments

## Version Information

**Current Version:** v5.0.1

See [CHANGELOG.md](CHANGELOG.md) for version history and migration guides.

## License

MIT — see [LICENSE](LICENSE).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines. Found a bug? [File an issue](https://github.com/rootspec/rootspec/issues/new/choose).
