# RootSpec Roadmap

**Status**: v4.4.1 published to npm ✅
**Last Updated**: 2025-11-25

---

## ✅ Completed - v4.0.0 Launch

### Branding
- [x] Rename project to "RootSpec"
- [x] Create GitHub namespace (github.com/rootspec)
- [x] Transfer repository to new org

### npm Distribution
- [x] Create CLI package with TypeScript
- [x] Build CLI commands (`init`, `prompts`, `cypress`, `validate`)
- [x] Publish to npm as `rootspec`
- [x] Create CLI README for npm page

### User Experience
- [x] Replace manual curl/cp with CLI commands
- [x] Add interactive init prompts
- [x] Add template engine for AI prompts

### Community & Open Source
- [x] Add CONTRIBUTING.md
- [x] Add CODE_OF_CONDUCT.md
- [x] Add SECURITY.md
- [x] Create GitHub issue templates (bug, feature, question)
- [x] Create PR template
- [x] Add badges to README
- [x] Create v4.0.0 GitHub release

### GitHub Settings
- [x] Configure repository description and topics
- [x] Enable Discussions (with categories)
- [x] Set up branch protection for `main`
- [x] Enable Dependabot alerts and security updates
- [x] Enable CodeQL security scanning
- [x] Configure PR merge settings

---

## ✅ Completed - v4.5.0 Release (2026-02-15)

### New Features
- [x] New `rootspec extend` command with 6 extension types
- [x] Extension type prompts: technical-design, ux-design, brand-guidelines, ui-design, analytics-plan, config-schema
- [x] Auto-detection of spec context in extension prompts
- [x] Dependency tracking for extension types

### Testing & Quality
- [x] Comprehensive integration testing (TaskFlow spec, 44 minutes, 92/100 score)
- [x] Fix Design Pillar extraction bug (only extracted 1 of 3 pillars)
- [x] Create shared extraction utilities to eliminate code duplication
- [x] Document known issues in KNOWN_ISSUES.md

### Bug Fixes
- [x] Fix regex pattern for Design Pillar extraction
- [x] Consolidate duplicate extraction code between `prompts.ts` and `extend.ts`
- [x] Improve extraction reliability with `Array.from()` for iterators
- [x] Fix ESM import syntax for fs-extra

---

## 📋 Pending - Post-Launch Tasks

### Week 2-3: Automation & Code Quality (Medium Priority)

**GitHub Automation:**
- [ ] Create `.github/CODEOWNERS` file
  - Auto-assign reviewers for PRs
  - Define ownership by directory

- [ ] Create `.github/dependabot.yml`
  - Weekly dependency update checks
  - Auto-create PRs for npm updates

- [ ] Create `.github/workflows/test.yml`
  - Run tests on all PRs
  - Run on push to main
  - Node.js matrix testing (18, 20, 22)

- [ ] Create `.github/workflows/publish.yml`
  - Auto-publish to npm on version tags
  - Triggered by `v*` tags
  - Requires NPM_TOKEN secret

**Code Quality Tools:**
- [ ] Set up ESLint in `packages/cli/`
  - Add `.eslintrc.json`
  - Add `lint` script to package.json
  - Install dependencies

- [ ] Set up Prettier in `packages/cli/`
  - Add `.prettierrc.json`
  - Add `format` script to package.json
  - Install dependencies

- [ ] Add pre-commit hooks
  - Install Husky + lint-staged
  - Auto-format on commit
  - Run linter before commit

### Week 3-4: Testing Infrastructure (Medium Priority)

**Test Setup:**
- [ ] Add Vitest configuration
  - Create `vitest.config.ts`
  - Install vitest and @vitest/ui
  - Add test scripts to package.json

**Test Coverage:**
- [ ] Write CLI command tests
  - `src/commands/init.test.ts`
  - `src/commands/prompts.test.ts`
  - `src/commands/cypress.test.ts`
  - `src/commands/validate.test.ts`

- [ ] Write utility tests
  - `src/utils/config.test.ts`
  - `src/utils/template.test.ts`

- [ ] Target 40%+ code coverage
  - Focus on critical paths
  - Test error handling
  - Test edge cases

**Example Projects:**
- [ ] Create demo project in this repo
  - Fully-generated RootSpec specification
  - Complete user stories in YAML
  - Working Cypress tests that pass
  - Serves as reference implementation

- [ ] Create `examples/` directory structure
  - `examples/README.md` with overview

- [ ] Create example 1: `examples/saas-app/`
  - Complete RootSpec specification
  - Demonstrates SaaS product structure
  - Includes user stories and Cypress tests

- [ ] Create example 2: `examples/mobile-app/`
  - Mobile application specification
  - Shows cross-platform considerations

- [ ] Create example 3: `examples/developer-tool/`
  - CLI/library specification
  - Demonstrates technical product spec

### Week 4+: Documentation & Polish (Low Priority)

**Documentation:**
- [ ] Merge Quick Start guide into README
  - Make it a brief section in README
  - Remove `docs/QUICK_START.md` (redundant)
  - Keep README as single comprehensive doc

- [ ] Trim markdown files (~30-40% reduction)
  - Focus on clarity and conciseness
  - Remove redundancy
  - Improve readability

- [ ] Add visual diagrams
  - Framework hierarchy diagram
  - Level dependencies visualization
  - User journey flowchart

- [ ] Create video walkthrough
  - Getting started tutorial
  - CLI demo
  - AI prompt workflow

**Community Growth:**
- [ ] Monitor and respond to GitHub Issues
- [ ] Monitor and respond to Discussions
- [ ] Track npm download metrics
- [ ] Pin welcome message in Discussions
- [ ] Create public roadmap in GitHub Projects

**Optional Enhancements:**
- [ ] Create `.github/FUNDING.yml` (if enabling sponsorships)

- [ ] Set up documentation site with Docus (or similar)
  - Use Docus, VitePress, or Docusaurus
  - Create `/docs` site within this repo
  - Deploy to GitHub Pages
  - Custom domain (rootspec.dev?)
  - Features: search, API docs, interactive examples

- [ ] Add more CLI features
  - `rootspec doctor` - Validate environment
  - `rootspec upgrade` - Update to latest version
  - `rootspec config` - Manage .rootspecrc.json

---

## 🔮 Future Ideas / Research

### Derivation Seeds
See [SEEDS_ROADMAP.md](SEEDS_ROADMAP.md) for detailed vision on derivation capabilities.

### Framework Evolution
- [ ] Technical specification layer (tech stack decisions)?
- [ ] Code/implementation as another spec layer?
- [ ] Balance prescription vs. flexibility
  - Care about WHY and WHAT
  - Less prescriptive about HOW
  - Allow implementation variation

### Tooling Enhancements
- [ ] VSCode extension
  - Syntax highlighting for user stories
  - Snippets for common patterns
  - Spec validation

- [ ] RootSpec linter
  - Validate specification hierarchy
  - Check for circular references
  - Ensure Design Pillar alignment

- [ ] Specification diff tool
  - Show changes between versions
  - Impact analysis (what levels affected)

### Integrations
- [ ] Jira/Linear integration
  - Sync user stories with tickets
  - Track implementation progress

- [ ] Notion/Confluence integration
  - Export specs to documentation platforms

- [ ] Storybook integration
  - Link UI components to specs

### Community Features
- [ ] Specification gallery
  - Showcase community projects
  - Search and filter by domain

- [ ] Templates/boilerplates
  - Common project types
  - Industry-specific templates

- [ ] CLI plugins system
  - Extensible architecture
  - Community-contributed commands

---

## 📊 Success Metrics to Track

**Week 1:**
- npm downloads > 50
- GitHub stars > 10
- 1-2 user issues/questions

**Month 1:**
- npm downloads > 500
- GitHub stars > 50
- 5-10 active users
- First external contributor

**Month 3:**
- npm downloads > 2000
- GitHub stars > 200
- 20+ active users
- 3-5 external contributors
- 2-3 community example projects

---

## 🔗 Quick Links

- **npm Package**: https://www.npmjs.com/package/rootspec
- **GitHub Repo**: https://github.com/rootspec/rootspec
- **Releases**: https://github.com/rootspec/rootspec/releases
- **Discussions**: https://github.com/rootspec/rootspec/discussions
- **Issues**: https://github.com/rootspec/rootspec/issues

---

## 📝 Notes

- This roadmap is a living document - update as priorities change
- Focus on user feedback over roadmap rigidity
- Ship iteratively, don't wait for perfect
- Community contributions > feature completeness
