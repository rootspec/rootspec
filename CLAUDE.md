# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a **Specification Framework Repository** - a hierarchical design document system template that can be used for any software project.

This is NOT a code repository. It contains markdown documentation only.

## Specification Framework

This repository implements the hierarchical specification framework defined in `00.SPEC_FRAMEWORK.md`.

**Read `00.SPEC_FRAMEWORK.md` first** to understand the 5-level hierarchy, reference rules, and architectural philosophy.

All project-specific content is in the level documents (01-04). This file provides navigation guidance only.

## Document Hierarchy

- **00.SPEC_FRAMEWORK.md** - Generic hierarchical framework (reusable)
- **01.FIRST_PRINCIPLES.md** - WHY the project exists (philosophy, mission, constraints)
- **02.STABLE_TRUTHS.md** - WHAT strategies (design commitments, behavioral science)
- **03.INTERACTION_ARCHITECTURE.md** - HOW interactions work (Hook Model implementation)
- **04.SYSTEMS/** - Implementation details (9 interconnected systems)
- **05.FINE_TUNING/** - NOT YET CREATED (future numeric balancing)

## Reference Hierarchy Rules

**CRITICAL**: Each level has strict reference constraints:

1. **Level 1** can only reference external resources
2. **Level 2** can reference Level 1 + external resources
3. **Level 3** can reference Levels 1-2 + external resources
4. **Level 4** can reference Levels 1-3 + sibling 04.SYSTEMS/ docs + external resources
5. **Level 5** can reference all levels + external resources

**NEVER reference lower levels from higher levels** (e.g., don't reference 04.SYSTEMS from 03.INTERACTION_ARCHITECTURE)

## Editing Guidelines

When modifying specifications:

1. **Maintain hierarchy**: Ensure changes in lower levels don't require changes in higher levels
2. **Preserve philosophy**: Changes must align with First Principles
3. **Use placeholders at Levels 1-4**: Actual numbers belong in Level 5
4. **Keep systems isolated**: Changes to one system shouldn't break others
5. **Document dependencies**: When systems interact, make it explicit in SYSTEMS_OVERVIEW.md
6. **Follow reference rules**: Never violate the hierarchical reference constraints
7. **Interaction architecture first**: Changes to behavioral/interaction patterns should update 03.INTERACTION_ARCHITECTURE.md before system docs

## Reading Order

1. `00.SPEC_FRAMEWORK.md` - Understand the framework
2. `01.FIRST_PRINCIPLES.md` - WHY
3. `02.STABLE_TRUTHS.md` - WHAT strategies
4. `03.INTERACTION_ARCHITECTURE.md` - HOW (behavioral loops)
5. `04.SYSTEMS/SYSTEMS_OVERVIEW.md` - System interconnections
6. Specific system docs in `04.SYSTEMS/` as needed
