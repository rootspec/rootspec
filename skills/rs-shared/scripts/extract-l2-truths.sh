#!/usr/bin/env bash
# extract-l2-truths.sh — Extract Stable Truth section names from Level 2
# Usage: bash extract-l2-truths.sh <spec-dir>
# Output: one truth name per line

set -euo pipefail

SPEC_DIR="${1:-.}"
L2_FILE="$SPEC_DIR/02.STABLE_TRUTHS.md"

if [[ ! -f "$L2_FILE" ]]; then
  exit 0
fi

# Extract ## headings, skip metadata sections
grep -E '^## ' "$L2_FILE" | sed 's/^## //' | grep -viE '^(Overview|Summary|Table of Contents)$'
