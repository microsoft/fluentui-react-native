#!/bin/bash

# Test script to compare beachball bump output with check-packages-need-publishing.ts

set -e

# Activate mise if available
if [ -f "$HOME/.local/bin/mise" ]; then
  eval "$("$HOME/.local/bin/mise" activate bash)"
fi

echo "=========================================="
echo "Testing package check script"
echo "=========================================="
echo ""

# Step 1: Run beachball bump in dry-run mode to see what it would change
echo "Step 1: Running beachball bump (dry-run)..."
echo "=========================================="

# Create a temporary branch to test
TEMP_BRANCH="test-package-check-$(date +%s)"
git switch -c "$TEMP_BRANCH" 2>/dev/null || git checkout -b "$TEMP_BRANCH"

# Run beachball bump and capture the output
echo ""
echo "Running: npx beachball bump --verbose"
mise exec -- npx beachball bump --verbose 2>&1 | tee /tmp/beachball-bump-output.txt

echo ""
echo "=========================================="
echo "Step 2: Extracting packages bumped by beachball..."
echo "=========================================="

# Get list of modified package.json files
BUMPED_PACKAGES=$(git diff --name-only | grep "package.json" | grep -v "^package.json$" || true)

if [ -z "$BUMPED_PACKAGES" ]; then
  echo "⚠️  No packages were bumped by beachball"
  echo "This might mean there are no change files or they've already been processed"
else
  echo "Beachball bumped the following package.json files:"
  echo "$BUMPED_PACKAGES"
  echo ""

  # Extract package names and versions
  echo "Package versions after bump:"
  for pkg in $BUMPED_PACKAGES; do
    if [ -f "$pkg" ]; then
      NAME=$(grep '"name"' "$pkg" | head -1 | sed 's/.*"name": "\(.*\)".*/\1/')
      VERSION=$(grep '"version"' "$pkg" | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')
      PRIVATE=$(grep '"private"' "$pkg" | head -1 || echo "")

      if [ -z "$PRIVATE" ]; then
        echo "  - $NAME@$VERSION"
      fi
    fi
  done
fi

echo ""
echo "=========================================="
echo "Step 3: Running check-packages-need-publishing.ts..."
echo "=========================================="
echo ""

mise exec -- node scripts/check-packages-need-publishing.ts --dry-run

echo ""
echo "=========================================="
echo "Comparison complete!"
echo "=========================================="
echo ""
echo "To clean up:"
echo "  git checkout main"
echo "  git branch -D $TEMP_BRANCH"
