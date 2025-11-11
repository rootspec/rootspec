# Generate Documentation from Specification

Prompt for creating various documentation artifacts from your specification.

## Prerequisites

- [ ] Complete specification (all levels 1-5)
- [ ] Clear understanding of which document type you need

## When to Use This Prompt

Use this prompt when:

- Creating a PRD for stakeholders
- Writing a Technical Design Document for engineers
- Generating a backlog for project management
- Creating a validation matrix for QA
- Preparing documentation for handoff

## The Prompt

```
I have a complete specification following Hierarchical Specification
Framework v3.0.0.

## DOCUMENT TYPE SPECIFICATIONS

### 1. Product Requirements Document (PRD)

**Audience:** Product managers, stakeholders, business team

**Contents from spec:**
- Mission and vision (L1)
- Design pillars as guiding principles (L1)
- User journeys and flows (L3)
- Feature list organized by priority (L5)
- Success criteria (L2)

**Format:** Business-focused, minimal technical detail

**Generation instructions:**
- Extract mission from L1
- Summarize design pillars as product principles
- Include L3 interaction flows
- Map L5 user stories by priority

### 2. Technical Design Document (TDD)

**Audience:** Engineers, architects, technical leads

**Contents from spec:**
- Architectural philosophy (L2)
- System architecture diagram (L4 SYSTEMS_OVERVIEW)
- Detailed system designs (L4 individual systems)
- Data models and state machines (L4)
- Configuration parameters (L5 FINE_TUNING)

**Format:** Technical, implementation-ready

**Generation instructions:**
- Extract L2 architectural commitments
- Detail L4 system designs
- Include system interaction diagrams
- Reference L5 parameter values

### 3. User Story Backlog

**Audience:** Project managers, scrum masters, developers

**Contents from spec:**
- All user stories from L5 USER_STORIES
- Organized by priority (MVP, SECONDARY, ADVANCED)
- Acceptance criteria in testable format
- System references for context

**Format:** Agile-friendly, story format

**Generation instructions:**
- Export all L5 user stories
- Organize by priority (MVP/Secondary/Advanced)
- Include acceptance criteria
- Link to relevant L4 systems

### 4. Design Pillar Validation Matrix

**Audience:** Design team, product owners, QA

**Contents from spec:**
- Design pillars (L1)
- Systems (L4)
- Mapping showing which systems support which pillars
- Gap analysis

**Format:** Matrix/table with clear traceability

**Generation instructions:**
- List all L4 systems
- Map which pillar(s) each system supports
- Identify gaps (systems not supporting pillars, pillars without systems)

### 5. API Documentation

**Audience:** Integration partners, frontend developers

**Contents from spec:**
- System interfaces (L4)
- Data models (L4)
- Interaction patterns (L3)

**Format:** API reference style

**Generation instructions:**
- Extract system interfaces from L4
- Document data models
- Include interaction patterns from L3

## AUDIENCE CUSTOMIZATION

Adapt the document detail level based on audience:

### For Executives
- Focus on L1 (mission, pillars)
- High-level L2 (strategy)
- Omit technical details
- Emphasize business value and vision

### For Designers
- Full L1 (pillars with examples)
- Full L3 (interaction patterns)
- L5 user stories (by journey)
- Minimal L4 system internals

### For Engineers
- Brief L1-2 (context)
- Full L4 (systems)
- Full L5 (parameters, tests)
- Focus on implementation details

## STAGE CUSTOMIZATION

Adapt the document emphasis based on project stage:

### Early Stage (Pre-Development)
- Emphasize L1-3 (philosophy, strategy, patterns)
- Light L4-5 (enough to start)
- Focus on vision and approach

### Implementation Stage
- Emphasize L4-5 (systems, user stories, parameters)
- Reference L1-3 for context
- Focus on concrete implementation

### Maintenance Stage
- Focus on L5 (stories, parameters)
- Reference L4 for system details
- Emphasize what needs tuning

## DOCUMENT GENERATION REQUEST

Please help me generate the following documents:

[Select one or more document types from above, or specify custom requirements]

Requirements:
- Maintain traceability back to the spec levels
- Use the audience/stage customization appropriate for my needs
- Include section references (e.g., "from 01.FOUNDATIONAL_PHILOSOPHY.md:45")
- Ensure consistency across all generated documents
```

## Document Types

### Product Requirements Document (PRD)

**Audience:** Product managers, stakeholders, business team

**Contents from spec:**
- Mission and vision (L1)
- Design pillars as guiding principles (L1)
- User journeys and flows (L3)
- Feature list organized by priority (L5)
- Success criteria (L2)

**Format:** Business-focused, minimal technical detail

### Technical Design Document (TDD)

**Audience:** Engineers, architects, technical leads

**Contents from spec:**
- Architectural philosophy (L2)
- System architecture diagram (L4 SYSTEMS_OVERVIEW)
- Detailed system designs (L4 individual systems)
- Data models and state machines (L4)
- Configuration parameters (L5 FINE_TUNING)

**Format:** Technical, implementation-ready

### User Story Backlog

**Audience:** Project managers, scrum masters, developers

**Contents from spec:**
- All user stories from L5 USER_STORIES
- Organized by priority (MVP, SECONDARY, ADVANCED)
- Acceptance criteria in testable format
- System references for context

**Format:** Agile-friendly, story format

### Design Pillar Validation Matrix

**Audience:** Design team, product owners, QA

**Contents from spec:**
- Design pillars (L1)
- Systems (L4)
- Mapping showing which systems support which pillars
- Gap analysis

**Format:** Matrix/table with clear traceability

### API Documentation

**Audience:** Integration partners, frontend developers

**Contents from spec:**
- System interfaces (L4)
- Data models (L4)
- Interaction patterns (L3)

**Format:** API reference style

## Customization Options

### For Different Audiences

**For executives:**
- Focus on L1 (mission, pillars)
- High-level L2 (strategy)
- Omit technical details

**For designers:**
- Full L1 (pillars with examples)
- Full L3 (interaction patterns)
- L5 user stories (by journey)

**For engineers:**
- Brief L1-2 (context)
- Full L4 (systems)
- Full L5 (parameters, tests)

### For Different Stages

**Early stage (pre-development):**
- Emphasize L1-3 (philosophy, strategy, patterns)
- Light L4-5 (enough to start)

**Implementation stage:**
- Emphasize L4-5 (systems, user stories, parameters)
- Reference L1-3 for context

**Maintenance stage:**
- Focus on L5 (stories, parameters)
- Reference L4 for system details

## Expected Outcome

- Professional documentation artifacts
- Appropriate detail level for each audience
- Maintained traceability to source specification
- Ready to share with stakeholders/team

## Tips

1. **Use templates** - Create organizational templates that map spec levels to doc sections
2. **Version together** - Keep generated docs in sync with spec version
3. **Automate when possible** - Consider scripting common doc generation tasks
4. **Link back** - Include references to spec files for detailed information
