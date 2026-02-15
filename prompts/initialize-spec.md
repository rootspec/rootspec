I have copied 00.SPEC_FRAMEWORK.md (RootSpec v4.5.0)
into my project directory.

Please read 00.SPEC_FRAMEWORK.md to understand the framework structure.

My product idea: [Brief description of your product concept]

Help me create my product specification by generating specification files
following the examples and templates in 00.SPEC_FRAMEWORK.md:

1. 01.FOUNDATIONAL_PHILOSOPHY.md - Use the Level 1 examples as a guide
2. 02.STABLE_TRUTHS.md - Use the Level 2 examples
3. 03.INTERACTION_ARCHITECTURE.md - Use the Level 3 examples
4. 04.SYSTEMS/ - Use the Level 4 examples
5. 05.IMPLEMENTATION/ - Use the Level 5 examples

## DISCOVERY QUESTION FRAMEWORK

Use these questions to guide the conversation for each level:

### Level 1: Foundational Philosophy

Ask me questions like:
- "What problem does this product solve, and why must it exist?"
- "What 3-5 core experiences or emotions should users feel?"
- "For each pillar, what specific feeling are you creating?"
- "What principles would you never violate, even if it cost features or users?"
- "Who is this NOT for? What will this product NOT do?"
- "If this product succeeds, how will users' lives be different in 6 months?"

Focus on *why* the product exists and *what experiences* it creates, not features.

### Level 2: Stable Truths

Ask me:
- "What design philosophy or framework guides your approach?"
- "What are you optimizing for, and what trade-offs will you accept?"
- "What patterns from other domains apply here?"
- "What existing approaches are you rejecting, and why?"
- "How do you define success for this product?"

Define strategic commitments without specifying implementation details.

### Level 3: Interaction Architecture

Ask me:
- "Walk me through a complete user journey from start to finish"
- "What triggers each interaction, and what feedback does the user receive?"
- "Are there different scales of interaction? Immediate? Session-level? Cross-session?"
- "What happens when things fail or users skip steps?"
- "How do different systems coordinate to create coherent experiences?"

Describe behavioral patterns and loops, not UI implementation.

### Level 4: Systems

Ask me:
- "What are the major subsystems, and what is each responsible for?"
- "What data does each system manage? What are the key entities?"
- "What rules govern state transitions and system behavior?"
- "How do systems interact? What do they expose to each other?"
- "What values are calculated, and from what inputs?"

Define system architecture conceptually, using placeholders for numbers.

### Level 5: Implementation

Ask me:
- "As a user, what would you want to accomplish in the first 5 minutes? First day? First week?"
- "For each feature, what observable behaviors would confirm it's working?"
- "Which features are absolutely essential (MVP) vs. nice-to-have vs. future?"
- "What are the complete user journeys from entry to exit?"
- "How would you know if the system is delivering the intended experience?"

Create user stories in YAML format with test specifications and identify numeric parameters.

## COMMON MISTAKES TO AVOID

As you help me create the specification, watch for these anti-patterns:

1. **Starting with features instead of philosophy**
   - Fix: Answer "Why must this exist?" before "What does it do?"

2. **Creating generic design pillars like "Make users happy"**
   - Fix: Be specific about the emotion/experience (e.g., "Empowered Action")

3. **Putting implementation details in Level 1**
   - Fix: Keep Level 1 philosophical - no systems, no technologies

4. **Skipping the narrative in user stories**
   - Fix: Always include given/when/then narrative alongside test DSL

5. **Creating more than 8 design pillars**
   - Fix: Consolidate to 3-5 core experiences

## QUALITY REFERENCE EXAMPLE

Here's an example of a good product concept to guide quality:

"A time management app that helps knowledge workers achieve sustainable
productivity through energy awareness rather than guilt-driven task completion.
Unlike traditional productivity apps that create anxiety about uncompleted tasks,
this app helps users understand their natural energy rhythms and schedule work
accordingly."

This works well because it has:
- Clear problem (guilt-driven productivity apps)
- Specific approach (energy awareness)
- Target users (knowledge workers)
- Emotional goal (sustainable productivity)

## FRAMEWORK COMPLIANCE RULES

Follow the framework rules in 00.SPEC_FRAMEWORK.md strictly:
- Each level should only reference higher levels (no upward references)
- Use placeholders for numbers in Levels 1-4 (e.g., [brief duration])
- Actual numeric values only appear in Level 5
- Design Pillars should focus on user feelings/experiences, not features
- Help me avoid the anti-patterns listed above

## PROCESS

Let's proceed level by level, ensuring each is complete before moving to the next:
1. Start with Level 1 (Foundational Philosophy)
2. Once Level 1 is approved, move to Level 2 (Stable Truths)
3. Continue through all 5 levels systematically
4. Validate each level before proceeding to the next
