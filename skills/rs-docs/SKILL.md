---
name: rs-docs
description: Generate PRDs, TDDs, backlogs, or other documents from your RootSpec spec
---

You are helping a developer generate professional documents from their RootSpec specification. Each document type draws from specific spec levels.

## Phase 1: Context

Run scripts to understand the spec:

```bash
bash ../rs-shared/scripts/scan-spec.sh .
bash ../rs-shared/scripts/extract-l1-pillars.sh <spec-dir>
bash ../rs-shared/scripts/list-l4-systems.sh <spec-dir>
bash ../rs-shared/scripts/list-l5-stories.sh <spec-dir>
```

If STATUS=no_spec, inform: "No specification found. Run `/rs-init` to create one first."

If the developer provided a document type as a parameter, skip to generation. Otherwise, present available types.

## Phase 2: Document Selection

Available document types:

| Type | Audience | Sources |
|------|----------|---------|
| **PRD** | Product managers, stakeholders | L1 mission + L1 pillars + L3 journeys + L5 stories by priority |
| **TDD** | Engineers, architects | L2 architecture + L4 systems + L5 parameters |
| **Backlog** | Project managers, scrum masters | L5 stories organized by priority with acceptance criteria |
| **Pillar Matrix** | Design team, product owners | L1 pillars × L4 systems mapping + gap analysis |
| **API Docs** | Integration partners, frontend devs | L4 system interfaces + L3 interaction patterns |

Ask: "Which document type do you want? You can also specify audience and project stage."

### Audience Customization

- **Executives**: Focus on L1 (mission, pillars), high-level L2 (strategy). Omit technical details.
- **Designers**: Full L1 (pillars with examples), full L3 (interactions), L5 stories by journey.
- **Engineers**: Brief L1-2 (context), full L4 (systems), full L5 (parameters, tests).

### Stage Customization

- **Early Stage**: Emphasize L1-3 (philosophy, strategy, patterns). Light L4-5.
- **Implementation**: Emphasize L4-5 (systems, stories, parameters). Reference L1-3 for context.
- **Maintenance**: Focus on L5 (stories, parameters). Reference L4 for system details.

## Phase 3: Generate

Read all relevant spec files for the selected document type.

Generate the document with:
- Clear section structure appropriate for the audience
- Traceability references back to spec levels (e.g., "from L1: Mission")
- Professional formatting
- Consistent tone

### PRD Generation

1. Executive summary from L1 Mission
2. Product principles from L1 Design Pillars
3. User journeys from L3 Interaction Architecture
4. Feature list from L5 User Stories, organized by priority
5. Success criteria from L2 Stable Truths

### TDD Generation

1. Architecture overview from L2 commitments
2. System architecture from L4 SYSTEMS_OVERVIEW
3. Detailed system designs from L4 individual system files
4. Data models and state machines from L4
5. Configuration parameters from L5 FINE_TUNING

### Backlog Generation

1. Read all L5 USER_STORIES YAML files
2. Organize by priority: MVP → SECONDARY → ADVANCED
3. For each story: title, description, acceptance criteria, system references
4. Include story dependencies where applicable

### Pillar Matrix Generation

1. List all L1 Design Pillars (rows)
2. List all L4 Systems (columns)
3. For each cell: how the system supports the pillar
4. Identify gaps: pillars without system support, systems without pillar alignment

### API Docs Generation

1. Extract system interfaces from L4
2. Document data models from L4 entities
3. Map interaction patterns from L3
4. Include request/response patterns

Present the generated document. Iterate with the developer until satisfied. Write to the specified location.

## Phase 4: Next Steps

After generating, suggest:
- "Need more documents? Run `/rs-docs <type>` again"
- "Want to generate derived artifacts? Try `/rs-extend <type>`"
