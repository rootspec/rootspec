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
 * PRESCRIPTIVE PATTERN: Capture browser console logs
 *
 * Captures console.log, console.warn, console.error, console.info from the
 * application under test and outputs them to Cypress terminal (headless mode)
 * and Cypress UI (interactive mode).
 *
 * This is especially useful for:
 * - Detecting JavaScript errors in headless CI environments
 * - Debugging application behavior during test runs
 * - Catching warnings that might indicate issues
 */
Cypress.on('window:before:load', (win) => {
  // Store original console methods
  const originalLog = win.console.log;
  const originalWarn = win.console.warn;
  const originalError = win.console.error;
  const originalInfo = win.console.info;

  // Override console.log
  win.console.log = function (...args: any[]) {
    // Call original to preserve normal console behavior
    originalLog.apply(win.console, args);

    // Send to Cypress terminal (visible in headless mode)
    cy.task('log', { level: 'LOG', message: args.join(' ') }, { log: false });
  };

  // Override console.warn
  win.console.warn = function (...args: any[]) {
    originalWarn.apply(win.console, args);
    cy.task('log', { level: 'WARN', message: args.join(' ') }, { log: false });
  };

  // Override console.error
  win.console.error = function (...args: any[]) {
    originalError.apply(win.console, args);
    cy.task('log', { level: 'ERROR', message: args.join(' ') }, { log: false });

    // Also show errors in Cypress Command Log for visibility
    cy.log(`🔴 Console Error: ${args.join(' ')}`);
  };

  // Override console.info
  win.console.info = function (...args: any[]) {
    originalInfo.apply(win.console, args);
    cy.task('log', { level: 'INFO', message: args.join(' ') }, { log: false });
  };
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
