# Changelog

All notable changes to the Hierarchical Specification Framework will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/caudexia/spec-framework/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/caudexia/spec-framework/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/caudexia/spec-framework/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/caudexia/spec-framework/releases/tag/v1.0.0
