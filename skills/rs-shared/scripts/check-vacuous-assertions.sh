#!/usr/bin/env bash
# check-vacuous-assertions.sh — Flag acceptance criteria whose assertion is
# structurally valid but semantically empty for the criterion's intent.
#
# Usage: bash check-vacuous-assertions.sh <spec-dir>
# Output: lines of VACUOUS=<storyId>:<acId>:<reason>
# Exit: 0 always (advisory, not a gate).
#
# Heuristic: classify the AC title into a category and check the `then` block
# against the category's expected assertion shape.
#
# Categories:
#   layout/overflow — title mentions horizontal scroll, overflow, fit, tap
#     target, viewport bounds, narrow/wide. A `then` containing only
#     `shouldExist` against a universal selector (body, html, main, #root) is
#     vacuous: those elements always exist on a rendered page.
#   any — a `then` containing zero assertions is always vacuous.
#
# Stories without DSL `then` arrays (narrative-only ACs) are skipped.

set -euo pipefail

SPEC_DIR="${1:?Usage: check-vacuous-assertions.sh <spec-dir>}"
STORIES_DIR="$SPEC_DIR/05.IMPLEMENTATION/USER_STORIES"

if [[ ! -d "$STORIES_DIR" ]]; then
  exit 0
fi

if ! command -v node &>/dev/null; then
  echo "ERROR: node is required" >&2
  exit 1
fi

YAML_FILES=()
while IFS= read -r f; do YAML_FILES+=("$f"); done < <(find "$STORIES_DIR" \( -name "*.yaml" -o -name "*.yml" \) 2>/dev/null | sort)

if [[ ${#YAML_FILES[@]} -eq 0 ]]; then
  exit 0
fi

FILE_LIST=$(printf '%s\n' "${YAML_FILES[@]}")

node -e "
const fs = require('fs');
const yaml = require('js-yaml');

const files = \`${FILE_LIST}\`.trim().split('\n').filter(Boolean);
const UNIVERSAL = new Set(['body', 'html', 'main', '#root', '#app', '#__next']);
const LAYOUT_RE = /horizontal scroll|overflow|fit|tap target|44.{0,4}px|viewport|narrow|wide|breakpoint|responsive/i;

const seen = new Set();
const findings = [];

function record(storyId, acId, reason) {
  const key = storyId + ':' + acId + ':' + reason;
  if (seen.has(key)) return;
  seen.add(key);
  findings.push({ storyId, acId, reason });
}

for (const file of files) {
  let content;
  try { content = fs.readFileSync(file, 'utf8'); } catch { continue; }
  let docs;
  try { docs = yaml.loadAll(content); } catch { continue; }

  for (const doc of docs) {
    if (!doc) continue;
    const stories = Array.isArray(doc) ? doc : (doc.id ? [doc] : (Array.isArray(doc.stories) ? doc.stories : []));
    for (const story of stories) {
      if (!story || !story.id || !Array.isArray(story.acceptance_criteria)) continue;
      for (const ac of story.acceptance_criteria) {
        if (!ac || !ac.id) continue;
        const title = (ac.title || '').toString();
        const thens = Array.isArray(ac.then) ? ac.then : null;
        if (thens === null) continue; // narrative-only AC

        if (thens.length === 0) {
          record(story.id, ac.id, 'no_assertions');
          continue;
        }

        const isLayout = LAYOUT_RE.test(title);
        if (!isLayout) continue;

        // Layout-class title with only universal-selector shouldExist => vacuous
        const allUniversalExist = thens.every(step => {
          if (typeof step !== 'object' || step === null) return false;
          const key = Object.keys(step)[0];
          if (key !== 'shouldExist') return false;
          const sel = step.shouldExist && step.shouldExist.selector;
          return typeof sel === 'string' && UNIVERSAL.has(sel.trim().toLowerCase());
        });
        if (allUniversalExist) {
          record(story.id, ac.id, 'layout_assertion_on_universal_selector');
        }
      }
    }
  }
}

for (const f of findings) {
  console.log('VACUOUS=' + f.storyId + ':' + f.acId + ':' + f.reason);
}
"
