/**
 * DSL-to-Cypress step converter.
 *
 * Converts YAML given/when/then steps into Cypress commands.
 *
 * EXTENDING THE DSL:
 * 1. Add new step types to the Step union
 * 2. Implement the step logic in runSetupSteps or runAssertionSteps
 * 3. Update the Zod schema in schema.ts to validate your custom steps
 */

/**
 * Step represents all possible test actions and assertions.
 *
 * Core steps:
 * - visit: Navigate to a URL
 * - click: Click an element
 * - fill: Fill an input field
 * - loginAs: Authenticate as a user role (via Cypress task)
 * - seedItem: Seed test data (via Cypress task)
 * - shouldContain: Assert element contains text
 * - shouldExist: Assert element exists
 * - shouldNotExist: Assert element does not exist
 *
 * Add your domain-specific steps below the core steps.
 */
export type Step =
  | { visit: string }
  | { click: { selector: string } }
  | { fill: { selector: string; value: string } }
  | { loginAs: string }
  | { seedItem: { slug: string; status: string } }
  | { shouldContain: { selector: string; text: string } }
  | { shouldExist: { selector: string } }
  | { shouldNotExist: { selector: string } };
  // Add custom steps here:
  // | { createProject: { name: string } }
  // | { goOffline: Record<string, unknown> }

/**
 * Runtime test state.
 *
 * Shared between steps within a single test, reset before each test.
 * Use this to track auth sessions, dynamic data, and flags that
 * steps need to share without coupling to each other.
 *
 * Add your app-specific state fields here.
 */
const testState = {
  /** Auth session from loginAs task (injected into localStorage on next visit) */
  authSession: null as any,
  /** Storage key for auth session (e.g., 'sb-xxx-auth-token' for Supabase) */
  authStorageKey: null as string | null,
  /** Pending localStorage entries — drained on next visit() call */
  pendingLocalStorage: [] as { key: string; value: string }[],
  /** Generic key-value store for passing data between steps */
  vars: {} as Record<string, any>,
}

/**
 * Reset test state. Called by beforeEach in e2e.ts.
 * Ensures complete isolation between tests.
 */
export function resetTestState() {
  testState.authSession = null
  testState.authStorageKey = null
  testState.pendingLocalStorage = []
  testState.vars = {}
}

/**
 * Visit with auth session injection and pending localStorage drain.
 * Injects auth state and any pending localStorage entries before the app loads.
 */
function visitWithState(url: string) {
  cy.visit(url, {
    onBeforeLoad(win) {
      // Inject auth session if available
      if (testState.authSession && testState.authStorageKey) {
        win.localStorage.setItem(
          testState.authStorageKey,
          JSON.stringify(testState.authSession)
        )
      }
      // Drain pending localStorage entries
      for (const { key, value } of testState.pendingLocalStorage) {
        win.localStorage.setItem(key, value)
      }
      testState.pendingLocalStorage = []
    },
  })
}

/**
 * Executes setup and action steps (given/when).
 */
export function runSetupSteps(steps: Step[]) {
  for (const s of steps ?? []) {
    if ('visit' in s) {
      visitWithState(s.visit)
    } else if ('click' in s) {
      cy.get(s.click.selector).click()
    } else if ('fill' in s) {
      cy.get(s.fill.selector).clear().type(s.fill.value)
    } else if ('loginAs' in s) {
      // loginAs task should return { session, storageKey } or null
      // Customize the task in cypress.config.ts for your auth system
      cy.task('loginAs', s.loginAs).then((result: any) => {
        if (result) {
          testState.authSession = result.session ?? result
          testState.authStorageKey = result.storageKey ?? 'authToken'
        }
      })
    } else if ('seedItem' in s) {
      cy.task('seedItem', s.seedItem)
    }
    // Add custom step implementations here:
    // else if ('goOffline' in s) {
    //   cy.intercept('**', (req) => {
    //     if (!req.url.includes('localhost')) req.reply({ statusCode: 503 })
    //     else req.continue()
    //   })
    // }
  }
}

/**
 * Executes assertion steps (then).
 */
export function runAssertionSteps(steps: Step[]) {
  for (const s of steps ?? []) {
    if ('shouldContain' in s) {
      cy.get(s.shouldContain.selector).should('contain.text', s.shouldContain.text)
    } else if ('shouldExist' in s) {
      cy.get(s.shouldExist.selector).should('exist')
    } else if ('shouldNotExist' in s) {
      cy.get((s as any).shouldNotExist.selector).should('not.exist')
    }
    // Add custom assertions here:
    // else if ('shouldHaveValue' in s) {
    //   cy.get(s.shouldHaveValue.selector).should('have.value', s.shouldHaveValue.value)
    // }
  }
}
