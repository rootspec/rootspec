#!/bin/bash
set -e

# RootSpec Release Script
# Usage: ./scripts/release.sh <version> [options]
#
# Options:
#   --dry-run    Preview changes without executing
#   -y           Auto-confirm all prompts
#
# Examples:
#   ./scripts/release.sh 6.1.0
#   ./scripts/release.sh 6.1.0 --dry-run
#   ./scripts/release.sh 6.0.1 -y

VERSION=$1
shift || true

# Parse options
DRY_RUN=""
AUTO_CONFIRM=""
for arg in "$@"; do
  case $arg in
    --dry-run) DRY_RUN="--dry-run" ;;
    -y) AUTO_CONFIRM="yes" ;;
  esac
done

if [ -z "$VERSION" ]; then
  echo "Usage: ./scripts/release.sh <version> [--dry-run] [-y]"
  echo "Example: ./scripts/release.sh 6.1.0"
  exit 1
fi

# Validate version format
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: Version must be in format X.Y.Z (e.g., 6.1.0)"
  exit 1
fi

# Get current version from framework file
CURRENT_VERSION=$(grep -oE 'Version:\*\* [0-9]+\.[0-9]+\.[0-9]+' 00.FRAMEWORK.md | head -1 | sed 's/Version:\*\* //')

echo "================================================"
echo "RootSpec Release Script"
echo "================================================"
echo "Current version: $CURRENT_VERSION"
echo "New version:     $VERSION"
echo "Dry run:         ${DRY_RUN:-no}"
echo "================================================"
echo ""

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo "Warning: You have uncommitted changes:"
  git status --short
  echo ""
  if [ "$DRY_RUN" != "--dry-run" ] && [ "$AUTO_CONFIRM" != "yes" ]; then
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
fi

# Function to run or print command
run() {
  if [ "$DRY_RUN" = "--dry-run" ]; then
    echo "[DRY RUN] $*"
  else
    echo "Running: $*"
    eval "$@"
  fi
}

# Function to update version in a file
# Usage: update_version <file> <sed-pattern> <description>
update_version() {
  local file="$1"
  local pattern="$2"
  local desc="$3"
  echo "  $file — $desc"
  if [ "$DRY_RUN" != "--dry-run" ]; then
    sed -i '' -E "$pattern" "$file"
  fi
}

echo ""
echo "Step 1: Update version references"
echo "----------------------------------"

CURRENT_DATE=$(date +%Y-%m-%d)

# Framework definition (edit the real file, not the root symlink — sed replaces symlinks on macOS)
update_version "skills/rs-shared/00.FRAMEWORK.md" \
  's/\*\*Version:\*\* [0-9]+\.[0-9]+\.[0-9]+/**Version:** '"$VERSION"'/' \
  "Version field"
update_version "skills/rs-shared/00.FRAMEWORK.md" \
  's/\*\*Last Updated:\*\* [0-9]{4}-[0-9]{2}-[0-9]{2}/**Last Updated:** '"$CURRENT_DATE"'/' \
  "Last Updated field"

# README
update_version "README.md" \
  's/Version v[0-9]+\.[0-9]+\.[0-9]+/Version v'"$VERSION"'/g' \
  "Version footer"

# Plugin registration
update_version ".claude-plugin/plugin.json" \
  's/"version": "[0-9]+\.[0-9]+\.[0-9]+"/"version": "'"$VERSION"'"/' \
  "Plugin version"
update_version ".claude-plugin/marketplace.json" \
  's/"version": "[0-9]+\.[0-9]+\.[0-9]+"/"version": "'"$VERSION"'"/' \
  "Marketplace version"

# Skill files (version in JSON examples)
update_version "skills/rs-init/SKILL.md" \
  's/"version": "[0-9]+\.[0-9]+\.[0-9]+"/"version": "'"$VERSION"'"/g' \
  "JSON examples (x2)"
update_version "skills/rs-spec/SKILL.md" \
  's/"version": "[0-9]+\.[0-9]+\.[0-9]+"/"version": "'"$VERSION"'"/g' \
  "JSON example"

# Test local script
update_version "skills/test-local.sh" \
  's/"version": "[0-9]+\.[0-9]+\.[0-9]+"/"version": "'"$VERSION"'"/g' \
  "JSON examples (x2)"

echo ""
echo "Step 2: Verify — no stale versions"
echo "------------------------------------"

# Check for any remaining old version strings (excluding CHANGELOG, UPGRADE, and this script)
STALE=$(grep -rn "$CURRENT_VERSION" \
  --include="*.md" --include="*.json" --include="*.sh" --include="*.ts" \
  --exclude-dir=node_modules --exclude-dir=.git \
  . 2>/dev/null \
  | grep -v CHANGELOG.md \
  | grep -v UPGRADE.md \
  | grep -v scripts/release.sh \
  | grep -v docs/archive/ \
  || true)

if [ -n "$STALE" ]; then
  echo "WARNING: Found stale version references ($CURRENT_VERSION):"
  echo "$STALE"
  echo ""
  if [ "$DRY_RUN" != "--dry-run" ] && [ "$AUTO_CONFIRM" != "yes" ]; then
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      echo "Fix stale references and re-run."
      exit 1
    fi
  fi
else
  echo "No stale version references found."
fi

# Verify key files updated correctly
if [ "$DRY_RUN" != "--dry-run" ]; then
  UPDATED_FW=$(grep -oE 'Version:\*\* [0-9]+\.[0-9]+\.[0-9]+' 00.FRAMEWORK.md | head -1 | sed 's/Version:\*\* //')
  UPDATED_PLUGIN=$(grep -oE '"version": "[0-9]+\.[0-9]+\.[0-9]+"' .claude-plugin/plugin.json | head -1 | sed 's/"version": "//' | sed 's/"//')
  echo "Framework: $UPDATED_FW"
  echo "Plugin:    $UPDATED_PLUGIN"
  if [ "$UPDATED_FW" != "$VERSION" ]; then
    echo "Error: 00.FRAMEWORK.md version not updated correctly"
    exit 1
  fi
  if [ "$UPDATED_PLUGIN" != "$VERSION" ]; then
    echo "Error: plugin.json version not updated correctly"
    exit 1
  fi
  echo "Verified."
fi

echo ""
echo "Step 3: Remind to update CHANGELOG.md and UPGRADE.md"
echo "-----------------------------------------------------"
echo "Please ensure CHANGELOG.md and UPGRADE.md are updated with:"
echo "  - New version section in CHANGELOG.md"
echo "  - Upgrade instructions in UPGRADE.md (if needed)"
echo ""
if [ "$DRY_RUN" != "--dry-run" ] && [ "$AUTO_CONFIRM" != "yes" ]; then
  read -p "Have you updated CHANGELOG.md and UPGRADE.md? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please update these files and run the script again."
    exit 1
  fi
else
  echo "Skipping confirmation (${DRY_RUN:-auto-confirm})"
fi

echo ""
echo "Step 4: Commit version updates"
echo "-------------------------------"
run "git add skills/rs-shared/00.FRAMEWORK.md 00.FRAMEWORK.md 00.AXIOMS.md README.md .claude-plugin/plugin.json .claude-plugin/marketplace.json skills/rs-init/SKILL.md skills/rs-spec/SKILL.md skills/test-local.sh"
run "git commit -m 'Release v$VERSION

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>'" || echo "Nothing new to commit."

echo ""
echo "Step 5: Create git tag"
echo "----------------------"
run "git tag -a v$VERSION -m 'Version $VERSION

See CHANGELOG.md for details.'"

echo ""
echo "Step 6: Push to GitHub"
echo "----------------------"
run "git push"
run "git push origin v$VERSION"

echo ""
echo "Step 7: Create GitHub release"
echo "-----------------------------"
# Extract changelog section for this version
RELEASE_NOTES=$(awk "/## \[$VERSION\]/,/## \[/" CHANGELOG.md | sed '1d;$d')
if [ -z "$RELEASE_NOTES" ]; then
  RELEASE_NOTES="See CHANGELOG.md for details."
fi

run "gh release create v$VERSION --title 'v$VERSION' --notes '$RELEASE_NOTES'"

echo ""
echo "================================================"
echo "Release v$VERSION complete!"
echo "================================================"
echo ""
echo "Verify:"
echo "  - GitHub: https://github.com/rootspec/rootspec/releases/tag/v$VERSION"
