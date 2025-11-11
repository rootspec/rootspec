# Changelog

All notable changes to the Hierarchical Specification Framework will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.1.0] - 2025-11-11

### Added

#### Comprehensive Prompt Library

**New `prompts/` directory** with self-contained, production-ready AI prompts for all framework workflows.

- **7 detailed prompt files:**
  - `initialize-spec.md` - Create new specifications from scratch
  - `migrate-spec.md` - Upgrade specifications to newer framework versions
  - `validate-spec.md` - Comprehensive specification validation
  - `add-feature.md` - Add features while maintaining hierarchy integrity
  - `review-feature.md` - Validate features/implementations against spec
  - `generate-docs.md` - Generate PRDs, TDDs, backlogs from specs
  - `tips-and-best-practices.md` - Quick commands and troubleshooting

- **Self-contained prompts:** All AI decision-making logic (decision trees, examples, checklists, validation criteria) embedded directly in copyable prompt sections
- **Human-focused guidance:** Prerequisites, usage tips, expected outcomes, and next steps outside prompt sections
- **No duplication:** Single source of truth for each piece of guidance

#### File Role Refinement

- **README.md:** Now human-focused with philosophy, use cases, comparisons, and collapsible quick prompts
- **CLAUDE.md:** Condensed to 171 lines with quick reference and redirects to detailed sources
- **00.SPEC_FRAMEWORK.md:** Added HTML section markers for AI navigation
- **Prompts library:** Detailed, extensible prompts for all use cases

### Changed

- Improved separation of concerns between human-facing and AI-facing documentation
- Enhanced README with "Why This Framework?", "When to Use", and comparison sections
- Streamlined CLAUDE.md from 283 to 171 lines while maintaining essential guidance

## [3.0.0] - 2025-11-09

### Major Changes

#### YAML User Stories with Auto-Generated Cypress Tests

**Level 5 USER_STORIES has been completely redesigned** to use YAML format with embedded test specifications that automatically generate Cypress end-to-end tests.

**Breaking Changes:**
- **File format changed:** `*.md` → `*.yaml` for all user story files
- **Structure changed:** Markdown prose → YAML with test DSL (given/when/then)
- **Template files added:** Framework now includes Cypress templates for test generation
- **New directory:** `templates/` with Cypress support and example files

### Added

- **YAML User Story Format** in Level 5 documentation
  - Structured format with id, title, requirement_id, acceptance_criteria
  - Comment annotations (@priority, @journey, @systems, @spec_source)
  - Acceptance criteria with narrative + test DSL (given/when/then)
  - Auto-generated Cypress tests from YAML specifications

- **Test DSL Documentation**
  - Core step types (visit, click, fill, loginAs, seedItem, shouldContain, shouldExist)
  - Extension guidance for domain-specific steps
  - Schema validation with Zod
  - Runtime test generation approach

- **Cypress Template Files**
  - `templates/cypress/support/schema.ts` - Zod validation schema
  - `templates/cypress/support/steps.ts` - DSL-to-Cypress converter
  - `templates/cypress/support/e2e.ts` - Support file entry point
  - `templates/cypress/e2e/by_priority.cy.ts` - Priority-based test generator
  - `templates/cypress/e2e/by_journey.cy.ts` - Journey-based test generator
  - `templates/cypress/e2e/by_system.cy.ts` - System-based test generator
  - `templates/cypress.config.ts` - Cypress configuration example

- **Example YAML User Stories**
  - `templates/USER_STORIES/by_priority/MVP.example.yaml`
  - `templates/USER_STORIES/by_journey/EXAMPLE_JOURNEY.example.yaml`
  - `templates/USER_STORIES/by_system/EXAMPLE_SYSTEM.example.yaml`
  - `templates/USER_STORIES/USER_STORIES_OVERVIEW.md` - Updated for YAML approach

- **Enhanced Documentation**
  - Complete YAML format specification in 00.SPEC_FRAMEWORK.md
  - Working with USER_STORIES section in CLAUDE.md
  - Runtime test generation workflow
  - DSL extension patterns

### Changed

- **User Stories are now executable** - YAML stories directly generate Cypress tests
- **Directory structure updated** - .yaml extensions instead of .md
- **00.SPEC_FRAMEWORK.md** - Complete rewrite of Level 5 USER_STORIES section
- **CLAUDE.md** - Added USER_STORIES YAML guidance parallel to FINE_TUNING
- **README.md** - Updated to mention YAML + Cypress workflow

### Migration Guide: 2.x → 3.0.0

If you have an existing project using version 2.x of this framework:

#### 1. Copy Cypress Templates to Your Project

```bash
# Copy the entire templates directory
cp -r templates/ your-project/

# Your project now has:
# - cypress/ (Cypress support and test files)
# - templates/USER_STORIES/ (example YAML stories)
```

#### 2. Convert Markdown User Stories to YAML Format

For each existing markdown user story, convert to YAML structure:

**Before (markdown):**
```markdown
As a busy user, I want to add new tasks quickly so that I can capture ideas before I forget them.

Acceptance criteria:
- A new task can be created from the main screen with one tap or keystroke
- After saving, the task appears instantly in the current list
- Empty or whitespace-only entries are rejected

System references: TASK_SYSTEM.md
```

**After (YAML):**
```yaml
# =============================================================================
# USER STORY: Quick Task Creation
# =============================================================================
# @spec_version: 1.0.0
# @priority: MVP
# @journey: DAILY_USAGE
# @systems: [TASK_SYSTEM]
# @last_updated: 2025-11-09T00:00:00Z

id: US-101
title: Add new tasks quickly
requirement_id: R-101

acceptance_criteria:
  - id: AC-101-1
    title: Create task from main screen
    narrative: |
      Given I am a logged-in member viewing the main screen
      When I click the add task button and enter a task name
      Then I should see the task appear in my current list
    given:
      - loginAs: member
      - visit: '/dashboard'
    when:
      - click: { selector: '[data-test=add-task]' }
      - fill: { selector: '[data-test=task-input]', value: 'Buy groceries' }
      - click: { selector: '[data-test=save-task]' }
    then:
      - shouldExist: { selector: '[data-test=task-list] [data-test=task-item]' }
      - shouldContain: { selector: '[data-test=task-item]', text: 'Buy groceries' }

  - id: AC-101-2
    title: Empty tasks are rejected
    narrative: |
      Given I am viewing the add task screen
      When I try to create a task with only whitespace
      Then I should see a validation error
    given:
      - loginAs: member
      - visit: '/dashboard'
      - click: { selector: '[data-test=add-task]' }
    when:
      - fill: { selector: '[data-test=task-input]', value: '   ' }
      - click: { selector: '[data-test=save-task]' }
    then:
      - shouldContain: { selector: '[data-test=error]', text: 'required' }
```

#### 3. Rename User Story Files

```bash
cd 05.IMPLEMENTATION/USER_STORIES/

# Rename all .md files to .yaml
mv by_priority/MVP.md by_priority/MVP.yaml
mv by_priority/SECONDARY.md by_priority/SECONDARY.yaml
mv by_priority/ADVANCED.md by_priority/ADVANCED.yaml

# Repeat for by_journey/ and by_system/
for file in by_journey/*.md; do mv "$file" "${file%.md}.yaml"; done
for file in by_system/*.md; do mv "$file" "${file%.md}.yaml"; done
```

#### 4. Add Test Selectors to Your Application

Update your application code to include `data-test` attributes:

```tsx
// Before
<button onClick={handleAddTask}>Add Task</button>

// After
<button data-test="add-task" onClick={handleAddTask}>Add Task</button>
```

**Best practices for test selectors:**
- Use `data-test` attributes (not classes or IDs that might change)
- Use kebab-case naming (e.g., `data-test="add-task"`)
- Be specific but stable (e.g., `task-list` not `list-1`)

#### 5. Extend the DSL for Your Domain

Add domain-specific test steps to `cypress/support/steps.ts`:

```typescript
// Add custom step types
export type Step =
  | { visit: string }
  | { click: { selector: string } }
  // ... core steps ...
  | { createProject: { name: string } }  // Your custom step
  | { inviteUser: { email: string, role: string } }  // Your custom step

// Implement custom steps
export function runSetupSteps(steps: Step[]) {
  for (const s of steps ?? []) {
    if ('visit' in s) cy.visit(s.visit);
    // ... other core steps ...
    else if ('createProject' in s) {
      cy.task('createProject', s.createProject);
    }
    else if ('inviteUser' in s) {
      cy.task('inviteUser', s.inviteUser);
    }
  }
}
```

#### 6. Implement Cypress Tasks

Add backend tasks in `cypress.config.ts`:

```typescript
on('task', {
  async loginAs(role: string) {
    // Generate session token or cookie for the role
    return null;
  },
  async seedItem(payload: { slug: string, status: string }) {
    // Seed database via API or direct DB connection
    return null;
  },
  async createProject(payload: { name: string }) {
    // Your custom task implementation
    return null;
  }
});
```

#### 7. Run Your Generated Tests

```bash
# Install Cypress if not already installed
npm install --save-dev cypress

# Run tests
npx cypress open  # Interactive mode
npx cypress run   # Headless mode
```

#### 8. Update AI Prompts

When working with AI assistants, update your prompts to request YAML format:

```
Please generate Level 5 user stories for the [SYSTEM_NAME] in YAML format
following the structure in 00.SPEC_FRAMEWORK.md, including:
- Story metadata (@priority, @journey, @systems)
- Acceptance criteria with narrative
- Test DSL (given/when/then) using appropriate selectors
```

### Why This Change?

**Problem:** Markdown user stories were documentation-only. Tests and stories could drift apart, leading to stale documentation and untested features.

**Solution:** YAML user stories with embedded test specifications create a single source of truth. User stories ARE the test specification, ensuring living documentation.

**Benefits:**
- **Single source of truth** - Stories and tests can't drift apart
- **Living documentation** - Tests always match documented behavior
- **Traceability** - Clear path from L4 systems → L5 stories → Cypress tests
- **AI-friendly** - Structured format for automated story/test generation
- **Multi-view testing** - Same stories generate priority, journey, and system test suites
- **Version control** - YAML with comments tracks full context of changes

**Backward compatibility:** The philosophical intent of Level 5 hasn't changed—it still validates that systems deliver user value. The format changed from documentation-only markdown to executable YAML specifications.

### Notes

- **Breaking change rationale:** File format and structure change require migration effort, hence 3.0.0
- **Philosophy unchanged:** Core framework principles (hierarchy, reference rules, separation of concerns) remain the same
- **Template addition:** Framework now includes working templates to accelerate adoption
- **No impact on Levels 1-4:** Structure and content of other levels unchanged
- **FINE_TUNING unchanged:** Level 5 FINE_TUNING YAML format remains the same

---

## [2.1.0] - 2025-11-08

### Fixed

- **Removed `01.FOUNDATIONAL_PHILOSOPHY.md` from framework repository**
  - This file was incorrectly committed as part of the framework repository in v2.0.0
  - It should only exist in user specifications, not in the framework itself
  - Framework repository now contains only meta-documents (framework definition + documentation)
  - Users copy `00.SPEC_FRAMEWORK.md` as the single seed file to their projects
  - AI assistants generate level files (01-05) based on examples in `00.SPEC_FRAMEWORK.md`

### Added

- **Comprehensive "Getting Started" workflow in README.md**
  - Step-by-step guide for new projects
  - Clear explanation of single-file seed approach
  - Visual project structure showing what gets generated
  - Distinction between framework definition and user specification

### Changed

- **Clarified single-file seed workflow throughout all documentation**
  - Updated all AI prompts to reference `00.SPEC_FRAMEWORK.md` as the framework definition
  - Added clear distinction between "framework repository" and "user specification"
  - Updated CLAUDE.md to explain what files exist in framework vs user projects
  - Updated `00.SPEC_FRAMEWORK.md` with usage instructions at the top
  - Renamed "Directory Structure Template" to "User Project Directory Structure" for clarity
  - All AI prompts now instruct users to copy framework file first

### Documentation

- **00.SPEC_FRAMEWORK.md**: Added prominent usage note at top explaining single-file seed workflow
- **README.md**: Complete getting started section with curl command and project structure diagram
- **CLAUDE.md**: Clear sections distinguishing framework repository contents from user specification structure

### Notes

This is a **non-breaking enhancement** to v2.0.0. The framework structure and Design Pillars from v2.0.0 remain unchanged. This release only clarifies the usage workflow and removes the incorrectly committed template file.

---

## [2.0.0] - 2025-11-08

### Major Changes

#### Design Pillars Integration

**Level 1 has been renamed and restructured to explicitly include Design Pillars** - a proven methodology from game design and product development that focuses on core user experiences and emotions.

**Breaking Changes:**
- **Level 1 renamed:** `First Principles` → `Foundational Philosophy`
- **File renamed:** `01.FIRST_PRINCIPLES.md` → `01.FOUNDATIONAL_PHILOSOPHY.md`
- **Level 1 purpose expanded:** Now explicitly includes "WHY & WHAT EXPERIENCE" instead of just "WHY"
- **New required section:** Design Pillars (3-5 core experiences/emotions)

### Added

- **Design Pillars section** in Level 1 documentation
  - 3-5 core experiences/emotions that define the product
  - Serves as decision filter: features must support at least one pillar
  - Focus on how users will FEEL, not what they will do
  - Each pillar includes: name, emotional statement, explanation, user perspective, examples

- **Enhanced Level 1 template** (`01.FOUNDATIONAL_PHILOSOPHY.md`)
  - Comprehensive Design Pillars structure
  - Anti-Goals section (what the product explicitly won't do)
  - External References section
  - Implementation notes for using pillars as decision filters

- **Design Pillars guidance** in CLAUDE.md
  - "Key Concepts" section explaining Design Pillars
  - Characteristics of good vs bad pillars
  - Examples of effective pillars
  - How to use pillars as decision filters

- **Enhanced AI assistant guidance** in 00.SPEC_FRAMEWORK.md
  - Updated Level 1 question templates to include pillar-specific questions
  - Warning signs for poor pillar design
  - Anti-pattern examples for pillars
  - Updated examples showing pillar integration

- **This CHANGELOG.md file** for version tracking and migration guidance

### Changed

- **Level 1 name:** "First Principles" → "Foundational Philosophy"
  - More accurate description of content (philosophy + pillars, not first principles thinking methodology)
  - Clarifies that Level 1 contains foundational philosophy AND experiential design

- **Level 1 purpose statement:** Now explicitly covers both "WHY the product exists" AND "WHAT core experiences it creates"

- **00.SPEC_FRAMEWORK.md** - All references updated:
  - Quick Reference table
  - Level Details section
  - Reference Matrix
  - Directory Structure Template
  - Question Templates
  - Anti-Patterns table
  - Example YAML comments

- **CLAUDE.md** - All references updated:
  - Document Hierarchy
  - Editing Guidelines (added pillar alignment requirement)
  - Reading Order

- **README.md** - Updated Level 1 references in five levels table

### Migration Guide: 1.x → 2.0.0

If you have an existing project using version 1.x of this framework:

#### 1. Rename Level 1 File

```bash
git mv 01.FIRST_PRINCIPLES.md 01.FOUNDATIONAL_PHILOSOPHY.md
```

#### 2. Update Your Level 1 Document Structure

Add the **Design Pillars** section between your Mission and Inviolable Principles:

```markdown
## Mission
[Your existing mission statement]

## Design Pillars

### 1. [PILLAR NAME]
[One-sentence emotional statement]

**What this means:**
[Explanation of the feeling/experience]

**User perspective:**
"I feel [emotion] when [context]"

**Examples:**
- [Concrete example]
- [Concrete example]

### 2. [PILLAR NAME]
[Repeat structure for 3-5 pillars total]

## Inviolable Principles
[Your existing principles]
```

#### 3. Identify Your Design Pillars

Review your existing Level 1 content and extract 3-5 core experiences:

**Questions to ask:**
- What are the 3-5 most important emotional experiences users should have?
- What feelings define the product's essence?
- What experiences would you never compromise?

**Look for pillars in:**
- Your mission statement's implied promises
- Your inviolable principles (what do they protect?)
- Your north-star experience description
- Core emotional/functional goals you've already documented

**Common extraction patterns:**
- Mission mentions "empowering users" → Pillar: "Empowered Action"
- Principle says "never create guilt" → Pillar: "Sustainable Engagement"
- North-star describes "effortless discovery" → Pillar: "Cascading Discovery"

#### 4. Update All Cross-References

Search your project for references to "First Principles" or "01.FIRST_PRINCIPLES.md" and update to "Foundational Philosophy" or "01.FOUNDATIONAL_PHILOSOPHY.md":

```bash
# Find all references
grep -r "FIRST_PRINCIPLES" .
grep -r "First Principles" .

# Update in Level 2-5 documents
# Update in any custom documentation
# Update in configuration files
```

#### 5. Update Feature Decision Processes

Going forward, use Design Pillars as decision filters:

**Before implementing any feature, ask:**
- "Which pillar(s) does this feature support?"
- "How does this create the intended user experience?"
- "If this doesn't support a pillar, why are we building it?"

#### 6. Validate Existing Features Against Pillars

Review your existing Level 4 systems and Level 5 user stories:

- Do existing features support at least one pillar?
- Are there features that don't align with any pillar? (Consider deprecating)
- Are there pillars with insufficient supporting features? (Identify gaps)

#### 7. Update Team Processes

**Design reviews:** Add "Pillar alignment check" to review criteria
**Feature proposals:** Require explicit pillar mapping
**Trade-off decisions:** Reference pillars when evaluating options

### Why This Change?

**Problem:** "First Principles" was philosophically inaccurate. The term refers to a reasoning methodology (breaking down problems to fundamental truths), but Level 1 actually contained the *outputs* of that thinking process—mission, goals, principles.

**Solution:** "Foundational Philosophy" accurately describes the content: philosophical foundations that guide everything else.

**Enhancement:** Design Pillars provide operational clarity. They're an industry-proven practice (AAA games, successful products) that helps teams:
- Make consistent decisions
- Communicate product vision clearly
- Say "no" to feature creep
- Create coherent user experiences

**Backward compatibility:** The philosophical intent of Level 1 hasn't changed—it still defines WHY the product exists and what's inviolable. Design Pillars make the "WHAT core experiences" aspect more explicit and actionable.

### Notes

- **Breaking change rationale:** File rename and structural change require migration effort, hence 2.0.0
- **Philosophy unchanged:** Core framework principles (hierarchy, reference rules, separation of concerns) remain the same
- **Template enhancement:** New 01.FOUNDATIONAL_PHILOSOPHY.md provides more comprehensive guidance than before
- **No impact on Levels 2-5:** Structure and content of other levels unchanged (except cross-references)

---

## [1.0.0] - 2025-11-07

### Initial Release

Initial public release of the Hierarchical Specification Framework.

### Added

- **5-level hierarchical structure:**
  - Level 1: First Principles (WHY)
  - Level 2: Stable Truths (WHAT Strategy)
  - Level 3: Interaction Architecture (HOW Conceptual)
  - Level 4: Systems (HOW Implementation)
  - Level 5: Implementation (Validation & Tuning)

- **Core framework documents:**
  - `00.SPEC_FRAMEWORK.md` - Complete framework definition
  - `README.md` - Overview and quick start
  - `CLAUDE.md` - AI assistant guidance

- **Strict reference hierarchy rules:**
  - Each level can only reference higher levels, never lower
  - Prevents circular dependencies
  - Ensures foundational stability

- **Dependency inversion principle:**
  - Philosophy guides implementation
  - Changes flow downward only
  - High-level policy sets direction

- **Level 5 dual structure:**
  - USER_STORIES/ for validation (markdown)
  - FINE_TUNING/ for numeric parameters (comment-annotated YAML)

- **Comment-annotated YAML format:**
  - Clean YAML structure with configuration values
  - Rich metadata in comments
  - Annotations: @rationale, @spec_source, @alternatives, @test_result, @constraints, etc.
  - Traceability from parameters back to specs

- **Comprehensive AI assistant guidance:**
  - Session flow recommendations
  - Level-by-level question templates
  - Warning signs and anti-patterns
  - Validation checklists
  - Example dialog patterns

- **User Stories organization:**
  - by_priority/ (MVP, Secondary, Advanced)
  - by_journey/ (complete user flows)
  - by_system/ (per system validation)

- **MIT License**

---

## Version Number Format

This project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html):

**MAJOR.MINOR.PATCH**

- **MAJOR:** Breaking changes (file renames, structural changes, migration required)
- **MINOR:** New features, enhancements (backward compatible additions)
- **PATCH:** Bug fixes, clarifications, typos (no structural changes)

### Examples

- **2.0.0:** Level 1 renamed, Design Pillars added (breaking: file rename)
- **2.1.0:** New Level 3 template examples added (non-breaking enhancement)
- **2.0.1:** Typo fixes in documentation (patch)

---

## How to Use This Changelog

**When adopting a new version:**
1. Read the version's entry in this CHANGELOG
2. Check for breaking changes
3. Follow the migration guide if upgrading across major versions
4. Review "Added" and "Changed" sections for new capabilities
5. Update your project following the migration steps

**When contributing:**
- Add changes under [Unreleased] section
- Move to versioned section on release
- Follow Keep a Changelog format
- Document breaking changes clearly
- Provide migration guidance for breaking changes

---

[Unreleased]: https://github.com/caudexia/spec-framework/compare/v3.0.0...HEAD
[3.0.0]: https://github.com/caudexia/spec-framework/compare/v2.1.0...v3.0.0
[2.1.0]: https://github.com/caudexia/spec-framework/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/caudexia/spec-framework/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/caudexia/spec-framework/releases/tag/v1.0.0
