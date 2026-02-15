# Derivation Seeds Roadmap

> **Note:** This document was a vision/roadmap for the derivation feature.
> The feature is now implemented as "root extensions" (`rootspec extend`).
> This file is archived for historical context.

Vision document for expanding RootSpec's derivation capabilities.

---

## The Vision

Software is not one tree. A mature specification can produce many independent derivations.

The framework file is the original seed — it grows a full specification through AI conversation. But once you have a spec, different parts can seed different outputs:

- **L4 Systems** → Technical design documents
- **L5 User Stories** → UX design artifacts
- **L3 Interaction Patterns** → Analytics event taxonomies
- **L1 Design Pillars** → Brand guidelines

These are **parallel branches**, not a pipeline. Use the seeds you need, skip the ones you don't.

---

## Seed Catalog

TODO: another important seed is security. Let's call this the Red Team seed, which looks for exploits. It can operate similar to user stories and tests, where the tests are expected to be written as to _not_ allow an exploit. Importantly for modern apps, this should include prompt injection testing.

| Seed                              | Input             | Output                                        | Type          |
| --------------------------------- | ----------------- | --------------------------------------------- | ------------- |
| **Systems → Technical Design**    | L4 Systems        | Architecture diagrams, API specs, data models | External      |
| **User Stories → UX Design**      | L5 USER_STORIES   | Wireframes, user flows, screen specs          | External      |
| **UX Design → UI Design**         | UX artifacts      | Visual specs, component libraries             | External      |
| **Philosophy → Brand Guidelines** | L1 Design Pillars | Voice/tone guide, brand principles            | External      |
| **Interaction → Analytics Plan**  | L3 Patterns       | Event taxonomy, metrics definitions           | Spec-adjacent |
| **Fine-Tuning → Config Schema**   | L5 FINE_TUNING    | JSON schemas, config templates                | External      |

**Type definitions:**

- **External**: Standalone deliverables outside the spec ecosystem
- **Spec-adjacent**: Content that may feed back into or extend the spec

---

## Priority: Systems → Technical Design

First seed to implement.

**Input:** L4 Systems documentation

- `04.SYSTEMS/SYSTEMS_OVERVIEW.md`
- Individual system files (`04.SYSTEMS/*.md`)

**Output:** Technical Design Document containing:

- Architecture diagram descriptions (Mermaid/PlantUML syntax)
- API endpoint specifications
- Data model definitions
- Integration contracts between systems
- Sequence diagrams for key flows

**Why this first:**

- Direct path from spec to implementation
- High value for engineering teams
- Clear input/output boundary
- L4 Systems is well-structured for derivation

---

## Seed Anatomy

Common structure for all derivation seeds (implemented as prompts):

```
Source:        Which spec level(s) to read
Context:       Additional info the AI needs (tech stack, conventions)
Transformation: What derivation to perform
Output format: Structure of produced artifact
Traceability:  How to link back to source spec
```

Each seed will become a prompt in `prompts/derive-*.md` and a CLI command.

---

## Future CLI Integration

```bash
# Derive technical design from L4 Systems
rootspec derive technical-design

# Derive UX artifacts from user stories
rootspec derive ux-design

# Derive analytics plan from interaction patterns
rootspec derive analytics-plan

# List available derivation seeds
rootspec derive --list
```

---

## Implementation Phases

### Phase 1: Foundation

- [ ] Document seed pattern in 00.SPEC_FRAMEWORK.md
- [ ] Create first prompt: `prompts/derive-technical-design.md`
- [ ] Add `rootspec derive` CLI command scaffold

### Phase 2: Core Seeds

- [ ] Systems → Technical Design (priority)
- [ ] User Stories → UX Design
- [ ] Philosophy → Brand Guidelines

### Phase 3: Extended Seeds

- [ ] UX Design → UI Design
- [ ] Interaction → Analytics Plan
- [ ] Fine-Tuning → Config Schema

### Phase 4: Ecosystem

- [ ] Seed composition (chain seeds when needed)
- [ ] Custom seed definitions
- [ ] Seed templates for common tech stacks

---

## Open Questions

1. **Should seeds be bidirectional?** Can technical design seed back into Systems docs?
2. **Versioning**: How to handle seed outputs when source spec changes?
3. **Validation**: Should derived artifacts validate against source?
4. **Storage**: Where do derived artifacts live? Separate directory? External tools?
