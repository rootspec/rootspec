import type { Phase } from "../types.js";

interface ToolCall {
  tool: string;
  inputHash: string;
  timestamp: number;
}

export function createCostTracker(phase: Phase) {
  const recentCalls: ToolCall[] = [];
  const MAX_HISTORY = 20;

  return async (input: Record<string, unknown>, toolUseId: string | undefined, context: { signal: AbortSignal }) => {
    const hookEvent = input.hook_event_name as string;
    if (hookEvent !== "PostToolUse") return {};

    const toolName = input.tool_name as string;
    const toolInput = input.tool_input as Record<string, unknown>;

    // Simple hash of tool + key input params
    const inputHash = `${toolName}:${JSON.stringify(toolInput).slice(0, 200)}`;

    recentCalls.push({ tool: toolName, inputHash, timestamp: Date.now() });
    if (recentCalls.length > MAX_HISTORY) recentCalls.shift();

    // Detect repeated identical calls (3+ of the same call in recent history)
    const sameCallCount = recentCalls.filter(
      (c) => c.inputHash === inputHash
    ).length;

    if (sameCallCount >= 3) {
      return {
        hookSpecificOutput: {
          hookEventName: hookEvent,
          additionalContext: `WARNING: You have made the same ${toolName} call ${sameCallCount} times recently. This may indicate a loop. Consider a different approach.`,
        },
      };
    }

    return {};
  };
}
