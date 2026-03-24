#!/usr/bin/env bash
# extract-l5-journeys.sh — Extract unique @journey annotations from YAML user stories
# Usage: bash extract-l5-journeys.sh <spec-dir>
# Output: one journey name per line

set -euo pipefail

SPEC_DIR="${1:-.}"
STORIES_DIR="$SPEC_DIR/05.IMPLEMENTATION/USER_STORIES"

if [[ ! -d "$STORIES_DIR" ]]; then
  exit 0
fi

# Extract @journey values from YAML comment annotations
grep -rh '@journey:' "$STORIES_DIR" 2>/dev/null \
  | sed 's/.*@journey:\s*//' \
  | sed 's/\s*$//' \
  | sort -u
