#!/bin/bash
# sync-github-labels.sh - Sync GitHub labels from .github/labels.yml
# Usage: ./scripts/sync-github-labels.sh

set -e

REPO="mihaigoctavian24/primariata.work"
LABELS_FILE=".github/labels.yml"

echo "🏷️  GitHub Labels Sync Script"
echo "================================"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed"
    echo ""
    echo "Install it:"
    echo "  macOS:   brew install gh"
    echo "  Linux:   curl -sS https://webi.sh/gh | sh"
    echo "  Windows: scoop install gh"
    echo ""
    echo "Then authenticate:"
    echo "  gh auth login"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Error: Not authenticated with GitHub CLI"
    echo ""
    echo "Run: gh auth login"
    exit 1
fi

# Check if labels file exists
if [ ! -f "$LABELS_FILE" ]; then
    echo "❌ Error: Labels file not found: $LABELS_FILE"
    exit 1
fi

echo "📂 Labels file: $LABELS_FILE"
echo "🔗 Repository: $REPO"
echo ""

# Confirm before proceeding
read -p "This will sync labels to GitHub. Continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 0
fi

echo ""
echo "🔄 Syncing labels..."
echo ""

# Parse YAML and create/update labels
# Note: This requires yq (brew install yq) for proper YAML parsing
if ! command -v yq &> /dev/null; then
    echo "⚠️  Warning: yq not installed, using basic parsing"
    echo "   For better results: brew install yq"
    echo ""

    # Basic parsing without yq (less reliable)
    gh label list --repo "$REPO" > /tmp/existing_labels.txt

    echo "✅ Manual sync required. Please run:"
    echo ""
    echo "   gh label create --repo $REPO --file $LABELS_FILE"
    echo ""
    echo "Or use GitHub UI to create labels from $LABELS_FILE"
    exit 0
fi

# Count total labels
TOTAL_LABELS=$(yq eval '.[] | .name' "$LABELS_FILE" | wc -l | tr -d ' ')
CURRENT=0

# Parse and create each label
while IFS= read -r label_name; do
    CURRENT=$((CURRENT + 1))

    # Get label details
    DESCRIPTION=$(yq eval ".[] | select(.name == \"$label_name\") | .description" "$LABELS_FILE")
    COLOR=$(yq eval ".[] | select(.name == \"$label_name\") | .color" "$LABELS_FILE")

    # Remove # from color if present
    COLOR="${COLOR#\#}"

    # Progress indicator
    PERCENT=$((CURRENT * 100 / TOTAL_LABELS))
    echo -ne "[$CURRENT/$TOTAL_LABELS] ($PERCENT%) Processing: $label_name\r"

    # Check if label exists
    if gh label list --repo "$REPO" --search "$label_name" --json name --jq '.[] | .name' | grep -q "^$label_name$"; then
        # Update existing label
        gh label edit "$label_name" \
            --repo "$REPO" \
            --description "$DESCRIPTION" \
            --color "$COLOR" \
            2>/dev/null || echo "⚠️  Warning: Failed to update $label_name"
    else
        # Create new label
        gh label create "$label_name" \
            --repo "$REPO" \
            --description "$DESCRIPTION" \
            --color "$COLOR" \
            2>/dev/null || echo "⚠️  Warning: Failed to create $label_name"
    fi
done < <(yq eval '.[] | .name' "$LABELS_FILE")

echo ""
echo ""
echo "✅ Label sync complete!"
echo ""
echo "📊 View labels at:"
echo "   https://github.com/$REPO/labels"
echo ""
echo "📖 Documentation:"
echo "   .github/LABELS_GUIDE.md"
