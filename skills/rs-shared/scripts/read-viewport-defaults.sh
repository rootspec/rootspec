#!/usr/bin/env bash
# read-viewport-defaults.sh — Resolve journey→viewport map for a project.
# Usage: bash read-viewport-defaults.sh <project-root>
# Output: lines of JOURNEY_NAME=WIDTHxHEIGHT (one per known journey).
#
# Resolution order:
#   1. CONVENTIONS/technical.md → "Test Viewports" section (project override)
#   2. ../viewport-defaults.json (framework defaults)
#
# CONVENTIONS entries shaped as:
#   ### Test Viewports
#   - **MOBILE_JOURNEY:** 375x667
#   - **TABLET_JOURNEY:** 768x1024
#
# A project entry overrides the framework default for that journey.
# Framework entries unmentioned by the project pass through unchanged.

set -euo pipefail

ROOT="${1:-.}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SHARED_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DEFAULTS_JSON="$SHARED_DIR/viewport-defaults.json"

# Locate CONVENTIONS/technical.md via specDirectory in .rootspec.json (default: rootspec/)
SPEC_DIR="rootspec"
if [[ -f "$ROOT/.rootspec.json" ]]; then
  PARSED_DIR=$(grep -o '"specDirectory"[[:space:]]*:[[:space:]]*"[^"]*"' "$ROOT/.rootspec.json" 2>/dev/null \
    | head -1 | sed 's/.*"specDirectory"[[:space:]]*:[[:space:]]*"//' | sed 's/"//')
  [[ -n "$PARSED_DIR" ]] && SPEC_DIR="$PARSED_DIR"
fi
TECH_MD="$ROOT/$SPEC_DIR/CONVENTIONS/technical.md"

node -e "
const fs = require('fs');
const defaultsPath = '$DEFAULTS_JSON';
const techPath = '$TECH_MD';

let defaults = {};
try { defaults = JSON.parse(fs.readFileSync(defaultsPath, 'utf8')); } catch {}

const map = {};
for (const [name, vp] of Object.entries(defaults)) {
  if (vp && vp.width && vp.height) map[name] = { width: vp.width, height: vp.height };
}

if (fs.existsSync(techPath)) {
  const md = fs.readFileSync(techPath, 'utf8');
  // Find '### Test Viewports' through next heading (### or ## or end of file)
  const m = md.match(/###\s+Test Viewports\s*\n([\s\S]*?)(?=\n##|\n###|\$)/i);
  if (m) {
    const block = m[1];
    const re = /-\s*\*\*([A-Z_]+):\*\*\s*(\d+)x(\d+)/gi;
    let entry;
    while ((entry = re.exec(block)) !== null) {
      const [, name, w, h] = entry;
      map[name] = { width: parseInt(w, 10), height: parseInt(h, 10) };
    }
  }
}

for (const [name, vp] of Object.entries(map)) {
  console.log(name + '=' + vp.width + 'x' + vp.height);
}
"
