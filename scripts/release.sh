#!/bin/bash
set -e

# RootSpec Release Script
# Usage: ./scripts/release.sh <version> [--dry-run]
#
# Example: ./scripts/release.sh 4.4.1
#          ./scripts/release.sh 4.5.0 --dry-run

VERSION=$1
DRY_RUN=$2

if [ -z "$VERSION" ]; then
  echo "Usage: ./scripts/release.sh <version> [--dry-run]"
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
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
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

# Files to update
FILES_TO_UPDATE=(
  "packages/cli/package.json"
  "prompts/README.md"
)

for file in "${FILES_TO_UPDATE[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating $file..."
    if [ "$DRY_RUN" != "--dry-run" ]; then
      sed -i '' "s/$CURRENT_VERSION/$VERSION/g" "$file"
    else
      echo "[DRY RUN] sed -i '' \"s/$CURRENT_VERSION/$VERSION/g\" $file"
    fi
  fi
done

echo ""
echo "Step 2: Verify no stale version references"
echo "-------------------------------------------"
echo "Checking for remaining references to $CURRENT_VERSION..."
STALE_REFS=$(grep -r "$CURRENT_VERSION" --include="*.md" --include="*.json" . 2>/dev/null | grep -v node_modules | grep -v CHANGELOG.md | grep -v UPGRADE.md || true)
if [ -n "$STALE_REFS" ]; then
  echo "Warning: Found remaining version references:"
  echo "$STALE_REFS"
  echo ""
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
else
  echo "No stale references found."
fi

echo ""
echo "Step 3: Remind to update CHANGELOG.md and UPGRADE.md"
echo "-----------------------------------------------------"
echo "Please ensure CHANGELOG.md and UPGRADE.md are updated with:"
echo "  - New version section in CHANGELOG.md"
echo "  - Upgrade instructions in UPGRADE.md (if needed)"
echo ""
read -p "Have you updated CHANGELOG.md and UPGRADE.md? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Please update these files and run the script again."
  exit 1
fi

echo ""
echo "Step 4: Commit version updates"
echo "-------------------------------"
run "git add -A"
run "git commit -m 'Release v$VERSION

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>'"

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
RELEASE_NOTES=$(awk "/## \[$VERSION\]/,/## \[/" CHANGELOG.md | head -n -1 | tail -n +2)
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
