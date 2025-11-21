# rootspec

**Hierarchical Specification Framework CLI** - Philosophy guides implementation

RootSpec is a five-level specification framework that helps teams build software with clear alignment from philosophy to implementation. The CLI automates framework setup, prompt generation, and project configuration.

## Installation

```bash
# Install globally
npm install -g rootspec

# Or use directly with npx (no installation)
npx rootspec init
```

## Quick Start

```bash
# Initialize RootSpec in your project
rootspec init

# Generate AI-assisted prompts with auto-detected project context
rootspec prompts init      # For new projects
rootspec prompts adopt     # For existing projects

# Add Cypress testing templates
rootspec cypress

# List all available prompts
rootspec prompts
```

## Commands

### `rootspec init [options]`

Initialize the RootSpec framework in your project.

**Options:**
- `--path <dir>` - Installation directory (default: `./spec`)
- `--full` - Include Cypress templates
- `--yes` - Skip prompts, use defaults

**Example:**
```bash
rootspec init --path ./docs --full
```

### `rootspec prompts [name] [options]`

List or view AI workflow prompts with auto-detected project context.

**Available prompts:**
- `init` - Create new specification
- `adopt` - Adopt framework for existing project
- `validate` - Validate specification compliance
- `add-feature` - Add feature to spec
- `review` - Review implementation vs. spec
- `generate-docs` - Generate PRDs, TDDs
- `migrate` - Migrate to newer version
- `cypress-merge` - Merge Cypress templates

**Options:**
- `-o, --open` - Open prompt in browser

**Example:**
```bash
rootspec prompts adopt     # Prints to stdout
rootspec prompts adopt -o  # Opens in browser
```

### `rootspec cypress`

Add Cypress testing templates for YAML user story testing.

Copies:
- `cypress.config.ts` with RootSpec tasks
- `cypress/` support files and test generators
- `templates/USER_STORIES/` examples

### `rootspec validate`

Validate your specification for compliance with the framework.

## Features

- **Auto-detection**: Scans your project for framework (Next.js, React, Vue, etc.), source directories, and config files
- **Template engine**: Fills AI prompts with your actual project context
- **Interactive mode**: User-friendly prompts for all options
- **Non-interactive mode**: `--yes` flag for CI/CD and scripting
- **Cypress integration**: Automated E2E testing from YAML user stories

## What is RootSpec?

RootSpec is a **five-level hierarchical specification system**:

1. **Level 1: Foundational Philosophy** - WHY & WHAT EXPERIENCE (mission, design pillars)
2. **Level 2: Stable Truths** - WHAT strategies and approaches
3. **Level 3: Interaction Architecture** - HOW users interact (behavioral patterns)
4. **Level 4: Systems** - HOW to implement (architecture)
5. **Level 5: Implementation** - HOW MUCH (validation with tests & parameters)

Each level references only higher levels, creating a **dependency-free hierarchy** where changes flow downward naturally.

## Documentation

**Complete guides and framework reference:**

- [Main Repository](https://github.com/rootspec/rootspec) - Full documentation
- [Framework Reference](https://github.com/rootspec/rootspec/blob/main/00.SPEC_FRAMEWORK.md) - Complete specification
- [Quick Start Guide](https://github.com/rootspec/rootspec/blob/main/docs/QUICK_START.md) - Fast-track setup
- [Cypress Setup](https://github.com/rootspec/rootspec/blob/main/docs/CYPRESS_SETUP.md) - Testing integration
- [Changelog](https://github.com/rootspec/rootspec/blob/main/CHANGELOG.md) - Version history

## Requirements

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0

## License

MIT © Corky Brown

## Contributing

Contributions are welcome! See the [contributing guide](https://github.com/rootspec/rootspec/blob/main/CONTRIBUTING.md) for details.

## Support

- [GitHub Issues](https://github.com/rootspec/rootspec/issues) - Bug reports and feature requests
- [GitHub Discussions](https://github.com/rootspec/rootspec/discussions) - Questions and community

---

**Built with TypeScript** | **Powered by Claude Code**
