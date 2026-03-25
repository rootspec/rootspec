#!/usr/bin/env bash
# test-local.sh — Set up a test project to try skills locally
# Usage: bash skills/test-local.sh [test-project-dir]
#
# Creates a test project with:
# - .claude/skills/ populated with all rs-* skills (including rs-shared)
# - A sample 00.SPEC_FRAMEWORK.md
# - A sample partial spec (L1 only) for testing validation/editing

set -euo pipefail

ROOTSPEC_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TEST_DIR="${1:-/tmp/rs-test-project}"

echo "Setting up test project at: $TEST_DIR"
echo "RootSpec source: $ROOTSPEC_DIR"
echo

# Create test project
mkdir -p "$TEST_DIR/.claude/skills"

# Install all skills into .claude/skills/ (symlinks to source for live editing)
# This mirrors the layout created by `npx skills add rootspec/rootspec`
for skill_dir in "$ROOTSPEC_DIR"/skills/rs-*/; do
  skill_name=$(basename "$skill_dir")
  [[ -f "$skill_dir/SKILL.md" ]] || continue
  ln -sfn "$skill_dir" "$TEST_DIR/.claude/skills/$skill_name"
done

# Copy framework file
cp "$ROOTSPEC_DIR/00.SPEC_FRAMEWORK.md" "$TEST_DIR/00.SPEC_FRAMEWORK.md"

# Create a sample L1 spec for testing rs-validate and rs-level
mkdir -p "$TEST_DIR/04.SYSTEMS"
cat > "$TEST_DIR/01.FOUNDATIONAL_PHILOSOPHY.md" << 'SPEC'
# Foundational Philosophy

## Mission

Help busy families plan meals effortlessly while reducing food waste.

## Design Pillars

### Effortless Relief

Dinner planning feels handled, not like another chore.

**User perspective:** "I don't have to think about what's for dinner."

### Resourceful Pride

Users feel good about using what they already have.

**User perspective:** "Nothing goes to waste in my kitchen."

### Invisible Improvement

Health and variety improve without conscious effort.

**User perspective:** "We're eating better and I didn't even try."

## Inviolable Principles

- Never guilt users about food waste or unhealthy choices
- Respect dietary restrictions without making them feel limiting
- Work with what's available, don't demand perfection

## North-Star Experience

A family sits down to a meal that used ingredients they already had,
discovered a new recipe they loved, and didn't spend more than 5 minutes
planning it. No one felt stressed. Everyone feels nourished.
SPEC

cat > "$TEST_DIR/02.STABLE_TRUTHS.md" << 'SPEC'
# Stable Truths

## Fridge-First Design

We always start with what users have, never with what they need to buy.
The INVENTORY_SYSTEM drives all meal suggestions.

## Simplicity Over Completeness

A good-enough meal plan delivered in 30 seconds beats a perfect one
that takes 10 minutes to configure.
SPEC

cat > "$TEST_DIR/04.SYSTEMS/SYSTEMS_OVERVIEW.md" << 'SPEC'
# Systems Overview

Three systems coordinate meal planning:

- **MEAL_PLANNING_SYSTEM** — generates weekly plans
- **INVENTORY_SYSTEM** — tracks what's in the fridge
- **RECIPE_SYSTEM** — matches recipes to available ingredients
SPEC

# Create .rootspecrc.json
cat > "$TEST_DIR/.rootspecrc.json" << 'JSON'
{
  "specDirectory": ".",
  "version": "4.6.2"
}
JSON

echo "Test project created!"
echo
echo "Files:"
find "$TEST_DIR" -not -path '*/\.*' -not -path "$TEST_DIR" -type f | sort | sed "s|$TEST_DIR/|  |"
echo
echo "Skills installed:"
ls "$TEST_DIR/.claude/skills/" | sed 's/^/  /'
echo
echo "To test:"
echo "  cd $TEST_DIR"
echo "  claude"
echo
echo "Then try:"
echo "  /rs-help"
echo "  /rs-validate"
echo "  /rs-level 4 add a grocery list system"
echo "  /rs-feature push notifications when groceries run low"
echo
echo "Note: Skills are symlinked — edits in $ROOTSPEC_DIR/skills/ are reflected immediately."
