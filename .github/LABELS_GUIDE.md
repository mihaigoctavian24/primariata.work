# GitHub Labels Guide

This guide explains the label system used in this repository and how to apply labels to issues and pull requests.

## 📋 Label Categories

### 🔢 Phase Labels (Implementation Phases)

Aligned with IMPLEMENTATION_ROADMAP.md phases:

- `phase-0` - Infrastructure & Foundation Setup
- `phase-1` - MVP Landing & Auth (M1)
- `phase-2` - Core Cereri Module (M2)
- `phase-3` - Integrations Live (M3)
- `phase-4` - Advanced Features (M4)
- `phase-5` - Production Launch (M5)
- `phase-6` - Documentation & Training (M6)

**Usage**: Apply the phase label that corresponds to the implementation phase where this work belongs.

### 🎯 Milestone Labels

Aligned with GitHub Milestones:

- `M1` - Landing Page & Authentication
- `M2` - Cereri Module
- `M3` - Integrations (certSIGN, Ghișeul.ro)
- `M4` - Advanced Features
- `M5` - Production Launch
- `M6` - Documentation & Training
- `M7` - Survey Platform (100% Complete)
- `M8` - User-Facing Dashboards (~50% Complete)
- `M9` - Management Dashboards (~10% Complete)

**Usage**: Apply the milestone label to link issues/PRs to specific project milestones.

### 🔧 Scope Labels (Feature Areas)

Aligned with commitlint scopes:

- `scope:landing` - Landing page features
- `scope:auth` - Authentication & authorization
- `scope:survey` - Survey Platform & Research Analytics
- `scope:cereri` - Cereri (Requests) Module
- `scope:integrations` - External integrations
- `scope:dashboard` - Dashboard features
- `scope:admin` - Admin features (3-level hierarchy)
- `scope:api` - API routes & backend logic
- `scope:ui` - UI components & styling
- `scope:db` - Database schema, migrations, RLS
- `scope:config` - Configuration files
- `scope:deps` - Dependencies & packages
- `scope:docs` - Documentation updates

**Usage**: Apply one or more scope labels to indicate which areas of the codebase are affected.

### 📝 Type Labels

- `type:bug` - Something isn't working
- `type:feature` - New feature or enhancement
- `type:docs` - Documentation improvements
- `type:refactor` - Code refactoring
- `type:test` - Testing improvements
- `type:perf` - Performance improvements
- `type:chore` - Maintenance tasks

**Usage**: Every issue/PR should have exactly ONE type label.

### 🎨 Priority Labels

- `priority:P0` 🔴 - Critical (blocking production, security)
- `priority:P1` 🟠 - High (important for milestone)
- `priority:P2` 🟡 - Medium (should be addressed soon)
- `priority:P3` 🟢 - Low (nice to have, future)

**Usage**: Apply priority to indicate urgency. Default to P2 if unsure.

### 📊 Status Labels

- `status:blocked` ⛔ - Blocked by dependencies
- `status:in-progress` 🔄 - Currently being worked on
- `status:review` 👀 - Awaiting code review
- `status:ready-to-merge` ✅ - Approved and ready
- `status:on-hold` ⏸️ - Paused, waiting for decision

**Usage**: Update status as work progresses through the workflow.

### 📏 Size Labels (Estimation)

- `size:XS` - < 2 hours
- `size:S` - 2-4 hours
- `size:M` - 1-2 days
- `size:L` - 3-5 days
- `size:XL` - > 1 week

**Usage**: Apply size during sprint planning for estimation.

### ⭐ Special Labels

- `good-first-issue` - Good for newcomers
- `help-wanted` - Extra attention needed
- `question` - Information request
- `security` - Security-related
- `breaking-change` - Breaks backward compatibility
- `needs-triage` - Needs initial review

## 🎯 Labeling Best Practices

### For New Issues

**Minimum Required Labels**:

1. ONE `type:*` label
2. ONE `priority:*` label
3. At least ONE `scope:*` label

**Example**:

```
type:feature
priority:P1
scope:admin
M9
phase-4
size:L
```

### For Pull Requests

**Minimum Required Labels**:

1. ONE `type:*` label
2. At least ONE `scope:*` label
3. ONE `status:*` label (updated as review progresses)

**Example**:

```
type:feature
scope:dashboard
scope:admin
status:review
M8
size:M
```

### Label Combinations

**Bug Fix Example**:

```yaml
Labels:
  - type:bug
  - priority:P1
  - scope:auth
  - status:in-progress
  - M1
  - size:S
```

**Feature Development Example**:

```yaml
Labels:
  - type:feature
  - priority:P2
  - scope:dashboard
  - scope:ui
  - status:review
  - M8
  - size:L
```

**Documentation Update Example**:

```yaml
Labels:
  - type:docs
  - scope:docs
  - priority:P2
  - M6
  - phase-6
  - size:XS
```

## 🔄 Syncing Labels to GitHub

### Option 1: Using GitHub CLI

```bash
# Install gh CLI if not already installed
# macOS: brew install gh
# Login: gh auth login

# Sync labels from .github/labels.yml
gh label create --repo mihaigoctavian24/primariata.work \
  --file .github/labels.yml
```

### Option 2: Using github-label-sync (npm)

```bash
# Install globally
pnpm add -g github-label-sync

# Sync labels
github-label-sync --access-token $GITHUB_TOKEN \
  --labels .github/labels.yml \
  mihaigoctavian24/primariata.work
```

### Option 3: Manual Creation

1. Go to repository settings
2. Navigate to "Issues" → "Labels"
3. Click "New label" for each label in `.github/labels.yml`
4. Copy name, description, and color from the YAML file

## 📖 Commit Message + Label Alignment

Labels and commit scopes are aligned:

```bash
# Commit message
feat(admin): add super_admin platform dashboard

# Corresponding labels for PR
type:feature
scope:admin
M9
priority:P1
```

This ensures consistency between git history and issue tracking!

## 🤝 Team Workflow

1. **Issue Creation**: Apply `type:*`, `priority:*`, `scope:*`, and `needs-triage`
2. **Triage**: Review lead removes `needs-triage`, adds milestone/phase labels
3. **Sprint Planning**: Add `size:*` labels during estimation
4. **Development Start**: Add `status:in-progress`, assign developer
5. **PR Creation**: Link to issue, inherit labels, add `status:review`
6. **Review Complete**: Change to `status:ready-to-merge`
7. **Merge**: Close issue, labels preserved in history

## 📊 Useful Filters

### View by Milestone

- All M8 issues: `is:issue label:M8`
- M9 in progress: `is:issue label:M9 label:status:in-progress`

### View by Priority

- Critical issues: `is:issue label:priority:P0`
- High priority bugs: `is:issue label:type:bug label:priority:P1`

### View by Scope

- Admin features: `is:issue label:scope:admin`
- Dashboard work: `is:issue label:scope:dashboard`

### View by Phase

- Phase 4 tasks: `is:issue label:phase-4`
- Phase 2 completed: `is:closed label:phase-2`

## 🔗 Related Files

- [labels.yml](.github/labels.yml) - Label definitions
- [commitlint.config.js](../commitlint.config.js) - Commit scope configuration
- [IMPLEMENTATION_ROADMAP.md](../.docs/03-implementation/IMPLEMENTATION_ROADMAP.md) - Project phases
- [README.md](../README.md) - Milestone tracking

---

**Last Updated**: 2026-01-19
**Maintained by**: Bubu & Dudu Dev Team
