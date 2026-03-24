#!/usr/bin/env bash
# extract-l3-patterns.sh — Extract interaction pattern names from Level 3
# Usage: bash extract-l3-patterns.sh <spec-dir>
# Output: one pattern name per line

set -euo pipefail

SPEC_DIR="${1:-.}"
L3_FILE="$SPEC_DIR/03.INTERACTION_ARCHITECTURE.md"

if [[ ! -f "$L3_FILE" ]]; then
  exit 0
fi

# Extract ## and ### headings, skip metadata sections
grep -E '^#{2,3} ' "$L3_FILE" \
  | sed 's/^##\{1,2\} //' \
  | grep -viE '^(Overview|Introduction|Summary|Interaction Architecture|Level 3|Table of Contents)$' \
  | sort -u

# Also extract "Loop:" or "Pattern:" prefixed items
grep -oiE '(Loop|Pattern):\s*.+' "$L3_FILE" 2>/dev/null \
  | sed 's/^[Ll]oop:\s*//' \
  | sed 's/^[Pp]attern:\s*//' \
  | sort -u
