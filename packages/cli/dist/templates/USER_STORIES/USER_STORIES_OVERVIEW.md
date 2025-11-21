# USER_STORIES_OVERVIEW.md

## Purpose

This directory contains Level 5 user stories in YAML format with embedded Cypress test specifications. User stories validate that Level 4 system implementations deliver the intended user experience.

**Key principle:** User stories ARE the test specification. There is a single source of truth—stories and tests cannot drift apart.

## Getting Started

**First time using Cypress with this framework?**

This framework automatically generates Cypress end-to-end tests from your YAML user stories. To use this feature:

1. **Install dependencies** - See **[../../docs/CYPRESS_SETUP.md](../../docs/CYPRESS_SETUP.md)** for complete setup guide
2. **Copy template files** - Follow the setup guide to copy Cypress configuration and test generators
3. **Implement Cypress tasks** - Edit `cypress.config.ts` to add `loginAs` and `seedItem` tasks
4. **Create your first story** - Copy from the examples in this directory
5. **Run tests** - Execute `npx cypress open` to see your stories become tests

**Quick setup checklist:**
- [ ] Installed: `cypress`, `cypress-vite`, `js-yaml`, `zod`, `typescript`
- [ ] Copied: `cypress.config.ts` and `cypress/` directory to your project
- [ ] Implemented: Required Cypress tasks (`loginAs`, `seedItem`)
- [ ] Created: At least one YAML user story file
- [ ] Validated: Tests run successfully with `npx cypress open`

**For detailed installation and troubleshooting:** **[../../docs/CYPRESS_SETUP.md](../../docs/CYPRESS_SETUP.md)**

---

## Directory Organization

User stories are organized in three complementary views:

```
USER_STORIES/
├── USER_STORIES_OVERVIEW.md  # This file
├── by_priority/               # Development phase organization
│   ├── MVP.yaml               # Core functionality (must-have features)
│   ├── SECONDARY.yaml         # Enhanced experience (should-have features)
│   └── ADVANCED.yaml          # Future features (nice-to-have features)
├── by_journey/                # User flow organization
│   ├── ONBOARDING.yaml        # New user experience
│   ├── DAILY_USAGE.yaml       # Regular user workflows
│   └── [OTHER_JOURNEYS].yaml # Additional user journeys
└── by_system/                 # System-based organization
    ├── TASK_SYSTEM.yaml       # Stories validating TASK_SYSTEM
    ├── REWARD_SYSTEM.yaml     # Stories validating REWARD_SYSTEM
    └── [OTHER_SYSTEMS].yaml   # Additional system stories
```

**Multiple perspectives:**
- **by_priority/** helps prioritize implementation efforts and aligns with roadmap
- **by_journey/** validates complete end-to-end user experiences
- **by_system/** links validation back to system architecture

Stories can appear in multiple organizational views to enable different testing perspectives.

### Customizing Story Paths

The default directory structure can be customized by editing the glob patterns in the test loader files. This allows you to adapt the framework to:
- Monorepo structures
- Legacy codebases with existing story locations
- Custom organization preferences

To customize paths, edit the `import.meta.glob()` pattern in each test file (see inline comments for examples):
- `cypress/e2e/by_priority.cy.ts`
- `cypress/e2e/by_journey.cy.ts`
- `cypress/e2e/by_system.cy.ts`

See [../../docs/CYPRESS_SETUP.md](../../docs/CYPRESS_SETUP.md) Step 2b for detailed instructions.

## YAML Format

Each user story file uses comment-annotated YAML format:

```yaml
# =============================================================================
# USER STORY: [Story Title]
# =============================================================================
# @spec_version: 1.0.0
# @priority: MVP | SECONDARY | ADVANCED
# @journey: [JOURNEY_NAME]
# @systems: [SYSTEM_A, SYSTEM_B]
# @last_updated: [ISO 8601 timestamp]
# @spec_source: [References to L4 systems]

id: US-101
title: [Story title]
requirement_id: R-101  # Optional

acceptance_criteria:
  - id: AC-101-1
    title: [Acceptance criterion title]
    narrative: |
      Given [context/setup]
      When [user action]
      Then [expected outcome]

    # Test DSL: Given-When-Then structure
    given:
      - [setup steps]
    when:
      - [action step]
    then:
      - [assertion steps]
```

## Test DSL

User stories use a domain-specific language (DSL) that maps to Cypress commands:

### Setup Steps (given/when)

- `visit: '/path'` - Navigate to a URL
- `click: { selector: '[data-test=button]' }` - Click an element
- `fill: { selector: '[data-test=input]', value: 'text' }` - Fill an input field
- `loginAs: 'user_role'` - Authenticate as a user role
- `seedItem: { slug: 'item-id', status: 'available' }` - Seed test data

### Assertion Steps (then)

- `shouldContain: { selector: '[data-test=element]', text: 'expected' }` - Verify text content
- `shouldExist: { selector: '[data-test=element]' }` - Verify element exists

### Extending the DSL

Add domain-specific steps in `cypress/support/steps.ts`:

```typescript
export type Step =
  | { visit: string }
  // ... core steps ...
  | { createProject: { name: string } }  // Custom step
  | { inviteUser: { email: string, role: string } }  // Custom step

export function runSetupSteps(steps: Step[]) {
  for (const s of steps ?? []) {
    // ... core step handlers ...
    else if ('createProject' in s) {
      cy.task('createProject', s.createProject);
    }
  }
}
```

Update the Zod schema in `cypress/support/schema.ts` to validate custom steps.

## Runtime Test Generation

User story YAML files automatically generate Cypress tests:

### Test Suites

- `by_priority/*.yaml` → `cypress/e2e/by_priority.cy.ts`
  - Generates tests organized by development priority
  - Useful for smoke testing MVP features

- `by_journey/*.yaml` → `cypress/e2e/by_journey.cy.ts`
  - Generates tests organized by user journey
  - Validates complete end-to-end workflows

- `by_system/*.yaml` → `cypress/e2e/by_system.cy.ts`
  - Generates tests organized by system
  - Validates each system delivers user value

### How It Works

1. **Load:** Runtime scripts use `import.meta.glob` to load all YAML files
2. **Parse:** YAML is parsed with `js-yaml`
3. **Validate:** Zod schema validates structure
4. **Generate:** Each story/AC becomes a Cypress `describe`/`it` block
5. **Execute:** DSL steps are converted to Cypress commands

### Running Tests

```bash
# Interactive mode (Cypress UI)
npx cypress open

# Headless mode (CI/CD)
npx cypress run

# Specific test suite
npx cypress run --spec 'cypress/e2e/by_priority.cy.ts'
```

## Writing User Stories

### Best Practices

1. **User-focused narratives:** Write from the user's perspective, not technical implementation
   - Good: "When I complete a task, Then I see my points increase"
   - Bad: "When TaskManager.complete() is called, Then PointsService.award() updates the database"

2. **Observable behaviors:** Test what users can see/experience
   - Good: "Then I should see a success message"
   - Bad: "Then the database should contain the record"

3. **Stable selectors:** Use `data-test` attributes, not fragile CSS classes
   - Good: `[data-test=submit-button]`
   - Bad: `.btn-primary.large`

4. **Clear given/when/then:** Make the test flow obvious
   - **Given** sets up context
   - **When** performs the action
   - **Then** verifies the outcome

5. **Focused tests:** Each acceptance criterion should test one behavior
   - Don't combine multiple unrelated assertions

6. **Traceability:** Link stories to Level 4 systems via `@systems` annotation

### Example User Story

See `by_priority/MVP.example.yaml` for a complete example with:
- Single-system story (task creation)
- Cross-system story (task completion with rewards)
- Multiple acceptance criteria

## Maintaining Stories

### When to Update

- **L4 system changes:** If system behavior changes, update corresponding stories
- **Test failures:** If tests fail due to UI changes, update selectors
- **New features:** Add new stories/AC for new functionality
- **Deprecated features:** Remove stories for removed functionality

### Annotations to Maintain

- `@last_updated` - Update timestamp when modifying story
- `@spec_source` - Update if L4 system references change
- `@systems` - Update if story now touches different systems

### Version Control

YAML stories are tracked in version control:
- Each story has full context (narrative + test DSL)
- Changes show both intent and test updates
- Easy to review: "Did the test change match the intent?"

## Integration with Framework

### Reference Rules

Level 5 USER_STORIES can reference:
- **Level 1:** Design pillars, inviolable principles (to validate experience alignment)
- **Level 2:** Design strategies (to validate approach)
- **Level 3:** Interaction patterns (to validate behavioral loops)
- **Level 4:** System specifications (primary reference—validates systems deliver value)
- **External:** Research, best practices, accessibility standards

### Relationship to FINE_TUNING

- **USER_STORIES** validate behaviors and user experience
- **FINE_TUNING** defines numeric parameters

Example:
- Story: "Points should appear quickly" (qualitative)
- Fine tuning: `feedback_delay: 100` (quantitative)

## Troubleshooting

### Common Issues

**Issue:** Tests fail with "element not found"
- **Fix:** Check that `data-test` attributes exist in your application

**Issue:** Tests fail with schema validation errors
- **Fix:** Run YAML through the Zod schema validator, fix structure

**Issue:** Custom steps not working
- **Fix:** Ensure custom steps are added to both `steps.ts` and `schema.ts`

**Issue:** Tests hang or timeout
- **Fix:** Check Cypress tasks are implemented in `cypress.config.ts`

### Debugging

1. Run Cypress in interactive mode to see each step
2. Use `cy.log()` to output debug information
3. Check the narrative matches the DSL steps
4. Verify selectors exist on the page

## Resources

- **Framework reference:** `00.SPEC_FRAMEWORK.md` - Complete framework documentation
- **AI guidance:** `CLAUDE.md` - How AI assistants work with YAML stories
- **Cypress docs:** https://docs.cypress.io/
- **Zod schema:** https://zod.dev/
