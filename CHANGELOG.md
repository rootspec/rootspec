# Changelog

All notable changes to **RootSpec** (Hierarchical Specification Framework) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.2.0] - 2025-11-24

### Changed

#### Cypress Test Suites

**Flexible test suite files** - Replaced prescriptive three-lane test structure with a single template that users copy and customize.

**Before:**
- Three hardcoded test files: `by_priority.cy.ts`, `by_journey.cy.ts`, `by_system.cy.ts`
- Each file loaded ALL YAML from its collection (e.g., all of `by_priority/**/*.yaml`)
- No way to run only MVP, only ONBOARDING, or any specific subset

**After:**
- Single template: `cypress/e2e/example.cy.ts`
- Users/AI create test suite files for each subset they want to run independently
- Example: `mvp.cy.ts` loads `by_priority/MVP/**/*.yaml`
- Example: `onboarding.cy.ts` loads `by_journey/ONBOARDING/**/*.yaml`

**Benefits:**
- Run specific test subsets: `cypress run --spec 'cypress/e2e/mvp.cy.ts'`
- Flexible organization based on project needs
- AI assistant decides what suites to create based on spec

**Migration:**
- Copy `example.cy.ts` for each test suite you need
- Modify the glob pattern to load your specific YAML files
- Delete `example.cy.ts` after copying if desired

#### Cypress Output Improvements

**Cleaner, quieter test output** - Reduced verbosity and added output control via environment variables.

**Changes:**
- Task logging now off by default (was spamming every setup operation)
- Browser console capture only shows errors by default
- Fixed Vite glob deprecation warning (`as: 'raw'` → `query: '?raw'`)
- Added reporter configuration section with JSON output option

**Environment variables:**
- `CYPRESS_QUIET=1` - Suppress all task/browser output
- `CYPRESS_LOG_TASKS=1` - Enable verbose task logging
- `CYPRESS_LOG_BROWSER=1` - Show all browser console output

**JSON reports for AI/CI:**
- Mochawesome reporter config included (commented out)
- Uncomment and install `mochawesome` for structured JSON output

## [4.1.0] - 2025-11-23

### Changed

#### RootSpec CLI

**`rootspec cypress` no longer creates untracked `templates/` directory** - Example user stories are now opt-in to avoid cluttering projects.

**Before:**
- Automatically copied examples to `templates/USER_STORIES/` when spec directory had no user stories
- Created untracked directory even in projects with existing Cypress setup

**After:**
- Default: References examples in `node_modules/rootspec/dist/templates/USER_STORIES/`
- Shows manual copy command: `cp -r node_modules/rootspec/dist/templates/USER_STORIES/* spec/05.IMPLEMENTATION/USER_STORIES/`
- New `--with-examples` flag: Copies examples to spec directory only when explicitly requested
- Only copies if destination doesn't already exist

**Usage:**
```bash
# Clean install (no template clutter)
rootspec cypress

# Install with examples copied to spec directory
rootspec cypress --with-examples
```

**Benefits:**
- No untracked files in projects with existing Cypress
- `templates/` directory won't conflict with project-specific templates
- Examples always accessible in node_modules
- Opt-in copying when needed

## [4.0.0] - 2025-11-21

### Added

#### RootSpec CLI

**New official CLI for framework installation, prompt generation, and project setup** - Replaces manual `curl` downloads and manual prompt editing with automated commands.

**Commands:**
- `rootspec init [--path] [--full] [--yes]` - Initialize framework with optional Cypress templates
- `rootspec cypress` - Add Cypress testing templates to existing project
- `rootspec prompts [name] [-o]` - List or view AI workflow prompts (auto-filled with project context)
- `rootspec validate` - Validate specification compliance

**Installation:**
```bash
# Global installation
npm install -g rootspec

# Or use directly with npx
npx rootspec init
```

**Key Features:**
- **Auto-detection:** Scans project for framework (Next.js, Nuxt, React, Vue, Angular, etc.), source directories (`src/`, `lib/`, `app/`, etc.), and configuration files
- **Template engine:** Custom syntax with `{{VARIABLE}}`, `{{#IF condition}}`, and `{{#EACH array}}` for dynamic prompt generation
- **Context-aware prompts:** Automatically fills prompts with your actual project details
- **Interactive mode:** User-friendly prompts for all configuration options
- **Non-interactive mode:** `--yes` flag for CI/CD and scripting

**Template System:**
All AI prompt files now use template format with placeholders that the CLI automatically fills:
- `{{FRAMEWORK}}` - Auto-detected framework (e.g., "Next.js", "React")
- `{{SOURCE_DIRS}}` - Discovered source directories
- `{{CONFIG_FILES}}` - Found configuration files
- `{{SPEC_DIR}}` - Specification directory location

**Example workflow:**
```bash
$ rootspec init
$ rootspec prompts adopt

🌳 Adopt RootSpec Framework

Analyzing your existing codebase...
  ✓ Detected framework: Next.js
  ✓ Found src/, components/

✅ Prompt ready! [copy and paste into AI assistant]
```

**Technical implementation:**
- TypeScript with ESM modules
- Commander.js for CLI framework
- Inquirer for interactive prompts
- fs-extra for file operations
- Custom template engine
- npm package: `rootspec`
- Node requirement: >=18.0.0

**Documentation updates:**
All major documentation files updated to reflect CLI-based workflow:
- `README.md` - New Installation section, updated Getting Started paths
- `prompts/README.md` - Complete rewrite explaining template system
- `docs/QUICK_START.md` - CLI Commands Reference section
- `CLAUDE.md` - CLI-Aware Workflows section
- `docs/CYPRESS_SETUP.md` - `rootspec cypress` as primary method
- `00.SPEC_FRAMEWORK.md` - Installation options with CLI recommended

**Migration notes:**
- Manual workflow still supported (download framework files directly from GitHub)
- Existing projects: No breaking changes to specification format or structure
- Users can continue using manual `curl` downloads if preferred

### Changed

- **Prompt files converted to template format** - All prompts in `prompts/` directory now use placeholder syntax instead of hardcoded examples
- **CLI is now the recommended installation method** - Manual workflow documented as alternative for offline/advanced usage
- **Documentation restructured** - CLI workflow presented first, manual approach in collapsible sections

## [3.6.0] - 2025-11-21

### Added

#### Browser Console Log Capture

**New built-in console log capturing for Cypress tests** - Captures `console.log`, `console.warn`, `console.error`, and `console.info` from your application and outputs them to the Cypress terminal, making them visible in headless mode and CI environments.

- **Implementation in `templates/cypress/support/e2e.ts`:**
  - Added `Cypress.on('window:before:load')` hook
  - Overrides browser console methods to capture output
  - Preserves original console functionality
  - Console errors also displayed in Cypress Command Log with red indicator

- **Implementation in `templates/cypress.config.ts`:**
  - Added `log` task that outputs to Node.js console
  - Formatted with timestamps: `[HH:MM:SS.mmm] [Browser LEVEL] message`

- **Documentation in `docs/CYPRESS_SETUP.md`:**
  - New "Browser Console Logs" section explaining the feature
  - Instructions for customizing log levels (errors/warnings only)
  - Instructions for disabling the feature if needed
  - Updated "What you get" and Summary sections

**Example terminal output:**
```
[14:32:15.123] [Browser LOG] User clicked submit button
[14:32:15.456] [Browser WARN] Deprecated API usage detected
[14:32:15.789] [Browser ERROR] Failed to load resource: 404
```

**Impact:** Enables debugging JavaScript errors and application behavior in headless CI environments where browser DevTools are not available. Especially useful for catching runtime errors, deprecation warnings, and failed network requests during automated test runs.

## [3.5.2] - 2025-11-15

### Fixed

- **Critical Cypress test hook timing bug** - Changed test setup hooks from `before()` to `beforeEach()` to fix execution order issue where setup steps were being cleared before tests ran.

  **Problem:** Test generators used `before()` hooks for setup steps (from YAML `given` sections), which ran BEFORE the global `beforeEach()` hook that clears page/cookies/localStorage. This caused setup steps like `cy.visit()` to be cleared before tests executed, resulting in "default blank page" errors.

  **Solution:** Changed all three test generators to use `beforeEach()` hooks, ensuring correct execution order:
  1. Global `beforeEach()`: Clear state (from e2e.ts)
  2. AC-level `beforeEach()`: Run setup steps (from test generators)
  3. Test `it()`: Run test with proper setup intact

  **Files fixed:**
  - `templates/cypress/e2e/by_priority.cy.ts` (lines 142, 175, 183)
  - `templates/cypress/e2e/by_journey.cy.ts` (lines 142, 175, 183)
  - `templates/cypress/e2e/by_system.cy.ts` (lines 142, 175, 183)

  This ensures setup steps (page visits, logins, etc.) execute after state is cleared and persist through test execution.

## [3.5.1] - 2025-11-15

### Fixed

- **AC-level `only` modifier now works within focused stories** - Previously, when a story had `only: true`, all of its acceptance criteria would run, even if only one AC had `only: true`. Now AC-level `only` modifiers correctly focus tests within a focused story.
  - Fixed: `templates/cypress/e2e/by_priority.cy.ts` (line 164)
  - Fixed: `templates/cypress/e2e/by_journey.cy.ts` (line 164)
  - Fixed: `templates/cypress/e2e/by_system.cy.ts` (line 164)
  - Changed condition from `if (story.only || story.skip)` to `if (story.skip)` to allow AC-level modifiers to work within `story.only`

## [3.5.0] - 2025-11-15

### Added

#### Test Control Modifiers (skip/only)

**New optional `skip` and `only` fields for user stories and acceptance criteria** - Control which tests run during development, matching Cypress's `.skip()` and `.only()` behavior.

- **Schema changes:**
  - `templates/cypress/support/schema.ts` - Added optional `skip?: boolean` and `only?: boolean` to both `StorySchema` and `Acceptance` schema
  - Story-level modifiers take precedence over acceptance criterion-level modifiers
  - Multiple `only` flags behave additively (all marked tests run)

- **Test generator updates:**
  - `templates/cypress/e2e/by_priority.cy.ts` - Implements skip/only logic
  - `templates/cypress/e2e/by_journey.cy.ts` - Implements skip/only logic
  - `templates/cypress/e2e/by_system.cy.ts` - Implements skip/only logic
  - Uses `describe.skip()` and `describe.only()` to control test execution

- **Documentation:**
  - `00.SPEC_FRAMEWORK.md` (lines 678-742) - New "Test Control Modifiers (skip/only)" section
  - Explains modifier behavior and precedence rules
  - Provides best practices (never commit `only`, document skip reasons)
  - Includes complete examples with both story-level and AC-level modifiers

- **Template examples:**
  - All three example files updated with commented modifier examples
  - `templates/USER_STORIES/by_priority/MVP.example.yaml`
  - `templates/USER_STORIES/by_journey/ONBOARDING.example.yaml`
  - `templates/USER_STORIES/by_system/TASK_SYSTEM.example.yaml`

**Usage:**
```yaml
id: US-101
title: Add new tasks quickly
skip: true  # Skip this entire story
# only: true  # Or run ONLY this story

acceptance_criteria:
  - id: AC-101-1
    title: Member can create task
    # skip: true  # Skip just this AC
    # only: true  # Or run ONLY this AC
```

**Impact:** Enables developers to focus on specific tests during development without commenting out YAML or modifying test code. Supports iterative development by allowing selective test execution while maintaining full test suite in version control.

## [3.4.0] - 2025-11-14

### Added

#### Implementation Workflow for Test-Driven Development

**New AI prompt and developer documentation** - Complete workflow for implementing applications iteratively from YAML user story tests (spec-first development).

- **New prompt:** `prompts/implement-from-tests.md` - AI assistant workflow for iterative implementation
  - 3-phase approach: Analyze → Global Setup → Iterate
  - Prescriptive patterns for auth, database reset, and seed data
  - Decision tree for extending DSL vs implementing features
  - Troubleshooting guide and success criteria

- **New documentation:** `docs/IMPLEMENTATION_WORKFLOW.md` - Human-readable developer guide
  - Detailed code examples for all patterns
  - Common scenarios and troubleshooting
  - Best practices and validation checklist
  - Timeline estimates (2-6 weeks for MVP)

- **Template improvements:**
  - `templates/cypress/support/e2e.ts` - Prescriptive global setup pattern with database reset
  - `templates/cypress.config.ts` - Added `resetDatabase` task with multiple implementation examples

- **Documentation updates:**
  - `docs/QUICK_START.md` - Expanded "Step 4: Start Building" with concrete workflow steps
  - `CLAUDE.md` - Added "Implementing from Tests" scenario with key patterns reference

**Impact:** Provides clear, step-by-step guidance for both AI assistants and human developers to implement applications using the YAML test suite as a development roadmap. Establishes prescriptive patterns for global test setup (auth, database reset, fixtures) to prevent common pitfalls like test pollution.

## [3.3.0] - 2025-11-14

### Added

#### YAML Syntax Guidance

**New "YAML Syntax Requirements" section in 00.SPEC_FRAMEWORK.md** - Comprehensive YAML formatting guidance to prevent parsing errors in generated user story files.

- Added after the YAML format example (line 419)
- **Block scalars:** Explains pipe operator (`|`) for multi-line text and text containing colons
- **Quote escaping:** Documents proper handling of apostrophes and quotes in strings
  - Use double quotes for strings with apostrophes: `message: "hasn't"` (recommended)
  - Or escape single quotes by doubling: `message: 'hasn''t'`
  - Invalid: Cannot use `\'` inside single quotes (common error)
- Includes before/after examples showing correct and incorrect YAML syntax
- Documents common YAML pitfalls (unquoted strings with colons, invalid quote escaping, improper indentation, special characters)
- Provides quick reference for YAML best practices
- Directly addresses reported issues:
  - Generated ADVANCED.yaml files with invalid syntax due to unquoted text with colons
  - Invalid quote escaping using `\'` inside single-quoted strings

**Impact:** Prevents YAML parsing errors when AI assistants generate user story files, especially for placeholder files, notes sections containing colons, and test assertions with apostrophes.

#### Improved Validation Error Messages

**Added pre-validation checks to Cypress test generators** - Provides clear, actionable error messages before Zod schema validation to help users quickly identify and fix YAML syntax issues.

- **Pre-validation in all three test generators:**
  - `templates/cypress/e2e/by_priority.cy.ts` (lines 49-71)
  - `templates/cypress/e2e/by_journey.cy.ts` (lines 49-71)
  - `templates/cypress/e2e/by_system.cy.ts` (lines 49-71)
  - Checks for null/undefined steps (empty array elements)
  - Checks for invalid data types (arrays, strings instead of objects)
  - Reports exact error location with file path and index

- **New "Troubleshooting YAML Validation Errors" section in 00.SPEC_FRAMEWORK.md** (lines 493-545)
  - How to locate errors from paths like `acceptance_criteria[2].then[1]`
  - Common "invalid_union" error causes with before/after examples
  - Validation checklist for quick debugging

- **Expanded "Common YAML Pitfalls"** (line 481)
  - Added pitfall #6: Empty array elements
  - Added "Array elements" to Quick Reference

**Before:** Cryptic Zod union errors showing all union members failed
**After:** Clear error messages like "Empty step at acceptance_criteria[2].then[1] - Check YAML for extra dashes"

**Impact:** Dramatically improves developer experience when debugging YAML validation errors. Users can quickly identify the exact line causing issues and understand what to fix, rather than deciphering cryptic Zod union validation failures.

### Fixed

#### Cypress Test Generators Support Multiple YAML Documents

**Updated all three test generators to use `yaml.loadAll()` instead of `yaml.load()`** - Properly handles YAML files containing multiple documents separated by `---`.

- **templates/cypress/e2e/by_priority.cy.ts** - Updated `loadStories()` function
- **templates/cypress/e2e/by_journey.cy.ts** - Updated `loadStories()` function
- **templates/cypress/e2e/by_system.cy.ts** - Updated `loadStories()` function
- Now iterates through all documents returned by `yaml.loadAll()`
- Skips empty documents automatically
- Each document is validated with Zod schema independently

**Before:** Used `yaml.load()` which only parses the first YAML document in a file
**After:** Uses `yaml.loadAll()` which handles multiple YAML documents in a single file

**Impact:** Allows user story YAML files to contain multiple story documents in a single file, separated by the standard YAML document separator (`---`). This provides more flexible file organization options for user stories.

#### Zod Schema Validation Fixes

**Fixed "invalid union" validation errors in Zod schema** - Resolved schema-YAML mismatches that caused validation failures for acceptance criteria.

- **templates/cypress/support/schema.ts:50** - Changed `when` array constraint from `.length(1)` to `.min(1)`
  - **Before:** Required exactly 1 step in the `when` array
  - **After:** Allows 1 or more steps in the `when` array
  - **Rationale:** User actions often involve multi-step sequences (click → fill → submit). Framework's own YAML examples contain 2-3 steps in `when` arrays.

- **templates/cypress/support/schema.ts:29** - Added `.passthrough()` to `seedItem` schema
  - **Before:** Only allowed `slug` and `status` fields in seedItem
  - **After:** Allows additional domain-specific fields while still validating required fields
  - **Rationale:** YAML examples include custom fields like `points: 10`. Passthrough enables domain-specific test data customization.

- Updated JSDoc comment to reflect "Action steps" (plural) instead of "Action step" (singular)

**Impact:** Fixes "invalid union on acceptance criteria" validation errors. Allows realistic multi-step user actions and custom test data fields, aligning schema with actual usage patterns.

### Changed

#### Cypress Test Loaders Support Document-Level Stories Array

**Enhanced YAML structure support in test generators** - Test loaders now support YAML files with a `stories:` or `user_stories:` array at the document level, in addition to the single-story-per-document format.

- **Updated all three test loaders:**
  - `templates/cypress/e2e/by_priority.cy.ts` (lines 49-89)
  - `templates/cypress/e2e/by_journey.cy.ts` (lines 49-89)
  - `templates/cypress/e2e/by_system.cy.ts` (lines 49-89)
  - Checks for `parsed.stories` or `parsed.user_stories` array
  - If array exists, iterates through and validates each story individually
  - If array doesn't exist, validates document as single story (backward compatible)

**Supported YAML structures:**

1. **Document-level stories array** (new):
```yaml
---
stories:
  - id: US-001
    title: Story One
    acceptance_criteria: [...]
  - id: US-002
    title: Story Two
    acceptance_criteria: [...]
```

2. **Single story per document** (still supported):
```yaml
---
id: US-001
title: Story One
acceptance_criteria: [...]
```

**Impact:** Allows multiple user stories in a single YAML file while maintaining backward compatibility. Provides more flexible file organization options for teams managing many user stories.

#### User Story Path Customization Documentation

**Added inline documentation for customizing story paths** - User story file paths can be customized by editing glob patterns directly in test loader files. Comprehensive inline examples support different project structures.

- **Test loader files with inline documentation:**
  - `templates/cypress/e2e/by_priority.cy.ts` - JSDoc with examples for standard, content, monorepo, and flat structures
  - `templates/cypress/e2e/by_journey.cy.ts` - JSDoc with examples for different directory layouts
  - `templates/cypress/e2e/by_system.cy.ts` - JSDoc with examples for various project types
  - Each file includes 4 common path pattern examples in comments

- **Documentation:**
  - `docs/CYPRESS_SETUP.md` - New Step 2b with path customization instructions
    - Step-by-step guide to editing test files
    - Exact line numbers where to make changes
    - Examples for standard, content subdirectory, monorepo, and flat structures
  - `templates/USER_STORIES/USER_STORIES_OVERVIEW.md` - Updated with path customization info
  - File structure diagram updated (no separate config file needed)

**Default paths (content subdirectory pattern):**
```typescript
'../../content/spec/05.IMPLEMENTATION/USER_STORIES/by_priority/**/*.yaml'
'../../content/spec/05.IMPLEMENTATION/USER_STORIES/by_journey/**/*.yaml'
'../../content/spec/05.IMPLEMENTATION/USER_STORIES/by_system/**/*.yaml'
```

**Example patterns provided in inline docs:**

Standard: `'../../../05.IMPLEMENTATION/USER_STORIES/by_priority/**/*.yaml'`
Content: `'../../content/spec/05.IMPLEMENTATION/USER_STORIES/by_priority/**/*.yaml'`
Monorepo: `'../../../packages/spec/USER_STORIES/by_priority/**/*.yaml'`
Flat: `'../../../stories/priority/**/*.yaml'`

**Technical constraint:** Vite's `import.meta.glob()` requires string literals for static analysis at build time - variables and imports cannot be used. This is a Vite limitation that necessitates editing glob patterns directly in test files.

**To customize paths:** Edit the `import.meta.glob()` pattern in each test file (lines ~34). Inline comments provide examples for common project structures.

**Impact:** Projects with non-standard directory structures (monorepos, legacy codebases, custom organization) can easily customize paths by editing three clearly-documented locations. No separate configuration file needed.

## [3.2.0] - 2025-11-11

### Added

#### Comprehensive Setup Documentation

**New `docs/` directory** with detailed setup and quick-start guides.

- **docs/CYPRESS_SETUP.md** - Complete Cypress installation and configuration guide
  - 8-step setup workflow with validation
  - Dependencies list (cypress, cypress-vite, js-yaml, zod, typescript)
  - npm scripts examples
  - Task implementation guide (loginAs, seedItem)
  - Test DSL extension guidance
  - Troubleshooting section with 8 common issues
  - CI/CD integration examples

- **docs/QUICK_START.md** - Fast-track reference cards
  - "New Project in 5 Minutes" workflow
  - "Existing Project in 10 Minutes" workflow
  - Learning path for framework newcomers
  - Common commands cheat sheet
  - Decision trees for approach selection
  - Prompt library reference table

#### Existing Project Adoption Workflow

**New prompt for brownfield projects** - Complete guidance for applying the framework to existing codebases.

- **prompts/adopt-framework-existing.md** - Dedicated brownfield adoption prompt
  - Two approaches: Specification-First (recommended) vs Reverse-Engineering
  - Specification-First: Define ideal state, create gap analysis, refactor incrementally
  - Reverse-Engineering: Document current state, infer philosophy from implementation
  - Level-by-level discovery questions tailored for each approach
  - Gap analysis and migration planning workflow
  - Anti-patterns specific to existing projects
  - Complete guidance for 4-8 hour adoption process

### Changed

#### Documentation Improvements

- **README.md:** Restructured "Getting Started" with three clear paths
  - Path 1: New Project (Greenfield) - enhanced with time estimates and Cypress link
  - Path 2: Existing Project (Brownfield) - NEW complete workflow
  - Path 3: Learning - expanded resources list
  - Clear scenario-based navigation for all project types

- **templates/USER_STORIES/USER_STORIES_OVERVIEW.md:**
  - Added "Getting Started" section with 5-step quick setup guide
  - Setup checklist for validation
  - Links to CYPRESS_SETUP.md for detailed instructions

- **prompts/README.md:**
  - Added new brownfield adoption prompt to table
  - Clarified greenfield vs brownfield scenarios in Quick Start section
  - Updated descriptions for better discoverability

- **CLAUDE.md:**
  - Added "User's Project Scenario" section
  - Helps distinguish greenfield vs brownfield contexts
  - Explains approach differences (Specification-First vs Reverse-Engineering)
  - Directs to appropriate prompts for each scenario

### Impact

This release dramatically improves developer experience for both new and existing projects:

- **Cypress setup:** Reduced time-to-first-test from hours of trial/error to 30-45 minutes with clear guidance
- **Existing projects:** Framework now explicitly welcomes brownfield adoption with dedicated 4-8 hour workflow
- **Documentation:** Multiple entry points with cross-linked guides for all scenarios
- **Developer clarity:** Three clear paths (new/existing/learning) with realistic time estimates

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

[Unreleased]: https://github.com/rootspec/rootspec/compare/v4.1.0...HEAD
[4.1.0]: https://github.com/rootspec/rootspec/compare/v4.0.0...v4.1.0
[4.0.0]: https://github.com/rootspec/rootspec/compare/v3.6.0...v4.0.0
[3.6.0]: https://github.com/rootspec/rootspec/compare/v3.5.2...v3.6.0
[3.5.2]: https://github.com/rootspec/rootspec/compare/v3.5.1...v3.5.2
[3.5.1]: https://github.com/rootspec/rootspec/compare/v3.5.0...v3.5.1
[3.5.0]: https://github.com/rootspec/rootspec/compare/v3.4.0...v3.5.0
[3.4.0]: https://github.com/rootspec/rootspec/compare/v3.3.0...v3.4.0
[3.3.0]: https://github.com/rootspec/rootspec/compare/v3.2.0...v3.3.0
[3.2.0]: https://github.com/rootspec/rootspec/compare/v3.1.0...v3.2.0
[3.1.0]: https://github.com/rootspec/rootspec/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/rootspec/rootspec/compare/v2.1.0...v3.0.0
[2.1.0]: https://github.com/rootspec/rootspec/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/rootspec/rootspec/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/rootspec/rootspec/releases/tag/v1.0.0
