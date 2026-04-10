import type { Reporter, OrchestratorEvent, OrchestratorResult } from "../types.js";

const PHASE_LABELS: Record<string, string> = {
  init: "Init",
  spec: "Spec",
  impl: "Impl",
  validate: "Validate",
  review: "Review",
};

export class ConsoleReporter implements Reporter {
  private phaseStartTime: number = 0;

  emit(event: OrchestratorEvent): void {
    const ts = new Date(event.timestamp).toLocaleTimeString();

    switch (event.type) {
      case "run_started":
        console.log(`\n[${ts}] === RootSpec Orchestrator ===`);
        console.log(`  Budget: $${event.data.budget}`);
        console.log(`  Phases: ${(event.data.phases as string[]).join(" → ")}`);
        console.log("");
        break;

      case "phase_started": {
        const label = PHASE_LABELS[event.phase!] ?? event.phase;
        this.phaseStartTime = Date.now();
        console.log(`[${ts}] ▶ ${label} (budget: $${(event.data.budget as number).toFixed(2)}, max ${event.data.maxTurns} turns)`);
        break;
      }

      case "phase_completed": {
        const label = PHASE_LABELS[event.phase!] ?? event.phase;
        const status = event.data.status as string;
        const icon = status === "success" ? "✓" : status === "skipped" ? "⊘" : "✗";
        const cost = (event.data.cost as number).toFixed(2);
        const turns = event.data.turns;
        const dur = Math.round((event.data.duration as number) / 1000);
        console.log(`[${ts}] ${icon} ${label} — ${status} ($${cost}, ${turns} turns, ${dur}s)`);
        break;
      }

      case "gate_started": {
        const label = PHASE_LABELS[event.phase!] ?? event.phase;
        console.log(`[${ts}]   Gate: ${label}...`);
        break;
      }

      case "gate_completed": {
        const passed = event.data.passed as boolean;
        const checks = event.data.checks as Array<{ name: string; passed: boolean; message: string }>;
        for (const check of checks) {
          const icon = check.passed ? "  ✓" : "  ✗";
          console.log(`${icon} ${check.name}: ${check.message}`);
        }
        if (!passed) {
          console.log(`  → Action: ${event.data.action}`);
        }
        break;
      }

      case "retry": {
        const label = PHASE_LABELS[event.phase!] ?? event.phase;
        console.log(`[${ts}] ↻ Retrying ${label} (attempt ${event.data.attempt})`);
        break;
      }

      case "run_completed": {
        console.log("");
        break;
      }

      case "message":
        // Verbose mode only
        break;
    }
  }

  summary(result: OrchestratorResult): void {
    const { state } = result;

    console.log("\n=== Summary ===");
    console.log(`Status: ${result.status}`);
    console.log(`Total cost: $${state.totalCostUsd.toFixed(2)}`);

    const phases = Object.entries(state.phaseResults);
    if (phases.length > 0) {
      console.log("\nPhase breakdown:");
      for (const [phase, r] of phases) {
        if (!r) continue;
        const dur = Math.round(r.durationMs / 1000);
        console.log(
          `  ${PHASE_LABELS[phase] ?? phase}: ${r.status} — $${r.costUsd.toFixed(2)}, ${r.numTurns} turns, ${dur}s`
        );
        if (r.errors.length > 0) {
          for (const err of r.errors) {
            console.log(`    Error: ${err}`);
          }
        }
      }
    }

    if (result.failedPhase) {
      console.log(`\nFailed at: ${PHASE_LABELS[result.failedPhase] ?? result.failedPhase}`);
    }
    if (result.failedGate) {
      console.log(`Gate failed: ${PHASE_LABELS[result.failedGate] ?? result.failedGate}`);
    }

    console.log("");
  }
}
