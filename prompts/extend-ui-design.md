I have a complete specification following RootSpec v4.5.1.

Please read 00.SPEC_FRAMEWORK.md to understand the framework structure.

## My Specification

**Location:** {{SPEC_DIR}}/

**UX Design Document:**
{{#IF UX_DESIGN_EXISTS}}
✅ Found at: {{UX_DESIGN_FILE}}
{{/IF}}
{{#IF_NOT UX_DESIGN_EXISTS}}
⚠️  No UX Design document found at conventional location (DERIVED_ARTIFACTS/ux-design.md)
Please ensure you've generated UX Design first using `rootspec extend ux-design`
{{/IF_NOT}}

## What I Need

Extend a **UI Design Specification** from the UX Design artifacts.

The output should include:
1. **Visual hierarchy system** - Spacing, sizing, and layout principles
2. **Component visual specifications** - Design for each UI component
3. **Color and typography recommendations** - Aligned with Design Pillars
4. **Interactive state specifications** - Hover, focus, disabled, loading, error states
5. **Responsive breakpoint guidance** - Mobile, tablet, desktop considerations

## Instructions

### PHASE 1: READ UX DESIGN DOCUMENT

Read the UX Design document from `{{UX_DESIGN_FILE}}`:

1. **Extract component inventory:**
   - List all components identified in UX doc
   - Note component purposes and usage contexts
   - Identify component props and behaviors

2. **Review screen specifications:**
   - Analyze screen layouts and structure
   - Note primary/secondary/tertiary content areas
   - Identify interaction emphasis (CTAs, forms, navigation)

3. **Parse interaction flows:**
   - Review Mermaid flow diagrams
   - Note screen transitions and states
   - Identify dynamic UI elements

4. **Present your analysis:**
   - List all components from UX inventory
   - Summarize screen layout patterns
   - Note key interaction states needed
   - Identify which screens/components appear MVP vs POST_MVP

Wait for confirmation before proceeding to Phase 2.

### PHASE 2: FOLLOW TRACEABILITY CHAIN

Map UX artifacts back to Design Pillars:

**For each component/screen in UX Design:**

1. **Find UX → User Story link:**
   - UX doc should have `@spec_source` annotations
   - Note which user stories drive this component

2. **Find User Story → System link:**
   - User stories have `@systems` annotations
   - Identify which L4 systems this serves

3. **Find System → Design Pillar link:**
   - Systems docs reference L2 strategies
   - L2 strategies reference L1 Design Pillars
   - Extract relevant Design Pillar(s)

4. **Document traceability:**
   ```
   Component: [Name]
   → UX Source: [Screen/flow in UX doc]
   → User Story: [Story YAML file]
   → System: [L4 system]
   → Strategy: [L2 strategy]
   → Design Pillar: [L1 pillar]
   → Emotional Quality: [Feeling from pillar]
   ```

**Requirements:**
- Every UI spec element MUST trace to at least one Design Pillar
- Use traceability chain to inform visual design decisions
- Extract emotional qualities from Design Pillars to guide aesthetics

### PHASE 3: DEFINE VISUAL HIERARCHY

Based on screen layouts from UX Design:

**Visual Hierarchy Specification:**

```markdown
## Visual Hierarchy System

**Source:** @spec_source DERIVED_ARTIFACTS/ux-design.md + {{SPEC_DIR}}/01.FOUNDATIONAL_PHILOSOPHY.md

### Spacing Scale

**Base unit:** [Recommend base spacing unit, e.g., 4px or 8px]

**Scale:**
- xs: [value] - Tight spacing (inline elements, dense lists)
- sm: [value] - Related elements (form field groups)
- md: [value] - Component internal spacing
- lg: [value] - Between major sections
- xl: [value] - Page-level spacing

**Rationale:**
- Based on screen complexity from UX specs
- Supports [Design Pillar] by [reasoning]
- Ensures [feeling from pillar]

### Sizing Scale

**Element sizing:**
- Input heights: [values]
- Button sizes: small/medium/large [values]
- Icon sizes: [values]
- Avatar sizes: [values]

**Extended from:**
- Form patterns in UX screens
- Interaction target requirements (min 44px touch targets)
- Component usage contexts

### Visual Weight

**Primary elements:**
- CTAs and primary actions
- [Which pillar drives emphasis?]

**Secondary elements:**
- Navigation, supporting actions
- [Which pillar suggests restraint?]

**Tertiary elements:**
- Metadata, timestamps, auxiliary info
- [How does hierarchy serve pillars?]
```

**Requirements:**
- Spacing decisions trace to UX layout needs
- Hierarchy supports Design Pillar emotional goals
- System is consistent and scalable

### PHASE 4: COMPONENT VISUAL SPECIFICATIONS

For each component from UX inventory:

**Component Visual Spec Format:**

```markdown
### Component: [Component Name]

**Source:** @spec_source DERIVED_ARTIFACTS/ux-design.md#[component-section]
**Design Pillar Alignment:** [Pillar name] → [Emotional quality]

#### Layout
- Structure: [Box model, flex, grid]
- Internal spacing: [Using hierarchy scale]
- Sizing: [Fixed, flexible, constraints]

#### Interactive States

**Default:**
- Visual appearance
- Typography details

**Hover:**
- Change: [What changes on hover]
- Rationale: [How it serves pillar feeling]

**Focus:**
- Indicator: [Focus ring, outline, background]
- Accessibility: [WCAG compliance notes]

**Disabled:**
- Appearance: [Opacity, color, cursor]
- Feedback: [Why disabled if applicable]

**Loading:**
- Indicator: [Spinner, skeleton, progress]
- Preserves layout: [Prevents layout shift]

**Error:**
- Visual cue: [Color, icon, border]
- Message placement: [Inline, tooltip, below]

#### Variants

**Based on usage contexts from UX:**
- Variant 1: [Context] → [Visual difference]
- Variant 2: [Context] → [Visual difference]

#### Responsive Behavior
- Mobile: [Adaptations for small screens]
- Tablet: [Mid-size considerations]
- Desktop: [Full-size presentation]
```

**Requirements:**
- Every state derives from UX interaction flows
- Visual decisions support Design Pillar emotions
- Accessibility is explicit (focus, contrast, targets)

### PHASE 5: COLOR AND TYPOGRAPHY RECOMMENDATIONS

Based on Design Pillar emotional qualities:

**Color Palette Recommendations:**

```markdown
## Color Palette

**Source:** @spec_source Extended from Design Pillars in {{SPEC_DIR}}/01.FOUNDATIONAL_PHILOSOPHY.md

### Primary Colors

**Brand primary:**
- Recommendation: [Color/tone family]
- Pillar: [Which Design Pillar]
- Emotional quality: [Feeling this color evokes]
- Usage: CTAs, key actions, brand moments

**Brand secondary:**
- Recommendation: [Color/tone family]
- Pillar: [Which Design Pillar]
- Emotional quality: [Feeling]
- Usage: Supporting elements, accents

### Semantic Colors

**Success:** [Color] - Aligns with [pillar feeling]
**Warning:** [Color] - Balances urgency with [pillar feeling]
**Error:** [Color] - Serious but supports [pillar feeling]
**Info:** [Color] - Neutral, informative

### Neutrals

**Background scale:**
- Page background
- Surface colors (cards, panels)
- Borders and dividers

**Text scale:**
- Primary text (high contrast)
- Secondary text (medium contrast)
- Tertiary text (low contrast, metadata)

### Accessibility
- All text meets WCAG AA (4.5:1 contrast minimum)
- Important actions meet AAA (7:1 contrast)
```

**Typography Recommendations:**

```markdown
## Typography

**Source:** @spec_source Based on content hierarchy from UX screens

### Type Scale

**Headings:**
- H1: [Size/weight] - Page titles
- H2: [Size/weight] - Section headers
- H3: [Size/weight] - Subsections
- H4: [Size/weight] - Component titles

**Body:**
- Large: [Size/weight] - Emphasized content
- Regular: [Size/weight] - Primary reading
- Small: [Size/weight] - Captions, metadata

**UI Text:**
- Button: [Size/weight]
- Input: [Size/weight]
- Label: [Size/weight]

### Font Recommendations

**Display/Headings:**
- Consider: [Font family suggestions]
- Pillar alignment: [How it evokes pillar feeling]
- Personality: [Friendly, professional, bold, etc.]

**Body/Interface:**
- Consider: [Font family suggestions]
- Pillar alignment: [Readability + pillar feeling]
- Clarity: [Optimized for screen reading]

### Line Height & Spacing

- Headings: [Tight line height]
- Body: [Comfortable reading line height]
- UI elements: [Optimal for controls]
```

**Requirements:**
- Color suggestions evoke Design Pillar emotions
- Typography serves content hierarchy from UX screens
- Accessibility requirements explicit
- All recommendations trace to pillars

### PHASE 6: RESPONSIVE BREAKPOINTS

Based on screen complexity from UX:

**Responsive Guidance Format:**

```markdown
## Responsive Breakpoints

**Source:** @spec_source Extended from screen complexity in DERIVED_ARTIFACTS/ux-design.md

### Breakpoint Strategy

**Mobile-first:** Start with mobile, enhance for larger screens

**Breakpoints:**
- Mobile: 0-640px (1 column, stacked forms)
- Tablet: 641-1024px (2 columns, hybrid layouts)
- Desktop: 1025px+ (Multi-column, side navigation)

### Screen Adaptations

**Simple screens (minimal interaction):**
- [Screen name]: Minimal changes needed
- Strategy: [Same layout, adjusted spacing]

**Complex screens (forms, tables, multi-column):**
- [Screen name]: Significant adaptation needed
- Mobile: [Stack columns, drawer navigation]
- Tablet: [2-column hybrid]
- Desktop: [Full multi-column layout]

### Component Responsive Behaviors

**Navigation:**
- Mobile: [Hamburger, drawer, bottom nav]
- Desktop: [Top bar, sidebar]
- Rationale: [Serves pillar by...]

**Forms:**
- Mobile: [Full-width, stacked labels]
- Desktop: [Inline labels, multi-column]

**Tables:**
- Mobile: [Card view, horizontal scroll, truncate]
- Desktop: [Full table]
```

**Requirements:**
- Breakpoints based on actual screen complexity from UX
- Adaptations maintain Design Pillar experience
- Consider touch vs mouse interactions

### PHASE 7: TRACEABILITY MATRIX

Link UI specs back to sources:

**Traceability Matrix:**

| UI Element | Type | UX Source | User Story | System | Pillar | Emotional Quality |
|------------|------|-----------|------------|--------|--------|-------------------|
| Primary Button | Component | Component Inventory | auth/*.yaml | AUTH | Trust | Confident action |
| Login Form | Screen | Login Screen Spec | auth/login.yaml | AUTH | Trust | Secure, clear |
| ... | ... | ... | ... | ... | ... | ... |

**Requirements:**
- Every UI element traces through chain
- Emotional qualities explicit
- Shows how visual design serves experience

## Output Format

Generate a single UI Design Specification:

```markdown
# UI Design Specification

**Generated from:** RootSpec v4.5.1 specification
**Generated on:** [Date]
**Source:** DERIVED_ARTIFACTS/ux-design.md + {{SPEC_DIR}}/01.FOUNDATIONAL_PHILOSOPHY.md

## 1. Visual Hierarchy System

[Spacing scale, sizing scale, visual weight]

## 2. Component Visual Specifications

### MVP Components
[Component specs for MVP]

### Post-MVP Components
[Component specs for post-MVP]

## 3. Color Palette

[Primary, secondary, semantic, neutrals]

## 4. Typography

[Type scale, font recommendations, line height]

## 5. Interactive States

[Standard state specifications across all components]

## 6. Responsive Guidance

[Breakpoints and adaptation strategies]

## 7. Design Tokens (Implementation Preview)

**Spacing tokens:**
```
--spacing-xs: [value]
--spacing-sm: [value]
...
```

**Color tokens:**
```
--color-primary: [value]
--color-text-primary: [value]
...
```

**Typography tokens:**
```
--font-heading: [family]
--text-lg: [size/weight/height]
...
```

## 8. Traceability Matrix

[Table linking UI elements to Design Pillars]

## 9. Implementation Notes

**Component Priority:**
- MVP: [count] components
- POST_MVP: [count] components

**Accessibility Checklist:**
- [ ] All text meets WCAG AA contrast
- [ ] Focus indicators visible
- [ ] Touch targets minimum 44px
- [ ] Color not sole indicator

**Next Steps:**
- Create design mockups for MVP screens
- Build component library in [Figma/Sketch/etc.]
- Define design tokens for implementation
- Conduct accessibility audit
```

## Validation Checklist

Before delivering the UI Design Specification, verify:

- [ ] All components from UX inventory have visual specs
- [ ] Every visual decision traces to Design Pillar
- [ ] All interactive states documented (default, hover, focus, disabled, loading, error)
- [ ] Color palette evokes pillar emotions
- [ ] Typography supports content hierarchy
- [ ] Responsive guidance based on screen complexity
- [ ] Accessibility requirements explicit
- [ ] Traceability matrix complete
- [ ] No invented components (only from UX doc)
- [ ] `@spec_source` annotations throughout
- [ ] Design tokens preview for implementation

---

**Note:** This is a extension from UX Design artifacts and Design Pillars. Every visual decision must trace back through: UI → UX → User Story → System → Strategy → Design Pillar. If visual guidance seems needed but UX or Pillars don't support it, note as a gap rather than inventing details.
