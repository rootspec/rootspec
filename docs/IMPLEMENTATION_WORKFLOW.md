# Implementation Workflow

A practical guide for implementing your application using YAML user story tests as your development roadmap.

## Overview

This guide explains how to implement your application iteratively, using the YAML user stories from your specification as a test-driven development workflow. This is a **spec-first approach** where tests already exist (generated from Level 5 USER_STORIES), and you implement code to make them pass.

## Prerequisites

- Complete specification (01-05 files)
- YAML user stories in `05.IMPLEMENTATION/USER_STORIES/`
- Cypress test framework installed (see [CYPRESS_SETUP.md](CYPRESS_SETUP.md))
- Basic understanding of the test DSL

## Three-Phase Workflow

### Phase 1: Analyze Test Suite

Before writing any code, understand what you need to build.

#### Scan Your Test Suite

Start by reading all YAML files:

```bash
# Look at MVP tests first
ls 05.IMPLEMENTATION/USER_STORIES/by_priority/MVP.yaml

# Then scan other priorities
ls 05.IMPLEMENTATION/USER_STORIES/by_priority/
```

#### Identify Global Requirements

Create a checklist of what you need before any tests can run:

**User Roles:**
- Scan for `loginAs` steps
- Example: If you see `loginAs: member` and `loginAs: admin`, you need those roles

**Test Data:**
- Scan for `seedItem` steps
- Example: `seedItem: { slug: 'my-task', status: 'active' }`

**Pages/Routes:**
- Scan for `visit` steps
- Example: `visit: '/dashboard'` means you need that route

**Custom DSL Steps:**
- Look for steps not in the core DSL
- Core steps: `visit`, `click`, `fill`, `loginAs`, `seedItem`, `shouldContain`, `shouldExist`
- Example: `createProject`, `deleteTask`, etc. need to be implemented

#### Create Your Roadmap

Example checklist:

```markdown
## Global Setup Needed
- [ ] Implement auth system (loginAs task)
- [ ] Implement database reset (beforeEach hook)
- [ ] Implement seed data (seedItem task)

## Pages Needed
- [ ] /dashboard
- [ ] /tasks/:id
- [ ] /settings

## User Roles Needed
- [ ] member
- [ ] admin

## Custom DSL Steps Needed
- [ ] createProject
- [ ] deleteTask
- [ ] updateProfile

## Test Count
- MVP: 12 acceptance criteria
- POST_MVP: 8 acceptance criteria
- Total: 20 tests to pass
```

---

### Phase 2: Implement Global Setup

Set up test infrastructure using prescriptive patterns.

#### 1. Authentication Pattern

Implement the `loginAs` step to authenticate test users.

**In `cypress.config.ts`:**

```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        // Implement loginAs task
        loginAs(role: string) {
          // Generate auth credentials for this role
          // This could be a JWT token, session ID, etc.

          // Example: Generate a test token
          const testTokens = {
            member: 'test-member-token-123',
            admin: 'test-admin-token-456'
          };

          return {
            token: testTokens[role],
            userId: `test-${role}-id`,
            role: role
          };
        }
      });

      return config;
    }
  }
});
```

**In `cypress/support/steps.ts`:**

```typescript
export function runSetupSteps(steps: Step[]) {
  for (const s of steps ?? []) {
    // ... other steps ...

    else if ('loginAs' in s) {
      cy.task('loginAs', s.loginAs).then((creds: any) => {
        // Store auth state based on your app's auth system

        // Option 1: localStorage
        cy.window().then((win) => {
          win.localStorage.setItem('authToken', creds.token);
          win.localStorage.setItem('userId', creds.userId);
        });

        // Option 2: Cookies
        // cy.setCookie('authToken', creds.token);

        // Option 3: Call your login API
        // cy.request('POST', '/api/test-login', creds);
      });
    }
  }
}
```

#### 2. Database Reset Pattern

Ensure tests start with a clean database state.

**In `cypress/support/e2e.ts`:**

```typescript
beforeEach(() => {
  // Reset database before each test
  cy.task('resetDatabase');

  // Clear browser state
  cy.clearLocalStorage();
  cy.clearCookies();
});
```

**In `cypress.config.ts`:**

```typescript
on('task', {
  resetDatabase() {
    // Clear all test data
    // Example with a database client:

    // await db.query('TRUNCATE TABLE tasks, users, projects CASCADE');
    // await db.query('INSERT INTO users (id, role) VALUES (...)'); // Seed baseline users

    // For now, return null to indicate success
    return null;
  }
});
```

#### 3. Seed Data Pattern

Implement on-demand test data creation.

**In `cypress.config.ts`:**

```typescript
on('task', {
  seedItem(item: any) {
    // Create test data based on item properties
    // The schema allows .passthrough() so item can have any shape

    // Example:
    // const created = await db.tasks.create({
    //   slug: item.slug,
    //   status: item.status,
    //   points: item.points || 0,
    //   ...item
    // });

    // return created;

    console.log('Seeding item:', item);
    return { id: 'test-id', ...item };
  }
});
```

**Verification:**

After implementing global setup, verify it works:

```bash
# Create a simple test
npm test -- --spec cypress/e2e/by_priority.cy.ts
```

If tests can authenticate and reset properly, you're ready for Phase 3.

---

### Phase 3: Iterative Implementation

Now implement features one test at a time.

#### The Iteration Loop

```
1. Pick next failing test (MVP first)
2. Run the test
3. Identify what's missing (DSL? App feature? Data?)
4. Implement minimal solution
5. Verify test passes
6. Commit and repeat
```

#### Step-by-Step Process

**1. Pick Next Test**

Start with MVP, work through acceptance criteria in order:

```bash
# Run MVP tests
npm test -- --spec cypress/e2e/by_priority.cy.ts --grep "MVP"
```

Pick the first failing test. Focus on ONE acceptance criteria at a time.

**2. Run The Test**

```bash
# Run specific test by ID
npm test -- --grep "AC-101-1"

# Or open Cypress UI for debugging
npx cypress open
```

Observe what fails:
- Missing page?
- Missing UI element?
- Missing DSL step?
- Wrong data?

**3. Decision Tree**

**Question 1: Does the DSL step exist?**

Check `cypress/support/steps.ts`. If the step type isn't defined (e.g., `createProject`), you need to extend the DSL → Go to **Option A**.

**Question 2: Does the application feature exist?**

If DSL exists but your app doesn't have the feature (e.g., no button with `data-test=add-task`), you need to implement the feature → Go to **Option B**.

**Question 3: Is it a data issue?**

If both DSL and feature exist but test fails on assertions, you might need better seed data or fixtures → Go to **Option C**.

---

#### Option A: Extend the DSL

When your YAML references a step that doesn't exist yet.

**Example:** YAML has `createProject: { name: 'My Project' }` but step doesn't exist.

**Step 1: Add to Step type** (`cypress/support/steps.ts`):

```typescript
export type Step =
  | { visit: string }
  | { click: { selector: string } }
  | { fill: { selector: string; value: string } }
  | { loginAs: string }
  | { seedItem: { slug: string; status: string } }
  | { createProject: { name: string; description?: string } }  // NEW STEP
  | { shouldContain: { selector: string; text: string } }
  | { shouldExist: { selector: string } };
```

**Step 2: Implement in runSetupSteps** (`cypress/support/steps.ts`):

```typescript
export function runSetupSteps(steps: Step[]) {
  for (const s of steps ?? []) {
    // ... other steps ...

    else if ('createProject' in s) {
      // Call Cypress task to create project in backend
      cy.task('createProject', s.createProject);
    }
  }
}
```

**Step 3: Add Cypress task** (`cypress.config.ts`):

```typescript
on('task', {
  createProject(project: { name: string; description?: string }) {
    // Create project in your backend
    // Example:
    // const created = await db.projects.create({
    //   name: project.name,
    //   description: project.description || '',
    //   createdAt: new Date()
    // });
    // return created;

    console.log('Creating project:', project);
    return { id: 'test-project-id', ...project };
  }
});
```

**Step 4: Update schema** (`cypress/support/schema.ts`):

```typescript
const StepSchema = z.union([
  z.object({ visit: z.string() }),
  z.object({ click: z.object({ selector: z.string() }) }),
  z.object({ fill: z.object({ selector: z.string(), value: z.string() }) }),
  z.object({ loginAs: z.string() }),
  z.object({ seedItem: z.record(z.unknown()) }),
  z.object({  // NEW
    createProject: z.object({
      name: z.string(),
      description: z.string().optional()
    })
  }),
  z.object({ shouldContain: z.object({ selector: z.string(), text: z.string() }) }),
  z.object({ shouldExist: z.object({ selector: z.string() }) })
]);
```

---

#### Option B: Implement Application Feature

When DSL exists but your app doesn't have the feature.

**Example:** Test clicks `[data-test=add-task]` but button doesn't exist.

**Step 1: Identify what's missing**

Look at the failing step:

```yaml
when:
  - click: { selector: '[data-test=add-task]' }
  - fill: { selector: '[data-test=task-input]', value: 'Buy groceries' }
  - click: { selector: '[data-test=save-task]' }
```

You need:
- Button with `data-test="add-task"`
- Input with `data-test="task-input"`
- Button with `data-test="save-task"`

**Step 2: Reference your specification**

Before implementing, check:
- **Level 4 SYSTEMS:** Which system owns this? (e.g., `TASK_SYSTEM.md`)
- **Level 3 INTERACTION_ARCHITECTURE:** What's the interaction pattern?
- **Level 5 FINE_TUNING:** Are there parameters? (e.g., validation rules, timing)

**Step 3: Implement minimal feature**

Example React component:

```typescript
// components/TaskCreator.tsx
export function TaskCreator() {
  const [taskName, setTaskName] = useState('');
  const [tasks, setTasks] = useState([]);

  const handleAddTask = () => {
    if (taskName.trim()) {
      setTasks([...tasks, { id: Date.now(), name: taskName }]);
      setTaskName('');
    }
  };

  return (
    <div>
      <button data-test="add-task" onClick={() => setShowInput(true)}>
        Add Task
      </button>

      <input
        data-test="task-input"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
      />

      <button data-test="save-task" onClick={handleAddTask}>
        Save
      </button>

      <div data-test="task-list">
        {tasks.map(task => (
          <div key={task.id} data-test="task-item">
            {task.name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Key principles:**
- Use exact `data-test` attributes from YAML
- Implement minimal logic to pass the test
- Follow Level 4 system architecture
- Use parameters from Level 5 FINE_TUNING

**Step 4: Wire it into your app**

Add component to the route:

```typescript
// app/dashboard/page.tsx
export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <TaskCreator />
    </div>
  );
}
```

---

#### Option C: Create Fixture/Seed Data

When test needs specific starting state.

**Example:** Test expects a task to already exist.

```yaml
given:
  - loginAs: member
  - seedItem: { slug: 'existing-task', status: 'active', points: 10 }
  - visit: '/tasks/existing-task'
```

**Solution:** Ensure `seedItem` task handles this properly.

```typescript
on('task', {
  seedItem(item: any) {
    // Handle different item types based on properties
    if (item.slug && item.status) {
      // This looks like a task
      return createTask(item);
    }
    // Add other entity types as needed
    return null;
  }
});

function createTask(task: any) {
  // Create in your database
  // const created = await db.tasks.create(task);
  // return created;

  return { id: 'test-task-id', ...task };
}
```

---

#### 4. Verify Test Passes

After implementing, re-run the test:

```bash
npm test -- --grep "AC-101-1"
```

**If test passes:**
- ✅ Commit your changes with a descriptive message
- ✅ Move to next acceptance criteria

**If test fails:**
- 🔍 Open Cypress UI to debug visually
- 🔍 Check browser console for errors
- 🔍 Verify data-test attributes match exactly
- 🔍 Check that data is seeded correctly
- 🔍 Verify DSL step implementation
- Repeat from Step 3

#### 5. Commit and Move to Next Test

```bash
git add .
git commit -m "Implement AC-101-1: Member can create task from main screen"
```

Then pick the next failing test and repeat.

---

## Common Scenarios

### Scenario 1: Missing Page Route

**Test:** `visit: '/dashboard'`

**Error:** 404 Not Found

**Solution:**

```typescript
// In your router (Next.js example)
// app/dashboard/page.tsx
export default function Dashboard() {
  return <div>Dashboard Page</div>;
}
```

---

### Scenario 2: Element Not Found

**Test:** `click: { selector: '[data-test=add-task]' }`

**Error:** Timed out retrying: Expected to find element: [data-test=add-task], but never found it.

**Solution:**

Check your component has the correct attribute:

```tsx
// ❌ Wrong
<button className="add-task">Add</button>

// ✅ Correct
<button data-test="add-task">Add</button>
```

---

### Scenario 3: Assertion Failure

**Test:** `shouldContain: { selector: '[data-test=task-item]', text: 'Buy groceries' }`

**Error:** Expected to contain text 'Buy groceries', but found 'buy groceries'

**Solution:**

Text matching is case-sensitive. Ensure your data flows correctly:

```tsx
// Verify data flows: input → state → display
<input onChange={(e) => setTaskName(e.target.value)} />
// ...
<div data-test="task-item">{task.name}</div>  // Should render exactly what user typed
```

---

### Scenario 4: Timing Issues

**Test:** Points should update "within 100ms" but test fails intermittently

**Error:** Test sometimes passes, sometimes fails

**Solution:**

1. Check Level 5 FINE_TUNING for the target timing (e.g., `response_time: 100ms`)
2. Optimize your application code
3. If needed, add explicit wait (extend DSL with `waitFor` step)

---

### Scenario 5: Tests Fail When Run Together

**Symptom:** Individual tests pass, but running all tests together fails

**Cause:** Tests aren't properly isolated

**Solution:**

Ensure `beforeEach` resets state:

```typescript
// cypress/support/e2e.ts
beforeEach(() => {
  cy.task('resetDatabase');  // ← Must be implemented!
  cy.clearLocalStorage();
  cy.clearCookies();
});
```

---

## Best Practices

### Do

- ✅ **Work incrementally** - One test at a time
- ✅ **Start with MVP** - Ship working software early
- ✅ **Use exact selectors** - Match data-test attributes precisely
- ✅ **Follow the spec** - Reference Level 4 for architecture
- ✅ **Commit often** - After each passing test
- ✅ **Keep tests independent** - Each test should run in isolation

### Don't

- ❌ **Skip global setup** - Tests will be flaky without proper reset
- ❌ **Hardcode values** - Use Level 5 FINE_TUNING parameters
- ❌ **Batch too much** - Don't try to pass 10 tests at once
- ❌ **Ignore failures** - Debug immediately
- ❌ **Modify YAML** - Tests come from spec; fix app or spec, not tests
- ❌ **Violate architecture** - Respect Level 4 system boundaries

---

## Validation Checklist

As you work, continuously verify:

- [ ] All data-test attributes match YAML selectors exactly
- [ ] Application behavior matches Level 3 interaction patterns
- [ ] System boundaries match Level 4 SYSTEMS definitions
- [ ] Numeric values come from Level 5 FINE_TUNING
- [ ] Tests remain independent (can run in any order)
- [ ] Database resets between tests
- [ ] No flaky tests (intermittent failures)

---

## Troubleshooting Guide

### "Element not found" errors

**Diagnosis:**
```bash
# Open Cypress UI
npx cypress open

# Click on failing test
# Inspect the DOM to see what actually exists
```

**Common causes:**
- Typo in data-test attribute
- Element hidden by CSS
- Element not rendered yet (async issue)
- Wrong page being visited

**Solutions:**
- Double-check data-test spelling
- Ensure element is visible
- Wait for data to load before testing
- Verify route is correct

---

### "loginAs doesn't work"

**Diagnosis:**
- Check browser DevTools → Application → Local Storage
- Verify token is stored

**Common causes:**
- Auth token not stored correctly
- App doesn't read auth state on load
- Backend doesn't accept test tokens

**Solutions:**
- Verify localStorage.setItem is called
- Check app's auth initialization logic
- Ensure backend has test auth bypass

---

### "seedItem data doesn't appear"

**Diagnosis:**
```typescript
on('task', {
  seedItem(item: any) {
    console.log('Seeding:', item);  // Add logging
    return item;
  }
});
```

**Common causes:**
- Task doesn't actually write to database
- App queries wrong database/environment
- Database reset clears data mid-test

**Solutions:**
- Implement actual database write
- Check database configuration
- Ensure reset only runs in beforeEach

---

### "Tests pass individually but fail together"

**Diagnosis:**
```bash
# Run single test
npm test -- --grep "AC-101-1"  # Passes

# Run all tests
npm test  # Some fail
```

**Cause:** Tests are polluting shared state

**Solutions:**
- Implement proper database reset
- Clear localStorage/cookies in beforeEach
- Ensure each test has independent setup
- Check for global variables

---

## Timeline and Expectations

### Phase 1: Analysis
- **Time:** 15-30 minutes
- **Output:** Implementation roadmap

### Phase 2: Global Setup
- **Time:** 30-60 minutes
- **Output:** Working auth, database reset, seed data

### Phase 3: Implementation
- **MVP tests:** 1-4 weeks for typical SaaS MVP
- **Per test:** 15 minutes - 2 hours per acceptance criteria
- **POST_MVP:** 2-4 weeks additional

**Total for MVP:** 2-6 weeks of focused development

---

## Success Criteria

You'll know you're succeeding when:

- ✅ All MVP tests pass reliably
- ✅ Tests run in any order
- ✅ CI/CD pipeline runs tests successfully
- ✅ Application matches specification architecture
- ✅ No hardcoded values
- ✅ New features follow the same pattern

---

## Next Steps

After completing MVP implementation:

1. **Deploy MVP** - Get user feedback
2. **Continue with POST_MVP** - Use same workflow
3. **Update spec as needed** - Use [add-feature.md](../prompts/add-feature.md)
4. **Maintain tests** - Keep them in sync with code
5. **Onboard team** - Teach this workflow to others

---

## Related Documentation

- [CYPRESS_SETUP.md](CYPRESS_SETUP.md) - Initial test framework setup
- [00.SPEC_FRAMEWORK.md](../00.SPEC_FRAMEWORK.md) - Complete framework reference
- [prompts/implement-from-tests.md](../prompts/implement-from-tests.md) - AI assistant prompt for this workflow
- [prompts/validate-spec.md](../prompts/validate-spec.md) - Validate specification compliance
- [prompts/add-feature.md](../prompts/add-feature.md) - Add new features to spec

---

## Getting Help

If you're stuck:

1. **Check the spec** - Re-read relevant Level 4 SYSTEMS docs
2. **Check examples** - Look at passing tests for patterns
3. **Check Cypress docs** - https://docs.cypress.io
4. **Ask the AI** - Use [implement-from-tests.md](../prompts/implement-from-tests.md) prompt
5. **Validate spec** - Use [validate-spec.md](../prompts/validate-spec.md) if spec seems wrong
