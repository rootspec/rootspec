#!/usr/bin/env bash
# assess.sh — Front-load ALL reading for rs-impl in a single call
# Usage: bash assess.sh <project-root> [shared-dir]
# Output: structured text with all context the implementation agent needs
#
# Sections are delimited by ===== SECTION_NAME ===== lines.
# Parse the output to extract each section.

set -euo pipefail

ROOT="${1:-.}"
SHARED_DIR="${2:-$(cd "$(dirname "$0")/.." && pwd)}"

section() { printf '\n===== %s =====\n' "$1"; }

# 1. Scan spec
section "SCAN_SPEC"
bash "$SHARED_DIR/scripts/scan-spec.sh" "$ROOT" 2>/dev/null || echo "STATUS=no_spec"

# 2. Scan project
section "SCAN_PROJECT"
bash "$SHARED_DIR/scripts/scan-project.sh" "$ROOT" 2>/dev/null || true

# 3. spec-status.json
section "SPEC_STATUS"
cat "$ROOT/rootspec/spec-status.json" 2>/dev/null || echo '{"valid":false}'

# 4. tests-status.json
section "TESTS_STATUS"
cat "$ROOT/rootspec/tests-status.json" 2>/dev/null || echo '{"lastRun":null,"stories":{}}'

# 5. .rootspec.json (dev server, test command config)
section "ROOTSPEC_JSON"
cat "$ROOT/.rootspec.json" 2>/dev/null || echo '{}'

# 6. All YAML story files
SPEC_DIR=""
if [[ -f "$ROOT/.rootspec.json" ]]; then
  SPEC_DIR=$(grep -o '"specDirectory"[[:space:]]*:[[:space:]]*"[^"]*"' "$ROOT/.rootspec.json" 2>/dev/null | head -1 | sed 's/.*"specDirectory"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')
fi
SPEC_DIR="${SPEC_DIR:-rootspec}"
STORIES_DIR="$ROOT/$SPEC_DIR/05.IMPLEMENTATION/USER_STORIES"

if [[ -d "$STORIES_DIR" ]]; then
  # Use by_phase view to avoid duplicate reads (by_journey and by_system are symlinks/copies)
  PHASE_DIR="$STORIES_DIR/by_phase"
  if [[ -d "$PHASE_DIR" ]]; then
    find "$PHASE_DIR" \( -name "*.yaml" -o -name "*.yml" \) 2>/dev/null | sort | while IFS= read -r f; do
      section "YAML:$(echo "$f" | sed "s|$ROOT/||")"
      cat "$f"
    done
  else
    # Fallback: read all YAML files, dedup by content hash
    find "$STORIES_DIR" \( -name "*.yaml" -o -name "*.yml" \) 2>/dev/null | sort -u | while IFS= read -r f; do
      section "YAML:$(echo "$f" | sed "s|$ROOT/||")"
      cat "$f"
    done
  fi
fi

# 7. Conventions docs
for f in "$ROOT/$SPEC_DIR/CONVENTIONS/technical.md" "$ROOT/$SPEC_DIR/CONVENTIONS/visual.md"; do
  if [[ -f "$f" ]]; then
    section "CONVENTIONS:$(basename "$f")"
    cat "$f"
  fi
done

# 8. package.json scripts (for test command resolution)
section "PACKAGE_SCRIPTS"
if [[ -f "$ROOT/package.json" ]]; then
  # Extract just the scripts block
  node -e "const p=require('./$ROOT/package.json'); console.log(JSON.stringify(p.scripts||{},null,2))" 2>/dev/null \
    || grep -A 30 '"scripts"' "$ROOT/package.json" 2>/dev/null \
    || echo '{}'
else
  echo '{}'
fi

# 9. Fragments — only include compact summaries, not full docs
section "FRAGMENT:dsl-steps"
echo "Core DSL steps: visit, click, fill, loginAs, seedItem, shouldContain, shouldExist"
echo "Extension: add to Step union type in steps.ts + implement in runSetupSteps/runAssertionSteps + register in schema.ts"
echo "CRITICAL: Do NOT use cy.readFile() outside it() blocks — embed YAML as string literals in test files"

section "END"
