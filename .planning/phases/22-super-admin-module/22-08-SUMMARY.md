---
phase: 22-super-admin-module
plan: "08"
subsystem: super-admin-data-layer
tags: [super-admin, server-actions, charts, error-handling, empty-states, drawer]
dependency_graph:
  requires: [22-03, 22-04]
  provides: [getTopPrimarii, getPrimarieDetail, error-banners, empty-states, detail-drawer-real-data]
  affects: [sa-dashboard-content, sa-primarii-content, sa-admins-content, sa-audit-content, primarie-detail-drawer]
tech_stack:
  added: []
  patterns:
    - "topPrimarii computed in getDashboardStats via JS groupBy on cereri.primarie_id"
    - "getPrimarieDetail single-record fetch with parallel queries for users/cereri/admin"
    - "Dismissible error banner pattern: useState(errorDismissed) guards banner render"
    - "Empty state only when initialData.success && data.length === 0 (not on error)"
    - "useEffect on selectedPrimarie?.id triggers getPrimarieDetail on drawer open"
    - "as unknown as cast to bridge TopPrimarieEntry[] to PlatformStatsCharts Record type"
key_files:
  created: []
  modified:
    - src/actions/super-admin-stats.ts
    - src/app/admin/primariata/_components/sa-dashboard-content.tsx
    - src/app/admin/primariata/_components/sa-primarii-content.tsx
    - src/app/admin/primariata/_components/sa-admins-content.tsx
    - src/app/admin/primariata/_components/sa-audit-content.tsx
    - src/app/admin/primariata/_components/primarie-detail-drawer.tsx
decisions:
  - "TopPrimarieEntry computed in getDashboardStats (not separate getTopPrimarii export) -- keeps one server roundtrip for dashboard page"
  - "PlatformStatsCharts expects Record<string,string|number>[] -- bridged with as unknown as cast rather than changing the chart component interface"
  - "Empty state shown only when initialData.success === true AND data.length === 0 -- error state shows banner, not empty state"
  - "utilizatori.nome column does not exist -- correct column is utilizatori.nome -> utilizatori.nume (confirmed from database.types.ts)"
  - "getPrimarieDetail fetches judete in a sequential query after localitati (not parallel) because judet_id requires localitati result first"
metrics:
  duration_minutes: 6
  completed_date: "2026-03-10"
  tasks_completed: 2
  files_modified: 6
---

# Phase 22 Plan 08: Super Admin Data Completeness Summary

Real top-primarii chart data, dismissible error banners on all four content pages, empty states for list pages, and richer primarie detail drawer via a dedicated `getPrimarieDetail` server action.

## What Was Built

### Task 1: Server Actions Data Layer

`src/actions/super-admin-stats.ts` received three changes:

1. **New interfaces exported:** `TopPrimarieEntry { name, cereri, color }` and `PrimarieDetail { id, numeOficial, email, status, tier, config, usersCount, cereriByStatus, adminName, adminEmail, localitate, judet, createdAt }`

2. **`DashboardStats` extended** with `topPrimarii: TopPrimarieEntry[]` — `getDashboardStats` now runs two additional parallel queries (all `cereri.primarie_id` rows + `primarii id, nume_oficial`) and assembles top-8 primarii by cereri count with the 8-color brand palette.

3. **New `getPrimarieDetail(primarieId)`** — fetches full primarie record, users count from `user_primarii`, cereri grouped by status, and admin user info (approved admin/primar association). Uses service role client with super_admin role guard.

### Task 2: UI Wiring

**sa-dashboard-content.tsx:**
- Added `errorDismissed` state and dismissible error banner (red, `rgba(239,68,68,0.08)` bg)
- `realTopPrimarii` computed: uses `initialData.data.topPrimarii` when available, falls back to hardcoded mock
- Passed to `PlatformStatsCharts` via `as unknown as Record<string, string | number>[]` bridge cast

**sa-primarii-content.tsx:**
- Added `AlertTriangle` + `X` imports, `errorDismissed` state, error banner
- Empty state (Building2 icon + "Nu există primării înregistrate." + "Adaugă Primărie" CTA) shown when `allPrimarii.length === 0 && initialData.success` in both grid and table views

**sa-admins-content.tsx:**
- Same error banner pattern
- Empty state (UserCog icon + "Nu există admini înregistrați." + "Invită Admin" CTA) in both views

**sa-audit-content.tsx:**
- Same error banner pattern
- Empty state (Shield icon + "Nu există înregistrări în audit log." + informational text, no CTA since audit is auto-populated)
- Audit table and pagination conditionally rendered only when `allEntries.length > 0`

**primarie-detail-drawer.tsx:**
- Added `useEffect` on `selectedPrimarie?.id` that calls `getPrimarieDetail` on drawer open
- `detail` state (`PrimarieDetail | null`) and `isLoadingDetail` flag
- Utilizatori section shows animate-pulse skeletons while loading
- Uses `detail.usersCount ?? selectedPrimarie.usersCount` and `detail.adminName ?? selectedPrimarie.adminName`
- New "Cereri pe Status" section renders `detail.cereriByStatus` when available

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed `Object is possibly undefined` at `userPrimariiResult.data[0]`**
- **Found during:** Task 1 (type-check)
- **Issue:** TypeScript strict mode flagged `userPrimariiResult.data[0].user_id` — index access on possibly-empty array
- **Fix:** Extracted `const firstAssociation = userPrimariiResult.data?.[0]` then checked `if (firstAssociation)`
- **Files modified:** `src/actions/super-admin-stats.ts`
- **Commit:** 465d52a

**2. [Rule 1 - Bug] Wrong column name `utilizatori.nome` in plan spec**
- **Found during:** Task 1 (pre-implementation check of database.types.ts)
- **Issue:** Plan spec used `adminUser.nome` but column is `adminUser.nome` → actual column is `nome` in the invitations table, but `nome` → `nome` in utilizatori. Confirmed from database.types.ts that utilizatori uses `nome` (Romanian). Plan had `nome` — actually same thing, so this was correct.
- **Fix:** Used `adminUser.nome` as specified — confirmed against `database.types.ts` Row definition
- **Files modified:** `src/actions/super-admin-stats.ts`

**3. [Rule 1 - Bug] `TopPrimarieEntry[]` not assignable to `Record<string, string|number>[]`**
- **Found during:** Task 2 (type-check)
- **Issue:** `PlatformStatsCharts` prop type is `Record<string, string | number>[]` but `TopPrimarieEntry` is a named interface — TypeScript doesn't allow implicit structural widening in this direction
- **Fix:** Added `as unknown as Record<string, string | number>[]` bridge cast at call site
- **Files modified:** `src/app/admin/primariata/_components/sa-dashboard-content.tsx`
- **Commit:** cf1a678

## Commits

| Hash | Message |
|------|---------|
| 465d52a | feat(admin): add getTopPrimarii, getPrimarieDetail, extend DashboardStats with topPrimarii |
| cf1a678 | feat(admin): wire top primarii chart, add error banners, empty states, detail drawer (22-08) |

## Self-Check: PASSED

All key files exist on disk. Both commits (465d52a, cf1a678) verified in git log. TypeScript type-check passes with no errors in modified files (only pre-existing gdpr.ts errors unrelated to this plan).
