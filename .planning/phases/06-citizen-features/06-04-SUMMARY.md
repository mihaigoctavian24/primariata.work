---
phase: 06-citizen-features
plan: 04
subsystem: ui
tags: [leaflet, map, landing-page, payments, dashboard, framer-motion]

requires:
  - phase: 06-citizen-features
    provides: "MapWidget with zoom controls, flyTo, PrimarieInfoCard popup"
provides:
  - "Interactive Leaflet map on landing page responding to location selection"
  - "TestModeBanner on /plati and /plati/[id]/checkout pages"
  - "Real totalCount exposed from useDashboardDocuments hook"
affects: [landing, dashboard, plati]

tech-stack:
  added: []
  patterns:
    - "Dynamic import with ssr:false for Leaflet components on landing page"
    - "Polling + storage event listener pattern for cross-component reactivity"

key-files:
  created:
    - src/components/landing/LandingMapSection.tsx
  modified:
    - src/app/page.tsx
    - src/hooks/use-dashboard-documents.ts
    - src/components/dashboard/role-dashboards/CetățeanDashboard.tsx
    - src/app/app/[judet]/[localitate]/plati/page.tsx
    - src/app/app/[judet]/[localitate]/plati/[id]/checkout/page.tsx

key-decisions:
  - "LandingMapSection polls every 2s for location + listens for storage events (no prop drilling needed)"
  - "Map section placed between Hero and Transition Zone as separate scroll snap point"
  - "totalCount exposed from hook AND consumed in CetateeanDashboard (plan extended to close gap fully)"

patterns-established:
  - "Dynamic Leaflet import pattern reused from MapWidget for landing page context"

requirements-completed: [DOC-04, PAY-04, MAP-01, MAP-02]

duration: 3min
completed: 2026-03-04
---

# Phase 6 Plan 4: Map Interactivity and Gap Closure Summary

**Interactive Leaflet map on landing page, TestModeBanner on payment pages, and real totalCount in documents widget**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-04T13:04:23Z
- **Completed:** 2026-03-04T13:07:32Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Landing page shows an interactive Leaflet map that appears after location selection, with polling and storage event reactivity
- Payment pages (/plati and /plati/[id]/checkout) display TestModeBanner when in mock mode
- useDashboardDocuments hook exposes real totalCount from Server Action; CetateeanDashboard passes it to RecentDocumentsWidget

## Task Commits

Each task was committed atomically:

1. **Task 1: Add interactive map to landing page and fix documents totalCount** - `c7d4c2f` (feat)
2. **Task 2: Wire TestModeBanner to payment pages** - `c442d4d` (feat)

## Files Created/Modified
- `src/components/landing/LandingMapSection.tsx` - New client component: dynamic Leaflet map for landing page with location polling
- `src/app/page.tsx` - Added LandingMapSection between Hero and Transition Zone
- `src/hooks/use-dashboard-documents.ts` - Added totalCount to DocumentsResponse, populated from Server Action
- `src/components/dashboard/role-dashboards/CetățeanDashboard.tsx` - Uses hook totalCount instead of documents.length
- `src/app/app/[judet]/[localitate]/plati/page.tsx` - Added TestModeBanner import and render
- `src/app/app/[judet]/[localitate]/plati/[id]/checkout/page.tsx` - Added TestModeBanner import and render

## Decisions Made
- LandingMapSection uses polling (2s interval) + storage event listener for detecting location changes without prop drilling from HeroSection
- Map section is a separate scroll snap point between Hero and Transition Zone
- Extended plan scope slightly: CetateeanDashboard updated to consume totalCount (plan noted this was needed but initially excluded it from files_modified)

## Deviations from Plan

None - plan executed exactly as written. The CetateeanDashboard update was explicitly called for in the plan's action description.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All Phase 6 gap closure items complete
- Landing page has interactive map (SC-5)
- Payment pages show mock mode banner (PAY-04)
- Documents widget shows accurate total count (DOC-04)

---
*Phase: 06-citizen-features*
*Completed: 2026-03-04*
