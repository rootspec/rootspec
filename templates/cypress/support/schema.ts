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
 * Steps can be any object with key-value pairs where:
 * - The key is the step name (e.g., 'visit', 'click', 'enrollStudent')
 * - The value can be a string, number, boolean, object, or array
 *
 * This flexible schema allows the DSL to be extended without modifying the schema.
 *
 * Examples:
 * - { visit: '/dashboard' }
 * - { click: { selector: '[data-test=button]' } }
 * - { enrollStudent: { studentId: 123, classId: 456 } }
 * - { shouldShow: { text: 'Welcome', timeout: 2000 } }
 */
export const Step = z.object({}).passthrough();

/**
 * Acceptance represents a single acceptance criterion with test specification.
 *
 * Structure:
 * - id: Unique identifier for the acceptance criterion
 * - title: Short description
 * - narrative: Human-readable given/when/then narrative
 * - given: Setup steps (optional, array of Step objects)
 * - when: Action steps (optional, array of Step objects)
 * - then: Assertion steps (optional, array of Step objects)
 *
 * All step arrays are optional to support narrative-only acceptance criteria.
 */
export const Acceptance = z.object({
  id: z.string(),
  title: z.string(),
  narrative: z.string().min(10),
  given: z.array(Step).optional(),
  when: z.array(Step).optional(),
  then: z.array(Step).optional()
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
