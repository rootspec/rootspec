---
name: rs-help
description: Show available RootSpec skills, tips, and best practices
---

Display the following help information to the developer:

## RootSpec Skills

| Skill | Description |
|-------|-------------|
| `/rs-init [product desc]` | Create, adopt, or reinterpret a spec — auto-detects project state |
| `/rs-level <1-5> [change]` | Edit any spec level by number |
| `/rs-feature [description]` | Add a feature with impact analysis across all levels |
| `/rs-review [target]` | Review feature or code against spec alignment |
| `/rs-validate` | Validate spec: hierarchy, content quality, coverage |
| `/rs-implement [story ID]` | Implement from YAML user stories (test-driven) |
| `/rs-docs [type]` | Generate PRD, TDD, backlog, pillar matrix, API docs |
| `/rs-extend <type>` | Derive artifact: tdd, ux, ui, brand, analytics, config |
| `/rs-update` | Update framework + migrate spec to latest version |
| `/rs-cypress` | Install/merge Cypress test templates |
| `/rs-help` | This help screen |

## Quick Start

**New project:** `/rs-init my productivity app for remote teams`
**Existing codebase:** `/rs-init our existing e-commerce platform`
**Edit a level:** `/rs-level 4 add a notification system`
**Add a feature:** `/rs-feature collaborative editing`
**Validate:** `/rs-validate`

## The 5 Levels

| Level | Name | Key Question | File |
|-------|------|-------------|------|
| 1 | Foundational Philosophy | WHY & what feelings? | `01.FOUNDATIONAL_PHILOSOPHY.md` |
| 2 | Stable Truths | WHAT strategies? | `02.STABLE_TRUTHS.md` |
| 3 | Interaction Architecture | HOW do users interact? | `03.INTERACTION_ARCHITECTURE.md` |
| 4 | Systems | HOW is it built? | `04.SYSTEMS/*.md` |
| 5 | Implementation | HOW MUCH? | `05.IMPLEMENTATION/**` |

## Tips

- **Start with feelings, not features** — Design Pillars describe emotions like "Empowered Action", not capabilities like "Task Dashboard"
- **One level at a time** — complete each level before moving to the next
- **Changes cascade down** — editing L1 may require updates to L2-L5
- **Placeholders in L1-4** — use `[brief duration]` not `500ms`. Only L5 has real numbers.
- **Every feature needs a pillar** — if it doesn't support a Design Pillar, reconsider it
- **Validate often** — run `/rs-validate` after major changes

## Common Workflows

**Create a full spec:** `/rs-init` → walks through all 5 levels
**Add a feature:** `/rs-feature` → impact analysis → level-by-level updates
**Review code:** `/rs-review` → checks alignment at every level
**Generate docs:** `/rs-docs PRD` → professional document from spec
**Set up testing:** `/rs-cypress` → then `/rs-implement` to build from stories
