---
phase: 13-layout-shell
plan: 01
subsystem: ui
tags: [sidebar, shell-layout, topbar, middleware, framer-motion, cookies, responsive]

requires:
  - phase: 12-design-system-foundation
    provides: oklch token system, accent color provider, motion variants
provides:
  - Config-driven collapsible sidebar (admin + citizen nav configs)
  - ShellLayout orchestrator component (sidebar + top bar + page transitions)
  - TopBar with role badge, weather, theme toggle, notifications, avatar
  - Cookie-based sidebar collapse persistence (server-readable)
  - Mobile sidebar as shadcn Sheet overlay
  - PageTransition with AnimatePresence fade
  - Middleware admin role enforcement (SEC-01, SEC-02)
  - useMediaQuery hook
affects: [13-02-command-palette-notifications, 14-admin-dashboard, 15-citizen-dashboard]

tech-stack:
  added: []
  patterns: [config-driven-sidebar, cookie-server-read-pattern, shell-layout-orchestrator, provider-wrapper-pattern]

key-files:
  created:
    - src/components/shell/sidebar/sidebar-config.ts
    - src/components/shell/sidebar/Sidebar.tsx
    - src/components/shell/sidebar/SidebarNav.tsx
    - src/components/shell/sidebar/SidebarNavItem.tsx
    - src/components/shell/sidebar/SidebarLogo.tsx
    - src/components/shell/sidebar/SidebarQuickSearch.tsx
    - src/components/shell/sidebar/SidebarUserCard.tsx
    - src/components/shell/top-bar/TopBar.tsx
    - src/components/shell/top-bar/TopBarActions.tsx
    - src/components/shell/ShellLayout.tsx
    - src/components/shell/PageTransition.tsx
    - src/hooks/use-media-query.ts
    - src/lib/cookies.ts
    - src/app/admin/providers.tsx
    - src/app/app/[judet]/[localitate]/providers.tsx
  modified:
    - src/app/admin/layout.tsx
    - src/app/app/[judet]/[localitate]/layout.tsx
    - src/middleware.ts

key-decisions:
  - "Cookie-based sidebar collapse: uses document.cookie with server-side reading via next/headers cookies() to avoid hydration mismatch"
  - "Provider wrapper pattern: server layout reads cookie -> passes to client providers wrapper -> ShellLayout"
  - "Admin role enforcement: only approved admin role in user_primarii grants /admin/* access; super_admin excluded per user decision"

patterns-established:
  - "Config-driven sidebar: SidebarConfig interface with getAdminSidebarConfig/getCitizenSidebarConfig factories"
  - "Provider wrapper pattern: server layout (reads cookies) -> client Providers (QueryClient + ShellLayout) -> children"
  - "Cookie persistence for layout state: SIDEBAR_COLLAPSED_KEY cookie read server-side, set client-side"

requirements-completed: [SHELL-01, SHELL-02, SHELL-03, SHELL-06, SHELL-07, SHELL-08, SEC-01, SEC-02]

duration: 5min
completed: 2026-03-05
---

# Phase 13 Plan 01: Layout Shell Summary

**Config-driven collapsible sidebar with role-based nav, top bar with actions, page transitions, and middleware admin role enforcement for both admin and citizen layouts**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-05T09:10:25Z
- **Completed:** 2026-03-05T09:15:50Z
- **Tasks:** 2
- **Files modified:** 18

## Accomplishments
- Built complete shell layout system: collapsible sidebar (260px/72px with spring animation), top bar, and page transitions
- Both admin and citizen layouts rewired to use unified ShellLayout with config-driven navigation
- Middleware now enforces admin-only access on /admin/* routes before any UI renders
- Sidebar collapse state persists via cookie (server-readable, no layout shift on reload)
- Mobile responsive: sidebar renders as shadcn Sheet on screens < 1024px

## Task Commits

Each task was committed atomically:

1. **Task 1: Create sidebar config, cookie helpers, useMediaQuery, and all sidebar sub-components** - `46b253a` (feat)
2. **Task 2: Create TopBar, ShellLayout, PageTransition, rewrite both layouts, and add middleware admin enforcement** - `b9e2b26` (feat)

## Files Created/Modified
- `src/components/shell/sidebar/sidebar-config.ts` - NavItem, NavSection, SidebarConfig types + admin/citizen factory functions
- `src/components/shell/sidebar/Sidebar.tsx` - Main sidebar: desktop motion.aside or mobile Sheet
- `src/components/shell/sidebar/SidebarNav.tsx` - Renders sections from config with section titles
- `src/components/shell/sidebar/SidebarNavItem.tsx` - Single nav item with active state, tooltip when collapsed
- `src/components/shell/sidebar/SidebarLogo.tsx` - Logo area with collapse toggle
- `src/components/shell/sidebar/SidebarQuickSearch.tsx` - Quick search trigger with Cmd+K hint
- `src/components/shell/sidebar/SidebarUserCard.tsx` - User info at bottom with avatar
- `src/components/shell/top-bar/TopBar.tsx` - Sticky header with hamburger and actions
- `src/components/shell/top-bar/TopBarActions.tsx` - Role badge, weather, search, theme, bell, avatar
- `src/components/shell/ShellLayout.tsx` - Orchestrator: sidebar + top bar + content + Cmd+K handler
- `src/components/shell/PageTransition.tsx` - AnimatePresence fade on route changes
- `src/hooks/use-media-query.ts` - SSR-safe media query hook
- `src/lib/cookies.ts` - Cookie helpers for sidebar collapse persistence
- `src/app/admin/layout.tsx` - Rewritten as server component reading cookie
- `src/app/admin/providers.tsx` - Client wrapper with QueryClient + ShellLayout
- `src/app/app/[judet]/[localitate]/layout.tsx` - Rewritten as server component
- `src/app/app/[judet]/[localitate]/providers.tsx` - Client wrapper with QueryProvider + ShellLayout + CereriNotifications
- `src/middleware.ts` - Added admin role enforcement block

## Decisions Made
- Cookie-based sidebar collapse persistence (not localStorage) so server components can read on first render
- Provider wrapper pattern: server layout reads cookie, passes to client providers which wrap ShellLayout
- Admin role enforcement: only `admin` role with `approved` status in `user_primarii` grants access; `super_admin` excluded per user decision
- SheetHeader with sr-only title added to mobile Sheet for accessibility compliance
- getInitials uses optional chaining for TypeScript strict mode safety

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript strict mode error in getInitials**
- **Found during:** Task 1 (SidebarUserCard)
- **Issue:** `parts[0][0]` flagged as possibly undefined under strict mode
- **Fix:** Added optional chaining `parts[0]?.[0]` with nullish coalescing
- **Files modified:** src/components/shell/sidebar/SidebarUserCard.tsx
- **Verification:** pnpm type-check passes
- **Committed in:** 46b253a

**2. [Rule 1 - Bug] Fixed invalid Framer Motion transition keys in PageTransition**
- **Found during:** Task 2 (PageTransition)
- **Issue:** `enter` and `exit` are not valid motion/react Transition keys
- **Fix:** Simplified to single `{ duration: 0.2, ease: "easeInOut" }` transition
- **Files modified:** src/components/shell/PageTransition.tsx
- **Verification:** pnpm type-check passes
- **Committed in:** b9e2b26

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both were TypeScript/API correctness fixes. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ShellLayout ready for Plan 02 (command palette + notification drawer) -- placeholder comments mark integration points
- `commandOpen` and `notifOpen` state already wired in ShellLayout
- Both admin and citizen layouts using new shell -- no regression expected
- Middleware admin enforcement active -- non-admin users redirected before UI

---
*Phase: 13-layout-shell*
*Completed: 2026-03-05*
