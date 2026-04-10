import { relative } from "node:path";
import type { Phase } from "../types.js";

// Write scope rules per phase: allowed patterns and denied patterns
// Denied takes priority over allowed
const WRITE_SCOPE: Record<Phase, { allowed: RegExp[]; denied: RegExp[] }> = {
  init: {
    allowed: [
      /^rootspec\//,
      /^\.rootspec\.json$/,
      /^scripts\//,
      /^package\.json$/,
      /^\.husky\//,
      /^\.gitignore$/,
    ],
    denied: [/^src\//, /^app\//, /^cypress\//],
  },
  spec: {
    allowed: [/^rootspec\//],
    denied: [
      /^src\//,
      /^app\//,
      /^cypress\//,
      /^rootspec\/tests-status\.json$/,
      /^rootspec\/CONVENTIONS\//,
    ],
  },
  impl: {
    allowed: [
      /^src\//,
      /^app\//,
      /^cypress\//,
      /^rootspec\/CONVENTIONS\//,
      /^rootspec\/tests-status\.json$/,
      /^rootspec\/stats\.json$/,
      /^package\.json$/,
      /^scripts\//,
      /^public\//,
      /^static\//,
      /^astro\.config/,
      /^vite\.config/,
      /^svelte\.config/,
      /^next\.config/,
      /^tsconfig/,
      /^tailwind\.config/,
      /^postcss\.config/,
      /^\.husky\//,
    ],
    denied: [
      /^rootspec\/0[0-5]/,
      /^rootspec\/spec-status\.json$/,
      /^rootspec\/00\.AXIOMS\.md$/,
      /^rootspec\/00\.FRAMEWORK\.md$/,
    ],
  },
  validate: {
    allowed: [/^rootspec\/tests-status\.json$/, /^rootspec\/stats\.json$/],
    denied: [/^src\//, /^app\//, /^cypress\//, /^rootspec\/(?!tests-status|stats)/],
  },
  review: {
    allowed: [/^rootspec\/review-status\.json$/, /^rootspec\/stats\.json$/],
    denied: [/^src\//, /^app\//, /^cypress\//, /^rootspec\/(?!review-status|stats)/],
  },
};

export function createScopeEnforcer(phase: Phase, projectDir: string) {
  const scope = WRITE_SCOPE[phase];

  return async (input: Record<string, unknown>, toolUseId: string | undefined, context: { signal: AbortSignal }) => {
    const hookEvent = input.hook_event_name as string;
    if (hookEvent !== "PreToolUse") return {};

    const toolName = input.tool_name as string;
    if (!["Write", "Edit"].includes(toolName)) return {};

    const toolInput = input.tool_input as Record<string, unknown>;
    const filePath = toolInput?.file_path as string;
    if (!filePath) return {};

    const rel = relative(projectDir, filePath);

    // Check denied first (higher priority)
    for (const pattern of scope.denied) {
      if (pattern.test(rel)) {
        return {
          systemMessage: `Scope enforcement: phase '${phase}' cannot write to ${rel}. Stay within your allowed scope.`,
          hookSpecificOutput: {
            hookEventName: hookEvent,
            permissionDecision: "deny",
            permissionDecisionReason: `Phase '${phase}' scope does not allow writing to ${rel}`,
          },
        };
      }
    }

    // Check allowed
    const isAllowed = scope.allowed.some((p) => p.test(rel));
    if (!isAllowed) {
      return {
        systemMessage: `Scope enforcement: phase '${phase}' cannot write to ${rel}. Allowed patterns: ${scope.allowed.map((p) => p.source).join(", ")}`,
        hookSpecificOutput: {
          hookEventName: hookEvent,
          permissionDecision: "deny",
          permissionDecisionReason: `Phase '${phase}' scope does not allow writing to ${rel}`,
        },
      };
    }

    return {};
  };
}
