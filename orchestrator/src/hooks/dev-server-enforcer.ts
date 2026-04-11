import type { Phase } from "../types.js";

// Patterns that indicate a direct dev server start (bypassing dev.sh)
const DIRECT_SERVER_PATTERNS = [
  /\bnpx\s+serve\b/,
  /\bnpx\s+astro\s+dev\b/,
  /\bnpx\s+vite\b/,
  /\bnpx\s+next\s+dev\b/,
  /\bnpx\s+nuxt\s+dev\b/,
  /\bnode_modules\/\.bin\/(serve|astro|vite|next|nuxt)\b/,
  /\bnpm\s+run\s+dev\b/,
  /\bnpx\s+http-server\b/,
];

// Commands that ARE allowed (dev.sh itself, or stopping servers)
const ALLOWED_PATTERNS = [
  /scripts\/dev\.sh/,
  /dev\.sh/,
];

// Only enforce during phases that run dev servers
const ENFORCED_PHASES: Phase[] = ["impl", "validate"];

export function createDevServerEnforcer(phase: Phase) {
  if (!ENFORCED_PHASES.includes(phase)) {
    return async () => ({});
  }

  return async (input: Record<string, unknown>) => {
    const hookEvent = input.hook_event_name as string;
    if (hookEvent !== "PreToolUse") return {};

    const toolName = input.tool_name as string;
    if (toolName !== "Bash") return {};

    const toolInput = input.tool_input as Record<string, unknown>;
    const command = (toolInput?.command as string) ?? "";

    // Allow dev.sh commands
    if (ALLOWED_PATTERNS.some((p) => p.test(command))) return {};

    // Block direct server starts
    for (const pattern of DIRECT_SERVER_PATTERNS) {
      if (pattern.test(command)) {
        return {
          systemMessage:
            `Dev server enforcement: use \`./scripts/dev.sh start\` instead of running ` +
            `server commands directly. The dev.sh script tracks the PID for reliable cleanup.`,
          hookSpecificOutput: {
            hookEventName: hookEvent,
            permissionDecision: "deny",
            permissionDecisionReason:
              "Use scripts/dev.sh start to manage the dev server — direct server commands bypass PID tracking",
          },
        };
      }
    }

    return {};
  };
}
