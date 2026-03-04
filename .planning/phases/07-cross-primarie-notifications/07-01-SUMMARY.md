---
phase: 07-cross-primarie-notifications
plan: 01
subsystem: ui
tags: [react-query, notifications, cross-primarie, context-switch, alertdialog]

requires:
  - phase: 01-security-foundation
    provides: "user_primarii junction table for multi-primarie membership"
  - phase: 05-staff-dashboards
    provides: "Notification components (NotificationDropdownItem, NotificationCard)"
provides:
  - "useUserPrimarii hook for cached primarie lookup with names/slugs"
  - "usePrimarieSwitch hook for cookie update + navigation on context switch"
  - "parseActionUrl helper for mixed action_url format handling"
  - "ContextSwitchDialog for cross-primarie navigation confirmation"
  - "Primarie badge rendering on both notification card components"
affects: [07-cross-primarie-notifications]

tech-stack:
  added: []
  patterns: ["cross-primarie badge pattern with MapPin icon + primarieName"]

key-files:
  created:
    - src/hooks/use-user-primarii.ts
    - src/hooks/use-primarie-switch.ts
    - src/components/notifications/ContextSwitchDialog.tsx
  modified:
    - src/components/notifications/NotificationDropdownItem.tsx
    - src/components/notificari/NotificationCard.tsx

key-decisions:
  - "useUserPrimarii queries user_primarii with inner join to primarii->localitati->judete for flat result"
  - "usePrimarieSwitch uses window.location.href (not router.push) for full cache/state reset"
  - "parseActionUrl handles both /app/judet/localitate/path and /path formats from different DB triggers"
  - "Badge uses variant=outline with bg-muted/50 for subtle cross-primarie indicator"

patterns-established:
  - "Cross-primarie badge: Badge variant=outline with MapPin h-3 w-3 + primarieName"
  - "Context switch: saveLocation() before window.location.href to prevent middleware redirect loop"

requirements-completed: [NOT-03, NOT-04, NOT-05]

duration: 3min
completed: 2026-03-04
---

# Phase 7 Plan 1: Cross-Primarie Notification Foundation Summary

**Hooks for user primarie lookup and context switching, AlertDialog confirmation, and MapPin badges on notification cards for cross-primarie awareness**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-04T13:58:51Z
- **Completed:** 2026-03-04T14:02:17Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- useUserPrimarii hook fetches and caches user's primarii with names, slugs, and roles via React Query
- usePrimarieSwitch hook safely updates cookie before full-page navigation to prevent middleware loops
- ContextSwitchDialog shows source/target primarie names and destination before confirming switch
- Both NotificationDropdownItem and NotificationCard show primarie badge only for cross-primarie notifications

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useUserPrimarii, usePrimarieSwitch hooks, and ContextSwitchDialog** - `2f9ee39` (feat)
2. **Task 2: Add primarie badge to NotificationDropdownItem and NotificationCard** - `3e65e26` (feat)

## Files Created/Modified
- `src/hooks/use-user-primarii.ts` - React Query hook for cached user primarie data with flat transform
- `src/hooks/use-primarie-switch.ts` - Context switch handler with cookie-first navigation pattern
- `src/components/notifications/ContextSwitchDialog.tsx` - AlertDialog for cross-primarie navigation confirmation
- `src/components/notifications/NotificationDropdownItem.tsx` - Added optional cross-primarie badge
- `src/components/notificari/NotificationCard.tsx` - Added optional cross-primarie badge after priority badge

## Decisions Made
- useUserPrimarii queries user_primarii with inner join to primarii->localitati->judete for a flat UserPrimarieInfo array
- usePrimarieSwitch uses window.location.href (not router.push) to ensure full React Query cache, Zustand store, and Realtime subscription cleanup
- parseActionUrl handles both absolute `/app/judet/localitate/path` and relative `/path` formats from different DB triggers
- Cross-primarie badge uses Badge variant="outline" with bg-muted/50 and MapPin icon for subtle, non-distracting indicator

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Commit scope `07-01` not in allowed commitlint scope list; used `ui` scope instead. Pre-existing project constraint, not a bug.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Hooks and components ready for integration into notification list/dropdown parent components
- Parent components need to pass currentPrimarieId and primarieName props (wired in future plans)
- ContextSwitchDialog ready to be triggered on cross-primarie notification action click

---
*Phase: 07-cross-primarie-notifications*
*Completed: 2026-03-04*
