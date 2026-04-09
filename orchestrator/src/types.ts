export type Phase = "init" | "spec" | "impl" | "validate";

export const PHASE_ORDER: Phase[] = ["init", "spec", "impl", "validate"];

export interface PhaseResult {
  phase: Phase;
  status: "success" | "error" | "max_turns" | "max_budget" | "skipped";
  sessionId?: string;
  costUsd: number;
  numTurns: number;
  durationMs: number;
  errors: string[];
}

export interface GateResult {
  passed: boolean;
  phase: Phase;
  checks: GateCheck[];
  action: "proceed" | "retry" | "abort";
}

export interface GateCheck {
  name: string;
  passed: boolean;
  message: string;
}

export interface OrchestratorState {
  runId: string;
  startedAt: string;
  currentPhase: Phase | null;
  completedPhases: Phase[];
  sessionIds: Partial<Record<Phase, string>>;
  phaseResults: Partial<Record<Phase, PhaseResult>>;
  gateResults: Partial<Record<Phase, GateResult>>;
  totalCostUsd: number;
  attempt: Record<Phase, number>;
}

export interface OrchestratorResult {
  status: "success" | "failed" | "gate_failed" | "budget_exhausted";
  state: OrchestratorState;
  failedPhase?: Phase;
  failedGate?: Phase;
}

export interface OrchestratorEvent {
  type:
    | "run_started"
    | "phase_started"
    | "phase_completed"
    | "gate_started"
    | "gate_completed"
    | "retry"
    | "run_completed"
    | "cost_update"
    | "message";
  phase?: Phase;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface Reporter {
  emit(event: OrchestratorEvent): void;
  summary(result: OrchestratorResult): void;
}

export interface BudgetAllocation {
  init: number;
  spec: number;
  impl: number;
  validate: number;
}

export const DEFAULT_BUDGET_ALLOCATION: BudgetAllocation = {
  init: 0.1,
  spec: 0.3,
  impl: 0.45,
  validate: 0.15,
};

export const DEFAULT_TURN_LIMITS: Record<Phase, number> = {
  init: 30,
  spec: 50,
  impl: 100,
  validate: 25,
};
