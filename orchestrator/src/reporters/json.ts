import type { Reporter, OrchestratorEvent, OrchestratorResult } from "../types.js";

export class JsonReporter implements Reporter {
  private events: OrchestratorEvent[] = [];

  emit(event: OrchestratorEvent): void {
    this.events.push(event);
    // Also print each event as a JSON line for streaming consumption
    console.log(JSON.stringify(event));
  }

  summary(result: OrchestratorResult): void {
    const report = {
      status: result.status,
      totalCostUsd: result.state.totalCostUsd,
      phases: result.state.phaseResults,
      gates: result.state.gateResults,
      failedPhase: result.failedPhase,
      failedGate: result.failedGate,
      startedAt: result.state.startedAt,
      completedAt: new Date().toISOString(),
      events: this.events,
    };
    console.log(JSON.stringify(report, null, 2));
  }
}
