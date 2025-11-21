# Quick Start Guide

Fast-track guides for getting started with the Hierarchical Specification Framework.

---

## 🆕 New Project in 5 Minutes

**Scenario:** Starting from scratch with a greenfield project

### Step 1: Download Framework (30 seconds)

```bash
cd your-project/
curl -O https://raw.githubusercontent.com/rootspec/rootspec/main/00.SPEC_FRAMEWORK.md
```

### Step 2: Generate Specification with AI (2-4 hours)

1. Open [`prompts/initialize-spec.md`](../prompts/initialize-spec.md)
2. Copy the complete prompt
3. Replace `[Brief description]` with your product idea
4. Paste into Claude Code or GPT-4
5. Answer AI's questions level-by-level

**What you'll create:**
```
your-project/
├── 00.SPEC_FRAMEWORK.md           # Framework reference
├── 01.FOUNDATIONAL_PHILOSOPHY.md  # Your WHY & Design Pillars
├── 02.STABLE_TRUTHS.md            # Your strategies
├── 03.INTERACTION_ARCHITECTURE.md # Your behavioral patterns
├── 04.SYSTEMS/                    # Your architecture
└── 05.IMPLEMENTATION/             # User stories & parameters
```

### Step 3: Set Up Cypress Testing (Optional, 30 minutes)

```bash
# Install dependencies
npm install --save-dev cypress cypress-vite js-yaml zod typescript

# Copy templates (from cloned framework repo)
cp -r rootspec/templates/cypress/ ./
cp rootspec/templates/cypress.config.ts ./

# Run tests
npx cypress open
```

**For detailed setup:** See [`docs/CYPRESS_SETUP.md`](CYPRESS_SETUP.md)

### Step 4: Start Building ✨

**Implement iteratively using YAML tests as your guide:**

**Quick Start:**
1. Run MVP tests: `npm test -- --spec cypress/e2e/by_priority.cy.ts --grep "MVP"`
2. Pick first failing test
3. Implement minimal code to pass it
4. Commit and move to next test

**Design Filter:**
- Every feature must support at least one Design Pillar
- If it doesn't → don't build it

**Detailed workflow:** See [`docs/IMPLEMENTATION_WORKFLOW.md`](IMPLEMENTATION_WORKFLOW.md)

**AI assistance:** Use [`prompts/implement-from-tests.md`](../prompts/implement-from-tests.md) for guided implementation

---

## 🔄 Existing Project in 10 Minutes

**Scenario:** Applying the framework to an existing codebase

### Step 1: Download Framework (30 seconds)

```bash
cd your-existing-project/
curl -O https://raw.githubusercontent.com/rootspec/rootspec/main/00.SPEC_FRAMEWORK.md
```

### Step 2: Choose Your Approach (1 minute)

**Specification-First (Recommended):**
- Define ideal philosophy and architecture
- Document what SHOULD exist
- Create gap analysis vs. current state
- Refactor incrementally toward spec

**Reverse-Engineering (Pragmatic):**
- Document current architecture as-is
- Infer implicit design decisions
- Extract retrospective philosophy
- Validate spec matches reality

### Step 3: Generate Specification with AI (4-8 hours)

1. Open [`prompts/adopt-framework-existing.md`](../prompts/adopt-framework-existing.md)
2. Copy the complete prompt
3. Fill in your project details:
   - Current domain/type
   - Development stage
   - Existing systems
   - Chosen approach
4. Paste into Claude Code or GPT-4
5. Answer AI's discovery questions

**AI will help you:**
- Map existing code to framework levels
- Identify architectural patterns already in use
- Define Design Pillars that match your decisions
- Create gap analysis (if using Specification-First)
- Document current state (if using Reverse-Engineering)

### Step 4: Validate with Team (1-2 hours)

**Check alignment:**
- Do Design Pillars match our actual decision-making?
- Are system boundaries accurate?
- Do user stories cover critical paths?

**Adjust as needed** - This is a living document

### Step 5: Establish as Single Source of Truth (Ongoing)

**New team process:**
1. New features reference spec first
2. PRs must cite user story IDs
3. Use Design Pillars to filter roadmap
4. Quarterly spec reviews

**Gradual migration:**
- Month 1-2: Levels 1-2 complete, team aligned
- Month 3-4: Levels 3-4 complete, architecture documented
- Month 5-6: Critical paths in YAML, 50% test coverage
- Month 7+: All new features spec-first

---

## 📚 Learning the Framework

**First time using the framework? Start here:**

### 1. Read Core Documentation (1-2 hours)

**Start with:**
- [`README.md`](../README.md) - Philosophy and use cases
- [`00.SPEC_FRAMEWORK.md`](../00.SPEC_FRAMEWORK.md) - Complete reference

**Quick reference:**
- [`CLAUDE.md`](../CLAUDE.md) - AI assistant cheat sheet
- [`CHANGELOG.md`](../CHANGELOG.md) - Version history

### 2. Understand the Five Levels (30 minutes)

| Level | Purpose | Key Question |
|-------|---------|--------------|
| **1: Foundational Philosophy** | WHY & WHAT EXPERIENCE | "What should users feel?" |
| **2: Stable Truths** | Design strategies | "What approach will we take?" |
| **3: Interaction Architecture** | HOW users interact | "What's the behavioral pattern?" |
| **4: Systems** | Implementation architecture | "How do we build this?" |
| **5: Implementation** | Validation & tuning | "Does it work? What values?" |

**Critical rule:** Each level only references higher levels (prevents circular dependencies)

### 3. Review Examples (1 hour)

**YAML user stories:**
- [`templates/USER_STORIES/by_priority/MVP.example.yaml`](../templates/USER_STORIES/by_priority/MVP.example.yaml)
- [`templates/USER_STORIES/by_journey/ONBOARDING.example.yaml`](../templates/USER_STORIES/by_journey/ONBOARDING.example.yaml)
- [`templates/USER_STORIES/by_system/TASK_SYSTEM.example.yaml`](../templates/USER_STORIES/by_system/TASK_SYSTEM.example.yaml)

**Complete YAML format:**
- [`templates/USER_STORIES/USER_STORIES_OVERVIEW.md`](../templates/USER_STORIES/USER_STORIES_OVERVIEW.md)

### 4. Try It Out (2-4 hours)

**Pick a small project or feature:**
1. Use `prompts/initialize-spec.md` to generate spec
2. See how AI guides you through levels
3. Review generated files
4. Get a feel for the hierarchy

---

## 🛠️ Common Commands

**Generate new specification:**
```bash
# Copy framework
curl -O https://raw.githubusercontent.com/rootspec/rootspec/main/00.SPEC_FRAMEWORK.md

# Use initialize-spec.md prompt with AI
```

**Validate existing specification:**
```bash
# Use prompts/validate-spec.md with AI
# AI will check:
# - Reference hierarchy compliance
# - Placeholder usage (no numbers in L1-4)
# - Design Pillar alignment
```

**Add a new feature:**
```bash
# Use prompts/add-feature.md with AI
# AI will:
# - Determine correct level
# - Check Design Pillar support
# - Verify reference rules
# - Update appropriate files
```

**Review implementation:**
```bash
# Use prompts/review-feature.md with AI
# AI will validate implementation against spec
```

**Generate documentation:**
```bash
# Use prompts/generate-docs.md with AI
# AI can create:
# - PRDs from spec
# - Technical design docs
# - API documentation
```

**Run Cypress tests:**
```bash
npm run cypress:open   # Interactive mode
npm run cypress:run    # Headless mode
npm run test:e2e       # All E2E tests
```

**Migrate framework version:**
```bash
# Use prompts/migrate-spec.md with AI
# Follow migration guide in CHANGELOG.md
```

---

## 🎯 Quick Decision Trees

### "Should I use this framework?"

**✅ YES if:**
- Building SaaS, game, or complex application
- Team needs alignment on product philosophy
- Long-lived system (1+ years)
- Multiple interconnected systems
- Want spec-code alignment

**❌ NO if:**
- Quick prototype for market testing
- Weekend hackathon project
- Single-developer experiment
- Throwaway or short-lived system

### "Which approach for existing projects?"

**Specification-First if:**
- Want to improve architecture
- Have technical debt to address
- Team willing to refactor
- Long-term vision matters

**Reverse-Engineering if:**
- Just need documentation
- Current architecture is good enough
- Want to formalize implicit decisions
- Can't afford refactoring time

### "Do I need Cypress testing?"

**✅ YES if:**
- Building web application
- Want automated E2E tests
- Value single source of truth (stories = tests)
- Have time for 30-min setup

**❌ NO if:**
- Non-web application
- Already have E2E test suite
- Just want specification docs
- Prefer other testing frameworks

---

## 📖 Prompt Library Reference

| Prompt | Use Case | Time |
|--------|----------|------|
| [`initialize-spec.md`](../prompts/initialize-spec.md) | Create new specification from scratch | 2-4 hours |
| [`adopt-framework-existing.md`](../prompts/adopt-framework-existing.md) | Apply framework to existing project | 4-8 hours |
| [`implement-from-tests.md`](../prompts/implement-from-tests.md) | Implement app iteratively from YAML tests | 2-6 weeks |
| [`validate-spec.md`](../prompts/validate-spec.md) | Check specification compliance | 15-30 min |
| [`add-feature.md`](../prompts/add-feature.md) | Add new feature to spec | 30-60 min |
| [`review-feature.md`](../prompts/review-feature.md) | Validate implementation vs. spec | 15-30 min |
| [`generate-docs.md`](../prompts/generate-docs.md) | Create PRDs, TDDs from spec | 30-60 min |
| [`migrate-spec.md`](../prompts/migrate-spec.md) | Upgrade framework version | 1-2 hours |
| [`tips-and-best-practices.md`](../prompts/tips-and-best-practices.md) | Quick commands and troubleshooting | As needed |

---

## 🆘 Getting Help

**Documentation:**
- Framework reference: [`00.SPEC_FRAMEWORK.md`](../00.SPEC_FRAMEWORK.md)
- Cypress setup: [`docs/CYPRESS_SETUP.md`](CYPRESS_SETUP.md)
- Prompt library: [`prompts/README.md`](../prompts/README.md)

**Troubleshooting:**
- [`prompts/tips-and-best-practices.md`](../prompts/tips-and-best-practices.md)
- [`docs/CYPRESS_SETUP.md#troubleshooting`](CYPRESS_SETUP.md#troubleshooting)

**Version info:**
- [`CHANGELOG.md`](../CHANGELOG.md) - Version history and migration guides

---

## 🚀 Next Steps

**For new projects:**
1. Generate specification → `prompts/initialize-spec.md`
2. Set up testing → `docs/CYPRESS_SETUP.md`
3. Implement iteratively → `docs/IMPLEMENTATION_WORKFLOW.md` or `prompts/implement-from-tests.md`
4. Use Design Pillars as decision filter

**For existing projects:**
1. Choose approach (Specification-First vs. Reverse-Engineering)
2. Generate specification → `prompts/adopt-framework-existing.md`
3. Establish as single source of truth
4. Gradual migration over 3-6 months

**For learning:**
1. Read `README.md` and `00.SPEC_FRAMEWORK.md`
2. Review example YAML files in `templates/`
3. Try on small project or feature

---

**Happy specifying! 🎉**
