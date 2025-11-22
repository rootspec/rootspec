# Cypress Setup Guide

Complete instructions for setting up automated end-to-end testing with Cypress for your YAML user stories.

## Overview

This framework includes a runtime test generation system that converts YAML user stories into executable Cypress tests. Once configured, your user stories automatically become your E2E test suite.

**What you get:**
- User stories and tests in perfect sync (single source of truth)
- Runtime test generation (no code generation step)
- Extensible test DSL for domain-specific steps
- Tests organized by priority, journey, or system
- Browser console log capture for headless debugging

**Time estimate:** 30-45 minutes for initial setup

---

## Prerequisites

- **Node.js 18+** and npm or yarn
- **Existing project** with `package.json`
- **User stories** in `05.IMPLEMENTATION/USER_STORIES/` (YAML format)

---

## Step 1: Install Dependencies

```bash
npm install --save-dev cypress cypress-vite
npm install --save-dev js-yaml @types/js-yaml zod
npm install --save-dev typescript @types/node
```

**Required packages:**
- `cypress` - E2E testing framework (^13.0.0 or later)
- `cypress-vite` - TypeScript preprocessing for Cypress
- `js-yaml` - YAML parsing
- `zod` - Schema validation for YAML structure
- `typescript` - TypeScript support
- `@types/node` - Node.js type definitions

**Why these dependencies?**
- Cypress runs the tests
- Vite compiles TypeScript test files
- js-yaml parses your user story YAML files
- Zod validates YAML structure at runtime
- TypeScript provides type safety for test DSL

---

## Step 2: Install Cypress Templates

### Using CLI (Recommended)

```bash
rootspec cypress
```

The CLI will:
- Copy `cypress.config.ts` with RootSpec tasks (loginAs, seedItem, resetDatabase, log)
- Copy all Cypress support files and test generators
- Detect your spec directory from `.rootspecrc.json`
- Set up proper paths automatically
- Provide next steps and installation instructions

**Output:**
```
🧪 RootSpec - Cypress Testing Setup

📁 Copying Cypress configuration...
   ✓ cypress.config.ts
   ✓ cypress/

✅ Cypress templates installed!

Next steps:
1. Install dependencies:
   npm install --save-dev cypress cypress-vite js-yaml zod typescript
2. Implement Cypress tasks in cypress.config.ts:
   - loginAs: Authentication logic
   - seedItem: Test data seeding
   - resetDatabase: Database cleanup
3. Create user stories in ./spec/05.IMPLEMENTATION/USER_STORIES/
4. Run tests: npx cypress open
```

### Manual Alternative

If you need to customize the setup or don't have the CLI:

```bash
# Clone or download the rootspec repository first
git clone https://github.com/rootspec/rootspec.git

# Copy Cypress configuration
cp rootspec/templates/cypress.config.ts ./

# Copy Cypress support files and test generators
cp -r rootspec/templates/cypress ./
```

**Resulting structure:**
```
your-project/
├── cypress.config.ts              # Cypress configuration
└── cypress/
    ├── support/
    │   ├── e2e.ts                # Support file entry point
    │   ├── schema.ts             # Zod validation schema
    │   └── steps.ts              # DSL-to-Cypress converter
    └── e2e/
        ├── by_priority.cy.ts     # Runtime generator (priority view)
        ├── by_journey.cy.ts      # Runtime generator (journey view)
        └── by_system.cy.ts       # Runtime generator (system view)
```

---

## Step 2b: Customize Story Paths (If Needed)

By default, the test loaders look for user stories in:
- `05.IMPLEMENTATION/USER_STORIES/by_priority/`
- `05.IMPLEMENTATION/USER_STORIES/by_journey/`
- `05.IMPLEMENTATION/USER_STORIES/by_system/`

**If your project uses a different directory structure**, you must edit the glob pattern in each test file:

1. Open `cypress/e2e/by_priority.cy.ts` (around line 34)
2. Open `cypress/e2e/by_journey.cy.ts` (around line 34)
3. Open `cypress/e2e/by_system.cy.ts` (around line 34)

Find and edit the `import.meta.glob()` pattern:

```typescript
const rawFiles = import.meta.glob(
  '../../../05.IMPLEMENTATION/USER_STORIES/by_priority/**/*.yaml',  // ← Edit this line
  { as: 'raw', eager: true }
) as Record<string, string>;
```

**Path format:**
- Relative to the test file location (`cypress/e2e/`)
- Use `../../../` to navigate to project root
- Must be a literal string (Vite requirement - cannot use variables)

**Examples for common structures:**

Standard framework:
```typescript
'../../../05.IMPLEMENTATION/USER_STORIES/by_priority/**/*.yaml'
```

Content subdirectory:
```typescript
'../../content/spec/05.IMPLEMENTATION/USER_STORIES/by_priority/**/*.yaml'
```

Monorepo:
```typescript
'../../../packages/app-spec/USER_STORIES/by_priority/**/*.yaml'
```

Flat structure:
```typescript
'../../../stories/priority/**/*.yaml'
```

> **Note:** Each test file has inline comments with these examples. Look for the `import.meta.glob()` call and follow the instructions in the JSDoc comment above it.

---

## Step 3: Add npm Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    "test:e2e": "cypress run --spec 'cypress/e2e/**/*.cy.ts'"
  }
}
```

**Optional but recommended:**
```json
{
  "scripts": {
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    "test:e2e": "cypress run --spec 'cypress/e2e/**/*.cy.ts'",
    "test:e2e:priority": "cypress run --spec 'cypress/e2e/by_priority.cy.ts'",
    "test:e2e:journey": "cypress run --spec 'cypress/e2e/by_journey.cy.ts'",
    "test:e2e:system": "cypress run --spec 'cypress/e2e/by_system.cy.ts'"
  }
}
```

---

## Step 4: Configure Cypress Tasks

Open `cypress.config.ts` and implement the required tasks for your application.

**Required tasks:**

### 4a. Implement `loginAs` Task

This task handles user authentication in your tests.

```typescript
// In cypress.config.ts, inside setupNodeEvents():
on('task', {
  loginAs(role: string) {
    // Option 1: API-based authentication
    // Call your auth API, return session token

    // Option 2: Database-based
    // Query database for test user, create session

    // Option 3: Mock authentication
    // Return mock credentials for development

    // Example:
    const credentials = {
      member: { email: 'test@example.com', password: 'test123' },
      admin: { email: 'admin@example.com', password: 'admin123' }
    };
    return credentials[role] || null;
  }
});
```

**Then in `cypress/support/steps.ts`:**

```typescript
// The loginAs step calls the task:
if ('loginAs' in s) {
  cy.task('loginAs', s.loginAs).then((credentials: any) => {
    // Use credentials to log in via UI or API
    cy.visit('/login');
    cy.get('[data-test=email]').type(credentials.email);
    cy.get('[data-test=password]').type(credentials.password);
    cy.get('[data-test=login-button]').click();
  });
}
```

### 4b. Implement `seedItem` Task

This task seeds test data into your application.

```typescript
// In cypress.config.ts:
on('task', {
  seedItem(params: { slug: string; status: string }) {
    // Option 1: Database seeding
    // Insert directly into database

    // Option 2: API seeding
    // Call your API to create test data

    // Option 3: Fixture-based
    // Use predefined test data

    // Example:
    // await db.tasks.create({ slug: params.slug, status: params.status });
    return null;
  }
});
```

**See detailed examples in `cypress.config.ts` (lines 28-116).**

---

## Step 5: Extend the Test DSL (Optional)

Add domain-specific steps for your application.

**Edit `cypress/support/steps.ts`:**

```typescript
export type Step =
  | { visit: string }
  | { click: { selector: string } }
  | { fill: { selector: string; value: string } }
  | { loginAs: string }
  | { seedItem: { slug: string; status: string } }
  // Add your custom steps here:
  | { createProject: { name: string } }
  | { uploadFile: { path: string } }
  | { waitForNotification: { message: string } }
  | { shouldContain: { selector: string; text: string } }
  | { shouldExist: { selector: string } };

export function runSetupSteps(steps: Step[]) {
  for (const s of steps ?? []) {
    if ('visit' in s) cy.visit(s.visit);
    else if ('click' in s) cy.get(s.click.selector).click();
    else if ('fill' in s) cy.get(s.fill.selector).type(s.fill.value);
    else if ('loginAs' in s) {
      // Your loginAs implementation
    }
    // Add your custom step implementations:
    else if ('createProject' in s) {
      cy.get('[data-test=new-project]').click();
      cy.get('[data-test=project-name]').type(s.createProject.name);
      cy.get('[data-test=save]').click();
    }
    else if ('uploadFile' in s) {
      cy.get('[data-test=file-input]').attachFile(s.uploadFile.path);
    }
  }
}
```

**See extension guidance in `steps.ts` (lines 7-12, 26-40).**

---

## Step 6: Create Your First User Story

Copy an example YAML file and customize it:

```bash
# Copy example
cp path/to/rootspec/templates/USER_STORIES/by_priority/MVP.example.yaml \
   05.IMPLEMENTATION/USER_STORIES/by_priority/MVP.yaml

# Or create from scratch
mkdir -p 05.IMPLEMENTATION/USER_STORIES/by_priority
```

**Example user story YAML:**

```yaml
# @spec_version: 3.0
# @priority: P0
# @journey: CORE_FUNCTIONALITY

user_stories:
  - id: US-001
    title: "User can log in"
    narrative: |
      As a registered user
      I want to log in to my account
      So that I can access my dashboard

    acceptance_criteria:
      - id: AC-001-1
        narrative: |
          Given I am a registered user
          When I enter valid credentials
          Then I am redirected to my dashboard
        given:
          - visit: '/login'
        when:
          - fill: { selector: '[data-test=email]', value: 'test@example.com' }
          - fill: { selector: '[data-test=password]', value: 'password123' }
          - click: { selector: '[data-test=login-button]' }
        then:
          - shouldExist: { selector: '[data-test=dashboard]' }
          - shouldContain: { selector: '[data-test=welcome]', text: 'Welcome' }
```

---

## Step 7: Run Tests

**Open Cypress interactive mode:**
```bash
npm run cypress:open
```

**What you should see:**
- Cypress Test Runner opens
- E2E Testing section shows 3 test files:
  - `by_priority.cy.ts`
  - `by_journey.cy.ts`
  - `by_system.cy.ts`
- Click any file to see generated test suites

**Run tests headless:**
```bash
npm run cypress:run
```

**Run specific test organization:**
```bash
npm run test:e2e:priority  # Only priority-based tests
npm run test:e2e:journey   # Only journey-based tests
npm run test:e2e:system    # Only system-based tests
```

---

## Step 8: Validate Setup

**Create a minimal test story to validate everything works:**

Create `05.IMPLEMENTATION/USER_STORIES/by_priority/SETUP_TEST.yaml`:

```yaml
# @spec_version: 3.0
# @priority: P0

user_stories:
  - id: US-SETUP-TEST
    title: "Setup validation test"
    narrative: "Verify Cypress is configured correctly"

    acceptance_criteria:
      - id: AC-SETUP-1
        narrative: "Can visit homepage"
        given: []
        when:
          - visit: '/'
        then:
          - shouldExist: { selector: 'body' }
```

**Run it:**
```bash
npm run cypress:run
```

**If successful:**
- Cypress starts
- Loads your YAML file
- Generates test suite
- Executes test
- Reports results

**If it fails, see Troubleshooting below.**

---

## Browser Console Logs

The Cypress templates include built-in browser console log capturing. This feature captures `console.log`, `console.warn`, `console.error`, and `console.info` from your application and outputs them to the Cypress terminal—especially useful for debugging in headless mode and CI environments.

### How It Works

**Interactive Mode (Cypress UI):**
- Console logs appear in your browser's DevTools (normal behavior)
- Console errors also appear in the Cypress Command Log with a red indicator

**Headless Mode (Terminal/CI):**
- All browser console output appears in your terminal alongside test results
- Formatted with timestamps and log levels

**Example terminal output:**
```
[14:32:15.123] [Browser LOG] User clicked submit button
[14:32:15.456] [Browser WARN] Deprecated API usage detected
[14:32:15.789] [Browser ERROR] Failed to load resource: 404
```

### Implementation Details

This feature is implemented in two files:

1. **`cypress/support/e2e.ts`** - Hooks into `window:before:load` to capture console methods
2. **`cypress.config.ts`** - Provides a `log` task that outputs to Node.js console

### Customizing Log Levels

To capture only warnings and errors (reduce noise), edit `cypress/support/e2e.ts` and comment out the `console.log` and `console.info` overrides:

```typescript
// In Cypress.on('window:before:load', (win) => { ... })

// Comment out to disable:
// win.console.log = function (...args: any[]) { ... };
// win.console.info = function (...args: any[]) { ... };

// Keep these for errors and warnings:
win.console.warn = function (...args: any[]) { ... };
win.console.error = function (...args: any[]) { ... };
```

### Disabling Console Capture

To disable console log capturing entirely, remove or comment out the entire `Cypress.on('window:before:load', ...)` block in `cypress/support/e2e.ts`.

---

## Troubleshooting

### "Cannot find module 'js-yaml'"

**Problem:** Missing dependency

**Solution:**
```bash
npm install --save-dev js-yaml @types/js-yaml
```

---

### "Task 'loginAs' not found"

**Problem:** Cypress task not implemented in `cypress.config.ts`

**Solution:** Add task implementation in `setupNodeEvents()`:
```typescript
on('task', {
  loginAs(role: string) {
    return { email: 'test@example.com', password: 'test' };
  }
});
```

---

### "YAML file not found"

**Problem:** Test generator can't find your user story files

**Solution:** Check that files are in correct location:
- `05.IMPLEMENTATION/USER_STORIES/by_priority/*.yaml`
- `05.IMPLEMENTATION/USER_STORIES/by_journey/*.yaml`
- `05.IMPLEMENTATION/USER_STORIES/by_system/*.yaml`

The test generator looks for YAML files matching the directory structure.

---

### "Schema validation failed"

**Problem:** YAML structure doesn't match expected schema

**Solution:** Check your YAML format matches the spec:
- Required annotations: `@spec_version`, `@priority` (or `@journey` or `@systems`)
- Required fields: `user_stories`, `id`, `title`, `acceptance_criteria`
- Each acceptance criterion needs: `id`, `given`, `when`, `then`

See `templates/USER_STORIES/USER_STORIES_OVERVIEW.md` for complete format specification.

---

### "Type error in steps.ts"

**Problem:** TypeScript compilation error in custom steps

**Solution:** Ensure your custom steps are added to both:
1. The `Step` type union
2. The implementation in `runSetupSteps()` or other step functions

---

### Tests fail with "Cannot GET /"

**Problem:** Your application isn't running

**Solution:** Start your development server first:
```bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Run Cypress
npm run cypress:open
```

Or configure `baseUrl` in `cypress.config.ts` to point to your running app.

---

### "Selector not found" errors

**Problem:** Test selectors don't match your application

**Solution:**
1. Use `data-test` attributes in your application:
   ```html
   <button data-test="login-button">Login</button>
   ```
2. Update selectors in your YAML files to match
3. Use Cypress selector playground to find correct selectors

---

## Next Steps

✅ **Setup complete!** Now you can:

1. **Write user stories** - Create YAML files in `05.IMPLEMENTATION/USER_STORIES/`
2. **Run tests** - `npm run cypress:run`
3. **Extend DSL** - Add domain-specific steps in `steps.ts`
4. **Integrate CI** - Add `npm run test:e2e` to your CI pipeline

**Resources:**
- Full YAML format spec: `templates/USER_STORIES/USER_STORIES_OVERVIEW.md`
- Extension examples: `cypress/support/steps.ts`
- Framework reference: `00.SPEC_FRAMEWORK.md` (lines 338-583)

---

## Integration with CI/CD

**GitHub Actions example:**

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm start & npx wait-on http://localhost:3000
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots
```

**Adapt for your CI system:**
- Start your application
- Wait for it to be ready
- Run `npm run test:e2e`
- Upload artifacts on failure

---

## Summary

**What you've set up:**
- ✅ Cypress with TypeScript support
- ✅ YAML-to-test runtime generation
- ✅ Extensible test DSL
- ✅ Test organization (priority/journey/system)
- ✅ Browser console log capture (for headless debugging)
- ✅ Single source of truth (stories ARE tests)

**Your workflow:**
1. Write user story in YAML
2. Tests auto-generate
3. Tests fail (red)
4. Implement feature
5. Tests pass (green)
6. Spec and code stay in sync forever

**No more spec-code drift!** 🎉
