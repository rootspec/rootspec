I have a complete specification following RootSpec v4.4.1.

Please read 00.SPEC_FRAMEWORK.md to understand the framework structure.

## My Specification

**Location:** {{SPEC_DIR}}/

**Design Pillars (from Level 1):**
{{#EACH DESIGN_PILLARS}}
- {{ITEM}}
{{/EACH}}
{{#IF NO_PILLARS}}
(No design pillars found - ensure you have Level 1 FOUNDATIONAL_PHILOSOPHY.md with Design Pillars section)
{{/IF}}

## What I Need

Derive **Brand Guidelines** from my Level 1 Design Pillars.

The output should include:
1. **Voice and tone principles** - How the brand communicates
2. **Brand personality traits** - Character the brand embodies
3. **Messaging guidelines** - Key messages that reflect pillars
4. **Content examples** - Do's and don'ts for brand consistency

## Instructions

### PHASE 1: ANALYZE DESIGN PILLARS

Read `{{SPEC_DIR}}/01.FOUNDATIONAL_PHILOSOPHY.md`:

1. **Extract each Design Pillar:**
   - Pillar name/title
   - Full description/explanation
   - Associated feelings or emotions mentioned
   - User experience goals stated

2. **Identify emotional qualities:**
   - What feeling should users have? (e.g., confident, empowered, delighted)
   - What personality does this suggest? (e.g., professional, playful, caring)
   - What tone aligns with this? (e.g., authoritative, friendly, inspiring)

3. **Note pillar relationships:**
   - Do pillars reinforce each other?
   - Are there tensions to balance? (e.g., "professional" + "approachable")
   - What's the overall brand character?

4. **Present your analysis:**
   - List each pillar with emotional qualities extracted
   - Identify overall brand personality
   - Note any tensions or balances needed

Wait for confirmation before proceeding to Phase 2.

### PHASE 2: EXTRACT EMOTIONAL QUALITIES

For each Design Pillar, extract:

**Emotional Analysis Format:**

```markdown
### Pillar: [Pillar Name]

**Source:** @spec_source 01.FOUNDATIONAL_PHILOSOPHY.md#[section-name]

**Core Feeling:** [Primary emotion user should experience]

**Personality Traits Suggested:**
- [Trait 1] - [Why this pillar implies this trait]
- [Trait 2] - [Reasoning]

**Communication Style Implications:**
- [Style element] - [How it serves the pillar]

**Language Patterns:**
- Words/phrases that fit: [Examples from pillar description]
- Words/phrases to avoid: [Opposites or conflicting tones]
```

**Requirements:**
- Extract, don't invent (derive from pillar descriptions)
- Focus on HOW the pillar makes users FEEL
- Translate technical/product language into brand language

### PHASE 3: DEFINE VOICE AND TONE

Synthesize emotional qualities into brand voice:

**Brand Voice Definition:**

```markdown
## Brand Voice

**Source:** @spec_source Derived from all Design Pillars in 01.FOUNDATIONAL_PHILOSOPHY.md

### Overall Voice

[1-2 sentence summary of brand personality]

**Core Characteristics:**
1. **[Trait 1]** (from Pillar: [X])
   - We are [description]
   - Example: [How this shows up in communication]

2. **[Trait 2]** (from Pillar: [Y])
   - We are [description]
   - Example: [How this shows up in communication]

### Tone Variations by Context

| Context | Tone | Rationale |
|---------|------|-----------|
| Error messages | [Tone] | [Which pillar guides this] |
| Onboarding | [Tone] | [Which pillar guides this] |
| Success states | [Tone] | [Which pillar guides this] |
| Marketing | [Tone] | [Which pillar guides this] |

### Language Patterns

**We use:**
- [Pattern 1] - because [pillar] values [reason]
- [Pattern 2] - because [pillar] emphasizes [reason]

**We avoid:**
- [Pattern 1] - conflicts with [pillar]
- [Pattern 2] - undermines [pillar]
```

**Requirements:**
- Every trait links to specific pillar
- Tone variations serve pillar goals
- Language patterns trace to pillar values

### PHASE 4: CREATE MESSAGING GUIDELINES

For each pillar, define how to communicate it:

**Messaging Guidelines Format:**

```markdown
### Messaging for: [Pillar Name]

**Source:** @spec_source 01.FOUNDATIONAL_PHILOSOPHY.md#[pillar-section]

**Key Message:** [Core message that embodies this pillar]

**Supporting Messages:**
- [Supporting point 1]
- [Supporting point 2]

**Language That Reinforces:**
- [Word/phrase] - evokes [feeling from pillar]
- [Word/phrase] - emphasizes [value from pillar]

**Metaphors/Analogies:**
- [Metaphor] - helps users understand [pillar concept]

**Call-to-Action Style:**
- [CTA example] - aligns with [pillar goal]
```

**Requirements:**
- Messages must reflect pillar's emotional goal
- Language choices trace to pillar descriptions
- Metaphors match pillar tone and values

### PHASE 5: PROVIDE EXAMPLES

For each guideline, show practical application:

**Example Format:**

```markdown
### Example: [Guideline Name]

**Source:** @spec_source Derived from pillar: [Pillar Name]

#### ✅ On-Brand

**Example:**
> [Sample content that follows guideline]

**Why it works:**
- [How it embodies pillar X]
- [How it uses recommended language]
- [How it evokes desired feeling]

#### ❌ Off-Brand

**Example:**
> [Sample content that violates guideline]

**Why it fails:**
- [How it conflicts with pillar X]
- [How it uses avoided language]
- [How it evokes wrong feeling]

#### Context

**Best used for:** [Situations where this guideline applies]
**Related pillars:** [Other pillars this supports]
```

**Example Categories:**
- Button/CTA text
- Error messages
- Onboarding copy
- Feature descriptions
- Marketing headlines
- Email communications

**Requirements:**
- Examples demonstrate guideline clearly
- On/off-brand contrast is obvious
- Explanations reference specific pillars
- Context shows when guideline applies

### PHASE 6: TRACEABILITY

Create traceability matrix:

**Traceability Matrix:**

| Guideline | Type | Derived From Pillar(s) | Key Feeling | Application Context |
|-----------|------|------------------------|-------------|---------------------|
| Voice: [Trait] | Voice | [Pillar X] | [Emotion] | All communications |
| Tone: Errors | Tone | [Pillar Y] | [Emotion] | Error handling |
| Message: [Key] | Message | [Pillar Z] | [Emotion] | Marketing, onboarding |

**Requirements:**
- Every guideline links to source pillar
- Emotional goal explicitly stated
- Application context defined

## Output Format

Generate a single Brand Guidelines Document:

```markdown
# Brand Guidelines

**Generated from:** RootSpec v4.4.1 specification
**Generated on:** [Date]
**Source:** {{SPEC_DIR}}/01.FOUNDATIONAL_PHILOSOPHY.md

## 1. Brand Voice

[Overall voice definition with traits]

## 2. Tone Variations

[Context-specific tone guidance]

## 3. Messaging Guidelines

### By Design Pillar

#### [Pillar 1]
[Messages and language patterns]

#### [Pillar 2]
[Messages and language patterns]

## 4. Content Examples

### Interface Copy
[On/off-brand examples for UI text]

### Error Messages
[On/off-brand examples for errors]

### Marketing Content
[On/off-brand examples for marketing]

### Transactional Messages
[On/off-brand examples for emails/notifications]

## 5. Quick Reference

**Our voice is:**
- [Trait 1] - [Pillar source]
- [Trait 2] - [Pillar source]

**We always:**
- [Do 1] - [Why/pillar]
- [Do 2] - [Why/pillar]

**We never:**
- [Don't 1] - [Why/pillar]
- [Don't 2] - [Why/pillar]

## 6. Traceability Matrix

[Table linking guidelines to pillars]

## 7. Application Checklist

Before publishing content, verify:
- [ ] Embodies at least one Design Pillar
- [ ] Uses recommended language patterns
- [ ] Tone matches context (per guidelines)
- [ ] Evokes desired feeling from pillars
- [ ] Avoids off-brand patterns
```

## Validation Checklist

Before delivering the Brand Guidelines, verify:

- [ ] All Design Pillars are represented
- [ ] Every guideline traces to specific pillar(s)
- [ ] Emotional qualities extracted, not invented
- [ ] Voice traits derive from pillar descriptions
- [ ] Tone variations align with pillar goals
- [ ] Examples clearly demonstrate on/off-brand
- [ ] No generic brand advice (must be specific to these pillars)
- [ ] Traceability matrix is complete
- [ ] Quick reference is actionable
- [ ] `@spec_source` annotations throughout

---

**Note:** This is a derivation, not invention. Every brand guideline must trace back to your Design Pillars. If the pillars don't support a guideline, don't include it. Brand Guidelines should be unique to your product's specific pillars, not generic best practices.
