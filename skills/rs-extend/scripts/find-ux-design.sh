#!/usr/bin/env bash
# find-ux-design.sh — Locate UX design artifact (prerequisite for ui type)
# Usage: bash find-ux-design.sh <spec-dir>
# Output: path to UX design file, or "NOT_FOUND"

set -euo pipefail

SPEC_DIR="${1:-.}"

# Check conventional locations
for f in \
  "$SPEC_DIR/DERIVED_ARTIFACTS/UX_DESIGN.md" \
  "$SPEC_DIR/../DERIVED_ARTIFACTS/UX_DESIGN.md" \
  "./DERIVED_ARTIFACTS/UX_DESIGN.md" \
  "./docs/UX_DESIGN.md" \
  "./UX_DESIGN.md"; do
  if [[ -f "$f" ]]; then
    echo "$f"
    exit 0
  fi
done

echo "NOT_FOUND"
