# Workflow Patterns Reference

**Purpose:** Document proven workflow automation patterns from SpriteStory and RootSpec for reference when deriving technical design specifications.

**Context:** When using `rootspec extend technical-design`, the AI recommends workflow controls based on these patterns. This document provides implementation insights for users who adopt these controls.

---

## 1. Dev Server Management

**Pattern:** PID-based process tracking with port conflict resolution

**Reference Implementation:** SpriteStory `scripts/dev.sh` (97 lines)

### Key Features

**PID File Tracking:**
- Store process ID in `.nuxt/dev.pid` (or `.next/dev.pid` for Next.js)
- Enables reliable process management without `killall` commands
- Prevents accidental termination of unrelated processes

**Port Conflict Detection:**
- Use `lsof -ti:$PORT` to find processes using target port
- Kill conflicting processes before starting new server
- Handles orphaned processes from crashed dev servers

**Log Management:**
- Redirect stdout/stderr to log file (`.nuxt/dev.log`)
- Enables debugging of startup failures
- Keeps terminal clean during background execution

**Graceful Shutdown:**
- Kill process group (`kill -- -$PID`) to terminate all children
- Fallback to direct kill if process group fails
- Cleanup port even if PID file is stale

**Survival Verification:**
- After `nohup` start, sleep briefly then check if process still running
- Catches immediate startup failures (missing dependencies, syntax errors)
- Shows log output if startup fails

### Implementation Insights

**Why PID files over `killall`:**
- `killall node` or `killall npm` affects ALL Node.js processes
- PID file tracks specific dev server instance
- Safer in multi-project environments

**Why port cleanup on start:**
- Dev server crashes can leave port occupied
- Manual cleanup is error-prone
- Automated cleanup prevents "port already in use" errors

**Why process groups:**
- Dev servers spawn child processes (Vite, Webpack, etc.)
- Killing parent leaves orphaned children consuming resources
- Process group termination ensures complete cleanup

### Script Structure

```bash
#!/bin/bash
# Dev server management

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="$PROJECT_DIR/.nuxt/dev.pid"
LOG_FILE="$PROJECT_DIR/.nuxt/dev.log"
PORT=3000

kill_port() {
  # Port cleanup logic
}

start() {
  # 1. Check PID file - already running?
  # 2. Kill anything on target port
  # 3. Start server with nohup
  # 4. Save PID to file
  # 5. Verify process survived startup
}

stop() {
  # 1. Kill by PID from file
  # 2. Also kill anything on port (catches orphans)
  # 3. Cleanup PID file
}

status() {
  # Check if PID is running
  # Clean stale PID file if not
}

case "$1" in
  start) start ;;
  stop) stop ;;
  status) status ;;
  *) echo "Usage: $0 {start|stop|status}" ;;
esac
```

### npm Scripts Integration

```json
{
  "scripts": {
    "dev:start": "./scripts/dev.sh start",
    "dev:stop": "./scripts/dev.sh stop",
    "dev:status": "./scripts/dev.sh status",
    "dev:restart": "./scripts/dev.sh stop && ./scripts/dev.sh start"
  }
}
```

---

## 2. Branch Management

**Pattern:** Regex-based naming enforcement with git hooks

**Reference Implementation:** Not yet implemented in reference projects (recommendation only)

### Key Features

**Naming Convention Enforcement:**
- User-defined regex pattern stored in config
- Pattern examples:
  - `^(feature|fix|chore)/[a-z0-9-]+$` - GitHub Flow style
  - `^(feat|fix|docs|chore)/[A-Z]+-[0-9]+-.+$` - Jira-integrated
  - Custom patterns per team workflow

**Branch Creation Script:**
- Validates proposed name against pattern
- Creates branch from main/master
- Prevents manual creation of invalid branches

**Branch Deletion Script:**
- Verifies branch is merged before deletion
- Prevents accidental deletion of unmerged work
- Safe cleanup of feature branches

**Pre-push Hook:**
- Validates branch name before allowing push
- Catches invalid names before they reach remote
- Blocks push with clear error message

### Implementation Insights

**Why regex patterns:**
- Flexibility for different workflows
- Integration with issue trackers (Jira, Linear, etc.)
- Team-specific conventions

**Why config storage:**
- Makes pattern discoverable to team
- Enables tooling integration
- Single source of truth

**Why pre-push not pre-commit:**
- Allows local experimentation with any branch name
- Enforcement happens before sharing with team
- Reduces friction for developers

### Configuration Format

```json
// .rootspecrc.json or similar
{
  "branchNamingPattern": "^(feature|fix|chore)/[a-z0-9-]+$",
  "branchNamingExamples": [
    "feature/user-authentication",
    "fix/login-redirect",
    "chore/update-deps"
  ]
}
```

---

## 3. Commit Conventions

**Pattern:** Conventional Commits with interactive wizard and git hook validation

**Reference Implementation:** Not yet implemented in reference projects (recommendation only)

### Key Features

**Conventional Commits Format:**
- Structure: `type(scope): description`
- Types: `feat`, `fix`, `chore`, `docs`, `style`, `test`, `refactor`, `ci`, `build`, `perf`
- Scope: Optional, context-specific (e.g., `auth`, `ui`, `api`)

**Interactive Commit Script:**
- Prompts for type (with descriptions)
- Prompts for optional scope
- Prompts for description
- Validates format before committing
- Adds co-author attribution if needed

**Commit-msg Hook:**
- Validates message format after commit created
- Allows exceptions:
  - Merge commits (`^Merge `)
  - Revert commits (`^Revert `)
  - Release commits (created by release script)

### Implementation Insights

**Why Conventional Commits:**
- Enables automated changelog generation
- Provides semantic meaning for commits
- Improves git log readability
- Standard format widely adopted

**Why interactive wizard:**
- Reduces cognitive load (no need to remember format)
- Catches errors before commit
- Consistent formatting across team
- Discoverability for new team members

**Why commit-msg hook:**
- Last line of defense
- Catches manual commits that skip script
- Allows exceptions for automated commits

### Best Practices

**Subject Line:**
- Max 72 characters
- Imperative mood ("Add" not "Added")
- No period at end

**Body (optional):**
- Blank line after subject
- Explain "why" not "what"
- Reference issue IDs

**Examples:**
```
feat(auth): add OAuth2 login flow

Implements login via Google and GitHub OAuth providers.
Closes #123

fix(api): prevent race condition in session refresh

Session refresh was creating duplicate tokens when called
concurrently. Added mutex lock to ensure single refresh.

Fixes #456
```

---

## 4. Changelog Management

**Pattern:** Dual changelogs (developer + user) with git hook enforcement

**Reference Implementation:** SpriteStory `.husky/commit-msg` (25 lines)

### Key Features

**Dual Changelog Approach:**

**Developer Changelog (`CHANGELOG.md`):**
- Format: Keep a Changelog (https://keepachangelog.com/)
- Categories: Added, Changed, Deprecated, Removed, Fixed, Security
- `[Unreleased]` section for pending changes
- Technical language, complete record
- All changes documented

**User Changelog (`USER_CHANGELOG.md`):**
- Feature-focused descriptions
- Non-technical language
- Only user-visible changes
- Organized by version with dates
- Highlights benefits to users

**Git Hook Enforcement:**
- Verifies CHANGELOG.md is staged for non-trivial commits
- Exceptions for conventional commit types: `chore:`, `docs:`, `ci:`, `build:`, `style:`, `test:`
- Exceptions for merge/revert/release commits
- Blocks commit with helpful error message

### Implementation Insights

**Why dual changelogs:**
- Developers need complete technical record
- End users need friendly, relevant updates only
- Different audiences have different information needs
- Reduces noise for users (no "refactor internal module" entries)

**Why hook enforcement:**
- Prevents forgotten changelog updates
- Catches gaps at commit time, not release time
- Maintains discipline across team
- Reduces code review burden

**Why exception patterns:**
- `chore:`, `ci:`, `build:`, etc. are internal changes
- Merge commits don't represent new work
- Release commits are automated
- Reduces false positives

### Hook Implementation

```bash
#!/bin/sh
# .husky/commit-msg

MSG=$(cat "$1")

# Skip check for certain commit types
if echo "$MSG" | grep -qE "^(chore|docs|ci|build|style|test|revert)(\(.+\))?:|^Merge |^Revert |^[Rr]elease |^v?[0-9]+\.[0-9]+"; then
  exit 0
fi

# Check if CHANGELOG.md is staged
if ! git diff --cached --name-only | grep -q "^CHANGELOG.md$"; then
  echo ""
  echo "ERROR: CHANGELOG.md not updated"
  echo ""
  echo "Please add your changes to the [Unreleased] section of CHANGELOG.md"
  echo ""
  echo "To skip this check, use a commit prefix: chore:, docs:, ci:, build:, style:, test:, revert:"
  echo ""
  exit 1
fi
```

### Keep a Changelog Format

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New feature X that does Y

### Changed
- Improved performance of Z by 50%

### Fixed
- Bug where A happened when B

## [1.2.0] - 2026-02-14

### Added
- Feature X
- Feature Y

### Changed
- Updated dependency Z to v3.0
```

---

## 5. Release Automation

**Pattern:** Semantic versioning with multi-file updates and GitHub release integration

**Reference Implementations:**
- **RootSpec `scripts/release.sh`** (182 lines) - Advanced pattern with dry-run support
- **SpriteStory `scripts/release.sh`** (65 lines) - Streamlined pattern

### Key Features

**Semantic Versioning:**
- Format: `MAJOR.MINOR.PATCH`
- Breaking changes → major (1.0.0 → 2.0.0)
- New features → minor (1.0.0 → 1.1.0)
- Bug fixes → patch (1.0.0 → 1.0.1)

**Multi-File Version Updates:**
- `package.json` version field
- Documentation version references (README, prompts)
- Changelog date insertion

**Changelog Hardening:**
- Convert `[Unreleased]` → `[X.Y.Z] - YYYY-MM-DD` in CHANGELOG.md
- Add version heading in USER_CHANGELOG.md
- Extract changelog section for GitHub release notes

**Git Operations:**
- Commit version updates with clear message
- Create annotated tag `vX.Y.Z`
- Push commits and tags to remote

**GitHub Release:**
- Use `gh` CLI to create release
- Extract changelog section for release notes
- Attach to git tag

**Package Publishing:**
- `npm publish` for npm packages
- Other registry publishing as needed

### Implementation Insights

**Why multi-file patching:**
- Version references scattered across codebase
- Manual updates are error-prone
- Automated patching ensures consistency
- Catches stale version strings

**Why dry-run support:**
- Preview changes before execution
- Verify version updates correct
- Test script logic without side effects
- Useful for debugging release script

**Why changelog extraction:**
- GitHub release notes mirror changelog
- Single source of truth for release information
- Automatic synchronization
- Reduces manual copy-paste errors

**Why annotated tags:**
- Include changelog notes in tag message
- Provides context in git history
- Enables `git describe` with version info

### RootSpec Pattern (Advanced)

**Features:**
- Dry-run mode with `[DRY RUN]` prefixes
- Multi-file version patching with verification
- Stale version string detection
- Auto-confirm mode (`-y` flag)
- Comprehensive validation before execution

**Usage:**
```bash
./scripts/release.sh 4.4.1           # Normal release
./scripts/release.sh 4.4.1 --dry-run # Preview changes
./scripts/release.sh 4.4.1 -y        # Auto-confirm
```

**Script Structure:**
1. Parse arguments (version, flags)
2. Validate version format (`X.Y.Z`)
3. Check for uncommitted changes
4. Update version references (package.json, docs, prompts)
5. Verify version updates successful
6. Remind to update changelogs
7. Commit version updates
8. Create annotated git tag
9. Push commits and tags
10. Create GitHub release with extracted notes
11. Publish to npm

### SpriteStory Pattern (Streamlined)

**Features:**
- Uses `npm version` for version bumping
- Simple sed-based changelog date insertion
- Manual changelog reminder
- GitHub release creation

**Usage:**
```bash
./scripts/release.sh patch  # 1.0.0 → 1.0.1
./scripts/release.sh minor  # 1.0.0 → 1.1.0
./scripts/release.sh major  # 1.0.0 → 2.0.0
```

**Script Structure:**
1. Validate on main branch
2. Check for uncommitted changes
3. Remind to update changelogs (manual verification)
4. Use `npm version` to bump version
5. Update changelog date via `sed`
6. Commit and tag
7. Push to remote
8. Create GitHub release

### Comparison

| Feature | RootSpec (Advanced) | SpriteStory (Streamlined) |
|---------|---------------------|---------------------------|
| Dry-run | ✅ Yes | ❌ No |
| Multi-file patching | ✅ Manual sed | ✅ npm version |
| Changelog hardening | ✅ Manual | ✅ Automated sed |
| GitHub release | ✅ Yes | ✅ Yes |
| npm publish | ✅ Yes | ❌ Manual |
| Auto-confirm mode | ✅ Yes | ❌ No |
| Complexity | 182 lines | 65 lines |
| Best for | Libraries, frameworks | Apps, simple projects |

### Changelog Extraction Example

```bash
# Extract section between current version and next heading
RELEASE_NOTES=$(awk "/## \[$VERSION\]/,/## \[/" CHANGELOG.md | sed '1d;$d')

# Use in GitHub release
gh release create "v$VERSION" --title "v$VERSION" --notes "$RELEASE_NOTES"
```

---

## Integration Patterns

### Workflow Integration Points

**Branch → Spec Alignment:**
- Create branch after spec feature approval
- Branch name references spec section (e.g., `feature/auth-system-L4`)
- Ensures implementation matches design

**Commit → Changelog Discipline:**
- Commit hook enforces changelog updates
- Prevents forgotten documentation
- Maintains audit trail

**Release → Changelog Hardening:**
- Release script hardens unreleased changes
- Creates permanent version record
- Synchronizes with git tags and GitHub releases

### Cross-Team Coordination

**For Small Teams (2-5 developers):**
- Adopt: Changelog enforcement, release automation
- Skip: Branch naming (code review sufficient), commit conventions (optional)

**For Medium Teams (6-20 developers):**
- Adopt: All workflow controls
- Enforce via git hooks
- Provides consistency at scale

**For Large Teams (20+ developers):**
- Adopt: All workflow controls
- Consider CI/CD integration
- Add additional governance (PR templates, issue templates)

---

## Tool Recommendations

**Husky:**
- Git hook management
- Installs hooks in `.husky/` directory
- npm scripts integration
- Cross-platform support

**Conventional Commits:**
- Standard commit message format
- Enables automated changelog generation
- Widely adopted ecosystem

**Keep a Changelog:**
- Human-readable changelog format
- Semantic versioning alignment
- Clear categories for changes

**GitHub CLI (`gh`):**
- Create releases programmatically
- Extract release notes from changelog
- Automate GitHub interactions

**Semantic Release (Alternative):**
- Fully automated release process
- Analyzes commits to determine version bump
- Generates changelogs automatically
- Trade-off: Less control, more automation

---

## Anti-Patterns to Avoid

**❌ Don't provide script implementations in specs:**
- Specs define WHAT, not HOW
- Implementation is project-specific
- Creates maintenance burden

**❌ Don't over-engineer for small teams:**
- Branch naming enforcement may be overkill
- Commit conventions can be optional
- Balance automation vs. overhead

**❌ Don't skip changelog enforcement:**
- Manual discipline fails at scale
- Forgotten updates accumulate
- Git hooks are cheap insurance

**❌ Don't skip dry-run support:**
- Release scripts are high-risk
- Preview changes before execution
- Builds confidence in automation

**❌ Don't hardcode project-specific values:**
- Use config files for patterns
- Support environment variables
- Enable reusability across projects

---

## References

**Implemented Patterns:**
- SpriteStory `/Users/cbrown/Dev/spritestory/scripts/dev.sh` - Dev server management
- SpriteStory `/Users/cbrown/Dev/spritestory/.husky/commit-msg` - Changelog enforcement
- SpriteStory `/Users/cbrown/Dev/spritestory/scripts/release.sh` - Streamlined release
- RootSpec `/Users/cbrown/Dev/rootspec/scripts/release.sh` - Advanced release

**Standards:**
- Keep a Changelog: https://keepachangelog.com/
- Conventional Commits: https://www.conventionalcommits.org/
- Semantic Versioning: https://semver.org/

**Tools:**
- Husky: https://typicode.github.io/husky/
- GitHub CLI: https://cli.github.com/
- Semantic Release: https://semantic-release.gitbook.io/
