# Hierarchical Specification Framework

**Version 2.1.0** | [Changelog](CHANGELOG.md)

A structured approach to software specification that enforces **dependency inversion**: foundational philosophy guides implementation, never vice versa.

**🤖 AI-First Design:** While this framework can be used manually, it is specifically designed for AI assistants and agents to help you create, maintain, and validate comprehensive product specifications.

## Overview

This repository contains a complete hierarchical specification framework designed to maintain architectural coherence across software projects. The framework enforces strict separation of concerns across five levels, from philosophical foundations to implementation details.

**Core Principle:** Each concern lives at exactly one level (single source of truth). Changes flow downward through abstraction layers while foundational documents remain stable.

**AI-Assisted Workflow:** This framework shines when used with AI assistants like Claude Code, which can guide you through the specification process, validate hierarchy rules, and ensure consistency across levels.

## The Five Levels

| Level | Purpose | Key Question | References |
|-------|---------|--------------|------------|
| **1: Foundational Philosophy** | WHY & WHAT EXPERIENCE | "What problem must we solve? What should users feel?" | External only |
| **2: Stable Truths** | Design strategies & commitments | "What approach will we take?" | L1 + External |
| **3: Interaction Architecture** | HOW users and product interact | "What's the behavioral pattern?" | L1-2 + External |
| **4: Systems** | Implementation architecture | "How do we build this?" | L1-3 + Sibling L4 + External |
| **5: Implementation** | Validation & numeric tuning | "Does it work? What values?" | All levels + External |

## Getting Started

### For New Projects

**Step 1: Copy the framework definition to your project**

```bash
# Download the framework file
curl -O https://raw.githubusercontent.com/caudexia/spec-framework/main/00.SPEC_FRAMEWORK.md

# Or manually download and copy 00.SPEC_FRAMEWORK.md to your project root
```

**Step 2: Use AI to generate your specification files**

Copy an AI prompt from the "Working with AI Assistants" section below. The AI will:
- Read `00.SPEC_FRAMEWORK.md` to understand the framework structure
- Ask you questions about your product
- Generate your specification files (01-05) based on the framework examples

**Step 3: Your project structure becomes:**

```
your-project/
├── 00.SPEC_FRAMEWORK.md           # Framework definition (reference, read-only)
├── 01.FOUNDATIONAL_PHILOSOPHY.md  # Generated: Your WHY & WHAT EXPERIENCE
├── 02.STABLE_TRUTHS.md            # Generated: Your design strategies
├── 03.INTERACTION_ARCHITECTURE.md # Generated: Your interaction patterns
├── 04.SYSTEMS/                    # Generated: Your system specs
│   ├── SYSTEMS_OVERVIEW.md
│   └── [YOUR_SYSTEMS].md
└── 05.IMPLEMENTATION/             # Generated: User stories & parameters
    ├── USER_STORIES/
    └── FINE_TUNING/
```

**The key difference:**
- `00.SPEC_FRAMEWORK.md` = The framework definition (same for everyone)
- `01-05.*` = YOUR product specification (unique to your project)

---

### For Learning the Framework

1. **Read `00.SPEC_FRAMEWORK.md`** - Complete framework structure and rules
2. **Read `CLAUDE.md`** - AI assistant guidance
3. **Check `CHANGELOG.md`** - Version history and migration guides

## Version Information

**Current Version:** 2.1.0

This framework follows [Semantic Versioning](https://semver.org/):
- **Major versions** (2.0.0) include breaking changes requiring migration
- **Minor versions** (2.1.0) add features while maintaining compatibility
- **Patch versions** (2.0.1) fix bugs and clarify documentation

See [CHANGELOG.md](CHANGELOG.md) for:
- Complete version history
- Migration guides for major version upgrades
- Detailed list of changes in each release

## Key Features

- **Strict Reference Hierarchy**: Higher levels cannot reference lower levels, preventing circular dependencies
- **Single Source of Truth**: Each concern lives at exactly one level
- **Dependency Inversion**: Philosophy drives implementation, not the reverse
- **Scalable Architecture**: Systems remain loosely coupled while maintaining clear interaction patterns
- **Future-Proof Design**: Stable upper levels protect against constant churn in implementation details

## Reference Rules

**CRITICAL**: Each level has strict reference constraints to maintain architectural integrity:

1. **Level 1** can only reference external resources
2. **Level 2** can reference Level 1 + external resources
3. **Level 3** can reference Levels 1-2 + external resources
4. **Level 4** can reference Levels 1-3 + sibling Level 4 docs + external resources
5. **Level 5** can reference all levels + external resources

**Never reference lower levels from higher levels** (e.g., don't reference Level 4 Systems from Level 3 Interaction Architecture).

## Using This Framework

This framework is designed to be:

- **AI-First**: Optimized for AI assistants to guide specification creation and validation
- **Generic and reusable** across different software projects
- **Maintainable** through strict separation of concerns
- **Scalable** from small projects to large systems

---

## Working with AI Assistants

This framework is specifically designed for AI-assisted specification development.

**Workflow:**
1. Copy `00.SPEC_FRAMEWORK.md` to your project directory
2. Use the prompts below — AI reads the framework file to understand structure
3. AI generates your specification files (01-05) based on framework examples

Below are copy-paste ready prompts for common tasks.

---

### 🚀 Initialize a New Specification

**Prerequisites:** Copy `00.SPEC_FRAMEWORK.md` to your project directory first.

**Then use this prompt:**

```
I have copied 00.SPEC_FRAMEWORK.md (Hierarchical Specification Framework v2.0.0)
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

Start by asking me questions to understand Level 1 (Foundational Philosophy):
- The mission and problem we're solving
- 3-5 Design Pillars (core user experiences/emotions)
- Inviolable principles
- North-star experience

Follow the framework rules in 00.SPEC_FRAMEWORK.md strictly:
- Each level should only reference higher levels
- Use placeholders for numbers in Levels 1-4
- Help me avoid anti-patterns

Let's proceed level by level, ensuring each is complete before moving to the next.
```

### 🔄 Migrate Specification to Newer Framework Version

**Prerequisites:** Update `00.SPEC_FRAMEWORK.md` in your project to the new version.

**Then use this prompt:**

```
I have an existing specification using Hierarchical Specification Framework
v[OLD_VERSION]. I've updated 00.SPEC_FRAMEWORK.md to v2.0.0.

Please read the updated 00.SPEC_FRAMEWORK.md and CHANGELOG.md to understand
what has changed.

My current specification structure:
[Paste your current file structure or describe your spec]

Help me migrate my specification by:

1. Identifying breaking changes from CHANGELOG.md between v[OLD_VERSION] and v2.0.0

2. Creating a migration plan:
   - Files that need to be renamed
   - New sections that need to be added (based on 00.SPEC_FRAMEWORK.md)
   - Structural changes required
   - Cross-references that need updating

3. For v2.0.0 specifically:
   - Rename 01.FIRST_PRINCIPLES.md to 01.FOUNDATIONAL_PHILOSOPHY.md
   - Extract 3-5 Design Pillars from my existing content
   - Add Design Pillars section following 00.SPEC_FRAMEWORK.md examples
   - Update all cross-references throughout my spec

4. Validate the migrated spec follows v2.0.0 rules from 00.SPEC_FRAMEWORK.md

Walk me through each step with specific changes for each file.
```

### ✅ Validate an Existing Specification

Use this prompt to check if your spec follows the framework correctly:

```
I have an existing specification and want to validate that it properly
follows the Hierarchical Specification Framework v2.0.0.

Please perform a comprehensive validation by checking:

**Reference Hierarchy Compliance:**
- Level 1 only references external resources
- Level 2 only references L1 + external
- Level 3 only references L1-2 + external
- Level 4 only references L1-3 + sibling L4 + external
- Level 5 can reference all levels
- NO lower-level references from higher levels

**Level 1 (Foundational Philosophy) Validation:**
- Has Mission statement
- Has 3-5 Design Pillars with proper structure
- Each pillar includes: name, emotional statement, explanation,
  user perspective, examples
- Has Inviolable Principles
- Has North-Star Experience
- No numeric values (only placeholders)
- No implementation details
- Pillars focus on FEELINGS not FEATURES

**Level 2 (Stable Truths) Validation:**
- Contains design philosophies and strategies
- No references to L3-5 systems or implementation
- Uses placeholders for numeric values
- Aligns with L1 mission and pillars

**Level 3 (Interaction Architecture) Validation:**
- Describes behavioral patterns, not UI implementation
- No references to L4-5 specifics
- Uses placeholders for numeric values
- Includes failure modes and edge cases

**Level 4 (Systems) Validation:**
- Clear system boundaries and responsibilities
- Conceptual rules, not code
- Uses placeholders for numeric values (e.g., [base_points])
- No references to L5 user stories or tuning values

**Level 5 (Implementation) Validation:**
- User stories follow "As a [user], I want [action], so that [outcome]"
- User stories have observable acceptance criteria
- User stories reference relevant L4 systems
- Fine-tuning YAML has @rationale and @spec_source annotations
- Actual numeric values only appear here

**Anti-Pattern Detection:**
- Features in L1 instead of purpose
- Vague emotional goals ("feel good" vs specific emotions)
- Too many design pillars (>8)
- Generic pillars that apply to everything
- Implementation constraints in L1-3
- Numeric values in L1-4

Please report:
1. All violations found (with file:line references)
2. Severity (critical/warning/suggestion)
3. Suggested fixes for each issue
4. Overall compliance score
```

### 🔍 Add Feature to Existing Specification

Use this prompt when extending your specification:

```
I want to add a new feature to my existing specification.

Feature description: [Describe the feature]

My specification follows Hierarchical Specification Framework v2.0.0.

Please help me:

1. **Design Pillar Check (Level 1):**
   - Which of my existing Design Pillars does this feature support?
   - If it doesn't support any pillar, should I reconsider the feature
     or add a new pillar?

2. **Determine Appropriate Levels:**
   - Does this require changes at Level 2 (new design strategy)?
   - Does this require changes at Level 3 (new interaction pattern)?
   - Which Level 4 systems are affected?
   - What Level 5 user stories and parameters are needed?

3. **Maintain Hierarchy:**
   - Ensure changes flow downward (L1→L2→L3→L4→L5)
   - Verify no upward references are introduced
   - Check that higher levels don't need changes for this feature

4. **Draft Specifications:**
   - Show me what to add/modify at each affected level
   - Use placeholders for numbers in L1-4
   - Actual values only in L5

Guide me through this systematically, starting with pillar alignment.
```

### 📊 Generate Documentation from Specification

Use this prompt to create documentation artifacts:

```
I have a complete specification following Hierarchical Specification
Framework v2.0.0.

Please help me generate:

1. **Product Requirements Document (PRD)**
   - Extract mission from L1
   - Summarize design pillars as product principles
   - Include L3 interaction flows
   - Map L5 user stories by priority

2. **Technical Design Document (TDD)**
   - Extract L2 architectural commitments
   - Detail L4 system designs
   - Include system interaction diagrams
   - Reference L5 parameter values

3. **User Story Backlog**
   - Export all L5 user stories
   - Organize by priority (MVP/Secondary/Advanced)
   - Include acceptance criteria
   - Link to relevant L4 systems

4. **Design Pillar Validation Matrix**
   - List all L4 systems
   - Map which pillar(s) each system supports
   - Identify gaps (systems not supporting pillars, pillars
     without systems)

Please maintain traceability back to the spec levels.
```

### 🎯 Review Feature Against Specification

Use this prompt to validate a proposed feature or implementation:

```
I have a feature proposal/implementation and want to validate it
against my specification.

Feature/Implementation: [Describe or paste code/design]

My specification follows Hierarchical Specification Framework v2.0.0.

Please review and answer:

1. **Pillar Alignment (L1):**
   - Which Design Pillar(s) does this support?
   - Does this violate any Inviolable Principles?
   - Does this align with the Mission and North-Star?

2. **Strategy Compliance (L2):**
   - Does this follow the design philosophies?
   - Are there trade-offs that conflict with L2 commitments?

3. **Interaction Pattern (L3):**
   - Does the interaction match L3 architecture?
   - Are behavioral loops properly implemented?

4. **System Design (L4):**
   - Does this follow the system boundaries and rules?
   - Are there unintended system interactions?

5. **Parameter Validation (L5):**
   - Do numeric values match L5 fine-tuning specs?
   - Are there values that should be configurable in L5?

**Verdict:**
- ✅ Approved / ⚠️ Needs Changes / ❌ Violates Spec
- List specific issues and suggested fixes
```

---

## Tips for AI-Assisted Specification

**Best Practices:**

1. **Start at Level 1**: Always begin with Foundational Philosophy before diving into implementation
2. **One level at a time**: Complete each level before moving to the next
3. **Use the validation prompt regularly**: Catch hierarchy violations early
4. **Let AI ask questions**: AI assistants following this framework will ask clarifying questions—answer them thoroughly
5. **Reference the framework docs**: Point your AI to `00.SPEC_FRAMEWORK.md` and `CLAUDE.md` for detailed guidance
6. **Iterate on Design Pillars**: Spend time getting your 3-5 pillars right—they guide everything else

**Common AI Commands:**

- "Validate my Level 1 against Design Pillar best practices"
- "Check if this feature supports at least one Design Pillar"
- "Help me extract Design Pillars from my existing mission statement"
- "Show me all references from Level 3 to other levels and verify hierarchy compliance"
- "Generate Level 5 user stories for the [SYSTEM_NAME] from Level 4"

**Framework-Aware AI Assistants:**

This framework includes `CLAUDE.md` with comprehensive guidance for Claude Code and other AI assistants. When working in a directory containing these files, AI assistants will automatically:

- Understand the 5-level hierarchy
- Enforce reference rules
- Guide you through level-by-level specification
- Validate against anti-patterns
- Suggest Design Pillars based on your mission
- Help extract specs from existing documentation

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

[Add contribution guidelines here]
