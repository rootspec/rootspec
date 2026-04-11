import type { Phase } from "../types.js";
import type { OrchestratorConfig } from "../config.js";
import { createScopeEnforcer } from "./scope-enforcer.js";
import { createCostTracker } from "./cost-tracker.js";
import { createDevServerEnforcer } from "./dev-server-enforcer.js";

type HookCallback = (
  input: Record<string, unknown>,
  toolUseId: string | undefined,
  context: { signal: AbortSignal }
) => Promise<Record<string, unknown>>;

interface HookCallbackMatcher {
  matcher?: string;
  hooks: HookCallback[];
  timeout?: number;
}

export function buildHooks(
  phase: Phase,
  config: OrchestratorConfig
): Record<string, HookCallbackMatcher[]> {
  const scopeEnforcer = createScopeEnforcer(phase, config.projectDir);
  const costTracker = createCostTracker(phase);
  const devServerEnforcer = createDevServerEnforcer(phase);

  return {
    PreToolUse: [
      {
        matcher: "Write|Edit",
        hooks: [scopeEnforcer],
        timeout: 10,
      },
      {
        matcher: "Bash",
        hooks: [devServerEnforcer],
        timeout: 10,
      },
    ],
    PostToolUse: [
      {
        hooks: [costTracker],
        timeout: 5,
      },
    ],
  };
}
