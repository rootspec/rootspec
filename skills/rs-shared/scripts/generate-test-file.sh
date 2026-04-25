#!/usr/bin/env bash
# generate-test-file.sh — Build a Cypress test file from spec YAML stories
# Usage: bash generate-test-file.sh <spec-dir> <output-path> [phase-filter]
#
# Reads YAML story files (multi-doc or array format), embeds them as string
# literals in a Cypress test file using the loadAndRun() pattern.
#
# If output file already exists, appends only NEW stories (by ID).
# Strips narrative fields and non-core DSL steps from embedded YAML.

set -euo pipefail

SPEC_DIR="${1:?Usage: generate-test-file.sh <spec-dir> <output-path> [phase-filter]}"
OUTPUT="${2:?Usage: generate-test-file.sh <spec-dir> <output-path> [phase-filter]}"
PHASE="${3:-}"

STORIES_DIR="$SPEC_DIR/05.IMPLEMENTATION/USER_STORIES"

if [[ ! -d "$STORIES_DIR" ]]; then
  echo "ERROR: No user stories directory at $STORIES_DIR" >&2
  exit 1
fi

# Require node and js-yaml
if ! command -v node &>/dev/null; then
  echo "ERROR: node is required" >&2
  exit 1
fi

# Find YAML files — search ALL directories, dedup by story ID in node
# If a phase filter is given, prefer by_phase/$PHASE but also search everywhere
YAML_FILES=()
if [[ -n "$PHASE" ]]; then
  # Phase-specific: search by_phase/$PHASE first, then all dirs for that phase annotation
  PHASE_DIR="$STORIES_DIR/by_phase/$PHASE"
  if [[ -d "$PHASE_DIR" ]]; then
    while IFS= read -r f; do YAML_FILES+=("$f"); done < <(find "$PHASE_DIR" \( -name "*.yaml" -o -name "*.yml" \) 2>/dev/null | sort)
  fi
  # Also search all other dirs for stories tagged with this phase (catches incomplete by_phase/)
  while IFS= read -r f; do
    # Skip files already found in by_phase
    already=false
    for existing in "${YAML_FILES[@]}"; do
      [[ "$f" == "$existing" ]] && already=true && break
    done
    $already && continue
    # Check if file has the phase annotation
    if grep -qi "@phase:.*${PHASE}" "$f" 2>/dev/null; then
      YAML_FILES+=("$f")
    fi
  done < <(find "$STORIES_DIR" \( -name "*.yaml" -o -name "*.yml" \) 2>/dev/null | sort)
fi

# No phase filter or no results: search everything
if [[ ${#YAML_FILES[@]} -eq 0 ]]; then
  while IFS= read -r f; do YAML_FILES+=("$f"); done < <(find "$STORIES_DIR" \( -name "*.yaml" -o -name "*.yml" \) 2>/dev/null | sort)
fi

if [[ ${#YAML_FILES[@]} -eq 0 ]]; then
  echo "ERROR: No YAML files found in $STORIES_DIR" >&2
  exit 1
fi

# Resolve journey -> viewport map (CONVENTIONS overrides + framework defaults).
# Empty if read-viewport-defaults.sh is missing or finds nothing — generator
# falls back to no injection in that case.
SCRIPT_DIR_GEN="$(cd "$(dirname "$0")" && pwd)"
VIEWPORT_LINES=""
if [[ -x "$SCRIPT_DIR_GEN/read-viewport-defaults.sh" ]]; then
  PROJECT_ROOT="$(cd "$SPEC_DIR/.." && pwd)"
  VIEWPORT_LINES=$(bash "$SCRIPT_DIR_GEN/read-viewport-defaults.sh" "$PROJECT_ROOT" 2>/dev/null || true)
fi

# Collect existing story IDs from output file
EXISTING_IDS=""
if [[ -f "$OUTPUT" ]]; then
  EXISTING_IDS=$(grep -oE 'US-[0-9]+' "$OUTPUT" 2>/dev/null | sort -u | tr '\n' ',' || true)
fi

# Use node to parse YAML, extract stories, clean them, and output TypeScript
FILE_LIST=$(printf '%s\n' "${YAML_FILES[@]}")
RESULT=$(VIEWPORT_LINES="$VIEWPORT_LINES" node -e "
const fs = require('fs');
const yaml = require('js-yaml');

const CORE_SETUP_STEPS = new Set(['visit', 'click', 'fill', 'loginAs', 'seedItem', 'awaitReady', 'setViewport']);
const CORE_ASSERT_STEPS = new Set(['shouldContain', 'shouldExist', 'shouldHaveNoOverflowX', 'shouldFitViewport']);
const ALL_CORE = new Set([...CORE_SETUP_STEPS, ...CORE_ASSERT_STEPS]);
const UNIVERSAL_SELECTORS = new Set(['body', 'html', 'main', '#root', '#app', '#__next']);
const LAYOUT_TITLE_RE = /horizontal scroll|overflow|fit|tap target|44.{0,4}px|viewport|narrow|wide|breakpoint|responsive/i;

// Parse journey->viewport map from VIEWPORT_LINES env var (one JOURNEY=WxH per line)
const viewportMap = {};
const vpRaw = (process.env.VIEWPORT_LINES || '').split('\n').filter(Boolean);
for (const line of vpRaw) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(\d+)x(\d+)$/);
  if (m) viewportMap[m[1]] = { width: parseInt(m[2], 10), height: parseInt(m[3], 10) };
}

function resolveJourneyViewport(journey) {
  if (!journey) return null;
  if (viewportMap[journey]) return viewportMap[journey];
  // Pattern fallback: MOBILE_* matches MOBILE_JOURNEY default, etc.
  const prefix = journey.split('_')[0];
  const fallbackKey = prefix + '_JOURNEY';
  return viewportMap[fallbackKey] || null;
}

const existingIds = new Set('${EXISTING_IDS}'.split(',').filter(Boolean));
const files = \`${FILE_LIST}\`.trim().split('\n').filter(Boolean);

let added = 0, skipped = 0, warnings = [];
const storyBlocks = [];

for (const file of files) {
  let content;
  try { content = fs.readFileSync(file, 'utf8'); } catch { continue; }

  // Pre-pass: build storyId -> journey map from comment annotations.
  // js-yaml strips comments, so journey tags must be parsed from raw text.
  // Walk lines: each '# @journey: NAME' sets a pending value; the next
  // 'id: STORY_ID' line claims it.
  const journeyById = {};
  const rawLines = content.split('\n');
  let pendingJourney = null;
  for (const line of rawLines) {
    const j = line.match(/#\s*@journey:\s*([A-Z][A-Z0-9_]*)/i);
    if (j) { pendingJourney = j[1].toUpperCase(); continue; }
    const idMatch = line.match(/^\s*-?\s*id:\s*([A-Za-z0-9_-]+)/);
    if (idMatch) { journeyById[idMatch[1]] = pendingJourney; }
  }

  // Parse multi-doc YAML
  let docs;
  try { docs = yaml.loadAll(content); } catch { continue; }

  for (const doc of docs) {
    if (!doc) continue;

    // Handle both formats: direct story object or array of stories
    const stories = Array.isArray(doc) ? doc : (doc.id ? [doc] : (Array.isArray(doc.stories) ? doc.stories : []));

    for (const story of stories) {
      if (!story || !story.id || !story.acceptance_criteria) continue;
      if (existingIds.has(story.id)) continue;
      const journey = journeyById[story.id] || null;
      const journeyViewport = resolveJourneyViewport(journey);

      // Check for DSL format and filter to core steps only
      let hasDslSteps = false;
      const cleanedAC = [];

      for (const ac of story.acceptance_criteria) {
        const cleanAc = { id: ac.id, title: ac.title };

        // Clean given/when/then — keep only core DSL steps
        for (const phase of ['given', 'when', 'then']) {
          if (Array.isArray(ac[phase])) {
            const filtered = ac[phase].filter(step => {
              if (typeof step !== 'object') return false;
              const key = Object.keys(step)[0];
              if (ALL_CORE.has(key)) { hasDslSteps = true; return true; }
              warnings.push(story.id + ': stripped non-core step \"' + key + '\"');
              return false;
            });
            if (filtered.length > 0) cleanAc[phase] = filtered;
          }
        }

        // Ensure at least empty arrays
        if (!cleanAc.given) cleanAc.given = [{ visit: '/' }];
        if (!cleanAc.when) cleanAc.when = [];
        if (!cleanAc.then) cleanAc.then = [];

        // Inject viewport from journey default if absent and journey resolves.
        // Per-story override wins: if author set setViewport in given, leave it.
        if (journeyViewport && !cleanAc.given.some(s => s && typeof s === 'object' && 'setViewport' in s)) {
          cleanAc.given.unshift({ setViewport: { width: journeyViewport.width, height: journeyViewport.height } });
          hasDslSteps = true;
        }

        // Vacuous-assertion warning: layout-class title with only universal-
        // selector shouldExist assertions can't actually catch layout breakage.
        if (LAYOUT_TITLE_RE.test(ac.title || '')) {
          const thens = cleanAc.then;
          if (thens.length > 0 && thens.every(s => {
            if (typeof s !== 'object' || s === null) return false;
            const k = Object.keys(s)[0];
            if (k !== 'shouldExist') return false;
            const sel = s.shouldExist && s.shouldExist.selector;
            return typeof sel === 'string' && UNIVERSAL_SELECTORS.has(sel.trim().toLowerCase());
          })) {
            warnings.push(story.id + ':' + ac.id + ': assertion on universal selector may be vacuous for \"' + (ac.title || '') + '\" — consider shouldHaveNoOverflowX or shouldFitViewport');
          }
        }

        cleanedAC.push(cleanAc);
      }

      if (!hasDslSteps) {
        warnings.push(story.id + ': no core DSL steps found — skipping');
        skipped++;
        continue;
      }

      // Build clean YAML for this story
      const cleanStory = {
        id: story.id,
        title: story.title,
        acceptance_criteria: cleanedAC
      };

      const yamlStr = yaml.dump(cleanStory, { lineWidth: -1, noRefs: true, quotingType: \"'\" });
      const varName = 'stories_' + story.id.replace('US-', '').replace(/-/g, '_');

      storyBlocks.push({
        id: story.id,
        title: story.title,
        varName,
        yaml: yamlStr
      });

      existingIds.add(story.id);
      added++;
    }
  }
}

// Output as JSON for bash to consume
console.log(JSON.stringify({ added, skipped, warnings, storyBlocks }));
" 2>&1)

# Check for node errors
if [[ $? -ne 0 ]]; then
  echo "ERROR: node processing failed: $RESULT" >&2
  exit 1
fi

ADDED=$(echo "$RESULT" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(d.added)")
SKIPPED=$(echo "$RESULT" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8')); console.log(d.skipped)")

# Print warnings
echo "$RESULT" | node -e "
  const d=JSON.parse(require('fs').readFileSync(0,'utf8'));
  for (const w of d.warnings) console.error('WARNING: ' + w);
" 2>&1 >&2 || true

if [[ "$ADDED" -eq 0 ]]; then
  echo "No new stories to add ($SKIPPED skipped)"
  exit 0
fi

# Build TypeScript content from story blocks
TS_CONTENT=$(echo "$RESULT" | node -e "
  const d=JSON.parse(require('fs').readFileSync(0,'utf8'));
  const lines = [];
  for (const s of d.storyBlocks) {
    lines.push('');
    lines.push('// ' + s.id + ': ' + s.title);
    lines.push('const ' + s.varName + ' = \`');
    lines.push(s.yaml.trimEnd());
    lines.push('\`;');
    lines.push('loadAndRun(' + s.varName + ');');
  }
  console.log(lines.join('\n'));
")

HEADER='import * as yaml from '"'"'js-yaml'"'"';
import { UserStorySchema } from '"'"'../support/schema'"'"';
import type { UserStory } from '"'"'../support/schema'"'"';
import { runSetupSteps, runAssertionSteps } from '"'"'../support/steps'"'"';

function loadAndRun(yamlContent: string) {
  const docs = yaml.loadAll(yamlContent) as UserStory[];
  for (const doc of docs) {
    if (!doc || !doc.id) continue;
    const story = UserStorySchema.parse(doc);
    const describeFn = story.skip ? describe.skip : story.only ? describe.only : describe;
    describeFn(`${story.id}: ${story.title}`, () => {
      for (const ac of story.acceptance_criteria) {
        const itFn = ac.skip ? it.skip : ac.only ? it.only : it;
        itFn(`${ac.id}: ${ac.title}`, () => {
          if (ac.given) runSetupSteps(ac.given);
          if (ac.when) runSetupSteps(ac.when);
          if (ac.then) runAssertionSteps(ac.then);
        });
      }
    });
  }
}'

if [[ -f "$OUTPUT" ]]; then
  echo "$TS_CONTENT" >> "$OUTPUT"
  echo "Appended $ADDED new stories to $OUTPUT ($SKIPPED skipped)"
else
  mkdir -p "$(dirname "$OUTPUT")"
  printf '%s\n%s\n' "$HEADER" "$TS_CONTENT" > "$OUTPUT"
  echo "Created $OUTPUT with $ADDED stories ($SKIPPED skipped)"
fi
