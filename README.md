# Hierarchical Specification Framework

A structured approach to software specification that enforces **dependency inversion**: foundational philosophy guides implementation, never vice versa.

## Overview

This repository contains a complete hierarchical specification framework designed to maintain architectural coherence across software projects. The framework enforces strict separation of concerns across five levels, from philosophical foundations to implementation details.

**Core Principle:** Each concern lives at exactly one level (single source of truth). Changes flow downward through abstraction layers while foundational documents remain stable.

## The Five Levels

| Level | Purpose | Key Question | References |
|-------|---------|--------------|------------|
| **1: First Principles** | WHY the project exists | "What problem must we solve?" | External only |
| **2: Stable Truths** | Design strategies & commitments | "What approach will we take?" | L1 + External |
| **3: Interaction Architecture** | HOW users and product interact | "What's the behavioral pattern?" | L1-2 + External |
| **4: Systems** | Implementation architecture | "How do we build this?" | L1-3 + Sibling L4 + External |
| **5: Fine Tuning** | Validation & numeric tuning | "Does it work? What values?" | All levels + External |

## Quick Start

1. **Read `00.SPEC_FRAMEWORK.md`** - Understand the complete framework structure and rules
2. **Read `CLAUDE.md`** - Guidance for working with this repository
3. Follow the reading order outlined in CLAUDE.md for navigating the specifications

## Key Features

- **Strict Reference Hierarchy**: Higher levels cannot reference lower levels, preventing circular dependencies
- **Single Source of Truth**: Each concern lives at exactly one level
- **Dependency Inversion**: Philosophy drives implementation, not the reverse
- **Scalable Architecture**: Systems remain loosely coupled while maintaining clear interaction patterns
- **Future-Proof Design**: Stable upper levels protect against constant churn in implementation details

## Reference Rules

**CRITICAL**: Each level has strict reference constraints to maintain architectural integrity:

1. **Level 1** can only reference external resources
2. **Level 2** can reference Level 1 + external resources
3. **Level 3** can reference Levels 1-2 + external resources
4. **Level 4** can reference Levels 1-3 + sibling Level 4 docs + external resources
5. **Level 5** can reference all levels + external resources

**Never reference lower levels from higher levels** (e.g., don't reference Level 4 Systems from Level 3 Interaction Architecture).

## Using This Framework

This framework is designed to be:

- **Generic and reusable** across different software projects
- **AI-friendly** for working with Claude Code or other AI assistants
- **Maintainable** through strict separation of concerns
- **Scalable** from small projects to large systems

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
