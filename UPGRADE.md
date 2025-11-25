# RootSpec Upgrade Guide

Migration instructions for upgrading between RootSpec versions.

---

## Upgrading to 4.3.0 from 4.2.x

**Release Date:** 2025-11-24

### What Changed

**Critical Bug Fix:**
- Fixed `FRAMEWORK_ROOT` path in CLI - prompts and templates were not found after npm install

**New Feature:**
- `rootspec prompts migrate` now auto-detects your current RootSpec version
- Shows version from multiple sources (framework file, config, package.json)
- Warns on version mismatches
- No more manual version entry

### Action Required

**Update immediately** - v4.2.x has a critical bug where `rootspec prompts migrate` (and potentially other prompt commands) fail with "ENOENT: no such file or directory" after npm install.

```bash
npm install -g rootspec@4.3.0
```

### Breaking Changes

None

---

## Upgrading to 4.2.1 from 4.2.0

**Release Date:** 2025-11-24

### What Changed

- Fixed CLI `--version` showing wrong version (4.1.0 instead of 4.2.0)
- Fixed npm warning about bin file not found

### Action Required

**None** - Just update: `npm install -g rootspec@4.2.1`

### Breaking Changes

None

---

## Upgrading to 4.2.0 from 4.1.0

**Release Date:** 2025-11-24

### What Changed

**Test Suite Structure:**
- Replaced 3 prescriptive test files (`by_priority.cy.ts`, `by_journey.cy.ts`, `by_system.cy.ts`) with single template (`example.cy.ts`)
- Users/AI now create test suite files for each subset they want to run independently

**Output Verbosity:**
- Task logging now off by default (was spamming terminal)
- Browser console capture only shows errors by default
- Fixed Vite glob deprecation warning
- Added mochawesome reporter config option for JSON output

### Action Required

**If you have existing Cypress setup from v4.1.0:**

1. Your existing `by_priority.cy.ts`, `by_journey.cy.ts`, `by_system.cy.ts` files will continue to work
2. To adopt the new pattern:
   - Copy your existing test file to a new name (e.g., `mvp.cy.ts`)
   - Modify the glob pattern to load specific YAML files
   - Delete old files when ready

### Migration Steps

**To reduce test output noise:**

Add environment variables when running tests:
```bash
# Quiet mode
CYPRESS_QUIET=1 npm run cypress:run

# Or enable verbose logging when debugging
CYPRESS_LOG_TASKS=1 npm run cypress:run
```

**To fix the deprecation warning:**

Update your test file glob syntax:
```typescript
// Old (deprecated)
import.meta.glob('...', { as: 'raw', eager: true })

// New
import.meta.glob('...', { query: '?raw', import: 'default', eager: true })
```

### Breaking Changes

None - existing test files continue to work.

---

## Upgrading to 4.1.0 from 4.0.0

**Release Date:** 2025-11-23

### What Changed

- `rootspec cypress` command no longer automatically copies example user stories to `templates/` directory
- New `--with-examples` flag added to opt-in to example copying
- Examples now referenced in `node_modules/rootspec/dist/templates/USER_STORIES/` by default

### Action Required

**None** - This is a backward compatible change.

### Migration Steps

If you previously relied on examples being copied automatically:

1. **Option A:** Use the new flag when installing Cypress templates:
   ```bash
   rootspec cypress --with-examples
   ```

2. **Option B:** Copy examples manually when needed:
   ```bash
   cp -r node_modules/rootspec/dist/templates/USER_STORIES/* spec/05.IMPLEMENTATION/USER_STORIES/
   ```

### Breaking Changes

None

---

## Upgrading to 4.0.0 from 3.6.0

**Release Date:** 2025-11-21

### What Changed

- **New official CLI** replaces manual `curl` downloads and manual prompt editing
- All AI prompt files now use template format with placeholders
- Auto-detection of project framework and structure
- New commands: `init`, `cypress`, `prompts`, `validate`

### Action Required

**Install the CLI globally or use with npx:**

```bash
# Global installation
npm install -g rootspec

# Or use directly
npx rootspec init
```

### Migration Steps

#### For New Projects

Use the new CLI workflow:
```bash
rootspec init                # Initialize framework
rootspec prompts init        # Get AI prompt for new project
```

#### For Existing Projects (3.x users)

1. **Install CLI:**
   ```bash
   npm install -g rootspec
   ```

2. **Your existing spec files (01-05) remain compatible** - no changes needed

3. **Update workflow to use CLI:**
   - Old: `curl` to download prompts, manually edit placeholders
   - New: `rootspec prompts <name>` auto-fills project context

4. **Optional: Add Cypress testing:**
   ```bash
   rootspec cypress
   ```

5. **Optional: Create `.rootspecrc.json`** for custom spec directory:
   ```json
   {
     "specDirectory": "./spec",
     "version": "4.0.0"
   }
   ```

### Breaking Changes

**None** - 3.x specification files are fully compatible with 4.0.0.

The CLI is an addition, not a replacement. You can still:
- Manually download `00.SPEC_FRAMEWORK.md`
- Edit prompts directly from `prompts/` directory
- Use the framework without the CLI

**However, the CLI is highly recommended** for auto-filled prompts and easier workflow.

---

## Template Format (4.0.0+)

If you maintain custom prompt files, note the new template syntax:

- `{{VARIABLE}}` - Simple variable replacement
- `{{#IF condition}}...{{/IF}}` - Conditional blocks
- `{{#EACH array}}...{{/EACH}}` - Loop over arrays

The CLI automatically processes these when generating prompts.

---

## Version History

- **4.1.0** (2025-11-23): Optional example templates in `rootspec cypress`
- **4.0.0** (2025-11-21): Official CLI with auto-detection and template engine
- **3.6.0** (2025-11-18): Cypress template improvements
- **3.5.2** (2025-11-15): Bug fixes and documentation updates
- **3.5.1** (2025-11-14): Minor prompt improvements
- **3.5.0** (2025-11-12): Enhanced validation tools

---

## Getting Help

- **Documentation:** [README.md](README.md)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)
- **Issues:** https://github.com/rootspec/rootspec/issues
- **Framework Reference:** `00.SPEC_FRAMEWORK.md`
