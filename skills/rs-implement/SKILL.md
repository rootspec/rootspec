---
name: rs-implement
description: Implement features from YAML user stories using test-driven development
---

You are helping a developer implement their product iteratively from RootSpec YAML user stories. This follows a test-driven approach: analyze stories, set up infrastructure, then implement one story at a time.

Read `skills/rs-shared/fragments/l5-test-dsl.md` for the test DSL step reference, extension patterns, and decision tree.
Read `skills/rs-shared/fragments/l5-yaml-format.md` for YAML syntax rules if you need to help debug story files.

## Phase 1: Context

Run scripts to understand the spec and stories:

```bash
bash skills/rs-shared/scripts/scan-spec.sh .
bash skills/rs-shared/scripts/list-l5-stories.sh <spec-dir>
bash skills/rs-shared/scripts/extract-l5-journeys.sh <spec-dir>
bash skills/rs-shared/scripts/list-l4-systems.sh <spec-dir>
```

Read all YAML user story files found.

If the developer provided a story ID as a parameter, focus on that specific story. Otherwise, present the full story inventory organized by priority.

Report to the developer:
- Total number of stories found
- Breakdown by priority (MVP / SECONDARY / ADVANCED)
- Breakdown by journey
- Which systems are involved

## Phase 2: Analysis & Planning

### If implementing from scratch (no existing app code):

**Phase 2a: Global Setup Analysis**

Read ALL user stories and identify global setup needs:

1. **Authentication**: Do any stories use `loginAs`? → Need auth setup
2. **Database reset**: Do stories assume clean state? → Need `beforeEach` reset
3. **Seed data**: Do stories use `seedItem`? → Need seed data tasks
4. **Shared fixtures**: What data appears across multiple stories?

Present the global setup plan to the developer.

**Phase 2b: Implementation Order**

Recommend an implementation order:
1. Global setup (auth, DB reset, seed data)
2. MVP stories, ordered by dependency (foundational flows first)
3. SECONDARY stories
4. ADVANCED stories

### If focusing on a specific story:

Read the story's YAML, identify:
- What given/when/then steps are involved
- What systems are exercised
- What setup is needed
- Any custom DSL steps that need implementing

## Phase 3: Iterative Implementation

Work through stories one at a time:

### For each story:

1. **Read the YAML** — understand the acceptance criteria
2. **Check prerequisites** — is global setup done? Are dependent stories implemented?
3. **Decide approach** using the decision tree:
   - Does the DSL step need extending? → Add step to `cypress/support/steps.ts` + schema
   - Does the app need changes? → Implement the app feature
   - Does test data need creating? → Add fixture or seed task
4. **Implement** — write the code to make the story pass
5. **Verify** — run the Cypress test for this story
6. **Commit** — after the test passes, commit

Present each story to the developer before implementing:

```
Story: [story name]
Priority: [MVP/SECONDARY/ADVANCED]
Journey: [journey name]
Systems: [involved systems]

Steps:
  given: [setup steps]
  when: [action steps]
  then: [assertion steps]

Implementation plan:
  1. [what needs to be built]
  2. [what needs to be configured]
  3. [what tests to run]
```

Wait for developer approval before implementing each story.

### Key Patterns

**Auth setup**: Create `loginAs` task in `cypress.config.ts` that sets localStorage/cookies for the test user.

**DB reset**: Add `beforeEach` in `cypress/support/e2e.ts` that calls an API endpoint or Cypress task to reset the database.

**Seed data**: Create `seedItem` task that inserts test data via API or direct DB access.

**DSL extension**: When a story uses a step not in the core DSL, add it to `cypress/support/steps.ts` and register in `cypress/support/schema.ts`.

## Phase 4: Progress & Next Steps

After each story is implemented:
- Report progress: "X of Y MVP stories complete"
- Suggest the next story to implement
- Note any issues discovered during implementation

After all MVP stories pass:
- "MVP implementation complete. Move to SECONDARY stories?"
- Suggest running `/rs-validate` to check coverage
