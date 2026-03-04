---
phase: 06-citizen-features
plan: 03
subsystem: ui
tags: [leaflet, map, react-leaflet, status-labels, romanian, popup]

requires:
  - phase: 02-infrastructure-stabilization
    provides: MapWidget with theme-aware tiles and SVG marker
provides:
  - Interactive MapWidget with zoom controls, flyTo animation, and PrimarieInfoCard popup
  - Centralized Romanian status labels across all cereri-displaying components
affects: [07-cross-primarie, 08-polish]

tech-stack:
  added: []
  patterns: [shared-status-labels, map-popup-component]

key-files:
  created:
    - src/components/dashboard/PrimarieInfoCard.tsx
  modified:
    - src/components/dashboard/MapWidget.tsx
    - src/components/dashboard/role-dashboards/CetățeanDashboard.tsx
    - src/components/dashboard/RecentActivity.tsx
    - src/components/dashboard/charts/StatusTimelineChart.tsx
    - src/components/dashboard/ActiveRequestProgressCard.tsx

key-decisions:
  - "FlyToHandler uses popupopen event for flyTo animation trigger rather than custom click handler"
  - "PrimarieInfoCard uses plain Tailwind (no shadcn) for Leaflet popup compatibility"
  - "ActiveRequestProgressCard fixed wrong enum keys (aprobat->aprobata, respins->respinsa, anulat->anulata)"

patterns-established:
  - "All status displays must use getCerereStatusLabel() from @/lib/validations/cereri -- no local label maps"
  - "Map popup content uses dedicated component (PrimarieInfoCard) for clean separation"

requirements-completed: [MAP-01, MAP-02, MAP-03]

duration: 6min
completed: 2026-03-04
---

# Phase 6 Plan 3: Map Interactivity and Status Label Audit Summary

**Interactive Leaflet map with zoom controls, flyTo animation, primarie info popup, and centralized Romanian status labels across all components**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-04T12:00:17Z
- **Completed:** 2026-03-04T12:06:20Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- MapWidget upgraded with ZoomControl (bottom-right), FlyToHandler for animated zoom on marker click, and PrimarieInfoCard popup showing primarie details
- PrimarieInfoCard component created for Leaflet popup (name, address, phone, email, working hours)
- CetateeanDashboard fetches primarie data from primarii table and passes to MapWidget
- Audited all status-displaying components; fixed 3 that had local label maps with incomplete/wrong enum keys

## Task Commits

Each task was committed atomically:

1. **Task 1: Upgrade MapWidget with interactivity and PrimarieInfoCard popup** - `3a4375d` (feat)
2. **Task 2: Audit and fix Romanian status labels across all components** - `a1b9794` (fix)

## Files Created/Modified
- `src/components/dashboard/PrimarieInfoCard.tsx` - Compact card for Leaflet popup with primarie details
- `src/components/dashboard/MapWidget.tsx` - Added ZoomControl, FlyToHandler, PrimarieInfoCard popup, custom CSS
- `src/components/dashboard/role-dashboards/CetățeanDashboard.tsx` - Added primarie query, passes primarieInfo to MapWidget
- `src/components/dashboard/RecentActivity.tsx` - Replaced local statusLabels/statusColors with getCerereStatusLabel/getCerereStatusColor
- `src/components/dashboard/charts/StatusTimelineChart.tsx` - Replaced local StatusBadge with shared label/color helpers
- `src/components/dashboard/ActiveRequestProgressCard.tsx` - Fixed wrong enum keys, uses shared getCerereStatusLabel

## Decisions Made
- FlyToHandler uses popupopen event for flyTo trigger (simpler than custom click handler on marker)
- PrimarieInfoCard uses plain Tailwind classes (no shadcn components) since Leaflet popups live outside React portal/context
- Custom popup CSS via style tag in MapWidget for clean appearance

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Fixed RecentActivity using incomplete local status labels**
- **Found during:** Task 2 (Status label audit)
- **Issue:** RecentActivity.tsx had its own statusLabels map with only 6 entries (missing depusa, in_verificare, info_suplimentare, in_procesare, in_aprobare, finalizata). Unknown statuses would display as undefined.
- **Fix:** Replaced with getCerereStatusLabel() and getCerereStatusColor() from shared validation
- **Files modified:** src/components/dashboard/RecentActivity.tsx
- **Committed in:** a1b9794

**2. [Rule 1 - Bug] Fixed StatusTimelineChart local StatusBadge with incomplete mapping**
- **Found during:** Task 2 (Status label audit)
- **Issue:** Had local StatusBadge with only 4 status entries. Fallback showed raw enum string.
- **Fix:** Replaced with getCerereStatusLabel/getCerereStatusColor from shared validation
- **Files modified:** src/components/dashboard/charts/StatusTimelineChart.tsx
- **Committed in:** a1b9794

**3. [Rule 1 - Bug] Fixed ActiveRequestProgressCard wrong enum keys**
- **Found during:** Task 2 (Status label audit)
- **Issue:** Used 'aprobat', 'respins', 'anulat' keys which don't match DB enum values 'aprobata', 'respinsa', 'anulata'. Fallback showed raw enum string.
- **Fix:** Replaced entire getStatusConfig with getCerereStatusLabel for labels and correct enum keys
- **Files modified:** src/components/dashboard/ActiveRequestProgressCard.tsx
- **Committed in:** a1b9794

---

**Total deviations:** 3 auto-fixed (1 missing critical, 2 bugs)
**Impact on plan:** All fixes found during the planned audit scope. These were the exact kind of issues the audit was designed to catch.

## Issues Encountered
- Build fails due to pre-existing missing `.next/types/app/admin/auth/callback/route.ts` file (unrelated to changes). TypeScript type-check passes cleanly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Map widget fully interactive with primarie info
- All status labels consistently Romanian across the app
- Ready for remaining Phase 6 plans

---
*Phase: 06-citizen-features*
*Completed: 2026-03-04*
