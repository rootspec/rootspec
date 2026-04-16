# RootSpec Orchestrator

Run the full RootSpec pipeline — `init` → `spec` → `impl` → `validate` → `review` — from a `SEED.md` to a working, tested app. No human in the loop.

The interactive skills (`/rs-init`, `/rs-spec`, …) are designed for an IDE session with you driving. The **orchestrator** chains them together autonomously, with budget caps, retries, quality gates, and resumable state. It's what we use to rebuild the [demo apps](https://github.com/rootspec/demos) on every framework release.

---

## When to use it (vs. the skills directly)

| Use the skills (`/rs-*`) when | Use the orchestrator when |
|---|---|
| You're driving in your IDE and want to interview, review drafts, redirect | You have a complete `SEED.md` and want a hands-off build |
| You're iterating on one phase | You want to chain phases with budget enforcement and retries |
| Single workstation, your dev environment | CI / scheduled rebuilds / unattended runs |

The orchestrator invokes the same skills under the hood — the difference is **autonomy** and **lifecycle management**, not a different methodology.

---

## Prerequisites

- **Node ≥22** (uses `import.meta.dirname`)
- **`ANTHROPIC_API_KEY`** in the environment
- **Claude Code CLI** installed (the orchestrator spawns it via the Agent SDK):
  ```sh
  curl -fsSL https://claude.ai/install.sh | bash
  ```
- A project directory containing **`SEED.md`** (a 1–2 page natural-language description of the product). See the [demo SEEDs](https://github.com/rootspec/demos) for examples.

---

## Install

Not on npm yet — build from source:

```sh
git clone https://github.com/rootspec/rootspec.git
cd rootspec/orchestrator
npm install
npm run build
```

The CLI binary is then at `dist/bin/rs-orchestrate.js`.

---

## Quick Start

From your project directory (the one containing `SEED.md`):

```sh
node /path/to/rootspec/orchestrator/dist/bin/rs-orchestrate.js \
  --project-dir "$PWD" \
  --rootspec-dir /path/to/rootspec \
  --budget 10
```

The orchestrator will:
1. Install RootSpec skills into `<project>/.agents/skills/` if missing.
2. Run each phase in turn, respecting the per-phase budget allocation.
3. Run a quality gate after each phase. On failure, retry (up to `maxRetries`), then either proceed or abort depending on the gate.
4. Save state continuously to `<project>/.rootspec-orchestrator/state.json` so an interrupted run can resume.

When it finishes you'll have:
- A working app (whatever framework the spec implied).
- `rootspec/` filled with a complete L1–L5 spec.
- `cypress/` with passing E2E tests derived from L5 user stories.
- `rootspec/tests-status.json`, `rootspec/review-status.json`, `rootspec/stats.json` summarizing the run.

---

## CLI flags

```
rs-orchestrate [seed]

  --project-dir <path>         Project directory (default: cwd)
  --rootspec-dir <path>        RootSpec framework repo path (default: auto-detect)
  --budget <dollars>           Max budget in USD (default: 5.00)
  --model <model>              Claude model (default: claude-sonnet-4-6)
  --phases <phases>            Comma-separated phases (default: all five)
  --resume                     Resume the most recent interrupted run
  --resume-from <phase>        Resume from a specific phase
  --reporter <type>            Output format: console | json (default: console)
  --verbose                    Stream detailed agent activity
  --config <path>              Path to a config file (default: ./rootspec.orchestrator.json)
  --no-llm-review              Skip the LLM advisory stage of review (static review still runs)
```

Any positional argument is treated as a path to `SEED.md`; otherwise it defaults to `<project-dir>/SEED.md`.

---

## Config file

CLI flags override config file values, which override defaults. Drop a `rootspec.orchestrator.json` in your project root:

```jsonc
{
  "maxBudgetUsd": 10,
  "model": "claude-sonnet-4-6",
  "phases": ["init", "spec", "impl", "validate", "review"],
  "maxRetries": 2,

  // Fraction of remaining budget allocated to each phase
  "budgetAllocation": {
    "init": 0.08, "spec": 0.25, "impl": 0.47, "validate": 0.12, "review": 0.08
  },

  // Per-phase turn caps for the agent
  "turnLimits": {
    "init": 30, "spec": 50, "impl": 100, "validate": 25, "review": 15
  },

  "gates": {
    "spec":     { "minStoryCount": 3, "requireAllValidationChecks": true },
    "impl":     { "minPassRate": 0.6 },
    "validate": { "minPassRate": 0.8 },
    "review":   { "maxFixCycles": 1, "runLlmStage": true }
  }
}
```

---

## Phases and gates

| Phase | What runs | Gate criterion |
|---|---|---|
| `init` | Programmatic setup (no LLM): scaffolds `rootspec/`, dev script, test runner, framework files. | Required files exist. |
| `spec` | Skill agent: `/rs-spec` in non-interactive mode. Drafts L1–L5 from `SEED.md`. | `spec-status.json` valid + ≥ `minStoryCount` user stories. |
| `impl` | Skill agent: `/rs-impl`. Implements story-by-story with TDD. | ≥ `minPassRate` of stories passing tests (default 0.6). Gate failures **proceed** rather than abort. |
| `validate` | Skill agent: `/rs-validate`. Re-runs the test suite, captures screenshots, writes `tests-status.json`. | ≥ `minPassRate` (default 0.8). |
| `review` | Two stages, see below. | `summary.staticBlockers === 0`. Never aborts the build. |

### Review (hybrid)

Review is split into two stages with separated authority:

1. **Static review** — deterministic JS scanner (no LLM). Owns `summary.staticBlockers` and `issues` in `review-status.json`. Detects template syntax (`{{...}}`), Lorem ipsum, `TODO:`/`FIXME:` markers, literal icon descriptions (`>Star Icon<`), placeholder URLs, missing `alt`, non-semantic `<div onclick>`, and test-coverage gaps. Cheap, fast, deterministic — runs on every cycle.
2. **LLM advisory stage** — slim agent. Reads a curated screenshot subset and writes `llmFindings: { assessment, observations }`. Never blocks the build, never triggers retries. Disable with `--no-llm-review`.

Static blockers (and only static blockers) can trigger one targeted `impl` + `validate` retry cycle.

---

## State and resume

Every run writes incrementally to `<project>/.rootspec-orchestrator/state.json`. To resume an interrupted run:

```sh
rs-orchestrate --resume
# or pick up from a specific phase:
rs-orchestrate --resume-from impl
```

State includes session IDs for each phase — when resuming, the SDK reuses the conversation rather than starting a fresh one.

---

## Output artifacts

After a successful run, the project directory contains:

| File | Owner | Contents |
|---|---|---|
| `rootspec/01.PHILOSOPHY.md` … `05.IMPLEMENTATION/` | spec phase | The full L1–L5 specification |
| `rootspec/spec-status.json` | spec phase | Validation results for the spec |
| `rootspec/tests-status.json` | validate phase | Per-story test results |
| `rootspec/review-status.json` | review phase | Static + LLM review findings |
| `rootspec/stats.json` | orchestrator | Per-phase cost / turns / duration |
| `cypress/screenshots/` | validate phase | Screenshots captured per acceptance criterion |
| `.rootspec-orchestrator/state.json` | orchestrator | Resumable run state |

---

## Programmatic use

The orchestrator exports its core API:

```ts
import {
  orchestrate,
  loadConfig,
  ConsoleReporter,
} from "@rootspec/orchestrator";

const config = loadConfig({ projectDir: process.cwd(), budget: "10" });
const result = await orchestrate(config, new ConsoleReporter());
process.exit(result.status === "success" ? 0 : 1);
```

See [`src/index.ts`](src/index.ts) for the full export surface and [`src/types.ts`](src/types.ts) for type definitions.

---

## Reference

- Skills (the methodology): [`../skills/`](../skills/) and [`../README.md`](../README.md)
- Framework spec: [`../rootspec/00.FRAMEWORK.md`](../rootspec/00.FRAMEWORK.md)
- Demo apps built with the orchestrator: [github.com/rootspec/demos](https://github.com/rootspec/demos)
- The CI workflow that exercises it: [`demos/.github/workflows/rebuild-demo.yml`](https://github.com/rootspec/demos/blob/main/.github/workflows/rebuild-demo.yml)
