# RootSpec Skills

Claude Code skills for the [RootSpec](https://github.com/rootspec/rootspec) specification framework.

## Skills

| Skill | Description |
|-------|-------------|
| `/rs-init [product desc]` | Create, adopt, or reinterpret a spec — auto-detects project state |
| `/rs-level <1-5> [change]` | Edit any spec level by number |
| `/rs-feature [description]` | Add a feature with impact analysis across all levels |
| `/rs-review [target]` | Review feature-to-spec alignment, or `inverse` to find unspecced code |
| `/rs-validate` | Validate spec: hierarchy, content quality, coverage |
| `/rs-implement [story ID]` | Implement from YAML user stories (test-driven) |
| `/rs-docs [type]` | Generate PRDs, TDDs, architectural docs |
| `/rs-extend <type>` | Derive artifact: tdd, ux, ui, brand, analytics, config |
| `/rs-update` | Update framework + migrate spec to latest version |
| `/rs-cypress` | Install/merge Cypress test templates |
| `/rs-help` | Show available skills, tips, best practices |

## Quick Start

```
/rs-init my productivity app for remote teams
```

## How It Works

Each skill follows a 4-phase pattern:

1. **Context** — Run scripts to understand current project/spec state
2. **Interview** — Ask questions one at a time, challenge anti-patterns
3. **Draft & Write** — Generate spec content, iterate with developer, write files
4. **Cascade** — Offer to review downstream levels affected by changes

## Directory Layout

```
skills/
  rs-shared/         Shared scripts and fragments
  rs-init/           Create/adopt/reinterpret spec
  rs-level/          Edit spec level 1-5
  rs-feature/        Add feature across levels
  rs-review/         Review against spec (+ inverse mode)
  rs-validate/       Parallel spec validation
  rs-implement/      Implement from user stories
  rs-docs/           Generate documentation
  rs-extend/         Derive specialized artifacts
  rs-update/         Update framework version
  rs-cypress/        Cypress test templates
  rs-help/           Help and tips
```
