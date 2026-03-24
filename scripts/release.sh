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
#   ./scripts/release.sh 5.0.0
#   ./scripts/release.sh 5.1.0 --dry-run
#   ./scripts/release.sh 5.0.1 -y

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
  echo "Example: ./scripts/release.sh 5.0.0"
  exit 1
fi

# Validate version format
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: Version must be in format X.Y.Z (e.g., 5.0.0)"
  exit 1
fi

# Get current version from framework file
CURRENT_VERSION=$(grep -oE 'Version:\*\* [0-9]+\.[0-9]+\.[0-9]+' 00.SPEC_FRAMEWORK.md | head -1 | sed 's/Version:\*\* //')

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

echo ""
echo "Step 1: Update version references"
echo "----------------------------------"

echo "Updating 00.SPEC_FRAMEWORK.md..."
if [ "$DRY_RUN" != "--dry-run" ]; then
  sed -i '' -E 's/\*\*Version:\*\* [0-9]+\.[0-9]+\.[0-9]+/**Version:** '"$VERSION"'/' 00.SPEC_FRAMEWORK.md
  CURRENT_DATE=$(date +%Y-%m-%d)
  sed -i '' -E 's/\*\*Last Updated:\*\* [0-9]{4}-[0-9]{2}-[0-9]{2}/**Last Updated:** '"$CURRENT_DATE"'/' 00.SPEC_FRAMEWORK.md
else
  echo "[DRY RUN] Update version in 00.SPEC_FRAMEWORK.md to $VERSION"
  echo "[DRY RUN] Update last updated date to current date"
fi

echo "Updating README.md..."
if [ "$DRY_RUN" != "--dry-run" ]; then
  sed -i '' -E 's/v[0-9]+\.[0-9]+\.[0-9]+/v'"$VERSION"'/g' README.md
else
  echo "[DRY RUN] Update version references in README.md to v$VERSION"
fi

echo "Updating .claude-plugin/plugin.json..."
if [ "$DRY_RUN" != "--dry-run" ]; then
  sed -i '' -E 's/"version": "[0-9]+\.[0-9]+\.[0-9]+"/"version": "'"$VERSION"'"/' .claude-plugin/plugin.json
else
  echo "[DRY RUN] Update version in .claude-plugin/plugin.json to $VERSION"
fi

echo "Updating .claude-plugin/marketplace.json..."
if [ "$DRY_RUN" != "--dry-run" ]; then
  sed -i '' -E 's/"version": "[0-9]+\.[0-9]+\.[0-9]+"/"version": "'"$VERSION"'"/' .claude-plugin/marketplace.json
else
  echo "[DRY RUN] Update version in .claude-plugin/marketplace.json to $VERSION"
fi

echo ""
echo "Step 2: Verify version updates"
echo "-------------------------------"
UPDATED_VERSION=$(grep -oE 'Version:\*\* [0-9]+\.[0-9]+\.[0-9]+' 00.SPEC_FRAMEWORK.md | head -1 | sed 's/Version:\*\* //')
echo "Framework version: $UPDATED_VERSION"
if [ "$DRY_RUN" != "--dry-run" ] && [ "$UPDATED_VERSION" != "$VERSION" ]; then
  echo "Error: 00.SPEC_FRAMEWORK.md version not updated correctly"
  exit 1
fi
UPDATED_PLUGIN_VERSION=$(grep -oE '"version": "[0-9]+\.[0-9]+\.[0-9]+"' .claude-plugin/plugin.json | head -1 | sed 's/"version": "//' | sed 's/"//')
echo "Plugin version: $UPDATED_PLUGIN_VERSION"
if [ "$DRY_RUN" != "--dry-run" ] && [ "$UPDATED_PLUGIN_VERSION" != "$VERSION" ]; then
  echo "Error: .claude-plugin/plugin.json version not updated correctly"
  exit 1
fi
echo "Version updates verified."

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
run "git add 00.SPEC_FRAMEWORK.md README.md .claude-plugin/plugin.json .claude-plugin/marketplace.json"
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
