# AI Assistant Prompt Library

**Context-aware prompt templates for RootSpec v4.5.1**

These are **template files** that are automatically filled by the RootSpec CLI with your project's actual context (framework, directories, files, etc.). The CLI scans your codebase and generates ready-to-use prompts that you can paste directly into your AI assistant.

## Overview

**RootSpec v4.2+** includes a CLI that transforms these template files into contextual prompts by:
- **Auto-detecting** your project's framework (Next.js, Nuxt, React, Vue, etc.)
- **Scanning** your source directories (`src/`, `lib/`, `app/`, etc.)
- **Finding** your configuration files (`tsconfig.json`, `package.json`, etc.)
- **Filling** template placeholders with your actual project information

**The result:** Prompts tailored to your specific project, no manual editing required.

---

## Using the CLI (Recommended)

### Quick Start

```bash
# List all available prompts
rootspec prompts

# Generate a specific prompt (automatically fills your project context)
rootspec prompts <command>
```

### Available Commands

| CLI Command | Use Case | Template File |
|-------------|----------|---------------|
| `rootspec prompts init` | Create new specification (greenfield) | [initialize-spec.md](initialize-spec.md) |
| `rootspec prompts adopt` | Adopt framework for existing project (brownfield) | [adopt-framework-existing.md](adopt-framework-existing.md) |
| `rootspec prompts migrate` | Upgrade to newer framework version | [migrate-spec.md](migrate-spec.md) |
| `rootspec prompts validate` | Validate specification compliance | [validate-spec.md](validate-spec.md) |
| `rootspec prompts add-feature` | Add feature to specification | [add-feature.md](add-feature.md) |
| `rootspec prompts review` | Review implementation against spec | [review-feature.md](review-feature.md) |
| `rootspec prompts generate-docs` | Generate PRDs, TDDs, documentation | [generate-docs.md](generate-docs.md) |
| `rootspec prompts cypress-merge` | Merge Cypress templates with existing config | [cypress-merge.md](cypress-merge.md) |

### Example: Adopting the Framework

```bash
# Run the adopt prompt command
$ rootspec prompts adopt

🌳 Adopt RootSpec Framework

Analyzing your existing codebase...

  ✓ Found src/
  ✓ Found components/
  ✓ Detected framework: Next.js
  ✓ Found config files: tsconfig.json, package.json, next.config.js

✅ Prompt ready! Copy and paste into your AI assistant:

────────────────────────────────────────────────────────────

I have an existing Next.js project and want to adopt the RootSpec framework.

**Source directories:**
- src/
- components/

**Framework/Stack:** Next.js
**Configuration files:**
- tsconfig.json
- package.json
- next.config.js

[... rest of contextualized prompt ...]
```

The CLI automatically filled in your framework, directories, and files!

---

## Understanding Template Placeholders

These markdown files contain template syntax that the CLI replaces:

### Variable Syntax
```markdown
{{VARIABLE_NAME}}
```
Example: `{{FRAMEWORK}}` becomes `Next.js` or `React`

### Conditional Syntax
```markdown
{{#IF CONDITION}}
  Content shown only if condition is true
{{/IF}}
```
Example:
```markdown
{{#IF FRAMEWORK}}
Framework detected: {{FRAMEWORK}}
{{/IF}}
{{#IF NO_FRAMEWORK}}
No framework detected
{{/IF}}
```

### List Syntax
```markdown
{{#EACH ARRAY_NAME}}
- {{ITEM}}
{{/EACH}}
```
Example:
```markdown
**Source directories:**
{{#EACH SOURCE_DIRS}}
- {{ITEM}}
{{/EACH}}
```

---

## Manual Usage (Advanced)

If you prefer not to use the CLI or want to understand the templates:

### Reading Template Files Directly

1. Open the template file (e.g., `adopt-framework-existing.md`)
2. You'll see placeholders like `{{FRAMEWORK}}`, `{{SOURCE_DIRS}}`, etc.
3. Manually replace these with your project's information
4. Copy the filled prompt to your AI assistant

### Common Placeholders

- `{{FRAMEWORK}}` - Project framework (Next.js, React, Vue, etc.)
- `{{SOURCE_DIRS}}` - Array of source directories
- `{{CONFIG_FILES}}` - Array of configuration files
- `{{SPEC_DIR}}` - Specification directory location
- `{{DESIGN_PILLARS}}` - Your specification's design pillars
- `{{SYSTEMS}}` - Your specification's systems

### When to Use Manual Approach

- **Learning**: Understanding how templates work
- **Customization**: Need to modify prompt structure
- **Offline**: No npm access
- **CI/CD**: Scripting prompt generation

---

## Quick Start Guide

### For New Projects (Greenfield)

```bash
# 1. Initialize RootSpec
npx rootspec init

# 2. Generate initialization prompt
rootspec prompts init

# 3. Copy output and paste into AI assistant
```

The AI will guide you through creating all 5 specification levels.

### For Existing Projects (Brownfield)

```bash
# 1. Initialize RootSpec in your project
npx rootspec init

# 2. Generate adoption prompt (auto-detects your codebase)
rootspec prompts adopt

# 3. Copy output and paste into AI assistant
```

The AI will help you reverse-engineer or define your specification.

### For Validating Specifications

```bash
# Generate validation prompt (scans your spec files)
rootspec prompts validate
```

The AI will check for hierarchy violations, missing sections, and anti-patterns.

---

## Tips for Best Results

1. **Use the CLI** - Auto-detection ensures accurate context
2. **Keep templates updated** - Template files are part of the framework, update with `npm update -g rootspec`
3. **Be specific in responses** - When AI asks follow-up questions, provide detailed answers
4. **Iterate freely** - AI-generated content is a draft; refine based on your expertise
5. **Validate regularly** - Use `rootspec prompts validate` to catch issues early

---

## How It Works

```
┌─────────────────┐
│   Your Project  │
│                 │
│  ├── src/       │
│  ├── lib/       │
│  └── package.json
└─────────────────┘
        │
        ├─────────────────────────┐
        │   RootSpec CLI          │
        │                         │
        │  1. Scans project       │
        │  2. Detects framework   │
        │  3. Finds directories   │
        │  4. Loads template      │
        │  5. Fills placeholders  │
        └─────────────────────────┘
                │
                ▼
        ┌──────────────────┐
        │ Generated Prompt │
        │                  │
        │ "I have a Next.js│
        │  project with... "│
        └──────────────────┘
                │
                ▼
        [ Paste into AI Assistant ]
```

---

## Version Compatibility

These templates are designed for **RootSpec v4.5.1**.

For earlier versions without CLI support:
- v3.x - Use manual workflow (download framework, edit prompts by hand)
- v2.x - See [CHANGELOG.md](../CHANGELOG.md) for migration to v3/v4

---

## Contributing

Improvements to template files or new templates are welcome! When contributing:

1. Keep templates focused and action-oriented
2. Use clear placeholder names (e.g., `{{FRAMEWORK}}` not `{{FW}}`)
3. Test with CLI to ensure placeholders are filled correctly
4. Update this README with new template documentation

---

## Questions?

- **CLI Help**: Run `rootspec --help` or `rootspec prompts --help`
- **Template Issues**: Check that your CLI version matches the framework version
- **Framework Questions**: See [00.SPEC_FRAMEWORK.md](../00.SPEC_FRAMEWORK.md)
- **Getting Started**: See [docs/QUICK_START.md](../docs/QUICK_START.md)
