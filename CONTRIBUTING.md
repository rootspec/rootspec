# Contributing to RootSpec

Thank you for your interest in contributing to RootSpec! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

### Ways to Contribute

- **Bug Reports**: Found a bug? Open an issue with detailed reproduction steps
- **Feature Requests**: Have an idea? Create an issue to discuss it first
- **Documentation**: Improve docs, fix typos, add examples
- **Code**: Fix bugs, implement features, improve performance
- **Examples**: Share your RootSpec projects as examples

### Before You Start

1. **Check [KNOWN_ISSUES.md](KNOWN_ISSUES.md)** for known bugs and limitations
2. **Search existing issues** to avoid duplicates
3. **Discuss major changes** in an issue before implementing
4. **Follow the project philosophy**: Remember, philosophy guides implementation!

## Development Setup

### Prerequisites

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Git**: Latest version

### Clone and Install

```bash
# Clone the repository
git clone https://github.com/rootspec/rootspec.git
cd rootspec

# Install dependencies for CLI package
cd packages/cli
npm install

# Build the CLI
npm run build

# Link for local testing
npm link
```

### Project Structure

```
rootspec/
├── 00.SPEC_FRAMEWORK.md     # Framework definition
├── README.md                 # Main documentation
├── CHANGELOG.md              # Version history
├── CLAUDE.md                 # AI assistant guidance
├── packages/
│   └── cli/                  # CLI package
│       ├── src/              # TypeScript source
│       │   ├── commands/     # CLI commands
│       │   └── utils/        # Utilities
│       ├── dist/             # Compiled output
│       └── package.json      # Package config
├── prompts/                  # AI prompt templates
├── templates/                # Cypress templates
└── docs/                     # Documentation
```

## Making Changes

### Development Workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes**:
   - Edit source files in `packages/cli/src/`
   - Update documentation if needed
   - Add tests for new functionality (when test infrastructure is ready)

3. **Build and test locally**:
   ```bash
   cd packages/cli
   npm run build

   # Test your changes
   rootspec --help
   rootspec init --help
   ```

4. **Test in a real project**:
   ```bash
   # In a test project directory
   rootspec init
   rootspec prompts adopt
   # etc.
   ```

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring
- `test/description` - Test additions/fixes

## Pull Request Process

### Before Submitting

1. **Update CHANGELOG.md** with your changes under `[Unreleased]`
2. **Build successfully**: `npm run build` passes
3. **Test locally**: Verify your changes work as expected
4. **Update documentation**: If you changed behavior or added features
5. **Commit messages**: Use clear, descriptive commit messages

### Commit Message Format

We follow a simple commit message convention:

```
Short description (50 chars or less)

Optional longer description explaining the change, motivation,
and any important implementation details.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Good examples:**
- `Add --verbose flag to init command`
- `Fix template rendering for Windows paths`
- `Update docs for Cypress integration`

### Creating a Pull Request

1. **Push your branch** to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request** on GitHub

3. **Fill out the PR template** with:
   - Description of changes
   - Type of change (bug fix, feature, docs, etc.)
   - Testing performed
   - Related issues

4. **Wait for review**: A maintainer will review your PR and may request changes

### PR Review Process

- Maintainers will review within 2-3 business days
- Address review feedback by pushing new commits
- Once approved, a maintainer will merge your PR
- Your contribution will be included in the next release!

## Coding Standards

### TypeScript Style

- **Use TypeScript strict mode**: Already configured
- **Explicit types**: Add type annotations for function parameters and returns
- **Interfaces over types**: Prefer `interface` for object shapes
- **Named exports**: Use named exports instead of default exports

### Code Organization

- **Small, focused functions**: Each function should do one thing well
- **Clear naming**: Use descriptive variable and function names
- **Comments**: Add comments for complex logic, not obvious code
- **Error handling**: Handle errors gracefully with clear messages

### File Naming

- **Commands**: `command-name.ts` (e.g., `init.ts`, `prompts.ts`)
- **Utils**: `utility-name.ts` (e.g., `config.ts`, `template.ts`)
- **Tests**: `file-name.test.ts` (when test infrastructure is ready)

### Documentation Style

- **Markdown**: Use GitHub-flavored Markdown
- **Code blocks**: Always specify language for syntax highlighting
- **Examples**: Include practical examples with actual code
- **Links**: Use relative links for internal docs

## Release Process

*For maintainers only*

### Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **Patch (4.0.1)**: Bug fixes, documentation updates
- **Minor (4.1.0)**: New features, backwards-compatible changes
- **Major (5.0.0)**: Breaking changes

### Release Steps

1. **Update CHANGELOG.md** with new version section:
   ```markdown
   ## [4.1.0] - 2025-MM-DD

   ### Added
   - Feature description

   ### Fixed
   - Bug fix description
   ```

2. **Update version references** in all docs:
   ```bash
   # Find all version references
   grep -r "v4\.0\.0" --include="*.md" .
   ```

3. **Update package.json version**:
   ```bash
   cd packages/cli
   npm version minor  # or patch/major
   ```

4. **Commit changes**:
   ```bash
   git add .
   git commit -m "Release v4.1.0"
   ```

5. **Create annotated tag**:
   ```bash
   git tag -a v4.1.0 -m "Version 4.1.0: Brief description

   New features:
   - Feature 1
   - Feature 2

   See CHANGELOG.md for details."
   ```

6. **Push to GitHub**:
   ```bash
   git push && git push --tags
   ```

7. **Publish to npm**:
   ```bash
   cd packages/cli
   npm publish
   ```

8. **Create GitHub Release**:
   - Go to https://github.com/rootspec/rootspec/releases
   - Click "Create a new release"
   - Select the tag
   - Auto-generate release notes
   - Edit and publish

## Questions?

- **General questions**: Open a [Discussion](https://github.com/rootspec/rootspec/discussions)
- **Bug reports**: Open an [Issue](https://github.com/rootspec/rootspec/issues)
- **Security issues**: See [SECURITY.md](SECURITY.md)

## License

By contributing to RootSpec, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to RootSpec!** Your efforts help make specification-driven development better for everyone. 🎉
