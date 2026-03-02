---
phase: 02-infrastructure-stabilization
plan: "07"
subsystem: dashboard, api, infra
tags: [leaflet, react-leaflet, map, csp, prefetch, notifications, middleware]

# Dependency graph
requires:
  - phase: 02-04
    provides: middleware cookie preservation, CSP img-src updates, admin route protection
  - phase: 02-05
    provides: signOut removal from admin, logout route, profile cache key fix
provides:
  - Interactive Leaflet map widget with dark/light theme tile switching
  - Fixed duplicate QuickActions heading
  - Skeleton loading for location selector in header
  - Cross-primarie navigation guard in middleware
  - redirectTo admin path sanitization to prevent login loop
  - Notifications API auth failure logging
  - Sidebar prefetch disabled to prevent stale Router Cache
affects: [dashboard, middleware, notifications, map]

# Tech tracking
tech-stack:
  added: [leaflet, react-leaflet, "@types/leaflet"]
  patterns: [dynamic-import-ssr-false, theme-aware-tile-switching, svg-div-icon-marker]

key-files:
  created:
    - src/components/dashboard/MapWidget.tsx
  modified:
    - src/components/dashboard/role-dashboards/CetățeanDashboard.tsx
    - src/components/dashboard/QuickActions.tsx
    - src/components/dashboard/DashboardHeader.tsx
    - src/components/dashboard/DashboardSidebar.tsx
    - src/app/api/notifications/route.ts
    - src/middleware.ts
    - next.config.ts
    - package.json

key-decisions:
  - "Leaflet with CartoDB dark tiles for dark mode, OSM standard for light mode (free, no API key)"
  - "SVG divIcon marker instead of Leaflet default PNGs to avoid webpack/Next.js icon loading issue"
  - "Cross-primarie guard uses saved_location cookie rather than DB query for lightweight middleware check"
  - "prefetch={false} on sidebar links as defensive fix alongside 02-04 cookie/slug fixes"

patterns-established:
  - "MapWidget: dynamic import with ssr:false for Leaflet components requiring window"
  - "Theme-aware tiles: resolvedTheme from next-themes drives tile URL selection"

requirements-completed: [FIX-05, FIX-06, FIX-07]

# Metrics
duration: 8min
completed: 2026-03-03
---

# Plan 02-07: Remaining Bugs + Map Widget Theme-Aware Upgrade Summary

**Interactive Leaflet map with dark/light theme tiles, duplicate heading fix, skeleton loading, cross-primarie guard, redirectTo sanitization, and sidebar prefetch disabled**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-02T22:06:34Z
- **Completed:** 2026-03-02T22:14:21Z
- **Tasks:** 4
- **Files modified:** 10

## Accomplishments
- Replaced broken static OpenStreetMap tile with interactive react-leaflet map supporting dark/light theme tiles
- Fixed duplicate "Actiuni Rapide" heading on dashboard by removing h3 from QuickActions component
- Replaced "Loading..." text flash in header location selector with shadcn/ui Skeleton component
- Added cross-primarie navigation guard and redirectTo admin path sanitization in middleware
- Disabled aggressive prefetch on sidebar links to prevent stale Next.js Router Cache payloads

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace static map tile with react-leaflet interactive map** - `6135392` (feat) -- committed as part of 02-06 stats fix
2. **Task 2: Fix dashboard UI bugs (duplicate heading, loading flash)** - `5258fcf` (fix)
3. **Task 3: Fix Notifications API auth + cross-primarie guard + redirectTo sanitization** - `91cb95d` (fix)
4. **Task 4: Fix client-side routing instability + sidebar prefetch** - `e356a5d` (fix)

**Plan metadata:** (pending)

## Files Created/Modified
- `src/components/dashboard/MapWidget.tsx` - New reusable Leaflet map with theme-aware tiles and SVG marker
- `src/components/dashboard/role-dashboards/CetățeanDashboard.tsx` - Dynamic import of MapWidget replacing static img
- `src/components/dashboard/QuickActions.tsx` - Removed duplicate h3 heading
- `src/components/dashboard/DashboardHeader.tsx` - Skeleton loading for location selector
- `src/components/dashboard/DashboardSidebar.tsx` - prefetch={false} on all Link components
- `src/app/api/notifications/route.ts` - Auth failure logging with cookie presence info
- `src/middleware.ts` - Cross-primarie guard and redirectTo admin path sanitization
- `next.config.ts` - CSP img-src and connect-src updated for tile.openstreetmap.org and basemaps.cartocdn.com
- `package.json` - Added leaflet, react-leaflet dependencies
- `pnpm-lock.yaml` - Lockfile updated

## Decisions Made
- Used Leaflet with CartoDB dark tiles for dark mode and OSM standard for light mode (free, no API key required)
- SVG divIcon marker avoids Leaflet's known webpack PNG icon loading issue in Next.js
- Cross-primarie guard uses saved_location cookie rather than DB query for lightweight middleware check
- prefetch={false} is a defensive fix that trades slightly slower first navigation for guaranteed correct content

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Task 1 already committed in prior session**
- **Found during:** Task 1 (Map widget)
- **Issue:** MapWidget, CSP changes, and dependencies were already committed in 6135392 as part of the 02-06 execution
- **Fix:** Verified all Task 1 artifacts exist in HEAD, skipped re-committing
- **Files modified:** None (already committed)
- **Verification:** git show HEAD confirms all expected files present

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** No scope creep. Task 1 work was already done, remaining tasks executed as planned.

## Issues Encountered
- Commitlint rejected the initial scope "02-07" -- project requires scopes from a fixed enum (dashboard, api, config, etc.). Fixed by using appropriate scopes.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All Phase 2 infrastructure stabilization plans are complete (02-01 through 02-07)
- Phase 2 is ready for final verification
- Dashboard, middleware, auth, and API bugs addressed
- Ready to proceed to Phase 3

---
## Self-Check: PASSED

All files verified present on disk. All commit hashes found in git log.

---
*Phase: 02-infrastructure-stabilization*
*Completed: 2026-03-03*
