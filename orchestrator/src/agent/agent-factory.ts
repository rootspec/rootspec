import type { Phase, PhaseResult, Reporter, OrchestratorEvent } from "../types.js";
import type { OrchestratorConfig } from "../config.js";
import type { OrchestratorState } from "../types.js";
import { buildPrompt } from "./prompt-builder.js";
import { buildHooks } from "../hooks/index.js";

// Tools available per phase
const PHASE_TOOLS: Record<Phase, string[]> = {
  init: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
  spec: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
  impl: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
  validate: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
};

export interface ExecutePhaseOptions {
  phase: Phase;
  config: OrchestratorConfig;
  state: OrchestratorState;
  reporter: Reporter;
}

export async function executePhase(
  opts: ExecutePhaseOptions
): Promise<PhaseResult> {
  const { phase, config, state, reporter } = opts;
  const startTime = Date.now();

  const prompt = buildPrompt(phase, config, state);
  const remainingBudget = config.maxBudgetUsd - state.totalCostUsd;

  // Calculate budget from REMAINING budget, proportional to this phase's share
  // of the remaining phases. This way, if init was free ($0), spec gets more.
  const remainingPhases = config.phases.filter(
    (p) => !state.completedPhases.includes(p as Phase)
  ) as Phase[];
  const totalRemainingPct = remainingPhases.reduce(
    (sum, p) => sum + config.budgetAllocation[p],
    0
  );
  const phasePct = totalRemainingPct > 0
    ? config.budgetAllocation[phase] / totalRemainingPct
    : 1 / remainingPhases.length;
  const phaseBudget = Math.max(remainingBudget * phasePct, 0.5);
  const maxTurns = config.turnLimits[phase];

  // Dynamic import to avoid issues if SDK not installed yet
  const { query } = await import("@anthropic-ai/claude-agent-sdk");

  const hooks = buildHooks(phase, config);

  reporter.emit({
    type: "phase_started",
    phase,
    timestamp: new Date().toISOString(),
    data: { budget: phaseBudget, maxTurns },
  });

  let sessionId: string | undefined;
  let costUsd = 0;
  let numTurns = 0;
  let assistantMessageCount = 0;
  let gotResultMessage = false;
  let resultStatus: PhaseResult["status"] = "error";
  const errors: string[] = [];

  try {
    const resumeId = state.attempt[phase] > 0 ? state.sessionIds[phase] : undefined;

    const messageStream = query({
      prompt,
      options: {
        cwd: config.projectDir,
        model: config.model,
        tools: PHASE_TOOLS[phase],
        allowedTools: PHASE_TOOLS[phase],
        permissionMode: "bypassPermissions" as const,
        allowDangerouslySkipPermissions: true,
        maxTurns,
        maxBudgetUsd: phaseBudget,
        systemPrompt: {
          type: "preset" as const,
          preset: "claude_code" as const,
        },
        settingSources: ["project" as const],
        hooks,
        ...(resumeId ? { resume: resumeId } : {}),
      },
    });

    for await (const message of messageStream) {
      // Capture session ID from init message
      if (message.type === "system" && "session_id" in message) {
        sessionId = message.session_id as string;
      }

      // Count assistant messages as a proxy for turns
      if (message.type === "assistant") {
        assistantMessageCount++;
        if (config.verbose) {
          reporter.emit({
            type: "message",
            phase,
            timestamp: new Date().toISOString(),
            data: { messageType: "assistant" },
          });
        }
      }

      // Capture result
      if (message.type === "result") {
        gotResultMessage = true;
        const result = message as Record<string, unknown>;
        costUsd = (result.total_cost_usd as number) ?? 0;
        numTurns = (result.num_turns as number) ?? 0;
        sessionId = (result.session_id as string) ?? sessionId;

        if (result.subtype === "success") {
          resultStatus = "success";
        } else if (result.subtype === "error_max_turns") {
          resultStatus = "max_turns";
          errors.push("Hit max turns limit");
        } else if (result.subtype === "error_max_budget_usd") {
          resultStatus = "max_budget";
          errors.push("Hit budget limit");
        } else {
          resultStatus = "error";
          if (Array.isArray(result.errors)) {
            errors.push(...(result.errors as string[]));
          }
        }
      }
    }

    // Stream ended without a result message — the SDK process likely exited
    // before sending one. Use assistant message count as a proxy for turns.
    if (!gotResultMessage) {
      numTurns = assistantMessageCount;
      errors.push(
        `SDK stream ended without result message (saw ${assistantMessageCount} assistant messages). ` +
        `Cost for this attempt is not tracked — check Anthropic dashboard for actual spend.`
      );
    }
  } catch (err) {
    resultStatus = "error";
    errors.push(err instanceof Error ? err.message : String(err));
  }

  const durationMs = Date.now() - startTime;
  const phaseResult: PhaseResult = {
    phase,
    status: resultStatus,
    sessionId,
    costUsd,
    numTurns,
    durationMs,
    errors,
  };

  reporter.emit({
    type: "phase_completed",
    phase,
    timestamp: new Date().toISOString(),
    data: {
      status: resultStatus,
      cost: costUsd,
      turns: numTurns,
      duration: durationMs,
    },
  });

  return phaseResult;
}
