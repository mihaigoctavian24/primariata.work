---
phase: 04-cereri-processing
plan: 02
subsystem: cereri, ui, components
tags: [react, shadcn, sla, timeline, status-machine, date-fns, react-query, server-actions]

# Dependency graph
requires:
  - phase: 04-cereri-processing
    provides: cerere_istoric table, transition matrix, SLA utilities, Server Actions, useCerereTimeline hook
  - phase: 01-security-foundation
    provides: user_primarii junction table for role detection
provides:
  - SlaIndicator traffic light badge component with compact dot variant
  - CerereTimeline data-driven vertical timeline reading from cerere_istoric
  - StatusTransitionDialog role-based status change dialog with reason enforcement
  - InternalNoteForm collapsible staff-only note input
  - Extended CereriTable with SLA column and mobile dot indicator
  - Extended CereriFilters with SLA status dropdown
  - Extended useCereriList with client-side SLA filtering
  - Rewritten cerere detail page with dynamic timeline, staff actions, citizen resubmit
affects: [phase-5, dashboard, cereri, admin]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SlaIndicator + SlaIndicatorDot: full badge for desktop, compact dot for mobile"
    - "CerereTimeline: vertical timeline with icon-colored dots per entry type"
    - "StatusTransitionDialog: radio-style selection with role-based transition filtering"
    - "Client-side SLA filtering via useMemo on query results with calculateSla()"
    - "User role detection via user_primarii query in detail page for conditional rendering"

key-files:
  created:
    - src/components/cereri/SlaIndicator.tsx
    - src/components/cereri/CerereTimeline.tsx
    - src/components/cereri/StatusTransitionDialog.tsx
    - src/components/cereri/InternalNoteForm.tsx
  modified:
    - src/components/cereri/CereriTable.tsx
    - src/components/cereri/CereriFilters.tsx
    - src/hooks/use-cereri-list.ts
    - src/app/app/[judet]/[localitate]/cereri/[id]/page.tsx
    - src/app/app/[judet]/[localitate]/cereri/page.tsx

key-decisions:
  - "SLA column hidden on mobile via lg:hidden/lg:table-cell; compact dot shown next to StatusBadge instead"
  - "SLA filtering is client-side (calculateSla on loaded data) rather than API-level, sufficient for Phase 4 pagination"
  - "Detail page rewritten as single client component with role detection via user_primarii query"
  - "StatusBadge unchanged -- already handles in_aprobare via getCerereStatusLabel/Color from 04-01"

patterns-established:
  - "SlaIndicator pattern: props receive raw data (dataTermen, status, totalPausedDays), component calls calculateSla internally"
  - "Responsive table column: hide full column on mobile, show compact indicator inline with existing column"
  - "Staff action section: conditional rendering based on user_primarii role detection"

requirements-completed: [CER-01, CER-02, CER-04, CER-05, CER-06]

# Metrics
duration: 7min
completed: 2026-03-03
---

# Phase 4 Plan 02: Cereri Processing UI Summary

**SLA traffic light indicators on cereri list and detail page, data-driven timeline from cerere_istoric, role-based status transition dialog, staff internal notes, and SLA filtering**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-03T15:20:42Z
- **Completed:** 2026-03-03T15:27:34Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- SlaIndicator renders green/yellow/red/paused badge on cereri table rows and detail header
- CerereTimeline replaces hardcoded 3-step progress with dynamic cerere_istoric entries
- StatusTransitionDialog restricts transitions to user role permissions with reason enforcement
- InternalNoteForm allows staff to add hidden notes via collapsible form
- CereriFilters gains SLA status dropdown (Depasit/Urgent/La termen/In asteptare)
- Citizens in info_suplimentare see resubmit button with guidance text
- All text in Romanian, components support light and dark mode

## Task Commits

Each task was committed atomically:

1. **Task 1: SLA indicator, timeline, and status action components** - `2e83f0a` (feat)
2. **Task 2: Extend table, filters, detail page with SLA and workflow** - `88a1358` (feat)

## Files Created/Modified

- `src/components/cereri/SlaIndicator.tsx` - Traffic light SLA badge + compact dot variant
- `src/components/cereri/CerereTimeline.tsx` - Vertical timeline from cerere_istoric with type-specific rendering
- `src/components/cereri/StatusTransitionDialog.tsx` - Dialog with radio-style status selection and motiv textarea
- `src/components/cereri/InternalNoteForm.tsx` - Collapsible staff-only note form
- `src/components/cereri/CereriTable.tsx` - Added SLA column (desktop) and dot indicator (mobile)
- `src/components/cereri/CereriFilters.tsx` - Added SLA status dropdown filter
- `src/hooks/use-cereri-list.ts` - Added slaStatus param with client-side filtering
- `src/app/app/[judet]/[localitate]/cereri/[id]/page.tsx` - Replaced hardcoded timeline, added staff actions and citizen resubmit
- `src/app/app/[judet]/[localitate]/cereri/page.tsx` - Wired slaStatus to filters and useCereriList

## Decisions Made

- SLA column uses `hidden lg:table-cell` pattern -- full badge on desktop, compact dot next to StatusBadge on mobile
- SLA filtering is client-side (calculateSla on loaded cereri array) rather than API-level query -- simpler and sufficient for paginated results in Phase 4
- Detail page stays as single client component -- wrapping interactive parts in separate wrappers would add complexity without benefit since page already uses `use()` for params
- StatusBadge confirmed working for in_aprobare without code changes (imports from cereri.ts updated in 04-01)
- User role detection in detail page queries user_primarii directly rather than passing from parent -- page is self-contained entry point

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed CereriFilters consumer missing new props**
- **Found during:** Task 2 (TypeScript verification)
- **Issue:** cereri/page.tsx uses CereriFilters but was missing onSlaStatusChange prop after interface extension
- **Fix:** Added slaStatus state, URL persistence, and onSlaStatusChange prop to cereri list page
- **Files modified:** src/app/app/[judet]/[localitate]/cereri/page.tsx
- **Verification:** TypeScript compiles cleanly
- **Committed in:** 88a1358 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Necessary fix for TypeScript compilation after interface change. No scope creep.

## Issues Encountered

None -- plan executed smoothly after the blocking fix.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Cereri processing UI is complete -- SLA indicators, dynamic timeline, status transitions, and internal notes all functional
- Phase 5 (Staff Dashboards) can now consume cerere_istoric for activity feeds and use the transition/SLA components
- Staff action patterns (StatusTransitionDialog, InternalNoteForm) ready for integration into staff dashboard cereri views

## Self-Check: PASSED

- All 4 created files verified present
- All 5 modified files verified present
- Both task commits verified (2e83f0a, 88a1358)
- TypeScript compiles cleanly (npx tsc --noEmit passes)

---
*Phase: 04-cereri-processing*
*Completed: 2026-03-03*
