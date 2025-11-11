import { z } from 'zod';

/**
 * Zod schema for validating user story YAML files.
 *
 * This schema validates the structure of Level 5 USER_STORIES YAML files
 * to ensure they conform to the specification framework requirements.
 */

/**
 * Step represents a single action or assertion in the test DSL.
 *
 * Core steps provided by the framework:
 * - visit: Navigate to a path
 * - click: Click an element
 * - fill: Fill an input field
 * - loginAs: Authenticate as a user role
 * - seedItem: Seed test data
 * - shouldContain: Assert text content
 * - shouldExist: Assert element exists
 *
 * Extend this union with domain-specific steps for your project.
 */
export const Step = z.union([
  z.object({ visit: z.string() }),
  z.object({ click: z.object({ selector: z.string() }) }),
  z.object({ fill: z.object({ selector: z.string(), value: z.string() }) }),
  z.object({ loginAs: z.string() }),
  z.object({ seedItem: z.object({ slug: z.string(), status: z.string() }) }),
  z.object({ shouldContain: z.object({ selector: z.string(), text: z.string() }) }),
  z.object({ shouldExist: z.object({ selector: z.string() }) })
]);

/**
 * Acceptance represents a single acceptance criterion with test specification.
 *
 * Structure:
 * - id: Unique identifier for the acceptance criterion
 * - title: Short description
 * - narrative: Human-readable given/when/then narrative
 * - given: Setup steps (optional, array of Step objects)
 * - when: Action step (exactly 1 step, array for type consistency)
 * - then: Assertion steps (1-5 steps)
 */
export const Acceptance = z.object({
  id: z.string(),
  title: z.string(),
  narrative: z.string().min(10),
  given: z.array(Step).optional(),
  when: z.array(Step).length(1),
  then: z.array(Step).min(1).max(5)
});

/**
 * Story represents a complete user story with metadata and acceptance criteria.
 *
 * Structure:
 * - id: Unique story identifier (e.g., US-101)
 * - title: Story title
 * - requirement_id: Optional reference to requirements (e.g., R-101)
 * - acceptance_criteria: Array of acceptance criteria (at least 1)
 */
export const StorySchema = z.object({
  id: z.string(),
  title: z.string(),
  requirement_id: z.string().optional(),
  acceptance_criteria: z.array(Acceptance).nonempty()
});

// Export TypeScript types inferred from Zod schemas
export type Story = z.infer<typeof StorySchema>;
export type AC = z.infer<typeof Acceptance>;
export type StepType = z.infer<typeof Step>;
