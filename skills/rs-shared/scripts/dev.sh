#!/usr/bin/env bash
# dev.sh — Dev server with process management
# Usage: ./scripts/dev.sh [start|stop|restart|status|logs]
# Copied into projects by /rs-init. Populated by /rs-impl from detected stack.
#
# Layering contract (see rootspec/00.FRAMEWORK.md → Dev Server Wrapper):
#   package.json "dev"/"start"/"preview" scripts MUST go through this wrapper.
#   This wrapper MUST call the framework binary directly (e.g.
#   `npx astro dev --port 4321`, `npx vite dev --port 5173`). It MUST NOT call
#   `npm run dev` (which calls this wrapper → infinite recursion) or itself.
#   The self-check in do_start() enforces this.

set -euo pipefail

# --- Configuration ---
# DEV_CMD is left empty intentionally. /rs-impl writes the framework command
# here based on the detected stack and records the choice in
# rootspec/CONVENTIONS/technical.md → Dev Server. Until then, do_start fails loud.
DEV_CMD=""
PORT="${PORT:-3000}"

# --- Internal ---
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PID_FILE="$PROJECT_ROOT/.dev-server.pid"
LOG_FILE="$PROJECT_ROOT/.dev-server.log"

# --- Port detection ---
# Try to auto-detect port from common config files.
# Falls back to PORT above if nothing found.
detect_port() {
  local detected=""

  # Vite: server.port in vite.config.*
  for f in "$PROJECT_ROOT"/vite.config.{ts,js,mjs}; do
    if [[ -f "$f" ]]; then
      detected=$(grep -oE 'port\s*:\s*[0-9]+' "$f" 2>/dev/null | head -1 | grep -oE '[0-9]+')
      [[ -n "$detected" ]] && echo "$detected" && return
    fi
  done

  # Next.js: check package.json dev script for -p flag
  if [[ -f "$PROJECT_ROOT/package.json" ]]; then
    detected=$(grep -oE '"dev"\s*:\s*"[^"]*-p\s+([0-9]+)' "$PROJECT_ROOT/package.json" 2>/dev/null | grep -oE '[0-9]+$')
    [[ -n "$detected" ]] && echo "$detected" && return
  fi

  # Astro: server.port in astro.config.*
  for f in "$PROJECT_ROOT"/astro.config.{ts,js,mjs}; do
    if [[ -f "$f" ]]; then
      detected=$(grep -oE 'port\s*:\s*[0-9]+' "$f" 2>/dev/null | head -1 | grep -oE '[0-9]+')
      [[ -n "$detected" ]] && echo "$detected" && return
    fi
  done

  echo "$PORT"
}

# --- Process checks ---
pid_alive() {
  local pid="$1"
  kill -0 "$pid" 2>/dev/null
}

read_pid() {
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid=$(cat "$PID_FILE")
    if pid_alive "$pid"; then
      echo "$pid"
      return
    fi
    # Stale PID file
    rm -f "$PID_FILE"
  fi
  echo ""
}

port_in_use() {
  local port="$1"
  lsof -i :"$port" -sTCP:LISTEN >/dev/null 2>&1
}

port_owner() {
  local port="$1"
  lsof -i :"$port" -sTCP:LISTEN -t 2>/dev/null | head -1
}

# --- Self-check: refuse to recurse ---
# Wrapper bypass / recursion is the most common dev.sh footgun. Hard-fail
# rather than spawn the wrong process or loop forever.
check_dev_cmd() {
  if [[ -z "$DEV_CMD" ]]; then
    echo "ERROR: DEV_CMD is empty in scripts/dev.sh." >&2
    echo "" >&2
    echo "  /rs-impl populates DEV_CMD with the framework binary based on" >&2
    echo "  the detected stack (e.g. 'npx astro dev --port 4321'). Run" >&2
    echo "  /rs-impl, or set DEV_CMD manually and document the choice in" >&2
    echo "  rootspec/CONVENTIONS/technical.md → Dev Server." >&2
    exit 1
  fi
  case "$DEV_CMD" in
    *"npm run dev"*|*"yarn dev"*|*"pnpm dev"*|*"bun run dev"*|*"./scripts/dev.sh"*)
      echo "ERROR: DEV_CMD='${DEV_CMD}' would recurse through this wrapper." >&2
      echo "" >&2
      echo "  package.json 'dev' scripts call ./scripts/dev.sh. This wrapper" >&2
      echo "  must call the framework binary directly (e.g. 'npx astro dev'," >&2
      echo "  'npx vite dev', 'npx next dev -p 3000'), not 'npm run dev' or" >&2
      echo "  itself. Edit scripts/dev.sh." >&2
      exit 1
      ;;
  esac
}

# --- Commands ---
do_start() {
  check_dev_cmd

  local resolved_port
  resolved_port=$(detect_port)

  local existing_pid
  existing_pid=$(read_pid)
  if [[ -n "$existing_pid" ]]; then
    echo "Dev server already running (PID $existing_pid)"
    return 0
  fi

  if port_in_use "$resolved_port"; then
    local owner
    owner=$(port_owner "$resolved_port")
    echo "Port $resolved_port already in use (PID $owner)"
    echo "Run './scripts/dev.sh stop' first, or kill PID $owner"
    return 1
  fi

  echo "Starting dev server on port $resolved_port..."
  cd "$PROJECT_ROOT"
  nohup $DEV_CMD > "$LOG_FILE" 2>&1 &
  local pid=$!
  echo "$pid" > "$PID_FILE"

  # Wait briefly and verify it started
  sleep 2
  if pid_alive "$pid"; then
    echo "Dev server started (PID $pid, port $resolved_port)"
    echo "Logs: $LOG_FILE"
  else
    echo "Dev server failed to start. Check logs:"
    tail -20 "$LOG_FILE"
    rm -f "$PID_FILE"
    return 1
  fi
}

do_stop() {
  local pid
  pid=$(read_pid)
  if [[ -z "$pid" ]]; then
    echo "No dev server running"
    return 0
  fi

  echo "Stopping dev server (PID $pid)..."
  kill "$pid" 2>/dev/null || true

  # Wait for graceful shutdown
  local attempts=0
  while pid_alive "$pid" && [[ $attempts -lt 10 ]]; do
    sleep 0.5
    attempts=$((attempts + 1))
  done

  if pid_alive "$pid"; then
    echo "Force killing..."
    kill -9 "$pid" 2>/dev/null || true
  fi

  rm -f "$PID_FILE"
  echo "Dev server stopped"
}

do_restart() {
  do_stop
  do_start
}

do_status() {
  local resolved_port
  resolved_port=$(detect_port)

  local pid
  pid=$(read_pid)
  if [[ -n "$pid" ]]; then
    echo "Dev server running (PID $pid, port $resolved_port)"
  else
    echo "Dev server not running"
    if port_in_use "$resolved_port"; then
      local owner
      owner=$(port_owner "$resolved_port")
      echo "Warning: port $resolved_port in use by PID $owner (not managed by this script)"
    fi
  fi
}

do_logs() {
  if [[ -f "$LOG_FILE" ]]; then
    tail -50 -f "$LOG_FILE"
  else
    echo "No log file found at $LOG_FILE"
  fi
}

do_url() {
  local resolved_port
  resolved_port=$(detect_port)
  echo "http://localhost:$resolved_port"
}

# --- Main ---
case "${1:-start}" in
  start)   do_start ;;
  stop)    do_stop ;;
  restart) do_restart ;;
  status)  do_status ;;
  logs)    do_logs ;;
  url)     do_url ;;
  *)
    echo "Usage: $0 [start|stop|restart|status|logs|url]"
    exit 1
    ;;
esac
