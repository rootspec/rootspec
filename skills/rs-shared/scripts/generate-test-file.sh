#!/usr/bin/env bash
# generate-test-file.sh — Build a Cypress test file from spec YAML stories
# Usage: bash generate-test-file.sh <spec-dir> <output-path> [phase-filter]
#
# Reads multi-doc YAML story files, embeds them as string literals in a
# Cypress test file using the loadAndRun() pattern.
#
# If output file already exists, appends only NEW stories (by ID).
# Never overwrites or removes existing stories from the test file.
#
# Stories without DSL-format given/when/then (prose format) are skipped
# with a warning.

set -euo pipefail

SPEC_DIR="${1:?Usage: generate-test-file.sh <spec-dir> <output-path> [phase-filter]}"
OUTPUT="${2:?Usage: generate-test-file.sh <spec-dir> <output-path> [phase-filter]}"
PHASE="${3:-}"

STORIES_DIR="$SPEC_DIR/05.IMPLEMENTATION/USER_STORIES"

if [[ ! -d "$STORIES_DIR" ]]; then
  echo "ERROR: No user stories directory at $STORIES_DIR" >&2
  exit 1
fi

# Collect YAML files — filter by phase if provided
yaml_files=()
if [[ -n "$PHASE" ]]; then
  PHASE_DIR="$STORIES_DIR/by_phase/$PHASE"
  if [[ -d "$PHASE_DIR" ]]; then
    while IFS= read -r f; do yaml_files+=("$f"); done < <(find "$PHASE_DIR" \( -name "*.yaml" -o -name "*.yml" \) 2>/dev/null | sort)
  else
    # Try case-insensitive match
    while IFS= read -r f; do yaml_files+=("$f"); done < <(find "$STORIES_DIR/by_phase" -maxdepth 1 -iname "$PHASE" -type d 2>/dev/null | head -1 | xargs -I{} find {} \( -name "*.yaml" -o -name "*.yml" \) 2>/dev/null | sort)
  fi
else
  # Use by_phase view to avoid duplicates; fall back to all
  PHASE_DIR="$STORIES_DIR/by_phase"
  if [[ -d "$PHASE_DIR" ]]; then
    while IFS= read -r f; do yaml_files+=("$f"); done < <(find "$PHASE_DIR" \( -name "*.yaml" -o -name "*.yml" \) 2>/dev/null | sort)
  else
    while IFS= read -r f; do yaml_files+=("$f"); done < <(find "$STORIES_DIR" \( -name "*.yaml" -o -name "*.yml" \) 2>/dev/null | sort)
  fi
fi

if [[ ${#yaml_files[@]} -eq 0 ]]; then
  echo "ERROR: No YAML files found" >&2
  exit 1
fi

# Find existing story IDs if output file exists
existing_ids=()
if [[ -f "$OUTPUT" ]]; then
  while IFS= read -r id; do
    existing_ids+=("$id")
  done < <(grep -oE 'US-[0-9]+' "$OUTPUT" | sort -u)
fi

is_existing() {
  local id="$1"
  for eid in "${existing_ids[@]+"${existing_ids[@]}"}"; do
    [[ "$eid" == "$id" ]] && return 0
  done
  return 1
}

# Extract individual story documents from multi-doc YAML
# Each doc is separated by --- on its own line
extract_stories() {
  local file="$1"
  local current=""
  local in_story=false

  while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip comment-only lines at the top of a document
    if [[ "$in_story" == false ]] && [[ "$line" =~ ^#.* ]]; then
      continue
    fi

    if [[ "$line" == "---" ]]; then
      if [[ -n "$current" ]]; then
        echo "===STORY_BOUNDARY==="
        echo "$current"
      fi
      current=""
      in_story=false
      continue
    fi

    # Check if this line starts a story (has id: field)
    if [[ "$line" =~ ^id:\ * ]]; then
      in_story=true
    fi

    if [[ "$in_story" == true ]]; then
      current+="$line"$'\n'
    fi
  done < "$file"

  # Emit last story
  if [[ -n "$current" ]]; then
    echo "===STORY_BOUNDARY==="
    echo "$current"
  fi
}

# Check if a story has DSL-format given/when/then (arrays with step objects)
has_dsl_steps() {
  local story="$1"
  # DSL format has lines like "      - visit:" or "      - shouldExist:" under given/when/then
  echo "$story" | grep -qE '^\s+- (visit|click|fill|loginAs|seedItem|shouldContain|shouldExist):' 2>/dev/null
}

# Strip narrative fields from story YAML (saves space, not needed for tests)
strip_narratives() {
  local story="$1"
  # narrative: is followed by a | block with indented lines
  # Remove the narrative: line and all subsequent lines that are more indented than
  # the next sibling field (given:/when:/then:/id:/title:)
  echo "$story" | awk '
    /^[[:space:]]+narrative:/ {
      # Record indentation level of narrative field
      match($0, /^[[:space:]]+/)
      narr_indent = RLENGTH
      in_narrative = 1
      next
    }
    in_narrative {
      # Stay in narrative if line is blank or more indented than narrative field
      if (/^[[:space:]]*$/) next
      match($0, /^[[:space:]]*/)
      if (RLENGTH > narr_indent) next
      in_narrative = 0
    }
    !in_narrative { print }
  '
}

# Make a valid JS variable name from story ID
to_var_name() {
  local id="$1"
  echo "$id" | sed 's/US-/stories_/' | sed 's/-/_/g'
}

# Build the test file content
HEADER='import * as yaml from '"'"'js-yaml'"'"';
import { UserStorySchema } from '"'"'../support/schema'"'"';
import type { UserStory } from '"'"'../support/schema'"'"';
import { runSetupSteps, runAssertionSteps } from '"'"'../support/steps'"'"';

function loadAndRun(yamlContent: string) {
  const docs = yaml.loadAll(yamlContent) as UserStory[];
  for (const doc of docs) {
    if (!doc || !doc.id) continue;
    const story = UserStorySchema.parse(doc);
    const describeFn = story.skip ? describe.skip : story.only ? describe.only : describe;
    describeFn(`${story.id}: ${story.title}`, () => {
      for (const ac of story.acceptance_criteria) {
        const itFn = ac.skip ? it.skip : ac.only ? it.only : it;
        itFn(`${ac.id}: ${ac.title}`, () => {
          if (ac.given) runSetupSteps(ac.given);
          if (ac.when) runSetupSteps(ac.when);
          if (ac.then) runAssertionSteps(ac.then);
        });
      }
    });
  }
}'

# Collect new stories to add
new_stories=""
skipped=0
added=0

for yaml_file in "${yaml_files[@]}"; do
  # Process each story document in the file
  current_story=""
  while IFS= read -r line; do
    if [[ "$line" == "===STORY_BOUNDARY===" ]]; then
      if [[ -n "$current_story" ]]; then
        # Extract story ID
        story_id=$(echo "$current_story" | grep -oE '^id: (US-[0-9]+)' | head -1 | sed 's/id: //')

        if [[ -z "$story_id" ]]; then
          continue
        fi

        # Skip if already in test file
        if is_existing "$story_id"; then
          continue
        fi

        # Check for DSL format
        if ! has_dsl_steps "$current_story"; then
          echo "WARNING: $story_id has prose-format given/when/then — skipping (needs manual test)" >&2
          skipped=$((skipped + 1))
          current_story=""
          continue
        fi

        # Strip narratives and add
        cleaned=$(strip_narratives "$current_story")
        var_name=$(to_var_name "$story_id")
        story_title=$(echo "$current_story" | grep -E '^title:' | head -1 | sed 's/title: //')

        new_stories+="
// $story_id: $story_title
const $var_name = \`
$cleaned\`;
loadAndRun($var_name);
"
        added=$((added + 1))
      fi
      current_story=""
    else
      current_story+="$line"$'\n'
    fi
  done < <(extract_stories "$yaml_file")

  # Handle last story
  if [[ -n "$current_story" ]]; then
    story_id=$(echo "$current_story" | grep -oE '^id: (US-[0-9]+)' | head -1 | sed 's/id: //')
    if [[ -n "$story_id" ]] && ! is_existing "$story_id"; then
      if has_dsl_steps "$current_story"; then
        cleaned=$(strip_narratives "$current_story")
        var_name=$(to_var_name "$story_id")
        story_title=$(echo "$current_story" | grep -E '^title:' | head -1 | sed 's/title: //')
        new_stories+="
// $story_id: $story_title
const $var_name = \`
$cleaned\`;
loadAndRun($var_name);
"
        added=$((added + 1))
      else
        echo "WARNING: $story_id has prose-format given/when/then — skipping" >&2
        skipped=$((skipped + 1))
      fi
    fi
  fi
done

# Write output
if [[ -f "$OUTPUT" ]]; then
  # Append new stories to existing file
  if [[ -n "$new_stories" ]]; then
    echo "$new_stories" >> "$OUTPUT"
    echo "Appended $added new stories to $OUTPUT ($skipped skipped)"
  else
    echo "No new stories to add ($skipped skipped)"
  fi
else
  # Create new file with header + stories
  mkdir -p "$(dirname "$OUTPUT")"
  {
    echo "$HEADER"
    echo "$new_stories"
  } > "$OUTPUT"
  echo "Created $OUTPUT with $added stories ($skipped skipped)"
fi
