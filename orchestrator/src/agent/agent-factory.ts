import { spawn } from "node:child_process";
import type { Phase, PhaseResult, Reporter } from "../types.js";
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
  review: ["Read", "Write", "Bash", "Glob", "Grep"],
};

export interface ExecutePhaseOptions {
  phase: Phase;
  config: OrchestratorConfig;
  state: OrchestratorState;
  reporter: Reporter;
}

/**
 * Spawn the Claude Code process in its own process group so that ALL
 * descendant processes (dev servers, Cypress, etc.) can be killed
 * reliably by sending a signal to the group leader.
 *
 * Returns the ChildProcess (which satisfies SpawnedProcess) and the PGID.
 */
function spawnInProcessGroup(options: {
  command: string;
  args: string[];
  cwd?: string;
  env: Record<string, string | undefined>;
  signal: AbortSignal;
}) {
  const child = spawn(options.command, options.args, {
    cwd: options.cwd,
    env: options.env as NodeJS.ProcessEnv,
    stdio: ["pipe", "pipe", "pipe"],
    detached: true, // Creates a new process group; child.pid === PGID
  });

  return {
    // ChildProcess satisfies SpawnedProcess per the SDK docs
    process: child,
    pgid: child.pid,
  };
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
  // Clamp to remaining budget — proportional calc can over-allocate
  // during review-fix retries when phases are already in completedPhases
  const phaseBudget = Math.min(
    Math.max(remainingBudget * phasePct, 0.5),
    remainingBudget
  );
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

  // Track PGID so we can kill the entire process tree on cleanup
  let pgid: number | undefined;

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
        spawnClaudeCodeProcess: (spawnOpts) => {
          const result = spawnInProcessGroup(spawnOpts);
          pgid = result.pgid;
          return result.process;
        },
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
  } finally {
    // Kill the entire process tree spawned by this phase.
    // detached: true creates a new session + process group (PGID = SID = child PID).
    // SIGTERM to the group handles direct children. But Cypress/Electron
    // apps may create their own process groups within the same session —
    // SIGTERM to our group won't reach them. So we:
    //   1. SIGTERM the process group (graceful)
    //   2. Wait briefly for cleanup
    //   3. SIGKILL the entire session (non-ignorable, catches escapees)
    if (pgid) {
      try {
        process.kill(-pgid, "SIGTERM");
      } catch {
        // Group already exited — normal for clean completions
      }

      // Give processes a moment for graceful shutdown, then force kill
      // the entire session to catch Cypress/Electron child processes
      // that created their own process groups.
      // macOS pkill lacks -s (session), so query ps and kill individually.
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const { execSync } = await import("node:child_process");
        const pids = execSync(
          `ps -eo pid=,sess= | awk '$2 == ${pgid} {print $1}'`,
          { timeout: 5000, encoding: "utf-8" }
        ).trim();
        if (pids) {
          execSync(`kill -9 ${pids.split("\n").join(" ")}`, {
            timeout: 5000,
            stdio: "ignore",
          });
        }
      } catch {
        // No remaining processes in session — expected after clean exit
      }

      // Kill dev server — started with nohup by scripts/dev.sh, so it has
      // its own session and escapes both process group and session kills.
      try {
        const { execSync } = await import("node:child_process");
        execSync("./scripts/dev.sh stop", {
          cwd: config.projectDir,
          timeout: 5000,
          stdio: "ignore",
        });
      } catch {
        // No dev server running or script missing — fine
      }
    }
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
