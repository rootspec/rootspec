/**
 * Cypress support file entry point.
 *
 * This file is processed and loaded automatically before test files.
 * Use it to import custom commands, configure global settings, or
 * set up test hooks that apply to all tests.
 *
 * See: https://on.cypress.io/configuration#Folders-Files
 */

// Import commands from other support files if needed
// import './commands';

// Alternatively, import step functions directly if using in custom commands
// import { runSetupSteps, runAssertionSteps } from './steps';

/**
 * Global configuration and hooks.
 *
 * This file sets up test isolation patterns that ensure each test
 * runs independently with a clean state.
 */

/**
 * PRESCRIPTIVE PATTERN: Test Isolation
 *
 * Run before each test to ensure a clean starting state.
 * This prevents test pollution where one test's data affects another.
 */
beforeEach(() => {
  // 1. Reset database to clean state
  // IMPORTANT: Implement the 'resetDatabase' task in cypress.config.ts
  cy.task('resetDatabase');

  // 2. Clear browser state
  cy.clearLocalStorage();
  cy.clearCookies();
});

/**
 * OPTIONAL: Global test logging
 *
 * Uncomment to log test names for debugging.
 */
// beforeEach(() => {
//   cy.log('Running test:', Cypress.currentTest.title);
// });

/**
 * OPTIONAL: Custom Cypress commands
 *
 * Add reusable commands here.
 *
 * Example:
 * Cypress.Commands.add('loginAsMember', () => {
 *   cy.task('loginAs', 'member').then((creds: any) => {
 *     cy.window().then((win) => {
 *       win.localStorage.setItem('authToken', creds.token);
 *     });
 *   });
 * });
 */
