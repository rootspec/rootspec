<p align="center">
  <img src="assets/rootspec-banner.png" alt="RootSpec" width="600">
</p>

<h1 align="center">RootSpec</h1>

<p align="center">
  <strong>Generate software bound by intent</strong><br>
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

RootSpec generates software bound by intent. You declare what your product is and why it exists; everything downstream — strategies, interactions, architecture, tests — is derived in a strict hierarchy where each level can only reference the levels above. Nothing ships unless it traces back to a stated purpose.

When code and specs can be generated trivially, the real value is **validation and proof**. The spec transforms output from "unverifiable claims" into "proven implementations."

Humans supply intent (why it exists, what users should feel). AI generates the implementation. The hierarchy enforces the boundary — upper levels encode judgment AI lacks; lower levels move at speed humans lack.

RootSpec is a specification language, file structure, YAML DSL, AI-agent skills, and an orchestrator that operationalize this.

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

Each skill is an agentic loop with an iteration cap. All accept an optional **focus** argument to narrow what they work on.

| Skill | Description | Mode |
|-------|-------------|------|
| `/rs-init [focus]` | Initialize project — directories, base files, prerequisites | Interactive |
| `/rs-spec [focus]` | Create or update specification — interview + validation loop | Interactive (skippable) |
| `/rs-impl [focus]` | Implement from spec — test-driven, autonomous | Non-interactive |
| `/rs-validate [focus]` | Run tests and report results | Non-interactive |
| `/rs-update [focus]` | Upgrade project to latest framework version | Interactive |
| `/rs-review [focus]` | Advisory visual review of rendered UI from screenshots | Non-interactive |

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

Intent flows down: philosophy → truths → interactions → systems → implementation. Skills drive each transition; tests prove the result still binds to the original intent.

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
│   ├── CONVENTIONS/                # Implementation conventions (created by /rs-impl)
│   │   ├── technical.md            # Stack, code patterns, API, testing
│   │   └── visual.md               # Component library, tokens, layout
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

### Unattended runs (orchestrator)

For CI, scheduled rebuilds, or any hands-off pipeline, the [**RootSpec Orchestrator**](orchestrator/README.md) chains all phases (`init → spec → impl → validate → review`) into a single `rs-orchestrate` command — with budget caps, retries, quality gates, and resumable state. Same skills, just driven autonomously instead of interactively.

---

**Version v7.6.1** — See [CHANGELOG.md](CHANGELOG.md) for history. MIT [License](LICENSE). [Contributing](CONTRIBUTING.md).
