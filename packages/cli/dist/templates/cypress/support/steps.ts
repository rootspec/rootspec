/**
 * DSL-to-Cypress step converter.
 *
 * This file defines the Step type and functions to convert DSL steps
 * from user story YAML files into Cypress commands.
 *
 * EXTENDING THE DSL:
 * To add custom domain-specific steps:
 * 1. Add new step types to the Step union
 * 2. Implement the step logic in runSetupSteps or runAssertionSteps
 * 3. Update the Zod schema in schema.ts to validate your custom steps
 */

/**
 * Step represents all possible test actions and assertions.
 *
 * Core steps (framework-provided):
 * - visit: Navigate to a URL
 * - click: Click an element
 * - fill: Fill an input field
 * - loginAs: Authenticate as a user role (via Cypress task)
 * - seedItem: Seed test data (via Cypress task)
 * - shouldContain: Assert element contains text
 * - shouldExist: Assert element exists
 *
 * EXTEND THIS TYPE with your domain-specific steps.
 * Example:
 *   | { createProject: { name: string } }
 *   | { inviteUser: { email: string, role: string } }
 */
export type Step =
  | { visit: string }
  | { click: { selector: string } }
  | { fill: { selector: string; value: string } }
  | { loginAs: string }
  | { seedItem: { slug: string; status: string } }
  | { shouldContain: { selector: string; text: string } }
  | { shouldExist: { selector: string } };
  // Add custom steps here:
  // | { customStep: { param: string } }

/**
 * Executes setup and action steps (given/when).
 *
 * These steps prepare the test environment and perform user actions.
 *
 * @param steps - Array of Step objects to execute
 */
export function runSetupSteps(steps: Step[]) {
  for (const s of steps ?? []) {
    if ('visit' in s) {
      cy.visit(s.visit);
    } else if ('click' in s) {
      cy.get(s.click.selector).click();
    } else if ('fill' in s) {
      cy.get(s.fill.selector).clear().type(s.fill.value);
    } else if ('loginAs' in s) {
      // Call Cypress task to authenticate
      // Implementation depends on your auth system (cookies, tokens, etc.)
      cy.task('loginAs', s.loginAs).then(() => {
        // Optionally reload page to pick up auth state
        cy.visit('/');
      });
    } else if ('seedItem' in s) {
      // Call Cypress task to seed data
      // Implementation depends on your data layer (API, direct DB, etc.)
      cy.task('seedItem', s.seedItem);
    }
    // Add custom step implementations here:
    // else if ('createProject' in s) {
    //   cy.task('createProject', s.createProject);
    // }
  }
}

/**
 * Executes assertion steps (then).
 *
 * These steps verify expected outcomes and behaviors.
 *
 * @param steps - Array of Step objects to execute
 */
export function runAssertionSteps(steps: Step[]) {
  for (const s of steps ?? []) {
    if ('shouldContain' in s) {
      cy.get(s.shouldContain.selector).should('contain.text', s.shouldContain.text);
    } else if ('shouldExist' in s) {
      cy.get(s.shouldExist.selector).should('exist');
    }
    // Add custom assertion implementations here:
    // else if ('shouldHaveClass' in s) {
    //   cy.get(s.shouldHaveClass.selector).should('have.class', s.shouldHaveClass.className);
    // }
  }
}
