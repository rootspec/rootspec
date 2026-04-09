#!/usr/bin/env node

import { Command } from "commander";
import { loadConfig } from "../src/config.js";
import { orchestrate } from "../src/orchestrator.js";
import { ConsoleReporter } from "../src/reporters/console.js";
import { JsonReporter } from "../src/reporters/json.js";

const program = new Command()
  .name("rs-orchestrate")
  .description(
    "RootSpec agentic orchestrator — SEED.md to working tested app"
  )
  .argument("[seed]", "Path to SEED.md file")
  .option("--project-dir <path>", "Project directory (default: cwd)")
  .option("--rootspec-dir <path>", "RootSpec framework repo path")
  .option("--budget <dollars>", "Max budget in USD (default: 5.00)")
  .option("--model <model>", "Model to use (default: claude-sonnet-4-6)")
  .option(
    "--phases <phases>",
    "Comma-separated phases (default: init,spec,impl,validate)"
  )
  .option("--resume", "Resume most recent interrupted run")
  .option("--resume-from <phase>", "Resume from a specific phase")
  .option("--reporter <type>", "Output format: console, json (default: console)")
  .option("--verbose", "Show detailed agent output")
  .option("--config <path>", "Config file path")
  .action(async (seed: string | undefined, opts: Record<string, unknown>) => {
    try {
      const config = loadConfig({
        seed,
        projectDir: opts.projectDir as string | undefined,
        rootspecDir: opts.rootspecDir as string | undefined,
        budget: opts.budget as string | undefined,
        model: opts.model as string | undefined,
        phases: opts.phases as string | undefined,
        resume: opts.resume as boolean | undefined,
        resumeFrom: opts.resumeFrom as string | undefined,
        reporter: opts.reporter as string | undefined,
        verbose: opts.verbose as boolean | undefined,
        config: opts.config as string | undefined,
      });

      const reporter =
        config.reporter === "json"
          ? new JsonReporter()
          : new ConsoleReporter();

      const result = await orchestrate(config, reporter);
      process.exit(result.status === "success" ? 0 : 1);
    } catch (err) {
      console.error(
        `Error: ${err instanceof Error ? err.message : String(err)}`
      );
      process.exit(2);
    }
  });

program.parse();
