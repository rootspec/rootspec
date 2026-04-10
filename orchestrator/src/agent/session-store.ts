import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import type { OrchestratorState, Phase } from "../types.js";

export function createInitialState(): OrchestratorState {
  return {
    runId: randomUUID().slice(0, 8),
    startedAt: new Date().toISOString(),
    currentPhase: null,
    completedPhases: [],
    sessionIds: {},
    phaseResults: {},
    gateResults: {},
    totalCostUsd: 0,
    attempt: { init: 0, spec: 0, impl: 0, validate: 0, review: 0 },
  };
}

export function saveState(outputDir: string, state: OrchestratorState): void {
  mkdirSync(outputDir, { recursive: true });
  const statePath = join(outputDir, "state.json");
  writeFileSync(statePath, JSON.stringify(state, null, 2));
}

export function loadState(outputDir: string): OrchestratorState | null {
  const statePath = join(outputDir, "state.json");
  if (!existsSync(statePath)) return null;
  return JSON.parse(readFileSync(statePath, "utf-8"));
}

export function saveReport(
  outputDir: string,
  result: Record<string, unknown>
): void {
  mkdirSync(outputDir, { recursive: true });
  const reportPath = join(outputDir, "report.json");
  writeFileSync(reportPath, JSON.stringify(result, null, 2));
}
