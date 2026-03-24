#!/usr/bin/env bash
# list-l5-stories.sh — List Level 5 user story YAML files
# Usage: bash list-l5-stories.sh <spec-dir>
# Output: one YAML file path per line

set -euo pipefail

SPEC_DIR="${1:-.}"
STORIES_DIR="$SPEC_DIR/05.IMPLEMENTATION/USER_STORIES"

if [[ ! -d "$STORIES_DIR" ]]; then
  exit 0
fi

find "$STORIES_DIR" -name "*.yml" -o -name "*.yaml" | sort
