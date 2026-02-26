I have an existing RootSpec specification (framework version {{FRAMEWORK_VERSION}}) that I want to reinterpret or rebuild. My spec is in: {{SPEC_DIR}}/

Please read my existing specification files before we begin:
- {{SPEC_DIR}}/01.FOUNDATIONAL_PHILOSOPHY.md
- {{SPEC_DIR}}/02.STABLE_TRUTHS.md
- {{SPEC_DIR}}/03.INTERACTION_ARCHITECTURE.md
- {{SPEC_DIR}}/04.SYSTEMS/SYSTEMS_OVERVIEW.md
- {{SPEC_DIR}}/05.IMPLEMENTATION/ (user stories and fine-tuning)

Also fetch the latest framework definition:
https://raw.githubusercontent.com/rootspec/rootspec/main/00.SPEC_FRAMEWORK.md

---

## Context: Existing Spec

Here's what I currently have defined:

**Design Pillars:**
{{#EACH EXISTING_PILLARS}}
- {{ITEM}}
{{/EACH}}
{{#IF NO_EXISTING_PILLARS}}(Could not extract — please read 01.FOUNDATIONAL_PHILOSOPHY.md directly){{/IF}}

**Systems:**
{{#EACH EXISTING_SYSTEMS}}
- {{ITEM}}
{{/EACH}}
{{#IF NO_EXISTING_SYSTEMS}}(Could not extract — please read 04.SYSTEMS/ directly){{/IF}}

---

## Why "Restart" vs. "Migrate"

- **Migrate** (`rootspec prompts migrate`): The format or structure changed — update syntax and sections to match new framework version.
- **Restart** (this prompt): The *philosophy* or *product direction* has drifted. You want to reinterpret what the product is, what it should feel like, or how it should be built.

Use this prompt when your existing spec feels like a constraint rather than a guide.

---

## Step 1: Honest Reflection

Before touching any files, let's understand what changed. Please walk me through these questions:

**About Level 1 (Why & Design Pillars):**
- Which Design Pillars still ring true? Which feel wrong or outdated?
- Has your mission statement evolved since the spec was written?
- What has the product *taught* you that the original spec got wrong?
- If you were defining the product today for the first time, what would the pillars be?

**About Level 2 (Strategies):**
- Which Stable Truths have been validated by experience? Which turned out to be false?
- Have new non-negotiables emerged? Have old ones been abandoned?
- What tradeoffs does the team make now that aren't reflected in the spec?

**About Level 3 (Interaction Patterns):**
- Do the documented behavioral loops still match how users actually use the product?
- What new patterns have emerged organically that belong in the spec?
- What in the spec never made it into the product — and should it?

**About Level 4 (Systems):**
- Has the system architecture changed significantly?
- Are there new systems, merged systems, or deleted systems?
- Do the documented interfaces still match the actual implementation?

**About Level 5 (User Stories):**
- Do the existing user stories still reflect the right user outcomes?
- Are there new critical paths not covered?
- Are fine-tuning values still accurate, or are they stale?

---

## Step 2: What to Keep vs. What to Rethink

After reflection, categorize each section:

### Level 1 — Foundational Philosophy

| Item | Keep | Revise | Replace | Remove |
|------|------|--------|---------|--------|
| Mission | | | | |
| Pillar 1 | | | | |
| Pillar 2 | | | | |
| Pillar 3 | | | | |
| ... | | | | |

**Keep:** Still accurate and guiding decisions
**Revise:** Right intent, wrong wording or scope
**Replace:** Outdated — new philosophy needed
**Remove:** No longer relevant

Apply the same table for L2, L3, L4, L5.

---

## Step 3: What Would You Write Today?

For any section marked **Replace**, treat it like a greenfield section. Ask yourself:

- What problem does this product solve now (not when the spec was written)?
- What should users feel when using it?
- What decisions are non-negotiable today?
- What have you learned that your original self didn't know?

Use the same level-by-level process as `initialize-spec.md`, but grounded in real product experience.

---

## Step 4: Decide — Replace In Place or Create spec-v2/

**Option A: Replace In Place**

Edit the existing spec files directly. Preserve git history — the old spec becomes historical context via `git log`.

Best when:
- Most of the spec is being kept or revised (not replaced)
- The team is aligned on the new direction
- You don't need to reference old and new spec simultaneously

**Option B: Create spec-v2/ Alongside**

Create a parallel spec directory (e.g., `spec-v2/`) with the new interpretation. Keep the old spec intact until migration is complete.

Best when:
- Major philosophy change — old and new are genuinely different
- You need to run old and new spec simultaneously during transition
- You want to preserve old user stories as historical context

---

## Step 5: Rebuild

Based on the reflection and decisions above, let's rebuild the spec. Work level by level:

**Level 1 first** — if the pillars change, everything below changes too.

For each level:
1. State what's being kept, revised, replaced, or removed
2. Write the new content
3. Verify it doesn't contradict any higher levels
4. Note any cascading changes needed at lower levels

---

## Cascading Change Tracker

As you update higher levels, track downstream impact:

| Change Made | Level Changed | Impacts | Action Needed |
|-------------|---------------|---------|---------------|
| | | | |

This ensures the full spec stays internally consistent.

---

## Reference: What Makes a Good Restart

**Signs you're on the right track:**
- The new Design Pillars feel more *specific* and *true* than the old ones
- Team members say "yes, that's actually what we believe" instead of "sure, that sounds fine"
- The new spec would have prevented real mistakes made under the old one
- You can point to decisions the new spec would change

**Signs you're going in circles:**
- The new pillars are just reworded versions of the old ones
- You're rewriting the spec to match what was already built (that's `adopt`, not `restart`)
- The motivation is "it's been a while" rather than a genuine shift in direction

---

## Anti-Patterns

- **Cleaning up format instead of rethinking content** — use `migrate` for format changes
- **Rewriting to justify past decisions** — the spec should guide future decisions
- **Removing pillars because the product doesn't support them yet** — keep aspirational, adjust L5 scope
- **Expanding to 6+ pillars** — focus; more pillars dilutes the filter

---

Please start by reading my existing spec files, then ask me the reflection questions one level at a time before proposing any changes.
