#!/usr/bin/env bash
# extract-l1-pillars.sh — Extract Design Pillar names from Level 1
# Usage: bash extract-l1-pillars.sh <spec-dir>
# Output: one pillar name per line

set -euo pipefail

SPEC_DIR="${1:-.}"
L1_FILE="$SPEC_DIR/01.FOUNDATIONAL_PHILOSOPHY.md"

if [[ ! -f "$L1_FILE" ]]; then
  exit 0
fi

# Extract ### headings within the "## Design Pillars" section
awk '
  /^## Design Pillars/,/^## / {
    if (/^### /) {
      sub(/^### +/, "")
      print
    }
  }
' "$L1_FILE"
