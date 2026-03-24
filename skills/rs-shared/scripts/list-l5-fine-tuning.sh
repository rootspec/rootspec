#!/usr/bin/env bash
# list-l5-fine-tuning.sh — List Level 5 fine-tuning YAML files
# Usage: bash list-l5-fine-tuning.sh <spec-dir>
# Output: one YAML file path per line

set -euo pipefail

SPEC_DIR="${1:-.}"
TUNING_DIR="$SPEC_DIR/05.IMPLEMENTATION/FINE_TUNING"

if [[ ! -d "$TUNING_DIR" ]]; then
  exit 0
fi

find "$TUNING_DIR" -name "*.yml" -o -name "*.yaml" | sort
