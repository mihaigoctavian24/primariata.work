---
phase: 20-pixel-perfect-admin-pages-figma-alignment-for-monitorizare-utilizatori-cereri-documente-financiar-calendar
plan: "05"
subsystem: ui
tags: [zustand, framer-motion, calendar, react, tailwind, admin]

# Dependency graph
requires:
  - phase: 20-04
    provides: Documente admin page (same phase wave pattern)
  - phase: 19-calendar
    provides: calendar-events-store.ts and calendar utils (superseded in this plan)
provides:
  - Full Calendar admin page with month grid, event detail panel, create modal
  - Zustand calendar-store.ts with ISO date strings and Tailwind color class storage
  - 5 components: calendar-content, calendar-grid, event-detail-panel, create-event-modal, calendar-skeleton
affects:
  - Any phase consuming calendar events from Zustand store

# Tech tracking
tech-stack:
  added: []
  patterns:
    - ISO date string keys "YYYY-MM-DD" for calendar events (not day/month/year fields)
    - Tailwind class strings stored in Zustand (e.g. "bg-pink-500") for CSS-variable-compatible theming
    - DOT_COLOR_MAP hex lookup pattern for SVG/style-only color usage (not design token replacement)

key-files:
  created:
    - src/store/calendar-store.ts
    - src/components/admin/calendar/calendar-skeleton.tsx
    - src/components/admin/calendar/calendar-grid.tsx
    - src/components/admin/calendar/event-detail-panel.tsx
    - src/components/admin/calendar/create-event-modal.tsx
    - src/components/admin/calendar/calendar-content.tsx
  modified: []

key-decisions:
  - "Calendar event date stored as ISO string YYYY-MM-DD (not day/month/year ints) for simpler comparison and filtering"
  - "Store named calendar-store.ts (useCalendarStore) to match plan spec; old calendar-events-store.ts kept for backward compat"
  - "DOT_COLOR_MAP hex values used only for CSS border/background style props (non-tokenizable) — Tailwind class is source of truth"
  - "Event detail panel shows upcoming events filtered by date >= today via ISO string comparison"
  - "Create event modal uses controlled useState (not RHF) for simplicity — 5 fields, no complex validation schema needed"

patterns-established:
  - "ISO date string pattern: filter events by e.date.startsWith(YYYY-MM prefix) for month view"
  - "Color picker stores Tailwind bg-* class string; hex mapping used only in inline styles"

requirements-completed: [CAL-01, CAL-02, CAL-03, CAL-04]

# Metrics
duration: 12min
completed: 2026-03-08
---

# Phase 20 Plan 05: Calendar Admin Page Summary

**Full month calendar grid (Monday-start) with Zustand-persisted events, day detail panel showing selected-day + upcoming events, and color-picker create modal — all using ISO date strings and Tailwind class color storage**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-08T10:50:30Z
- **Completed:** 2026-03-08T11:01:06Z
- **Tasks:** 2
- **Files modified:** 6 (all new)

## Accomplishments
- Rewrote all Phase 19 calendar components using ISO date strings for event.date field (cleaner filtering/sorting)
- Created `useCalendarStore` Zustand store with `primariata-calendar-events` localStorage key and 6 Figma-seed events
- CalendarGrid with Monday-start offset math, animated month transitions, event dots (up to 3 per day), today highlight, past-day opacity
- EventDetailPanel with two cards: selected day events list (with remove button + toast) + upcoming events sorted by ISO date
- CreateEventModal with 7-color picker storing Tailwind class strings (not hex), date/time/type/location fields
- CalendarContent coordinator reads from Zustand, handles month navigation with year rollover, filters events by month prefix
- pnpm build passes with zero TypeScript errors

## Task Commits

1. **Task 1: calendar Zustand store + skeleton + grid** - `53d6ebe` (feat)
2. **Task 2: event detail panel, create modal, content coordinator** - `bc6c26d` (feat)

## Files Created/Modified
- `src/store/calendar-store.ts` - Zustand persist store with ISO date CalEvent interface, useCalendarStore hook
- `src/components/admin/calendar/calendar-skeleton.tsx` - Pulse skeleton with 12-col grid layout (8/4 split)
- `src/components/admin/calendar/calendar-grid.tsx` - Month grid, Monday-start, event dots, today/selected/past styling
- `src/components/admin/calendar/event-detail-panel.tsx` - Selected day events + upcoming events list (col-span-4)
- `src/components/admin/calendar/create-event-modal.tsx` - Framer Motion modal, color picker, date/time inputs
- `src/components/admin/calendar/calendar-content.tsx` - "use client" coordinator, Zustand integration, month nav

## Decisions Made
- ISO date string `"YYYY-MM-DD"` chosen over `{ day, month, year }` object — enables direct string comparison for sorting/filtering and simpler month-prefix matching
- New store `calendar-store.ts` with `useCalendarStore` created per plan spec; existing `calendar-events-store.ts` retained (not deleted) to avoid breaking any remaining imports from Phase 19
- `DOT_COLOR_MAP` hex lookup used only for CSS `style={{ background: hex }}` where Tailwind classes can't be resolved at runtime — Tailwind class is still the canonical stored value
- Controlled `useState` instead of React Hook Form in create-event modal — form has 5 simple fields, custom validation sufficient without schema overhead

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript strict-mode array destructuring errors**
- **Found during:** Task 2 (event-detail-panel.tsx build)
- **Issue:** `dateStr.split("-").map(Number)` returns `number[]` — array element access returns `number | undefined` in strict mode
- **Fix:** Changed to index-based access with nullish coalescing (`parts[0] ?? 0`, `parts[1] ?? 1`, etc.)
- **Files modified:** src/components/admin/calendar/event-detail-panel.tsx
- **Verification:** pnpm build passes with zero TS errors
- **Committed in:** bc6c26d (Task 2 commit)

**2. [Rule 1 - Bug] Fixed ROMANIAN_MONTHS index possibly undefined**
- **Found during:** Task 2 (event-detail-panel.tsx build)
- **Issue:** `ROMANIAN_MONTHS[em]` returns `string | undefined` in strict mode — `.slice()` call unsafe
- **Fix:** Added nullish coalescing fallback `(ROMANIAN_MONTHS[em] ?? ROMANIAN_MONTHS[0]).slice(0, 3)`
- **Files modified:** src/components/admin/calendar/event-detail-panel.tsx
- **Verification:** pnpm build clean
- **Committed in:** bc6c26d (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - TypeScript strict mode type safety)
**Impact on plan:** Necessary for TypeScript strict mode compliance. No scope creep.

## Issues Encountered
- None beyond the TypeScript strict-mode auto-fixes above

## Next Phase Readiness
- Calendar admin page fully functional: month grid, event creation, detail panel, upcoming events
- Phase 20 Wave 5 (Calendar) complete — all 5 admin page rewrites done (monitorizare, utilizatori, cereri-supervizare, documente, calendar)
- `calendar-store.ts` exports `useCalendarStore` and `CalEvent` for any future integrations

## Self-Check: PASSED

All 6 files exist. Both commits (53d6ebe, bc6c26d) verified in git log. pnpm build green.

---
*Phase: 20-pixel-perfect-admin-pages-figma-alignment-for-monitorizare-utilizatori-cereri-documente-financiar-calendar*
*Completed: 2026-03-08*
