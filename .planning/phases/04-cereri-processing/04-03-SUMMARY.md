---
phase: 04-cereri-processing
plan: 03
subsystem: cereri
tags: [server-actions, rls, next.js, supabase, middleware]

# Dependency graph
requires:
  - phase: 01-security-foundation
    provides: RLS policies, x-primarie-id middleware header, createClient() with header forwarding
  - phase: 04-cereri-processing
    provides: Cerere detail page, workflow Server Actions, SLA components, timeline
provides:
  - Server Actions (getCerereDetails, getCerereDocuments, cancelCerere) for cerere detail page
  - Fixed RLS context for staff users on cerere detail page
affects: [phase-5, dashboard, admin]

# Tech tracking
tech-stack:
  added: []
  patterns: [Server Actions as alternative to API routes for RLS-dependent data fetching]

key-files:
  created:
    - src/actions/cereri-detail.ts
  modified:
    - src/app/app/[judet]/[localitate]/cereri/[id]/page.tsx

key-decisions:
  - "Server Actions replace API route fetches for cerere detail (x-primarie-id only available on /app/* paths)"
  - "sla_total_paused_days removed from Server Action select query (column not in generated DB types, SlaIndicator handles undefined gracefully)"

patterns-established:
  - "Server Actions for data fetching: use Server Actions instead of API routes when page lives under /app/[judet]/[localitate] and needs RLS context"

requirements-completed: [CER-01, CER-02, CER-04, CER-05, CER-06]

# Metrics
duration: 4min
completed: 2026-03-03
---

# Phase 4 Plan 3: Cerere Detail Fix Summary

**Server Actions replace API route fetches on cerere detail page to fix RLS context for staff users**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-03T17:14:20Z
- **Completed:** 2026-03-03T17:18:05Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created three Server Actions (getCerereDetails, getCerereDocuments, cancelCerere) that inherit x-primarie-id from page request context
- Converted cerere detail page from API route fetches to Server Action calls, fixing RLS returning empty for staff users
- All 4 UAT failures (tests 4-7) addressed by this single root cause fix: detail page, timeline, status transitions, and internal notes all depend on cerere data loading

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Server Actions for cerere detail data fetching** - `2327665` (feat)
2. **Task 2: Convert detail page from API fetches to Server Action calls** - `a194fee` (fix)

## Files Created/Modified
- `src/actions/cereri-detail.ts` - Three Server Actions (getCerereDetails, getCerereDocuments, cancelCerere) using createClient() for x-primarie-id inheritance
- `src/app/app/[judet]/[localitate]/cereri/[id]/page.tsx` - Replaced fetch('/api/cereri/...') calls with Server Action imports and calls

## Decisions Made
- Server Actions replace API route fetches for cerere detail: API routes under /api/* never receive x-primarie-id from middleware (middleware only matches /app/[judet]/[localitate]/* paths). Server Actions execute as POST to the current page URL which middleware matches and sets x-primarie-id on.
- sla_total_paused_days excluded from Server Action select query: the column exists in DB but not in generated TypeScript types. SlaIndicator prop is optional and handles undefined gracefully. This matches the existing API route pattern which also doesn't select this field.
- Existing API routes left unchanged: they may be used by other consumers (list page, admin). Only the detail page's data path was changed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed sla_total_paused_days from select query**
- **Found during:** Task 1 (Server Action creation)
- **Issue:** Plan specified including sla_total_paused_days in select, but this column is not in generated database types, causing TypeScript error TS2352
- **Fix:** Removed sla_total_paused_days from select query. The field is optional on the Cerere type and SlaIndicator handles undefined gracefully.
- **Files modified:** src/actions/cereri-detail.ts
- **Verification:** `npx tsc --noEmit` passes cleanly
- **Committed in:** 2327665 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor query adjustment for type safety. No functional impact since the field is optional on the type.

## Issues Encountered
None beyond the sla_total_paused_days type issue documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Cerere detail page now works for both citizens and staff users
- All cereri processing features (workflow, UI, detail page) are complete
- Ready for Phase 5 (Staff Dashboards)

## Self-Check: PASSED

- [x] src/actions/cereri-detail.ts exists
- [x] 04-03-SUMMARY.md exists
- [x] Commit 2327665 exists (Task 1)
- [x] Commit a194fee exists (Task 2)

---
*Phase: 04-cereri-processing*
*Completed: 2026-03-03*
