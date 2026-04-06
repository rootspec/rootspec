# Workflows

How to use RootSpec, end to end. Each workflow is built from four skills: `/rs-init`, `/rs-spec`, `/rs-impl`, `/rs-validate`. Every skill accepts an optional **focus** argument that narrows what it works on.

---

## 1. New Project (Greenfield)

You have an idea but no code. RootSpec helps you specify it before building.

### Steps

```
/rs-init
```

Sets up the project: creates `rootspec/` directory, copies framework files, detects or creates prerequisites (dev server, test runner, pre-commit hook). You'll answer questions about your project setup.

```
/rs-spec
```

Walks you through a level-by-level interview to build your specification:

- **L1 — Philosophy:** What problem are you solving? What should users feel? You'll define design pillars — short emotional phrases that become decision filters for everything else.
- **L2 — Truths:** What strategic commitments are you making? What trade-offs? What does success look like?
- **L3 — Interactions:** How do users and the product interact? What are the behavioral patterns, flows, failure modes?
- **L4 — Systems:** What systems need to exist? What are their boundaries and responsibilities?
- **L5 — Implementation:** User stories (YAML with testable acceptance criteria) and fine-tuning parameters.

The skill validates your spec after each draft. When it passes, a hash is recorded so downstream skills know the spec is stable.

```
/rs-impl
```

Reads your user stories and implements them test-first, working through phases in order. Works autonomously — reads a story, builds the feature, runs the test, moves to the next. Reports progress as it goes.

```
/rs-validate
```

Runs the full test suite and produces a pass/fail report. Updates `rootspec/tests-status.json` with results per story and per acceptance criterion.

### When you're done

You have a validated specification that traces from philosophy to tests, and a working implementation that passes those tests. The spec is the source of truth; the code is derived from it.

---

## 2. Existing Codebase (Brownfield)

You have code but no specification. RootSpec helps you formalize what you've already built and close the gaps.

### Steps

```
/rs-init
```

Same as greenfield — creates the `rootspec/` structure and detects prerequisites. The init skill also scans your codebase to understand what frameworks, data models, and patterns are in use.

```
/rs-spec
```

The interview adapts to brownfield projects. Instead of inventing from scratch, the skill asks you to describe what already exists:

- **L1:** What was the original intent? What experience were you going for?
- **L2:** What commitments has the code already made? (The skill can scan your codebase to surface these.)
- **L3:** What interaction patterns exist? What's missing?
- **L4:** What systems exist in the code? The skill can profile your project to find them.
- **L5:** Write user stories for existing behavior AND for gaps you want to fill.

The goal isn't to document everything — it's to formalize the intent behind what exists, then identify what's unspecified.

```
/rs-impl
```

Implements stories for the gaps. Since existing features already have code, this focuses on missing behaviors and new acceptance criteria.

```
/rs-validate
```

Runs tests against both existing and new features. The report shows what's covered and what isn't.

### When you're done

Your existing code now has a specification backing it. New work is spec-driven. The gap between "what we intended" and "what we built" is visible and shrinking.

---

## 3. Adding a Feature

You have a working spec and want to add something new.

### Steps

```
/rs-spec add push notifications for overdue tasks
```

The focus argument tells the skill what you want to add. It analyzes the impact across all five levels:

- Does this feature support an existing design pillar? (L1 check)
- Does it require new strategic commitments or trade-offs? (L2)
- What new interaction patterns does it introduce? (L3)
- Does it need a new system or extend an existing one? (L4)
- What user stories capture the new behavior? (L5)

The skill walks through each affected level, drafts changes, and validates the result.

```
/rs-impl push notifications
```

Implements the new stories. Focuses only on stories related to the feature — doesn't re-implement everything.

```
/rs-validate
```

Runs tests for the new feature and regression tests for everything else.

### Tip

If you're not sure whether a feature belongs, check it against your design pillars. If it doesn't support at least one pillar, it might not belong in this product.

---

## 4. Changing the Spec

Something about the spec is wrong, outdated, or needs rethinking.

### Steps

```
/rs-spec update L2 to replace "speed over accuracy" with "accuracy over speed"
```

The focus tells the skill exactly what to change. It:

1. Makes the change at the specified level
2. Identifies downstream levels that may be affected (L2 changes can cascade to L3-L5)
3. Walks through each affected level with you
4. Validates the full spec when done

```
/rs-impl failing
```

After a spec change, some implementations may no longer match. Focus on `"failing"` to re-implement only the stories that broke.

```
/rs-validate
```

Confirms everything passes after the changes.

### Common spec changes

| Change | Command |
|--------|---------|
| Rethink a design pillar | `/rs-spec update L1 pillar name` |
| Add a trade-off | `/rs-spec add trade-off to L2` |
| Redesign an interaction flow | `/rs-spec update L3 checkout flow` |
| Add a new system | `/rs-spec add NOTIFICATION_SYSTEM to L4` |
| Rewrite user stories | `/rs-spec rewrite stories for TASK_SYSTEM` |
| Full rethink from philosophy down | `/rs-spec reinterpret` |

---

## 5. Ongoing Validation

Tests should run regularly — not just when you think something broke.

### Ad hoc

```
/rs-validate
```

Run everything. Get a report.

```
/rs-validate MVP
```

Run only stories tagged with the MVP phase. Useful for quick checks.

```
/rs-validate TASK_SYSTEM
```

Run tests for a specific system. Useful after touching code in that area.

### Pre-commit

If `/rs-init` set up a pre-commit hook, validation runs automatically before each commit. Failed tests block the commit.

### CI/CD

Run `/rs-validate` in your CI pipeline. The `rootspec/tests-status.json` output can be parsed by CI tools to report per-story results.

### Reading the report

```
Test Run: 2026-04-01T12:00:00Z

PASS: 8 stories
FAIL: 2 stories
SKIP: 1 story

Failures:
- US-103 AC-103-2: Expected element [data-test=feedback] to exist
- US-107 AC-107-1: Timeout waiting for /api/tasks response

Coverage:
- MVP: 10/12 passing
- post-launch: 0/5 (not yet implemented)
```

Failures tell you what broke and where. Coverage tells you how much of the spec is proven.

---

## Skill Reference

| Skill | What it does | Mode | Iteration cap |
|-------|-------------|------|---------------|
| `/rs-init [focus]` | Set up project structure and prerequisites | Interactive | 15 |
| `/rs-spec [focus]` | Create, update, or refine the specification | Interactive (skippable) | 20 |
| `/rs-impl [focus]` | Implement features from user stories | Non-interactive | 25 |
| `/rs-validate [focus]` | Run tests and report results | Non-interactive | 10 |

### Focus examples

| Skill | Focus | Effect |
|-------|-------|--------|
| `/rs-init` | `prerequisites` | Only detect/create prerequisites |
| `/rs-spec` | `add dark mode` | Add a feature across all levels |
| `/rs-spec` | `L3` | Work on Level 3 only |
| `/rs-spec` | `reinterpret` | Rethink the spec from L1 down |
| `/rs-impl` | `MVP` | Implement stories tagged with MVP phase |
| `/rs-impl` | `US-101` | Implement one specific story |
| `/rs-impl` | `TASK_SYSTEM` | Implement stories for one system |
| `/rs-validate` | `failing` | Re-run previously failing tests |

### Scope restrictions

Each skill has soft restrictions on what it can read and write:

| Skill | Can write | Cannot write |
|-------|-----------|-------------|
| `/rs-init` | `rootspec/`, `.rootspec.json`, templates | Application code |
| `/rs-spec` | `rootspec/` (spec files, `spec-status.json`) | Application code, test files, `rootspec/CONVENTIONS/` |
| `/rs-impl` | Application code, test files, `rootspec/tests-status.json`, `rootspec/CONVENTIONS/` | Spec files in `rootspec/` |
| `/rs-validate` | `rootspec/tests-status.json` only | Everything else |

These are enforced by the skill's instructions, not by the system. They prevent accidental cross-concern writes.
