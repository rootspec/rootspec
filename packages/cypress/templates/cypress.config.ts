import { defineConfig } from 'cypress';
import vitePreprocessor from 'cypress-vite';

/**
 * Cypress configuration for user story test generation.
 *
 * This configuration:
 * - Uses Vite preprocessor for TypeScript support
 * - Defines Cypress tasks for test setup (loginAs, seedItem, etc.)
 * - Configures spec patterns to match generated test files
 * - Sets baseUrl for your application
 *
 * Customize this file for your project's needs.
 */

/**
 * Task logging utility.
 * Set CYPRESS_QUIET=1 to suppress task logs, or CYPRESS_LOG_TASKS=1 for verbose output.
 * Default: minimal logging (errors only).
 */
const logTask = (message: string, data?: any) => {
  if (process.env.CYPRESS_QUIET === '1') return;
  if (process.env.CYPRESS_LOG_TASKS === '1') {
    console.log(`[Task] ${message}`, data !== undefined ? data : '');
  }
};

export default defineConfig({
  e2e: {
    // Test file patterns - matches the generated test files
    specPattern: 'cypress/e2e/**/*.cy.ts',

    // Support file with global configuration
    supportFile: 'cypress/support/e2e.ts',

    setupNodeEvents(on, config) {
      // Use Vite preprocessor for TypeScript and modern JS support
      on('file:preprocessor', vitePreprocessor());

      /**
       * Define Cypress tasks here.
       *
       * Tasks are used by the test DSL to perform setup operations
       * that require backend/database access (authentication, data seeding, etc.).
       *
       * Each task must return a value (or null) to satisfy Cypress requirements.
       */
      on('task', {
        /**
         * Authenticate as a specific user role.
         *
         * Implementation depends on your auth system:
         * - Set session cookies
         * - Generate and store JWT tokens
         * - Mock auth state for testing
         *
         * @param role - User role to authenticate as (e.g., 'member', 'admin')
         * @returns null (required by Cypress)
         */
        async loginAs(role: string) {
          logTask(`Authenticating as role: ${role}`);

          // TODO: Implement your authentication logic here
          // Example approaches:
          //
          // 1. Session cookies:
          //    await setSessionCookie(role);
          //
          // 2. JWT tokens:
          //    const token = await generateTestToken(role);
          //    // Store in localStorage/sessionStorage via Cypress commands
          //
          // 3. API login:
          //    await fetch('/api/test-login', {
          //      method: 'POST',
          //      body: JSON.stringify({ role })
          //    });

          return null;
        },

        /**
         * Seed test data into the database.
         *
         * Implementation depends on your data layer:
         * - Direct database calls (Prisma, TypeORM, etc.)
         * - API calls to test endpoints
         * - Mock data fixtures
         *
         * @param payload - Data to seed (structure depends on your app)
         * @returns null (required by Cypress)
         */
        async seedItem(payload: { slug: string; status: string; [key: string]: any }) {
          logTask(`Seeding item: ${payload.slug}`, payload);

          // TODO: Implement your data seeding logic here
          // Example approaches:
          //
          // 1. Direct database (Prisma example):
          //    await prisma.item.create({
          //      data: {
          //        slug: payload.slug,
          //        status: payload.status,
          //        // ... other fields
          //      }
          //    });
          //
          // 2. API endpoint:
          //    await fetch('/api/test-seed', {
          //      method: 'POST',
          //      body: JSON.stringify(payload)
          //    });
          //
          // 3. Fixtures:
          //    await loadFixture(payload.slug);

          return null;
        },

        /**
         * PRESCRIPTIVE PATTERN: Reset database to clean state.
         *
         * Called by the global beforeEach hook in cypress/support/e2e.ts
         * to ensure each test starts with a clean database state.
         *
         * This prevents test pollution where one test's data affects another.
         *
         * @returns null (required by Cypress)
         */
        async resetDatabase() {
          logTask('Resetting database');

          // TODO: Implement your database reset logic here
          // Example approaches:
          //
          // 1. Truncate all tables (Prisma example):
          //    const tables = await prisma.$queryRaw`
          //      SELECT tablename FROM pg_tables WHERE schemaname='public'
          //    `;
          //    for (const { tablename } of tables) {
          //      if (tablename !== '_prisma_migrations') {
          //        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
          //      }
          //    }
          //    // Re-seed baseline data (admin user, etc.)
          //    await prisma.user.create({ data: { role: 'admin', email: 'admin@test.com' } });
          //
          // 2. Drop and recreate schema:
          //    await db.dropSchema();
          //    await db.migrate();
          //    await db.seedBaseline();
          //
          // 3. Test database with migrations:
          //    await exec('npm run db:reset:test');
          //
          // 4. In-memory database:
          //    database.clear();
          //    database.init();

          return null;
        },

        /**
         * Log browser console output to terminal.
         *
         * This task receives console logs from the browser (via e2e.ts)
         * and outputs them to the Node.js console.
         *
         * Set CYPRESS_LOG_BROWSER=1 to enable browser console output.
         * Errors are always shown unless CYPRESS_QUIET=1.
         *
         * @param payload - Log level and message from browser console
         * @returns null (required by Cypress)
         */
        log(payload: { level: string; message: string }) {
          if (process.env.CYPRESS_QUIET === '1') return null;

          // Always show errors, optionally show other levels
          const isError = payload.level === 'ERROR';
          if (isError || process.env.CYPRESS_LOG_BROWSER === '1') {
            const prefix = isError ? '🔴' : '📋';
            console.log(`${prefix} [Browser] ${payload.message}`);
          }
          return null;
        },

        /**
         * Add custom tasks here to support domain-specific test steps.
         *
         * Examples:
         * - createProject({ name, owner })
         * - inviteUser({ email, role })
         * - sendNotification({ userId, message })
         * - processQueue({ queueName })
         */

        // async createProject(payload: { name: string; owner: string }) {
        //   logTask('Creating project', payload);
        //   // Implementation here
        //   return null;
        // },

        // async inviteUser(payload: { email: string; role: string }) {
        //   logTask('Inviting user', payload);
        //   // Implementation here
        //   return null;
        // },
      });

      return config;
    },

    /**
     * Base URL for your application.
     * Update this to match your development server.
     */
    baseUrl: 'http://localhost:3000',
  },

  /**
   * Reporter configuration.
   *
   * Default: 'spec' reporter for human-readable terminal output.
   *
   * For JSON output (useful for AI/LLM consumption or CI):
   *   npm install --save-dev mochawesome mochawesome-merge
   *   Then uncomment the reporter options below.
   */
  reporter: 'spec',

  // Uncomment for JSON reports (AI/CI friendly):
  // reporter: 'mochawesome',
  // reporterOptions: {
  //   reportDir: 'cypress/results',
  //   overwrite: false,
  //   html: false,
  //   json: true,
  // },

  /**
   * Additional Cypress configuration options.
   * See: https://docs.cypress.io/guides/references/configuration
   */

  // Disable video recording (speeds up tests, reduces disk usage)
  video: false,

  // Screenshot configuration
  screenshotOnRunFailure: true,

  // Viewport size
  viewportWidth: 1280,
  viewportHeight: 720,

  // Timeouts
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 30000,
});
