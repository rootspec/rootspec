#!/usr/bin/env bash
# preview.sh — Preview server (built artifact) with process management
# Usage: ./scripts/preview.sh [start|stop|restart|status|logs|url]
# Copied into projects by /rs-init. Edit PREVIEW_CMD and PORT to match your project.
#
# Preview servers serve the production build. Used by scripts/test.sh in the
# default 'preview' testMode. For dev-mode testing, set
# .rootspec.json prerequisites.testMode = "dev" and use scripts/dev.sh instead.

set -euo pipefail

# --- Configuration (edit these) ---
PREVIEW_CMD="npm run preview"
PORT="${PORT:-4173}"

# --- Internal ---
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PID_FILE="$PROJECT_ROOT/.preview-server.pid"
LOG_FILE="$PROJECT_ROOT/.preview-server.log"

# --- Port detection ---
# Preview ports often differ from dev ports (e.g. Vite: dev=5173, preview=4173).
# Auto-detect from common config files; fall back to PORT above.
detect_port() {
  local detected=""

  # Vite preview defaults to 4173 (preview.port in vite.config.*)
  for f in "$PROJECT_ROOT"/vite.config.{ts,js,mjs}; do
    if [[ -f "$f" ]]; then
      detected=$(awk '/preview\s*:\s*\{/,/\}/' "$f" 2>/dev/null \
        | grep -oE 'port\s*:\s*[0-9]+' | head -1 | grep -oE '[0-9]+')
      [[ -n "$detected" ]] && echo "$detected" && return
    fi
  done

  # Astro preview shares server.port with dev unless overridden
  for f in "$PROJECT_ROOT"/astro.config.{ts,js,mjs}; do
    if [[ -f "$f" ]]; then
      detected=$(grep -oE 'port\s*:\s*[0-9]+' "$f" 2>/dev/null | head -1 | grep -oE '[0-9]+')
      [[ -n "$detected" ]] && echo "$detected" && return
    fi
  done

  # Next.js: `next start -p <port>`
  if [[ -f "$PROJECT_ROOT/package.json" ]]; then
    detected=$(grep -oE '"(start|preview)"\s*:\s*"[^"]*-p\s+([0-9]+)' "$PROJECT_ROOT/package.json" 2>/dev/null | grep -oE '[0-9]+$')
    [[ -n "$detected" ]] && echo "$detected" && return
  fi

  echo "$PORT"
}

# --- Process checks ---
pid_alive() { kill -0 "$1" 2>/dev/null; }

read_pid() {
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid=$(cat "$PID_FILE")
    if pid_alive "$pid"; then echo "$pid"; return; fi
    rm -f "$PID_FILE"
  fi
  echo ""
}

port_in_use() { lsof -i :"$1" -sTCP:LISTEN >/dev/null 2>&1; }
port_owner() { lsof -i :"$1" -sTCP:LISTEN -t 2>/dev/null | head -1; }

# --- Commands ---
do_start() {
  local resolved_port
  resolved_port=$(detect_port)

  local existing_pid
  existing_pid=$(read_pid)
  if [[ -n "$existing_pid" ]]; then
    echo "Preview server already running (PID $existing_pid)"
    return 0
  fi

  if port_in_use "$resolved_port"; then
    local owner
    owner=$(port_owner "$resolved_port")
    echo "Port $resolved_port already in use (PID $owner)"
    echo "Run './scripts/preview.sh stop' first, or kill PID $owner"
    return 1
  fi

  echo "Starting preview server on port $resolved_port..."
  cd "$PROJECT_ROOT"
  nohup $PREVIEW_CMD > "$LOG_FILE" 2>&1 &
  local pid=$!
  echo "$pid" > "$PID_FILE"

  # Wait briefly and verify it started
  sleep 2
  if pid_alive "$pid"; then
    echo "Preview server started (PID $pid, port $resolved_port)"
    echo "Logs: $LOG_FILE"
  else
    echo "Preview server failed to start. Check logs:"
    tail -20 "$LOG_FILE"
    rm -f "$PID_FILE"
    return 1
  fi
}

do_stop() {
  local pid
  pid=$(read_pid)
  if [[ -z "$pid" ]]; then
    echo "No preview server running"
    return 0
  fi

  echo "Stopping preview server (PID $pid)..."
  kill "$pid" 2>/dev/null || true

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
  echo "Preview server stopped"
}

do_restart() { do_stop; do_start; }

do_status() {
  local resolved_port
  resolved_port=$(detect_port)
  local pid
  pid=$(read_pid)
  if [[ -n "$pid" ]]; then
    echo "Preview server running (PID $pid, port $resolved_port)"
  else
    echo "Preview server not running"
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
