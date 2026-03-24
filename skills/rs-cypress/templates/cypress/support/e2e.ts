/**
 * Global Cypress support file.
 *
 * Runs before every test. Handles:
 * - Test state isolation (reset between tests)
 * - Unhandled exception prevention
 * - Browser console forwarding
 *
 * Customize the beforeEach/afterEach hooks for your project.
 */

import { resetTestState } from './steps'

// Prevent unhandled app errors from stalling the entire test suite.
// Remove this if you want tests to fail on uncaught exceptions.
Cypress.on('uncaught:exception', () => false)

// One-time cleanup before the entire suite.
// Ensures dangling state from prior runs is gone.
// Uncomment and implement when you have a cleanup task.
// before(() => {
//   cy.task('cleanupAllTestData')
// })

/**
 * Test Isolation: Reset state before each test.
 *
 * 1. Reset runtime test state (auth, seed data refs, flags)
 * 2. Reset database to clean state
 * 3. Clear browser state
 *
 * Customize the localStorage keys and cleanup for your app.
 */
beforeEach(() => {
  resetTestState()

  // Reset database — implement the task in cypress.config.ts
  cy.task('resetDatabase')

  // Clear browser state
  cy.clearLocalStorage()
  cy.clearCookies()

  // Clear app-specific keys that might leak between tests:
  // cy.window({ log: false }).then((win) => {
  //   win.localStorage.removeItem('your-app-key')
  // }).then(() => {}, () => {})
})

// Clean up UI state after each test (dismiss modals, overlays, etc.):
// afterEach(() => {
//   cy.get('body').then(($body) => {
//     if ($body.find('.modal-overlay').length) {
//       cy.get('.modal-close').click({ force: true, multiple: true })
//     }
//   })
// })

/**
 * Browser console forwarding.
 *
 * Forwards browser console output to terminal via the 'log' task.
 * Controlled by env vars in cypress.config.ts:
 * - CYPRESS_LOG_BROWSER=1  → Show all browser console output
 * - CYPRESS_QUIET=1        → Suppress all output
 * - Default: Errors only
 */
Cypress.on('window:before:load', (win) => {
  const originalLog = win.console.log
  const originalWarn = win.console.warn
  const originalError = win.console.error

  win.console.log = function (...args: any[]) {
    originalLog.apply(win.console, args)
    cy.task('log', { level: 'LOG', message: args.join(' ') }, { log: false })
  }

  win.console.warn = function (...args: any[]) {
    originalWarn.apply(win.console, args)
    cy.task('log', { level: 'WARN', message: args.join(' ') }, { log: false })
  }

  win.console.error = function (...args: any[]) {
    originalError.apply(win.console, args)
    cy.task('log', { level: 'ERROR', message: args.join(' ') }, { log: false })
  }
})

export {}
