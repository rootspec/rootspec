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
#   ./scripts/release.sh 4.4.1
#   ./scripts/release.sh 4.5.0 --dry-run
#   ./scripts/release.sh 4.4.1 -y

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
  echo "Example: ./scripts/release.sh 4.4.1"
  exit 1
fi

# Validate version format
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: Version must be in format X.Y.Z (e.g., 4.4.1)"
  exit 1
fi

# Get current version from package.json
CURRENT_VERSION=$(grep '"version"' packages/cli/package.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')

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

# Files to update with their version patterns
# package.json uses "version": "X.Y.Z"
# README.md uses vX.Y.Z
echo "Updating packages/cli/package.json..."
if [ "$DRY_RUN" != "--dry-run" ]; then
  sed -i '' -E 's/"version": "[0-9]+\.[0-9]+\.[0-9]+"/"version": "'"$VERSION"'"/' packages/cli/package.json
else
  echo "[DRY RUN] Update version in packages/cli/package.json to $VERSION"
fi

echo "Updating prompts/*.md..."
if [ "$DRY_RUN" != "--dry-run" ]; then
  find prompts -name "*.md" -exec sed -i '' -E 's/v[0-9]+\.[0-9]+\.[0-9]+/v'"$VERSION"'/g' {} \;
else
  echo "[DRY RUN] Update version references in prompts/*.md to v$VERSION"
  grep -r "v[0-9]\+\.[0-9]\+\.[0-9]\+" prompts/ --include="*.md" | head -5
fi

echo "Updating README.md..."
if [ "$DRY_RUN" != "--dry-run" ]; then
  sed -i '' -E 's/v[0-9]+\.[0-9]+\.[0-9]+/v'"$VERSION"'/g' README.md
else
  echo "[DRY RUN] Update version references in README.md to v$VERSION"
fi

echo "Updating 00.SPEC_FRAMEWORK.md..."
if [ "$DRY_RUN" != "--dry-run" ]; then
  # Update version number
  sed -i '' -E 's/\*\*Version:\*\* [0-9]+\.[0-9]+\.[0-9]+/**Version:** '"$VERSION"'/' 00.SPEC_FRAMEWORK.md
  # Update last updated date to current date in YYYY-MM-DD format
  CURRENT_DATE=$(date +%Y-%m-%d)
  sed -i '' -E 's/\*\*Last Updated:\*\* [0-9]{4}-[0-9]{2}-[0-9]{2}/**Last Updated:** '"$CURRENT_DATE"'/' 00.SPEC_FRAMEWORK.md
else
  echo "[DRY RUN] Update version in 00.SPEC_FRAMEWORK.md to $VERSION"
  echo "[DRY RUN] Update last updated date to current date"
fi

echo ""
echo "Step 2: Verify version updates"
echo "-------------------------------"
UPDATED_PKG_VERSION=$(grep '"version"' packages/cli/package.json | head -1 | sed 's/.*"version": "\([^"]*\)".*/\1/')
echo "package.json version: $UPDATED_PKG_VERSION"
if [ "$UPDATED_PKG_VERSION" != "$VERSION" ]; then
  echo "Error: package.json version not updated correctly"
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
run "git add packages/cli/package.json prompts/ README.md 00.SPEC_FRAMEWORK.md"
run "git commit -m 'Release v$VERSION

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>'" || echo "Nothing new to commit."

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
echo "Step 8: Publish to npm"
echo "----------------------"
run "cd packages/cli && npm publish"

echo ""
echo "================================================"
echo "Release v$VERSION complete!"
echo "================================================"
echo ""
echo "Verify:"
echo "  - GitHub: https://github.com/rootspec/rootspec/releases/tag/v$VERSION"
echo "  - npm: https://www.npmjs.com/package/rootspec"
