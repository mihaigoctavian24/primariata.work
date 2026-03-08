---
phase: 20-pixel-perfect-admin-pages-figma-alignment-for-monitorizare-utilizatori-cereri-documente-financiar-calendar
plan: "03"
subsystem: ui
tags: [recharts, framer-motion, financiar, admin, tailwind, animated-counter]

requires:
  - phase: 20-02
    provides: Cereri Supervizare Kanban rewrite (same wave pattern)
  - phase: 19
    provides: financiar-utils.ts aggregation functions, page.tsx Server Component shell

provides:
  - 6 KPI cards with AnimatedCounter (Colectat, Target, Tranzacții, Rată succes, Rată eșec, Val. medie)
  - 4 mini status filter cards synced with TransactionList
  - Monthly AreaChart (colectat vs esuat, gradient fills, 6m/1y toggle)
  - Daily BarChart (volume per day of week)
  - Payment methods bar list with animated fills (Card/Transfer/Numerar)
  - 6-category grid with animated progress bars (graceful mock)
  - Filterable + searchable transaction list with expandable rows and retry button
  - aggregateByMonthFull() utility for colectat+esuat monthly shape

affects:
  - 20-04 (Calendar admin page — next wave)
  - financiar-utils.ts (MonthlyRevenueExtended interface added)

tech-stack:
  added: []
  patterns:
    - "6/page pagination with safe page clamping"
    - "txFilter shared state pattern (lifted to coordinator)"
    - "aggregateByMonthFull for colectat+esuat shape (not target)"
    - "MOCK_CATEGORIES constant with comment for graceful fallback"
    - "colectatGrad20/esuatGrad20 unique SVG gradient IDs to avoid conflicts"

key-files:
  created:
    - src/components/admin/financiar/financiar-skeleton.tsx
    - src/components/admin/financiar/kpi-cards.tsx
    - src/components/admin/financiar/revenue-charts.tsx
    - src/components/admin/financiar/transaction-list.tsx
    - src/components/admin/financiar/financiar-content.tsx
  modified:
    - src/lib/financiar-utils.ts
    - src/app/app/[judet]/[localitate]/admin/financiar/page.tsx

key-decisions:
  - "aggregateByMonthFull() added to financiar-utils.ts — returns colectat+esuat shape (not target) needed for AreaChart"
  - "page.tsx switches from aggregateByMonth to aggregateByMonthFull for correct chart data"
  - "CustomTooltip uses CSS tokens (bg-popover border-border) not hardcoded dark hex"
  - "6/page pagination (down from 20) per plan spec — matches Figma compact table"
  - "txFilter state lifted to FinanciarContent coordinator — KpiCards mini-cards and TransactionList share it"
  - "MOCK_CATEGORIES with comment in revenue-charts.tsx per plan — plati table has no category column"
  - "SVG gradient IDs named colectatGrad20/esuatGrad20 — unique IDs prevent conflicts with other Recharts on page"

requirements-completed: [FIN-01, FIN-02, FIN-03, FIN-04, FIN-05]

duration: 7min
completed: 2026-03-08
---

# Phase 20 Plan 03: Financiar Pixel-Perfect Rewrite Summary

**Full Financiar admin page rewrite: 6 KPI cards, AreaChart colectat+esuat, daily BarChart, payment methods bar list, 6-category grid, and filterable searchable transaction list with expandable rows — all wired to real plati DB data**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-08T10:32:44Z
- **Completed:** 2026-03-08T10:39:52Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Replaced Phase 19 financiar components (4-StatsCard layout) with full Figma-aligned 6-KPI-card design
- Added `aggregateByMonthFull()` to `financiar-utils.ts` returning `{ month, colectat, esuat }` for AreaChart
- Implemented shared `txFilter` state in coordinator syncing mini status cards with transaction list filter
- Transaction list gains search input, expandable rows with retry button, and 6-per-page pagination
- Category breakdown section uses MOCK_CATEGORIES with explicit comment (DB has no category column)
- All chart tooltips use CSS tokens (`bg-popover`, `border-border`) — not hardcoded dark hex

## Task Commits

1. **Task 1: Skeleton + KpiCards + RevenueCharts** - `b40b927` (feat)
2. **Task 2: TransactionList + FinanciarContent coordinator** - `285de53` (feat)

## Files Created/Modified

- `src/components/admin/financiar/financiar-skeleton.tsx` - Updated skeleton matching new 6-card + 2-col chart layout
- `src/components/admin/financiar/kpi-cards.tsx` - NEW: 6 KPI cards with AnimatedCounter + 4 mini filter cards
- `src/components/admin/financiar/revenue-charts.tsx` - NEW: AreaChart + BarChart + payment methods + category grid
- `src/components/admin/financiar/transaction-list.tsx` - NEW: search + controlled filter + expandable rows + 6/page
- `src/components/admin/financiar/financiar-content.tsx` - NEW: coordinator with txFilter state
- `src/lib/financiar-utils.ts` - Added `MonthlyRevenueExtended` interface + `aggregateByMonthFull()`
- `src/app/app/[judet]/[localitate]/admin/financiar/page.tsx` - Switch to `aggregateByMonthFull`

## Decisions Made

- **aggregateByMonthFull instead of aggregateByMonth** — The plan spec requires AreaChart with colectat+esuat, but the existing `aggregateByMonth` returns `colectat+target`. Added a new function returning the correct shape without breaking the existing export.
- **CSS token tooltips** — CustomTooltip uses `bg-popover border-border` (Tailwind CSS vars), light+dark theme compatible.
- **Gradient IDs scoped** — `colectatGrad20`/`esuatGrad20` avoid SVG `<defs>` ID collisions with other Recharts instances.
- **6/page pagination** — Plan spec; matches Figma compact list style (previous was 20/page).
- **MOCK_CATEGORIES comment** — Explicitly documented as graceful mock per plan spec and Phase 19 decision log.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Extended financiar-utils.ts to add aggregateByMonthFull**
- **Found during:** Task 1 (revenue-charts creation)
- **Issue:** Plan spec requires `monthlyData: Array<{ month, colectat, esuat }>` but `aggregateByMonth` returns `{ month, colectat, target }` — AreaChart with esuat area would fail
- **Fix:** Added `MonthlyRevenueExtended` interface and `aggregateByMonthFull()` to `financiar-utils.ts`; updated `page.tsx` to use new function
- **Files modified:** `src/lib/financiar-utils.ts`, `src/app/app/[judet]/[localitate]/admin/financiar/page.tsx`
- **Committed in:** b40b927 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — data shape mismatch)
**Impact on plan:** Fix necessary for correct chart rendering. No scope creep — same data source, different aggregation shape.

## Issues Encountered

None — commitlint rejected first commit message due to scope and line length; corrected to `admin` scope with shorter body lines.

## Next Phase Readiness

- Financiar page fully rewritten to Figma spec with real plati data
- `aggregateByMonthFull()` available in `financiar-utils.ts` for future use
- Phase 20-04 (Calendar admin page) can proceed independently

---
*Phase: 20-pixel-perfect-admin-pages-figma-alignment*
*Completed: 2026-03-08*

## Self-Check: PASSED

- financiar-skeleton.tsx: FOUND
- kpi-cards.tsx: FOUND
- revenue-charts.tsx: FOUND
- transaction-list.tsx: FOUND
- financiar-content.tsx: FOUND
- Commit b40b927: FOUND
- Commit 285de53: FOUND
