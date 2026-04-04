<p align="center">
  <img src="assets/rootspec-banner.png" alt="RootSpec" width="600">
</p>

<h1 align="center">RootSpec</h1>

<p align="center">
  <strong>Specification Language for Software</strong><br>
  Philosophy guides implementation, never vice versa.
</p>

<p align="center">
  <a href="CHANGELOG.md">Changelog</a> •
  <a href="docs/WORKFLOWS.md">Workflows</a> •
  <a href="rootspec/00.FRAMEWORK.md">Framework</a>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT"></a>
  <a href="https://github.com/rootspec/rootspec"><img src="https://img.shields.io/github/stars/rootspec/rootspec?style=flat-square" alt="GitHub stars"></a>
</p>

---

## What and Why

RootSpec implements **purpose-aligned declarative specification** — a methodology where foundational philosophy guides implementation, never vice versa. The methodology works with or without AI, with any tooling, any team.

You define what your product is and why it exists, then derive everything else — strategies, interaction patterns, system architecture, testable user stories — in a strict hierarchy where each level can only reference the levels above it. The spec is **declarative**, **executable**, and serves as a **validation gate**: nothing ships unless it traces back to a user need, through a design pillar, to a mission.

AI makes this methodology more urgent: when code and specs can be generated trivially, the real value is **validation and proof**. The spec transforms output from "unverifiable claims" into "proven implementations."

AI has knowledge but not wisdom. It can retrieve and recombine, but it has no experience, no intuition, no skin in the game. This is why the hierarchy matters — humans supply the philosophy (why it exists, what users should feel), and AI executes the implementation. The upper levels encode the judgment that AI lacks; the lower levels leverage the speed that humans lack.

RootSpec is one implementation of this methodology — a specification language, file structure, YAML DSL, and four AI-agent skills that operationalize the approach for building software.

See [AXIOMS.md](rootspec/00.AXIOMS.md) for the foundational beliefs this framework is built on.

**Good for:** Complex products, long-lived systems, team collaboration, AI-assisted development.
**Not ideal for:** Throwaway prototypes, single-developer experiments.

---

## Quick Start

Install ([detailed instructions](https://github.com/vercel-labs/skills)):

```
npx skills add rootspec/rootspec
```

Then:

```
/rs-init
/rs-spec my productivity app for remote teams
/rs-impl
/rs-validate
```

---

## Usage

### Skills

Four skills, each an agentic loop with an iteration cap. All accept an optional **focus** argument to narrow what they work on.

| Skill | Description | Mode |
|-------|-------------|------|
| `/rs-init [focus]` | Initialize project — directories, base files, prerequisites | Interactive |
| `/rs-spec [focus]` | Create or update specification — interview + validation loop | Interactive (skippable) |
| `/rs-impl [focus]` | Implement from spec — test-driven, autonomous | Non-interactive |
| `/rs-validate [focus]` | Run tests and report results | Non-interactive |

### Focus Examples

| Command | What it does |
|---------|-------------|
| `/rs-spec` | Full spec interview, level by level |
| `/rs-spec add dark mode` | Add a feature across all affected levels |
| `/rs-spec reinterpret` | Rethink the spec from L1 down |
| `/rs-impl MVP` | Implement stories tagged with MVP phase |
| `/rs-impl US-101` | Implement one specific story |
| `/rs-validate TASK_SYSTEM` | Test stories for one system |
| `/rs-validate failing` | Re-run previously failing tests |

### The Five Levels

| Level | Purpose | Key Question |
|-------|---------|-------------|
| **1: Philosophy** | WHY & WHAT EXPERIENCE | "What should users feel?" |
| **2: Truths** | Design strategies & commitments | "What approach will we take?" |
| **3: Interactions** | HOW users and product interact | "What's the behavioral pattern?" |
| **4: Systems** | Implementation architecture | "How do we build this?" |
| **5: Implementation** | Validation & tuning (YAML) | "Does it work? What values?" |

Each level can only reference higher levels, never lower. This prevents circular dependencies and keeps philosophy stable when implementation changes.

---

## In-Depth

### How It Works

1. **Init** — Set up project directories, base files, and prerequisites
2. **Spec** — Define what to build through interview-driven dialogue with built-in validation
3. **Impl** — Build it test-driven from the spec, autonomously
4. **Validate** — Run tests and prove it works

### Project Structure

```
your-project/
├── .rootspec.json                   # Project config
├── rootspec/                        # Specification directory
│   ├── 00.AXIOMS.md                # Foundational beliefs (reference)
│   ├── 00.FRAMEWORK.md             # Framework definition (reference)
│   ├── 01.PHILOSOPHY.md            # L1: WHY & WHAT EXPERIENCE
│   ├── 02.TRUTHS.md                # L2: Design strategies
│   ├── 03.INTERACTIONS.md          # L3: Interaction patterns
│   ├── 04.SYSTEMS/                 # L4: System specs
│   │   ├── SYSTEMS_OVERVIEW.md
│   │   └── [YOUR_SYSTEMS].md
│   ├── 05.IMPLEMENTATION/          # L5: User stories + parameters
│   │   ├── USER_STORIES/           # YAML → Cypress tests
│   │   └── FINE_TUNING/            # Numeric parameter YAML
│   ├── DERIVED_ARTIFACTS/          # Generated: technical & visual design
│   │   ├── technical-design.md     # Architecture, stack, conventions
│   │   └── visual-design.md        # Design principles, components, layout
│   ├── spec-status.json            # Spec validation tracking
│   └── tests-status.json           # Test pass/fail tracking
└── ...
```

### Further Reading

- [00.FRAMEWORK.md](rootspec/00.FRAMEWORK.md) — Complete framework specification (the language definition)
- [docs/IMPLEMENTATION_WORKFLOW.md](docs/IMPLEMENTATION_WORKFLOW.md) — Detailed guide for translating YAML stories into code
- [docs/CYPRESS_SETUP.md](docs/CYPRESS_SETUP.md) — Setting up E2E testing with Cypress

---

## Workflows

| Scenario | Commands |
|----------|----------|
| **New project** | `/rs-init` → `/rs-spec` → `/rs-impl` → `/rs-validate` |
| **Existing codebase** | `/rs-init` → `/rs-spec` (scans your code) → `/rs-impl` → `/rs-validate` |
| **Add a feature** | `/rs-spec add push notifications` → `/rs-impl` → `/rs-validate` |
| **Change the spec** | `/rs-spec update L2 trade-offs` → `/rs-impl failing` → `/rs-validate` |
| **Run tests** | `/rs-validate` or `/rs-validate <phase>` or `/rs-validate TASK_SYSTEM` |

See [docs/WORKFLOWS.md](docs/WORKFLOWS.md) for detailed walkthroughs of each scenario.

---

**Version v6.2.2** — See [CHANGELOG.md](CHANGELOG.md) for history. MIT [License](LICENSE). [Contributing](CONTRIBUTING.md).
