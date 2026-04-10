import { z } from "zod";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import {
  DEFAULT_BUDGET_ALLOCATION,
  DEFAULT_TURN_LIMITS,
  type Phase,
} from "./types.js";

const GateConfigSchema = z.object({
  spec: z
    .object({
      minStoryCount: z.number().default(3),
      requireAllValidationChecks: z.boolean().default(true),
    })
    .default({}),
  impl: z
    .object({
      minPassRate: z.number().default(0.6),
    })
    .default({}),
  validate: z
    .object({
      minPassRate: z.number().default(0.8),
    })
    .default({}),
  review: z
    .object({
      maxFixCycles: z.number().default(2),
    })
    .default({}),
});

const ConfigFileSchema = z.object({
  seed: z.string().optional(),
  maxBudgetUsd: z.number().default(5.0),
  model: z.string().default("claude-sonnet-4-6"),
  phases: z
    .array(z.enum(["init", "spec", "impl", "validate", "review"]))
    .default(["init", "spec", "impl", "validate", "review"]),
  maxRetries: z.number().default(2),
  budgetAllocation: z
    .object({
      init: z.number().default(DEFAULT_BUDGET_ALLOCATION.init),
      spec: z.number().default(DEFAULT_BUDGET_ALLOCATION.spec),
      impl: z.number().default(DEFAULT_BUDGET_ALLOCATION.impl),
      validate: z.number().default(DEFAULT_BUDGET_ALLOCATION.validate),
      review: z.number().default(DEFAULT_BUDGET_ALLOCATION.review),
    })
    .default({}),
  turnLimits: z
    .object({
      init: z.number().default(DEFAULT_TURN_LIMITS.init),
      spec: z.number().default(DEFAULT_TURN_LIMITS.spec),
      impl: z.number().default(DEFAULT_TURN_LIMITS.impl),
      validate: z.number().default(DEFAULT_TURN_LIMITS.validate),
      review: z.number().default(DEFAULT_TURN_LIMITS.review),
    })
    .default({}),
  gates: GateConfigSchema.default({}),
  reporter: z.enum(["console", "json"]).default("console"),
  verbose: z.boolean().default(false),
});

export type OrchestratorConfig = z.infer<typeof ConfigFileSchema> & {
  seedPath: string;
  seedContent: string;
  projectDir: string;
  rootspecDir: string;
  outputDir: string;
  resume: boolean;
  resumeFrom?: Phase;
};

export function loadConfig(opts: {
  seed?: string;
  projectDir?: string;
  rootspecDir?: string;
  budget?: string;
  model?: string;
  phases?: string;
  resume?: boolean;
  resumeFrom?: string;
  reporter?: string;
  verbose?: boolean;
  config?: string;
}): OrchestratorConfig {
  const projectDir = resolve(opts.projectDir ?? ".");

  // Load config file if it exists
  const configPath =
    opts.config ?? resolve(projectDir, "rootspec.orchestrator.json");
  let fileConfig: Record<string, unknown> = {};
  if (existsSync(configPath)) {
    fileConfig = JSON.parse(readFileSync(configPath, "utf-8"));
  }

  // CLI args override file config
  if (opts.budget) fileConfig.maxBudgetUsd = parseFloat(opts.budget);
  if (opts.model) fileConfig.model = opts.model;
  if (opts.phases) fileConfig.phases = opts.phases.split(",");
  if (opts.reporter) fileConfig.reporter = opts.reporter;
  if (opts.verbose) fileConfig.verbose = true;
  if (opts.seed) fileConfig.seed = opts.seed;

  const parsed = ConfigFileSchema.parse(fileConfig);

  // Resolve seed path
  const seedPath = resolve(projectDir, parsed.seed ?? "SEED.md");
  if (!existsSync(seedPath)) {
    throw new Error(`SEED.md not found at ${seedPath}`);
  }
  const seedContent = readFileSync(seedPath, "utf-8");

  // Resolve rootspec dir (framework repo with skills)
  const rootspecDir = resolve(
    opts.rootspecDir ?? dirname(dirname(import.meta.dirname ?? "."))
  );

  return {
    ...parsed,
    seedPath,
    seedContent,
    projectDir,
    rootspecDir,
    outputDir: resolve(projectDir, ".rootspec-orchestrator"),
    resume: opts.resume ?? false,
    resumeFrom: opts.resumeFrom as Phase | undefined,
  };
}
