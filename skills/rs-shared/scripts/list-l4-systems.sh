#!/usr/bin/env bash
# list-l4-systems.sh — List Level 4 system files
# Usage: bash list-l4-systems.sh <spec-dir>
# Output: one system file path per line

set -euo pipefail

SPEC_DIR="${1:-.}"
SYSTEMS_DIR="$SPEC_DIR/04.SYSTEMS"

if [[ ! -d "$SYSTEMS_DIR" ]]; then
  exit 0
fi

# List all .md files except SYSTEMS_OVERVIEW
find "$SYSTEMS_DIR" -maxdepth 1 -name "*.md" ! -name "SYSTEMS_OVERVIEW.md" | sort
