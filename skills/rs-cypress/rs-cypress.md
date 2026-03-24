---
name: rs-cypress
description: Install or merge RootSpec Cypress test templates into your project
---

You are helping a developer set up Cypress testing templates for their RootSpec specification. These templates enable auto-generating E2E tests from Level 5 YAML user stories.

Bundled templates are in `skills/rs-cypress/templates/`. These are the canonical source — copy them, don't generate from scratch.

**IMPORTANT — Ownership boundary:** Templates are scaffolding. Once copied to the user's project, the user owns those files. They will add custom DSL steps, configure auth/DB tasks, and extend the schema for their domain. NEVER overwrite, replace, or regenerate these files if they already exist. For existing Cypress setups, ALWAYS merge — read what exists, identify only what's missing, and propose additions. Preserve all user customizations.

## Phase 1: Context

Check for existing Cypress setup:

1. Look for existing Cypress files:
   - `cypress.config.ts` or `cypress.config.js`
   - `cypress/support/e2e.ts` or `cypress/support/e2e.js`
   - `cypress/support/steps.ts` or `cypress/support/steps.js`
   - `cypress/support/schema.ts` or `cypress/support/schema.js`

2. Check if Cypress is installed: look for `cypress` in `package.json` dependencies/devDependencies.

3. Check for RootSpec spec files:
   ```bash
   bash skills/rs-shared/scripts/scan-spec.sh .
   bash skills/rs-shared/scripts/list-l5-stories.sh <spec-dir>
   ```

Report what was found.

## Phase 2: Setup

### If no Cypress exists:

1. Suggest installing Cypress: `npm install --save-dev cypress cypress-vite`
2. Copy the bundled templates to the project:
   - Read `skills/rs-cypress/templates/cypress.config.ts` → write to `cypress.config.ts`
   - Read `skills/rs-cypress/templates/cypress/support/e2e.ts` → write to `cypress/support/e2e.ts`
   - Read `skills/rs-cypress/templates/cypress/support/steps.ts` → write to `cypress/support/steps.ts`
   - Read `skills/rs-cypress/templates/cypress/support/schema.ts` → write to `cypress/support/schema.ts`
   - Read `skills/rs-cypress/templates/cypress/e2e/example.cy.ts` → write to `cypress/e2e/example.cy.ts`

3. If L5 user stories exist, update the example test file's glob pattern to point at the actual YAML files.

### If Cypress already exists:

This is a merge operation. For each template file:

1. Read the existing project file
2. Read the corresponding bundled template from `skills/rs-cypress/templates/`
3. Identify what needs to be added (RootSpec tasks, steps, schema)
4. Present the merge plan to the developer:
   - What will be added
   - What existing code will be preserved
   - Any potential conflicts

5. Get approval before writing merged files.

**Key merge points:**
- `cypress.config.ts`: Add `setupNodeEvents` tasks (loginAs, seedItem, resetDatabase) and vite preprocessor
- `cypress/support/e2e.ts`: Add `beforeEach` database reset and browser console forwarding
- `cypress/support/steps.ts`: Add DSL step type and runner functions
- `cypress/support/schema.ts`: Add Zod validation schema for story YAML

## Phase 3: Configure

After templates are in place:

1. Ask about authentication approach:
   - "Does your app require login? If so, how? (JWT, session cookie, etc.)"
   - Update the `loginAs` task in `cypress.config.ts` accordingly

2. Ask about database reset:
   - "How should the database reset between tests? (API endpoint, direct DB, seed script)"
   - Update the `resetDatabase` task in `cypress.config.ts` accordingly

3. Ask about seed data:
   - "What test data needs to exist for stories to run?"
   - Update the `seedItem` task in `cypress.config.ts` accordingly

4. Ask about base URL:
   - "What port does your dev server run on?"
   - Update `baseUrl` in `cypress.config.ts`

## Phase 4: Next Steps

After setup, suggest:
- "Run `/rs-implement` to start implementing features from your user stories"
- "Your L5 YAML user stories will auto-generate Cypress tests"
- "Extend the DSL by adding steps to `cypress/support/steps.ts` and `cypress/support/schema.ts` — see `skills/rs-shared/fragments/l5-test-dsl.md` for the extension pattern"
