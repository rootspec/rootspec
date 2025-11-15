/**
 * Runtime test generator for system-based user stories.
 *
 * This file dynamically loads all YAML user stories from the
 * 05.IMPLEMENTATION/USER_STORIES/by_system/ directory and generates
 * Cypress tests organized by system (e.g., TASK_SYSTEM, REWARD_SYSTEM).
 *
 * Test organization:
 * - Each story becomes a describe block
 * - Each acceptance criterion becomes a nested describe + it block
 * - Tests display human-readable narratives in the reporter
 */

import yaml from 'js-yaml';
import { StorySchema, type Story, type AC } from '../support/schema';
import { runSetupSteps, runAssertionSteps } from '../support/steps';

/**
 * Load all YAML story files from the by_system directory.
 *
 * This uses Vite's import.meta.glob to load files at spec-eval time.
 * The 'as: raw' option loads file contents as strings.
 * The 'eager: true' option loads synchronously.
 *
 * To customize for your project structure, edit the glob pattern below.
 * Path is relative to this file (cypress/e2e/).
 *
 * Examples for different structures:
 * - Standard:  '../../../05.IMPLEMENTATION/USER_STORIES/by_system/**​/*.yaml'
 * - Content:   '../../content/spec/05.IMPLEMENTATION/USER_STORIES/by_system/**​/*.yaml'
 * - Monorepo:  '../../../packages/spec/USER_STORIES/by_system/**​/*.yaml'
 * - Flat:      '../../../stories/system/**​/*.yaml'
 */
const rawFiles = import.meta.glob(
  '../../content/spec/05.IMPLEMENTATION/USER_STORIES/by_system/**/*.yaml',
  { as: 'raw', eager: true }
) as Record<string, string>;

/**
 * Parse and validate all user story YAML files.
 *
 * @returns Array of validated Story objects
 * @throws Error if any story fails schema validation
 */
function loadStories(): Story[] {
  const stories: Story[] = [];

  for (const [path, raw] of Object.entries(rawFiles)) {
    try {
      // Parse YAML - loadAll handles multiple documents separated by ---
      const documents = yaml.loadAll(raw);

      // Process each document in the file
      for (const parsed of documents) {
        // Skip empty documents
        if (!parsed) continue;

        // Support both document-level stories array and direct story format
        let storiesToProcess: any[] = [];
        if (parsed.stories || parsed.user_stories) {
          // Document has a stories array - extract it
          storiesToProcess = parsed.stories || parsed.user_stories;
        } else if (parsed.acceptance_criteria) {
          // Document is a single story - wrap in array for uniform processing
          storiesToProcess = [parsed];
        } else {
          // Document doesn't contain stories - skip it (e.g., metadata documents)
          continue;
        }

        // Process each story
        for (const storyData of storiesToProcess) {
          // Pre-validate step structure to provide better error messages
          if (storyData.acceptance_criteria) {
            storyData.acceptance_criteria.forEach((ac: any, acIdx: number) => {
              ['given', 'when', 'then'].forEach(phase => {
                if (ac[phase]) {
                  ac[phase].forEach((step: any, stepIdx: number) => {
                    if (step === null || step === undefined) {
                      throw new Error(
                        `Empty step at acceptance_criteria[${acIdx}].${phase}[${stepIdx}] in ${path}\n` +
                        `Check YAML for extra dashes (-) or blank array elements`
                      );
                    }
                    if (typeof step !== 'object' || Array.isArray(step)) {
                      throw new Error(
                        `Invalid step at acceptance_criteria[${acIdx}].${phase}[${stepIdx}] in ${path}\n` +
                        `Expected object, got ${Array.isArray(step) ? 'array' : typeof step}`
                      );
                    }
                  });
                }
              });
            });
          }

          // Validate with Zod schema
          const story = StorySchema.parse(storyData);

          stories.push(story);
        }
      }
    } catch (error) {
      console.error(`Failed to load story from ${path}:`, error);
      throw error;
    }
  }

  return stories;
}

/**
 * Extract a readable test title from the acceptance criterion narrative.
 *
 * Attempts to craft a "When → Then" title from the narrative block.
 * Falls back to the AC title if narrative parsing fails.
 *
 * @param ac - Acceptance criterion object
 * @returns Formatted test title
 */
function titleFromNarrative(ac: AC): string {
  const lines = ac.narrative
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const when = lines.find(l => /^when/i.test(l)) ?? ac.title;
  const then = lines.find(l => /^then/i.test(l)) ?? '';

  return `${when.replace(/^when\s+/i, '')} → ${then.replace(/^then\s+/i, '')}`.trim();
}

// Load all stories
const stories = loadStories();

/**
 * Generate test suites for each story and acceptance criterion.
 *
 * Structure:
 * describe(story) {
 *   describe(acceptance criterion) {
 *     before() { // Show narrative and given steps }
 *     it(test) { // Run when and then steps }
 *   }
 * }
 *
 * Supports skip/only modifiers at both story and acceptance criterion levels.
 * Story-level modifiers take precedence over AC-level modifiers.
 */
for (const story of stories) {
  // Determine which describe function to use for the story
  let storyDescribe = describe;
  if (story.only) {
    storyDescribe = describe.only;
  } else if (story.skip) {
    storyDescribe = describe.skip;
  }

  storyDescribe(`${story.id}: ${story.title}`, () => {
    for (const ac of story.acceptance_criteria) {
      // Determine which describe function to use for the AC
      // Story-level skip suppresses AC-level modifiers
      // Story-level only allows AC-level modifiers to work within the focused story
      let acDescribe = describe;
      if (story.skip) {
        // Story is skipped - ignore AC-level modifiers
        acDescribe = describe;
      } else if (ac.only) {
        acDescribe = describe.only;
      } else if (ac.skip) {
        acDescribe = describe.skip;
      }

      acDescribe(`${ac.id}: ${ac.title}`, () => {
        before(() => {
          // Display human-readable narrative and setup in reporter
          cy.log('--- Narrative ---');
          cy.log(ac.narrative);

          cy.log('--- Given (Setup) ---');
          (ac.given ?? []).forEach(s => cy.log(JSON.stringify(s)));

          // Run given steps once before the test
          runSetupSteps(ac.given ?? []);
        });

        it(titleFromNarrative(ac), () => {
          // Run the when step(s)
          cy.log('--- When (Action) ---');
          (ac.when ?? []).forEach(s => cy.log(JSON.stringify(s)));
          runSetupSteps(ac.when ?? []);

          // Run the then assertion(s)
          cy.log('--- Then (Assertions) ---');
          (ac.then ?? []).forEach(s => cy.log(JSON.stringify(s)));
          runAssertionSteps(ac.then ?? []);
        });
      });
    }
  });
}
