#!/bin/bash

# Fix Git permissions script
# Run this with: bash scripts/fix-git-permissions.sh

echo "🔧 Fixing Git repository permissions..."
echo ""

# Get the project root directory (one level up from scripts/)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "📂 Project root: $PROJECT_ROOT"
echo ""

# Change to project root
cd "$PROJECT_ROOT"

# Check if .git exists
if [ ! -d ".git" ]; then
    echo "❌ Error: .git directory not found in $PROJECT_ROOT"
    exit 1
fi

# Change ownership of .git/objects to current user
echo "Step 1: Fixing .git/objects ownership..."
sudo chown -R octavianmihai:staff .git/objects

# Fix permissions on .git directory
echo "Step 2: Fixing .git directory permissions..."
sudo chown -R octavianmihai:staff .git

# Set correct permissions
echo "Step 3: Setting correct permissions..."
chmod -R u+rwX .git

echo ""
echo "✅ Done! Git permissions fixed."
echo ""
echo "Now you can try your git commit again:"
echo "  git add ."
echo "  git commit -m 'your message'"
