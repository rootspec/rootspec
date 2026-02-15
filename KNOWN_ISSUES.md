# Known Issues

This document tracks known bugs and limitations discovered during testing and development.
For feature requests and roadmap items, see [docs/ROADMAP.md](docs/ROADMAP.md).

**Last Updated:** 2026-02-14

---

## Critical Issues

### ✅ Design Pillar Extraction Bug [FIXED]

**Status:** Fixed in v4.4.2
**Discovered:** Integration testing (2026-02-14)
**Impact:** HIGH - Users got incomplete context in prompts

**Description:**
`rootspec add-feature` and `rootspec review` commands only extracted 1 of 3 Design Pillars from `01.FOUNDATIONAL_PHILOSOPHY.md`.

**Root Cause:**
- Code duplication between `prompts.ts` and `extend.ts`
- Regex lookahead terminated section extraction prematurely
- Iterator not fully consumed with `matchAll()`

**Fix:**
- Created shared `extractDesignPillars()` in `utils/extraction.ts`
- Improved regex pattern: `/##\s+Design Pillars\s+([\s\S]*?)(?=\n##|$)/i`
- Use `Array.from()` to fully consume iterator

**Files Changed:**
- `packages/cli/src/utils/extraction.ts` (new)
- `packages/cli/src/commands/prompts.ts` (refactored)
- `packages/cli/src/commands/extend.ts` (refactored)

---

## High Priority Issues

### ❌ Validate Command Not Implemented

**Status:** Planned for v4.5.0
**Impact:** MEDIUM - No automated validation, must use AI prompts

**Description:**
Running `npx rootspec validate` returns "not yet implemented" message. Users must use `rootspec prompts validate` with an AI assistant instead.

**Planned Features:**
- Check reference hierarchy (no upward references)
- Verify no numeric values in L1-4 (placeholders only)
- Validate Design Pillars are emotional, not features
- Ensure user stories have test DSL
- Check all required sections present

**File:** `packages/cli/src/commands/validate.ts`

**Workaround:**
Use `rootspec prompts validate` to generate a comprehensive validation prompt for use with AI assistants.

**Implementation Estimate:** 4-6 hours

---

## Low Priority Issues

### ⚠️ Interaction Pattern Display Truncation

**Status:** Cosmetic issue
**Impact:** LOW - Doesn't affect functionality, only console output

**Description:**
When running `rootspec extend analytics-plan`, the console output only shows first 3 interaction patterns with "..." if more exist. The full data is still passed to the template correctly.

**Example:**
```
✓ Found 4 interaction pattern(s):
  - Core User Journey: Daily Task Completion Loop
  - Secondary Journey: Achievement Discovery
  - Onboarding Journey
  - **
```

**Location:** `packages/cli/src/commands/extend.ts` (lines ~429)

**Root Cause:**
Display truncation logic:
```typescript
interactionPatterns.slice(0, 3).join(', ')${interactionPatterns.length > 3 ? '...' : ''}
```

**Fix Options:**
1. Show all patterns (remove truncation)
2. Improve truncation to show count: "...and 2 more"
3. Keep as-is (data is correct, just display issue)

**Recommendation:** Option 2 - show "...and N more" for better UX

---

## Testing Phase Issues

The following issues were discovered during comprehensive integration testing (2026-02-14):

### Test Overview

**Test Product:** TaskFlow (Gamified Task Manager)
**Test Duration:** 44 minutes (67% faster than planned 135 minutes)
**Framework Version:** 4.4.1
**Overall Score:** 92/100

**Test Coverage:**
- ✅ Installation & Setup
- ✅ Auto-Detection (Next.js project)
- ✅ Specification Creation (L1-L5)
- ✅ Validation Prompts
- ✅ Feature Addition Workflow
- ✅ Cypress Integration
- ⚠️ Extension Prompts (pillar bug found)
- ✅ Migration Prompts

### All Bugs Found

1. **Design Pillar Extraction** - FIXED (see above)
2. **Validate Command** - Not implemented (see above)
3. **Display Truncation** - Cosmetic only (see above)

### Non-Issues (Expected Behavior)

**Cypress Examples Not Copied:**
Running `rootspec cypress --with-examples` showed:
```
⚠️  User stories directory already exists, skipping examples
```

**Status:** ✅ CORRECT - Prevents overwriting user files

---

## Performance Notes

All CLI commands run in <2 seconds, which is excellent.
No performance issues detected during testing.

---

## Reporting New Issues

If you discover a bug:

1. **Check this file first** to see if it's already known
2. **File a GitHub issue** using the bug report template:
   - Go to: https://github.com/rootspec/rootspec/issues/new/choose
   - Select "Bug Report"
   - Fill in all sections with details
3. **Link to this file** if the bug is already documented here

For questions or feature requests, use the appropriate GitHub issue template.

---

## Related Documentation

- [ROADMAP.md](docs/ROADMAP.md) - Feature roadmap and priorities
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guidelines
- [CHANGELOG.md](CHANGELOG.md) - Version history and changes
