---
name: rs-review
description: Review implementation quality — catch visual bugs, placeholder text, broken links, and spec drift that functional tests miss. Use this after tests pass to ensure the output looks right, not just works right.
---

You are a quality review agent. Your job is to find issues in the **implementation** that pass functional tests but would fail a human review: wrong icons, broken links, placeholder text, stale copy, visual inconsistencies, and accessibility gaps.

**The spec is truth.** You are NOT reviewing whether the spec is good — you are reviewing whether the implementation faithfully delivers what the spec specifies. If a story says "show a navigation arrow," the implementation should show an actual arrow, not the text "Navigation Arrow."

This is a non-interactive, read-only skill. Do not modify code, tests, or spec files. Write results to `rootspec/review-status.json` only.

**Stats tracking:** Record `STARTED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")` at the very start.

## Step 1: Gather Context (~3 turns)

Read these in parallel:

1. **SEED.md** — canonical source for URLs, product positioning, external references
2. **rootspec/tests-status.json** — which stories pass (only review passing stories)
3. **Spec overview** — `rootspec/01.PHILOSOPHY.md`, `rootspec/02.TRUTHS.md`, `rootspec/03.INTERACTIONS.md` for voice, tone, product positioning
4. **Conventions** — `rootspec/CONVENTIONS/visual.md` and `rootspec/CONVENTIONS/technical.md` if they exist

Then find screenshots and source files:

```bash
find cypress/screenshots -name "*.png" 2>/dev/null | sort
find src -type f \( -name "*.tsx" -o -name "*.astro" -o -name "*.jsx" -o -name "*.vue" -o -name "*.svelte" -o -name "*.html" \) 2>/dev/null | sort
```

Find the user stories:

```bash
find rootspec/05.IMPLEMENTATION/USER_STORIES -name "*.yaml" -o -name "*.yml" 2>/dev/null | sort
```

Announce: "Reviewing N passing stories with M screenshots."

## Step 2: Per-Story Review

For each **passing** story:

### 2a. Read the story's YAML

Read the story's acceptance criteria, given/when/then steps. Understand what was specified — what should the user see? What interactions should work? What content should appear?

### 2b. Read the story's screenshots

Find screenshots matching the story ID (e.g., `cypress/screenshots/**/US-101--*.png`). Read each screenshot image.

### 2c. Judge: does the implementation match the story?

Compare what the screenshot shows against what the story specifies. Check for:

**placeholder_text** (blocker)
- Literal text describing a visual element instead of the actual element (e.g., "Next Arrow" instead of →, "Star Icon" instead of ★)
- Lorem ipsum or obvious filler content where real content should be
- Template syntax visible in rendered output (`{{variable}}`, `{slot}`, `$ARGUMENTS`)

**visual_quality** (blocker or warning)
- Elements that appear broken: overlapping text, cut-off content, invisible text
- Empty sections that should have content per the story
- Icons rendered as text boxes or missing entirely
- Layout clearly different from what the story's interaction pattern describes

**impl_error** (blocker)
- Content that contradicts what SEED.md or spec says (impl got it wrong)
- Features described in the story but visibly missing or non-functional in the screenshot
- Wrong data displayed (e.g., wrong version number, wrong product name)

## Step 3: Global Source Review (~2 turns)

Read application source files and check across all stories:

**broken_links** (blocker)
- Extract all `href`, `src`, and `action` attribute values from source
- Cross-reference URLs against SEED.md — flag any URL not traceable to SEED.md or the spec
- Check for hallucinated GitHub URLs, CDN links to non-existent resources
- Internal links must match routes that exist (cross-reference with story `visit` paths)

**accessibility** (warning)
- Images without meaningful `alt` text (empty or missing)
- Interactive elements (buttons, links) without accessible labels
- Non-semantic HTML for interactive content (div with onClick instead of button)

## Step 4: Write Results

Write `rootspec/review-status.json`:

```json
{
  "lastReview": "<ISO timestamp>",
  "status": "pass|fail",
  "summary": { "blockers": 0, "warnings": 0, "nitpicks": 0 },
  "issues": [
    {
      "id": "REV-001",
      "severity": "blocker|warning|nitpick",
      "category": "placeholder_text|visual_quality|impl_error|broken_links|accessibility",
      "story": "US-103",
      "file": "src/components/Wizard.tsx",
      "line": 42,
      "screenshot": "cypress/screenshots/mvp.cy.ts/US-103--AC-103-1.png",
      "description": "What is wrong",
      "expected": "What spec/story says it should be",
      "actual": "What it currently is",
      "suggestion": "How to fix"
    }
  ]
}
```

**Severity rules:**
- **blocker**: Broken links, literal icon text, content contradicting spec/SEED.md, missing specified features
- **warning**: Accessibility gaps, minor visual issues, slightly stale copy
- **nitpick**: Subjective style preferences, could-be-better patterns

**Status:** `"pass"` if zero blockers, `"fail"` if any blockers.

## Step 5: Quality Score

Compute a quality score (0-100) using this rubric:

| Category | Max Points | Deductions |
|----------|-----------|------------|
| Content accuracy | 30 | -10 per broken link, -5 per wrong copy |
| Visual fidelity | 25 | -15 per literal icon text, -10 per visible placeholder |
| Spec alignment | 25 | -10 per story where screenshot contradicts acceptance criteria |
| Accessibility | 10 | -5 per missing alt text, -5 per non-semantic interactive element |
| Polish | 10 | -5 per visible template syntax/TODO/artifact |

Score = 100 - total deductions (floor at 0).

Add to `review-status.json`:

```json
{
  "qualityScore": {
    "score": 82,
    "breakdown": {
      "content": 25,
      "visual": 25,
      "alignment": 20,
      "accessibility": 7,
      "polish": 5
    }
  }
}
```

## Step 6: Report

If pass: "Review passed (score: N/100). M warnings, K nitpicks — no blockers."

If fail: List each blocker with file path, screenshot, what's wrong, and suggested fix.

Record stats:

```bash
COMPLETED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
bash "$SHARED_DIR/scripts/write-stats.sh" rootspec/stats.json rs-review "$STARTED_AT" "$COMPLETED_AT"
```

## Focus

- No focus → review all passing stories
- `"US-101"` → review specific story only
- `"links"` → only check broken links
- `"visual"` → only check visual quality + placeholder text

## Scope

- **CAN read:** All project files, screenshots, SEED.md, spec files, source code
- **CAN write:** `rootspec/review-status.json`, `rootspec/stats.json`
- **CANNOT write:** Application code, spec files, test files, configuration files
