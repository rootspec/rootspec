#!/usr/bin/env bash
# check-app-ready.sh — Detect shallow cy.appReady() in projects with deferred-execution boundaries.
# Usage: bash check-app-ready.sh [project-root]
# Exit:  0 = OK (no mismatch), 1 = mismatch (shallow appReady + deferred-execution markers found).
#
# Background: cy.appReady() is project-defined. The framework can't know what
# "ready" means for a given app, but it CAN detect when the chosen check is
# trivially insufficient for the rendering stack — e.g., resolving on
# document.readyState in a project that mounts hydration islands or lazy
# components. Those markers fire BEFORE the components are interactive; tests
# that visit and click pass intermittently and fail loud on the first miss.
#
# If app-ready.ts doesn't exist or the project has no deferred-execution
# markers, this is a no-op success.

set -euo pipefail

ROOT="${1:-.}"
APP_READY="$ROOT/cypress/support/app-ready.ts"

# Nothing to check if the project hasn't generated app-ready.ts yet.
if [[ ! -f "$APP_READY" ]]; then
  exit 0
fi

# --- Detect shallow appReady patterns ---
# Each pattern below is a check the framework considers insufficient when
# deferred-execution boundaries are present. Matching one is necessary but
# not sufficient — the violation only fires when markers are also present.
SHALLOW_HITS=()

# document.readyState — fires before any client-side execution starts
if grep -qE "document\(\)\.its\(['\"]readyState['\"]" "$APP_READY" 2>/dev/null \
   || grep -qE "readyState['\"][[:space:]]*\)" "$APP_READY" 2>/dev/null; then
  SHALLOW_HITS+=("document.readyState")
fi

# cy.wrap(true) / cy.wrap(undefined) — unconditional resolution
if grep -qE "cy\.wrap\((true|undefined|null|\{\}|1)\)" "$APP_READY" 2>/dev/null; then
  SHALLOW_HITS+=("cy.wrap(<constant>) — unconditional resolution")
fi

# body presence with no further assertion (e.g., cy.get('body') with nothing chained)
if grep -qE "cy\.get\(['\"]body['\"]\)[[:space:]]*[;}]" "$APP_READY" 2>/dev/null; then
  SHALLOW_HITS+=("cy.get('body') with no assertion")
fi

# Empty Commands.add body — () => {} or arrow with only a return
if grep -qE "Commands\.add\(['\"]appReady['\"],[[:space:]]*\(\)[[:space:]]*=>[[:space:]]*\{[[:space:]]*\}[[:space:]]*\)" "$APP_READY" 2>/dev/null; then
  SHALLOW_HITS+=("empty appReady body")
fi

# If the implementation isn't shallow, we're done — the app-ready check is
# the project's call. We only flag the combination that produces flake.
if [[ ${#SHALLOW_HITS[@]} -eq 0 ]]; then
  exit 0
fi

# --- Detect deferred-execution markers in the project ---
# Framework-agnostic: covers Astro client:*, React Server Components 'use client'
# islands, React.lazy/Suspense, Next.js dynamic(), Vue defineAsyncComponent.
# Search common source roots; ignore node_modules and build output.
SEARCH_ROOTS=()
for d in src app pages components islands; do
  [[ -d "$ROOT/$d" ]] && SEARCH_ROOTS+=("$ROOT/$d")
done

# Fall back to project root if no conventional source dir exists.
if [[ ${#SEARCH_ROOTS[@]} -eq 0 ]]; then
  SEARCH_ROOTS=("$ROOT")
fi

MARKER_HITS=()

# grep helpers — quiet, recursive, exclude node_modules / dist / .git / cypress
grep_marker() {
  local pattern="$1"
  grep -rEln \
    --exclude-dir=node_modules \
    --exclude-dir=dist \
    --exclude-dir=.git \
    --exclude-dir=cypress \
    --exclude-dir=.astro \
    --exclude-dir=.next \
    --exclude-dir=.svelte-kit \
    "$pattern" "${SEARCH_ROOTS[@]}" 2>/dev/null | head -3 || true
}

add_hits() {
  local label="$1"
  local files="$2"
  if [[ -n "$files" ]]; then
    while IFS= read -r f; do
      [[ -z "$f" ]] && continue
      MARKER_HITS+=("$label: ${f#$ROOT/}")
    done <<< "$files"
  fi
}

add_hits "client:* directive (Astro)"             "$(grep_marker 'client:(load|idle|visible|only|media)')"
add_hits "'use client' directive (RSC island)"     "$(grep_marker "^[[:space:]]*['\"]use client['\"]")"
add_hits "React.lazy / lazy() import"              "$(grep_marker '(React\.lazy|^[[:space:]]*const[[:space:]]+[A-Za-z0-9_]+[[:space:]]*=[[:space:]]*lazy\()')"
add_hits "<Suspense> boundary"                     "$(grep_marker '<Suspense[[:space:]>]')"
add_hits "dynamic() import (Next.js)"              "$(grep_marker '=[[:space:]]*dynamic\(')"
add_hits "defineAsyncComponent (Vue)"              "$(grep_marker 'defineAsyncComponent\(')"

# No markers → static project, shallow check is fine.
if [[ ${#MARKER_HITS[@]} -eq 0 ]]; then
  exit 0
fi

# --- Both present: hard fail with actionable message ---
{
  echo ""
  echo "✗ App-readiness mismatch (cypress/support/app-ready.ts)"
  echo ""
  echo "  Shallow check detected:"
  for h in "${SHALLOW_HITS[@]}"; do
    echo "    - $h"
  done
  echo ""
  echo "  Deferred-execution boundaries found in the project:"
  for h in "${MARKER_HITS[@]}"; do
    echo "    - $h"
  done
  echo ""
  echo "  These boundaries become interactive AFTER the document-level signal"
  echo "  fires. cy.appReady() must wait on a signal those boundaries emit"
  echo "  when fully active — not on document.readyState, body presence, or"
  echo "  unconditional resolution."
  echo ""
  echo "  Fix: edit cypress/support/app-ready.ts to wait on a real readiness"
  echo "  signal from those components (a global, an attribute, polled state,"
  echo "  an event). Document the chosen mechanism in"
  echo "  rootspec/CONVENTIONS/technical.md → App Readiness."
  echo ""
} >&2

exit 1
