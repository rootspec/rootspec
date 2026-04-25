#!/usr/bin/env bash
# detect-stack.sh — Detect a project's frontend framework and emit dev/preview commands.
# Usage: bash detect-stack.sh [project-root]
# Output: structured key=value lines for skill scripts to consume:
#   STACK=astro|vite|next|nuxt|sveltekit|eleventy|remix|unknown
#   DEV_CMD=<command for the dev server, or empty if unknown>
#   PREVIEW_CMD=<command for the preview server, or empty if unknown>
#   PORT=<canonical dev port for the stack>
#
# Detection priority:
#   1. .rootspec.json prerequisites.detected.devCmd / previewCmd
#      (captured by bootstrap-init.sh from the project's original
#      package.json scripts before the wrapper rewrite)
#   2. Framework config-file presence (astro.config.*, vite.config.*, etc.)
#   3. devDependency inspection in package.json
# When all three return nothing, STACK=unknown and DEV_CMD/PREVIEW_CMD are empty.

set -euo pipefail

ROOT="${1:-.}"

STACK="unknown"
DEV_CMD=""
PREVIEW_CMD=""
PORT=""

# --- 1. Prefer captured-original from .rootspec.json ---
SAVED_DEV=""
SAVED_PREVIEW=""
if [[ -f "$ROOT/.rootspec.json" ]]; then
  SAVED_DEV=$(grep -o '"devCmd"[[:space:]]*:[[:space:]]*"[^"]*"' "$ROOT/.rootspec.json" 2>/dev/null \
    | head -1 | sed 's/.*"devCmd"[[:space:]]*:[[:space:]]*"//' | sed 's/"$//')
  SAVED_PREVIEW=$(grep -o '"previewCmd"[[:space:]]*:[[:space:]]*"[^"]*"' "$ROOT/.rootspec.json" 2>/dev/null \
    | head -1 | sed 's/.*"previewCmd"[[:space:]]*:[[:space:]]*"//' | sed 's/"$//')
fi

# Saved-original commands may themselves be `./scripts/dev.sh start` or
# `npm run dev` from a previously-bootstrapped project — those would recurse.
# Reject and fall through to detection in that case.
is_recursive_cmd() {
  case "$1" in
    *"npm run dev"*|*"npm run preview"*|*"yarn dev"*|*"yarn preview"*) return 0 ;;
    *"pnpm dev"*|*"pnpm preview"*|*"bun run dev"*|*"bun run preview"*) return 0 ;;
    *"./scripts/dev.sh"*|*"./scripts/preview.sh"*) return 0 ;;
    "") return 0 ;;
    *) return 1 ;;
  esac
}

# --- 2. Framework detection by config file presence ---
if [[ -f "$ROOT/astro.config.mjs" ]] || [[ -f "$ROOT/astro.config.ts" ]] || [[ -f "$ROOT/astro.config.js" ]]; then
  STACK="astro"; PORT="4321"
  DEV_CMD="npx astro dev --port ${PORT}"
  PREVIEW_CMD="npx astro preview --port ${PORT}"
elif [[ -f "$ROOT/svelte.config.js" ]] || [[ -f "$ROOT/svelte.config.ts" ]]; then
  STACK="sveltekit"; PORT="5173"
  DEV_CMD="npx vite dev --port ${PORT}"
  PREVIEW_CMD="npx vite preview --port 4173"
elif [[ -f "$ROOT/next.config.js" ]] || [[ -f "$ROOT/next.config.ts" ]] || [[ -f "$ROOT/next.config.mjs" ]]; then
  STACK="next"; PORT="3000"
  DEV_CMD="npx next dev -p ${PORT}"
  PREVIEW_CMD="npx next start -p ${PORT}"
elif [[ -f "$ROOT/nuxt.config.ts" ]] || [[ -f "$ROOT/nuxt.config.js" ]]; then
  STACK="nuxt"; PORT="3000"
  DEV_CMD="npx nuxt dev --port ${PORT}"
  PREVIEW_CMD="npx nuxt preview --port ${PORT}"
elif [[ -f "$ROOT/remix.config.js" ]] || [[ -f "$ROOT/remix.config.ts" ]]; then
  STACK="remix"; PORT="3000"
  DEV_CMD="npx remix vite:dev --port ${PORT}"
  PREVIEW_CMD="npx remix-serve build/server/index.js"
elif [[ -f "$ROOT/.eleventy.js" ]] || [[ -f "$ROOT/eleventy.config.js" ]] || [[ -f "$ROOT/eleventy.config.mjs" ]]; then
  STACK="eleventy"; PORT="8080"
  DEV_CMD="npx eleventy --serve --port=${PORT}"
  PREVIEW_CMD="npx eleventy --serve --port=${PORT}"
elif [[ -f "$ROOT/vite.config.ts" ]] || [[ -f "$ROOT/vite.config.js" ]] || [[ -f "$ROOT/vite.config.mjs" ]]; then
  STACK="vite"; PORT="5173"
  DEV_CMD="npx vite dev --port ${PORT}"
  PREVIEW_CMD="npx vite preview --port 4173"
fi

# --- 3. devDependency fallback (config file may be absent in monorepo subprojects) ---
if [[ "$STACK" == "unknown" && -f "$ROOT/package.json" ]]; then
  if grep -qE '"astro"[[:space:]]*:' "$ROOT/package.json" 2>/dev/null; then
    STACK="astro"; PORT="4321"
    DEV_CMD="npx astro dev --port ${PORT}"
    PREVIEW_CMD="npx astro preview --port ${PORT}"
  elif grep -qE '"@sveltejs/kit"[[:space:]]*:' "$ROOT/package.json" 2>/dev/null; then
    STACK="sveltekit"; PORT="5173"
    DEV_CMD="npx vite dev --port ${PORT}"
    PREVIEW_CMD="npx vite preview --port 4173"
  elif grep -qE '"next"[[:space:]]*:' "$ROOT/package.json" 2>/dev/null; then
    STACK="next"; PORT="3000"
    DEV_CMD="npx next dev -p ${PORT}"
    PREVIEW_CMD="npx next start -p ${PORT}"
  elif grep -qE '"nuxt"[[:space:]]*:' "$ROOT/package.json" 2>/dev/null; then
    STACK="nuxt"; PORT="3000"
    DEV_CMD="npx nuxt dev --port ${PORT}"
    PREVIEW_CMD="npx nuxt preview --port ${PORT}"
  elif grep -qE '"@remix-run/' "$ROOT/package.json" 2>/dev/null; then
    STACK="remix"; PORT="3000"
    DEV_CMD="npx remix vite:dev --port ${PORT}"
    PREVIEW_CMD="npx remix-serve build/server/index.js"
  elif grep -qE '"@11ty/eleventy"[[:space:]]*:' "$ROOT/package.json" 2>/dev/null; then
    STACK="eleventy"; PORT="8080"
    DEV_CMD="npx eleventy --serve --port=${PORT}"
    PREVIEW_CMD="npx eleventy --serve --port=${PORT}"
  elif grep -qE '"vite"[[:space:]]*:' "$ROOT/package.json" 2>/dev/null; then
    STACK="vite"; PORT="5173"
    DEV_CMD="npx vite dev --port ${PORT}"
    PREVIEW_CMD="npx vite preview --port 4173"
  fi
fi

# --- 4. Saved-original overrides config-detected default when non-recursive ---
# Brownfield projects often ship custom port/host flags in their original
# package.json scripts; preserve them rather than substituting our defaults.
if ! is_recursive_cmd "$SAVED_DEV"; then
  DEV_CMD="$SAVED_DEV"
fi
if ! is_recursive_cmd "$SAVED_PREVIEW"; then
  PREVIEW_CMD="$SAVED_PREVIEW"
fi

echo "STACK=$STACK"
echo "DEV_CMD=$DEV_CMD"
echo "PREVIEW_CMD=$PREVIEW_CMD"
echo "PORT=$PORT"
