---
name: rs-init
description: Initialize a RootSpec project — create the rootspec/ directory, copy framework files, detect or create prerequisites. Use this when a user wants to start using RootSpec in a project, whether it's greenfield or has existing code.
---

You are setting up a project to use RootSpec. Start by telling the developer what you're about to do:

"I'll set up RootSpec for this project — create the spec directory, copy the framework files, and configure prerequisites (dev server, test runner, etc.). This takes a minute or two."

## Step 1: Scan the project

Understand what exists. Run these from the project root:

```bash
bash "$(dirname "$0")/../rs-shared/scripts/scan-spec.sh" .
bash "$(dirname "$0")/../rs-shared/scripts/scan-project.sh" .
```

If these paths don't resolve, find the scripts by searching for `scan-spec.sh` in the skills directory.

Based on the output, determine the situation:

- **Fresh init** — no `.rootspec.json`, no `rootspec/` directory. Most common case.
- **Partial init** — some files exist but others are missing (interrupted previous init).
- **Re-init** — `.rootspec.json` exists. Ask the developer what they want to update. Do NOT overwrite existing spec files (01-05). You may update `00.AXIOMS.md` and `00.FRAMEWORK.md` to the latest bundled versions if the developer confirms.
- **Already initialized** — everything exists. Tell the developer and suggest `/rs-spec` instead.

Report what you found before proceeding.

## Step 2: Create the spec directory and base files

Create whatever is missing:

1. **`rootspec/` directory** — `mkdir -p rootspec`
2. **`rootspec/00.AXIOMS.md`** — copy from the bundled version at `../rs-shared/00.AXIOMS.md` (relative to this skill's directory). Read the source file and write it to the project.
3. **`rootspec/00.FRAMEWORK.md`** — copy from `../rs-shared/00.FRAMEWORK.md`. Same approach.
4. **`rootspec/spec-status.json`**:
   ```json
   { "hash": null, "validatedAt": null, "valid": false, "version": "6.2.0" }
   ```
5. **`rootspec/tests-status.json`**:
   ```json
   { "lastRun": null, "stories": {} }
   ```

## Step 3: Detect or create prerequisites

Run the detection script:

```bash
bash "$(dirname "$0")/../rs-shared/scripts/detect-prerequisites.sh" .
```

The script outputs `DEV_SERVER=`, `PRE_COMMIT_HOOK=`, `RELEASE_SCRIPT=`, `VALIDATION_SCRIPT=` lines with detected paths or `none`.

Read `../rs-shared/fragments/prerequisites.md` for the full reference on what each prerequisite is.

Report what was found. For each prerequisite with `=none`, ask the developer:
- "No [prerequisite] detected. Want me to create a template, or skip for now?"

For each prerequisite:
- **Found** → confirm with developer, record the path
- **Not found** → offer to create a template or skip
- **Skipped** → record `null`

### Dev server template

When creating the dev server template:

1. **Copy the bundled template** from `../rs-shared/scripts/dev.sh` to `scripts/dev.sh` in the project. Make it executable. Read the source and write it — don't generate from scratch.
2. **Edit the `DEV_CMD` variable** at the top of the copied script to match the project's actual dev command (e.g., `npm run dev`, `npx vite`, etc.).
3. **Add package.json scripts** if `package.json` exists — add `dev:start`, `dev:stop`, and `dev:restart` entries that delegate to `scripts/dev.sh`:
   ```json
   "dev:start": "./scripts/dev.sh start",
   "dev:stop": "./scripts/dev.sh stop",
   "dev:restart": "./scripts/dev.sh restart"
   ```
   If `package.json` doesn't exist, tell the developer: "No package.json found — run `npm init` first if you want convenience scripts."
4. **Update .gitignore** — if `.gitignore` exists, add `.dev-server.pid` and `.dev-server.log` if not already present.

## Step 4: Write `.rootspec.json`

Create (or update) `.rootspec.json` at the project root:

```json
{
  "version": "6.2.0",
  "specDirectory": "rootspec",
  "prerequisites": {
    "devServer": null,
    "preCommitHook": null,
    "releaseScript": null,
    "validationScript": null
  }
}
```

Fill in prerequisite values with paths or commands discovered in Step 3.

## Step 5: Verify and hand off

Run the verification script:

```bash
bash "$(dirname "$0")/../rs-shared/scripts/verify-init.sh" .
```

If anything is reported missing, create it. Then report:

"Project initialized. Here's what was set up:
- [list files created]
- [list prerequisites configured or skipped]

Run `/rs-spec` to create your specification."

## Focus

If the developer passes an argument:
- `"resume"` → skip to whatever step is incomplete
- `"prerequisites"` → only run Steps 3-4 (detect/create prerequisites, update .rootspec.json)

## Scope

- **CAN read:** all project files
- **CAN write:** `rootspec/` directory (including `spec-status.json`, `tests-status.json`), `.rootspec.json`, prerequisite templates (e.g., `scripts/dev.sh`)
- **SHOULD NOT write:** application source code, existing test files
