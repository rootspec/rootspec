I have a complete specification following RootSpec v3.6.0,
with YAML user stories in 05.IMPLEMENTATION/USER_STORIES/.

Please read 00.SPEC_FRAMEWORK.md to understand the framework structure and test DSL.

I want to implement my application iteratively, using the YAML user stories as my
test suite. Guide me through this process systematically.

## PHASE 1: ANALYZE TEST SUITE

First, analyze my complete test suite:

1. **Scan all YAML user stories** in `05.IMPLEMENTATION/USER_STORIES/`
   - Read all files in `by_priority/MVP/` first
   - Then scan `by_priority/SECONDARY/` and other priorities
   - Understand the complete scope of testing

2. **Identify global setup requirements:**
   - Which user roles are needed? (look for `loginAs` steps)
   - What test data is seeded? (look for `seedItem` steps)
   - What pages/routes are visited? (look for `visit` steps)
   - What custom DSL steps are referenced but don't exist yet?

3. **Create test suite files:**
   - For each collection/subset you want to run independently, copy `cypress/e2e/example.cy.ts`
   - Modify the glob pattern to load the specific YAML files (e.g., `by_priority/MVP/**/*.yaml`)
   - Example: `mvp.cy.ts`, `onboarding.cy.ts`, `tasks.cy.ts`

4. **Create implementation roadmap:**
   - List all unique DSL steps that need implementation
   - List all global setup needs (auth, fixtures, DB reset)
   - Plan order of implementation (global first, then tests)

Present your findings before proceeding to Phase 2.

## PHASE 2: GLOBAL SETUP (PRESCRIPTIVE PATTERNS)

Implement global test infrastructure using these prescriptive patterns:

### Authentication Setup (REQUIRED)

**Pattern: Session-based auth with Cypress tasks**

1. **Implement `loginAs` Cypress task** in `cypress.config.ts`:
   ```typescript
   on('task', {
     loginAs(role: string) {
       // Generate auth token/session for role
       // Store in your auth backend
       // Return credentials
       return { token: '...', userId: '...' };
     }
   });
   ```

2. **Update step implementation** in `cypress/support/steps.ts`:
   ```typescript
   else if ('loginAs' in s) {
     cy.task('loginAs', s.loginAs).then((creds: any) => {
       // Set auth state (localStorage, cookies, etc.)
       cy.window().then((win) => {
         win.localStorage.setItem('authToken', creds.token);
       });
     });
   }
   ```

3. **Add global auth state management** in `cypress/support/e2e.ts`:
   ```typescript
   beforeEach(() => {
     // Preserve auth state between tests if needed
     // OR clear it to ensure isolation
     cy.clearLocalStorage(); // Choose based on your needs
   });
   ```

### Database Reset Pattern (REQUIRED)

**Pattern: Reset to clean state before each test**

Add to `cypress/support/e2e.ts`:
```typescript
beforeEach(() => {
  // Reset database to clean state before each test
  cy.task('resetDatabase');
});
```

Implement task in `cypress.config.ts`:
```typescript
on('task', {
  resetDatabase() {
    // Clear all test data
    // Recreate schema if needed
    // Return success
    return null;
  }
});
```

### Seed Data Pattern (REQUIRED)

**Pattern: On-demand seeding via `seedItem` task**

Implement in `cypress.config.ts`:
```typescript
on('task', {
  seedItem(item: any) {
    // Create test data in your backend
    // item can have any shape (uses .passthrough() in schema)
    // Store in database
    return { id: '...', ...item };
  }
});
```

## PHASE 3: ITERATION WORKFLOW

Now implement features iteratively to pass tests:

### Step 1: Pick Next Test

**Strategy: Work through MVP tests first**

1. Start with `by_priority/MVP/` stories
2. Pick the first failing acceptance criteria
3. Focus on ONE acceptance criteria at a time

### Step 2: Run The Test

```bash
# Run your MVP test suite (assuming you created mvp.cy.ts)
npm test -- --spec cypress/e2e/mvp.cy.ts

# Or run single story by filtering
npm test -- --grep "US-101"
```

Identify what's failing:
- Missing DSL step?
- Missing application feature?
- Missing fixture/seed data?

### Step 3: Decision Tree - What To Implement?

**Decision: Does the DSL step exist in steps.ts?**

**NO** → Extend DSL (go to Step 4a)
**YES** → Does the application feature exist?
  - **NO** → Implement application feature (go to Step 4b)
  - **YES** → Does the test data exist?
    - **NO** → Create fixture/seed (go to Step 4c)
    - **YES** → Debug test or application logic

### Step 4a: Extend DSL

When YAML references a step that doesn't exist (e.g., `createProject`, `deleteTask`):

1. **Add to Step type** in `cypress/support/steps.ts`:
   ```typescript
   export type Step =
     | { visit: string }
     | { createProject: { name: string, description: string } }  // NEW
     | ...
   ```

2. **Implement in runSetupSteps or runAssertionSteps**:
   ```typescript
   else if ('createProject' in s) {
     cy.task('createProject', s.createProject);
   }
   ```

3. **Add Cypress task** in `cypress.config.ts`:
   ```typescript
   on('task', {
     createProject(project: { name: string, description: string }) {
       // Call your backend API or database
       return { id: '...', ...project };
     }
   });
   ```

4. **Update schema** in `cypress/support/schema.ts`:
   ```typescript
   const StepSchema = z.union([
     z.object({ createProject: z.object({ name: z.string(), description: z.string() }) }),
     // ... other steps
   ]);
   ```

### Step 4b: Implement Application Feature

When DSL exists but application doesn't have the feature:

1. **Identify what's missing:**
   - UI component? (e.g., button with `data-test=add-task`)
   - API endpoint? (e.g., POST /tasks)
   - Business logic? (e.g., task validation)
   - State management? (e.g., task list state)

2. **Implement minimal code to pass the test:**
   - Start with the UI if it's a `click` or `fill` step
   - Add API if it's a `seedItem` or data operation
   - Add validation if it's an error case

3. **Follow your specification:**
   - Reference Level 4 SYSTEMS docs for architecture
   - Reference Level 3 for interaction patterns
   - Use placeholders from Level 5 FINE_TUNING for parameters

### Step 4c: Create Fixture/Seed

When test needs specific data state:

1. **Identify seed requirements** from `given` section
2. **Extend seedItem task** to handle new data types
3. **Create seed helper functions** for complex scenarios

### Step 5: Verify Test Passes

```bash
# Re-run the specific test
npm test -- --grep "AC-101-1"
```

If test passes:
- ✅ Mark acceptance criteria as complete
- ✅ Commit your changes
- ✅ Move to next test

If test fails:
- 🔍 Debug using Cypress UI
- 🔍 Check console errors
- 🔍 Verify data-test attributes match selectors
- 🔍 Check that DSL steps are implemented correctly
- Repeat from Step 3

### Step 6: Iterate

Repeat Steps 1-5 until all tests pass.

## COMMON IMPLEMENTATION SCENARIOS

### Scenario: Test references missing page

**Test:** `visit: '/dashboard'` but page doesn't exist

**Solution:**
1. Create route in your router (e.g., React Router, Next.js)
2. Create basic page component
3. Ensure page renders without errors

### Scenario: Test references missing UI element

**Test:** `click: { selector: '[data-test=add-task]' }` but button doesn't exist

**Solution:**
1. Add button to UI with correct data-test attribute
2. Wire up click handler
3. Implement feature logic

### Scenario: Test expects specific text

**Test:** `shouldContain: { selector: '[data-test=task-item]', text: 'Buy groceries' }`

**Solution:**
1. Ensure data flows from input → state → display
2. Check that element has correct data-test attribute
3. Verify text rendering logic

### Scenario: Test fails on timing

**Test:** `shouldContain: { selector: '[data-test=points-total]', text: '10' }` appears too slowly

**Solution:**
1. Check Level 5 FINE_TUNING for timing parameters
2. Optimize application performance
3. Add explicit wait in test if needed (use DSL extension)

### Scenario: Multiple tests need same setup

**Problem:** Every test does `loginAs: member` followed by `visit: '/dashboard'`

**Solution (PRESCRIPTIVE):**
1. For auth: Keep per-test `loginAs` for clarity (tests are self-documenting)
2. For navigation: Consider adding compound DSL step like `startAsLoggedInMember`
3. Alternatively: Use `beforeEach` in global setup if ALL tests need it

## VALIDATION CHECKLIST

As you implement, continuously verify:

- [ ] All data-test attributes match YAML selectors exactly
- [ ] Application behavior matches Level 3 interaction architecture
- [ ] System boundaries match Level 4 SYSTEMS definitions
- [ ] Numeric values come from Level 5 FINE_TUNING (not hardcoded)
- [ ] Tests remain independent (can run in any order)
- [ ] Database resets between tests (no state pollution)

## WORKFLOW SUMMARY

```
┌─────────────────────────────────────────────────────────┐
│ PHASE 1: Analyze all YAML tests                        │
│ - Identify global setup needs                          │
│ - List all DSL steps required                          │
│ - Create implementation roadmap                        │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ PHASE 2: Implement global setup                        │
│ - Auth pattern (loginAs task + state management)       │
│ - Database reset (beforeEach hook)                     │
│ - Seed data pattern (seedItem task)                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ PHASE 3: Iterate through tests (MVP first)             │
│                                                         │
│ For each failing test:                                 │
│   1. Run test, identify failure                        │
│   2. Decision tree: DSL vs App vs Fixture?             │
│   3. Implement minimal solution                        │
│   4. Verify test passes                                │
│   5. Commit and move to next test                      │
│                                                         │
│ Repeat until all MVP tests pass                        │
│ Then move to POST_MVP, P2, P3, etc.                    │
└─────────────────────────────────────────────────────────┘
```

## TROUBLESHOOTING

**Problem: Test can't find element with selector**
- Solution: Check that data-test attribute exists in your UI
- Solution: Use Cypress UI to inspect actual DOM structure
- Solution: Verify element is visible (not hidden by CSS)

**Problem: loginAs doesn't work**
- Solution: Verify auth token is stored correctly (localStorage/cookies)
- Solution: Check that your app reads auth state on page load
- Solution: Ensure backend accepts the test auth tokens

**Problem: seedItem data doesn't appear**
- Solution: Check that seedItem task actually writes to database
- Solution: Verify your app queries the database correctly
- Solution: Ensure database reset isn't clearing data mid-test

**Problem: Tests pass individually but fail when run together**
- Solution: Tests are not isolated - check database reset
- Solution: Check for global state pollution (localStorage, cookies)
- Solution: Ensure each test has independent `given` setup

**Problem: Can't decide if I should extend DSL or modify app**
- Solution: If YAML uses a step that doesn't exist → Extend DSL
- Solution: If YAML uses existing DSL but app doesn't have feature → Modify app
- Solution: When in doubt, extend DSL (keeps tests readable)

## SUCCESS CRITERIA

You'll know this workflow is working when:

- ✅ All MVP tests pass
- ✅ Tests run independently in any order
- ✅ Global setup is consistent across all tests
- ✅ Application matches specification architecture
- ✅ No hardcoded values (all from FINE_TUNING)
- ✅ CI/CD pipeline runs all tests successfully

Let's begin with Phase 1: Analyze Test Suite.
```
