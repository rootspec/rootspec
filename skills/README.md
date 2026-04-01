# RootSpec Skills

AI-agent skills for the [RootSpec](https://github.com/rootspec/rootspec) specification framework.

## Skills

| Skill | Description | Mode |
|-------|-------------|------|
| `/rs-init [focus]` | Initialize project — directories, base files, prerequisites | Interactive |
| `/rs-spec [focus]` | Create or update specification — interview + validation loop | Interactive (skippable) |
| `/rs-impl [focus]` | Implement from spec — test-driven, autonomous | Non-interactive |
| `/rs-validate [focus]` | Run tests and report results | Non-interactive |

## Quick Start

```
/rs-init
/rs-spec my productivity app for remote teams
/rs-impl
/rs-validate
```

## How It Works

Each skill is an agentic loop with an iteration cap:

1. **ASSESS** — Scan project state, check prerequisites
2. **PLAN** — Determine what to do next (narrowed by focus argument)
3. **ACT** — Do the work (create files, interview, implement, test)
4. **CHECK** — Verify results, decide whether to loop or exit

Skills exit on success, iteration cap, or developer interrupt.

## Directory Layout

```
skills/
  rs-shared/         Shared scripts, fragments, and bundled files
  rs-init/           Initialize project
  rs-spec/           Create or update specification
  rs-impl/           Implement from spec
  rs-validate/       Run tests and report
```
