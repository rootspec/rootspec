# Tips and Best Practices for AI-Assisted Specification

Collection of tips, common commands, and troubleshooting guidance for working with AI assistants on specifications.

## General Tips

### Working with AI Assistants

1. **Be patient and iterative**
   - AI assistants work best with back-and-forth dialogue
   - Don't expect perfect output on first try
   - Refine and iterate

2. **Provide context**
   - The more context you give, the better the output
   - Share examples from your domain
   - Explain constraints and trade-offs

3. **Question AI suggestions**
   - AI isn't always right
   - If something feels wrong, speak up
   - Ask "why" to understand reasoning

4. **Use specific language**
   - Vague: "Users should feel good"
   - Specific: "Users should feel empowered and in control"

5. **Save your work frequently**
   - Copy AI-generated content to files regularly
   - Don't rely solely on conversation history

## Quick Commands

### Ask AI to Check Something

```
Check if [this section] violates any hierarchy rules
```

```
Does this feature support at least one Design Pillar?
```

```
Are there any numeric values in Levels 1-4 that should be placeholders?
```

### Ask AI to Generate Content

```
Generate 3 user stories for the [SYSTEM_NAME] in YAML format
```

```
Create a Level 3 interaction loop for [user action]
```

```
Draft a Design Pillar around [emotional experience]
```

### Ask AI to Refine Content

```
This Design Pillar feels too generic. Make it more specific to [our domain]
```

```
Rewrite this Level 2 truth without referencing Level 4 systems
```

```
Convert this markdown user story to YAML format with test DSL
```

### Ask AI to Validate

```
Validate this specification against the framework rules
```

```
Check all cross-references in my specification for accuracy
```

```
Ensure all placeholders in L1-4 are replaced with actual values in L5
```

## Common Mistakes and How to Avoid Them

### Mistake 1: Starting with Features

**Problem:** "I want to build an app with tasks, points, and social features"

**Why it's wrong:** Jumps straight to implementation

**Fix:** Start with why
```
I want to help knowledge workers achieve sustainable productivity
by focusing on energy awareness rather than guilt-driven completion.
```

### Mistake 2: Vague Design Pillars

**Problem:** "Make users happy"

**Why it's wrong:** Too generic, doesn't guide decisions

**Fix:** Be specific about the emotion
```
Empowered Action - Users feel capable and in control, never
overwhelmed or helpless.
```

### Mistake 3: Implementation in Philosophy

**Problem:** Putting "React-based architecture" in Level 1

**Why it's wrong:** L1 is about why and what experience, not how

**Fix:** Keep L1 philosophical
```
Level 1: "Transparent and learnable" (principle)
Level 4: "Use React for predictable state management" (implementation)
```

### Mistake 4: Numbers in High Levels

**Problem:** "Tasks complete in 100ms" in Level 3

**Why it's wrong:** Actual values belong in L5

**Fix:** Use placeholders
```
Level 3: "Tasks complete in [brief duration]"
Level 5: feedback_delay: 100  # actual value in FINE_TUNING
```

### Mistake 5: Upward References

**Problem:** Level 2 saying "As defined in TASK_SYSTEM.md..."

**Why it's wrong:** L2 can't reference L4

**Fix:** Reference concepts, not systems
```
Wrong: "We use the TASK_SYSTEM.md priority algorithm"
Right: "We prioritize based on effort and impact"
```

## Best Practices by Level

### Level 1: Foundational Philosophy

**Do:**
- Focus on emotional experiences
- Create 3-5 specific design pillars
- Define what you WON'T do (anti-goals)
- Make principles truly inviolable

**Don't:**
- List features
- Mention technologies
- Use generic language
- Create 8+ pillars

### Level 2: Stable Truths

**Do:**
- Explain your strategic approach
- Document rejected alternatives
- Define success criteria
- Reference external frameworks

**Don't:**
- Reference specific systems
- Include numeric values
- Describe interaction flows
- Mix strategy with tactics

### Level 3: Interaction Architecture

**Do:**
- Describe behavioral loops
- Include failure modes
- Map interaction scales
- Use conceptual language

**Don't:**
- Specify UI implementation
- Reference system code
- Include actual timing values
- Describe visual design

### Level 4: Systems

**Do:**
- Define clear boundaries
- Use placeholders for values
- Document system interfaces
- Show conceptual algorithms

**Don't:**
- Write actual code
- Reference user stories
- Include magic numbers
- Specify technologies

### Level 5: Implementation

**Do:**
- Write complete user stories
- Include test DSL
- Document parameter rationale
- Use actual numeric values

**Don't:**
- Include philosophy
- Duplicate system logic
- Use vague acceptance criteria
- Skip test specifications

## Troubleshooting

### "My Design Pillars feel wrong"

**Try:**
- Focus on user feelings, not features
- Ask "How do I want users to FEEL?"
- Look at your mission for emotional clues
- Limit to 3-5 pillars

### "I can't figure out which level something belongs in"

**Ask:**
- Is it about WHY? → L1
- Is it about WHAT strategy? → L2
- Is it about HOW users interact (conceptual)? → L3
- Is it about HOW we build it? → L4
- Is it a number or test? → L5

### "AI keeps suggesting features I don't want"

**Try:**
- Be more explicit about anti-goals
- Reference your inviolable principles
- Ask AI to explain how feature supports pillars
- Update your Level 1 to be clearer

### "My spec has too much duplication"

**Check:**
- Are concepts at wrong levels?
- Should something be defined once and referenced?
- Is this necessary repetition for clarity?

### "Validation keeps failing"

**Common causes:**
- Upward references (L2 → L4)
- Numbers in L1-4
- Generic design pillars
- Missing required sections

**Fix:**
- Use the validation prompt
- Fix issues in order (L1 first)
- Re-validate after each fix

## Working with Different AI Models

### Claude (Sonnet/Opus)

**Strengths:**
- Excellent at following framework rules
- Good at iterative refinement
- Strong with structured output

**Tips:**
- Provide complete framework file
- Use explicit prompts from this library
- Ask for validation frequently

### GPT-4

**Strengths:**
- Creative suggestions
- Good at examples
- Fast responses

**Tips:**
- Be more explicit about rules
- Validate output carefully
- May need to repeat constraints

### Other Models

**Tips:**
- Test with small sections first
- Provide more examples
- Validate more frequently
- Use simpler language in prompts

## Productivity Shortcuts

### Quick Spec Check

```
Read my 01.FOUNDATIONAL_PHILOSOPHY.md and tell me:
1. How many Design Pillars do I have?
2. Are they emotional or feature-based?
3. Quick fix suggestions
```

### Fast User Story Generation

```
Generate 5 MVP user stories for [SYSTEM] in YAML format
with test DSL, following by_priority/MVP.example.yaml structure
```

### Rapid Validation

```
Quick validation: Check my L2 file for:
1. Upward references
2. Numeric values
3. Missing placeholders
```

## Remember

1. **Spec is a living document** - Update it as product evolves
2. **Framework is a guide** - Adapt where needed, but understand why rules exist
3. **AI is a tool** - You make final decisions
4. **Iterate, don't perfect** - Better to have "good enough" spec than perfect spec never finished
5. **Team alignment matters** - Share spec with team, get feedback, iterate together
