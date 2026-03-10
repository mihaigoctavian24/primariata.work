---
phase: 22-super-admin-module
plan: "06"
subsystem: admin
tags: [impersonation, cookie, middleware, command-palette, notification-drawer, super-admin]

requires:
  - phase: 22-super-admin-module
    provides: SuperAdminShell, SuperAdminTopBar, SuperAdminSidebar, PrimarieDetailDrawer, super-admin-write.ts

provides:
  - CommandPalette and NotificationDrawer wired to state in SuperAdminShell
  - startImpersonation server action (cookie + audit_log + redirect URL)
  - Middleware sa_impersonation cookie reading with association check bypass
  - Impersonation button in PrimarieDetailDrawer calling the server action

affects: [middleware, super-admin-module, impersonation-session]

tech-stack:
  added: []
  patterns:
    - "Impersonation cookie pattern: httpOnly sa_impersonation JSON cookie set via server action, read in middleware"
    - "Middleware impersonation bypass: isImpersonating flag gates association check block, restructured else-if for TypeScript null narrowing"

key-files:
  created: []
  modified:
    - src/app/admin/primariata/_components/super-admin-shell.tsx
    - src/actions/super-admin-write.ts
    - src/middleware.ts
    - src/app/admin/primariata/_components/primarie-detail-drawer.tsx

key-decisions:
  - "CommandPalette receives role='admin' and basePath='/admin/primariata' in SuperAdminShell — super_admin role not mapped in getCommandsForRole, falls through to admin commands which is appropriate"
  - "Middleware else-if restructured to else-if (!isImpersonating && association && association.status === 'approved') for TypeScript null narrowing — plain else caused TS18047 because isImpersonating=true could reach else with null association"
  - "startImpersonation reuses getSuperAdminUser and writeAuditLog helpers from super-admin-write.ts — no code duplication"

patterns-established:
  - "Pattern: Super admin impersonation uses sa_impersonation cookie (JSON, httpOnly) set by server action; middleware reads and bypasses user_primarii association checks"

requirements-completed:
  - SA-IMPERSONATE-01
  - SA-HEADER-01

duration: 3min
completed: "2026-03-10"
---

# Phase 22 Plan 06: Super Admin Shell Header + Impersonation System Summary

**CommandPalette/NotificationDrawer wired to state in SuperAdminShell, plus full impersonation flow: server action sets httpOnly sa_impersonation cookie, middleware bypasses association checks, UI button redirects to primarie admin dashboard**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-10T00:27:12Z
- **Completed:** 2026-03-10T00:30:46Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- SuperAdminShell now has live commandOpen/notifOpen state with useCallback togglers passed to both sidebar and topbar; CommandPalette and NotificationDrawer render at shell level
- `startImpersonation` server action added to `super-admin-write.ts`: verifies super_admin role, resolves judet/localitate slugs via Supabase join, sets `sa_impersonation` httpOnly cookie (2h TTL), writes audit_log entry
- Middleware updated to read `sa_impersonation` cookie and set `isImpersonating` flag that bypasses `user_primarii` association checks, allowing super admin to enter any primarie's `/app/[judet]/[localitate]/admin` route
- PrimarieDetailDrawer "Impersonare Admin" placeholder button replaced with real `handleImpersonate` handler: calls `startImpersonation`, closes drawer, redirects on success

## Task Commits

1. **Task 1: Wire CommandPalette and NotificationDrawer in SuperAdminShell** - `27fe9b6` (feat)
2. **Task 2: Implement impersonation — server action + middleware + UI button** - `767ac06` (feat)

## Files Created/Modified

- `src/app/admin/primariata/_components/super-admin-shell.tsx` - Added commandOpen/notifOpen state, real toggle handlers, CommandPalette and NotificationDrawer rendered at shell level
- `src/actions/super-admin-write.ts` - Added `startImpersonation` action + `cookies` import from next/headers
- `src/middleware.ts` - Added sa_impersonation cookie reader, isImpersonating flag, restructured else-if for TypeScript narrowing
- `src/app/admin/primariata/_components/primarie-detail-drawer.tsx` - Replaced placeholder toast with real handleImpersonate handler, added LogIn icon, removed unused UserCog import

## Decisions Made

- **CommandPalette role/basePath for super admin:** Used `role="admin"` and `basePath="/admin/primariata"` since `getCommandsForRole` does not have a super_admin branch; admin commands are appropriate context
- **Middleware null narrowing fix:** Changed `else { ... association.rol ... }` to `else if (!isImpersonating && association && association.status === "approved") { ... }`. The original `else` worked because it was the complement of `if (!association || ...)` which narrowed `association` to non-null. Adding `isImpersonating` to the `if` condition broke this narrowing since TypeScript couldn't guarantee `association` was non-null in the `else` branch. The explicit `else if` with both guards restores type safety.
- **Reuse of helpers:** `startImpersonation` uses the existing `getSuperAdminUser()` and `writeAuditLog()` helpers already in the file, maintaining DRY principle

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Middleware TypeScript null narrowing error after adding isImpersonating**
- **Found during:** Task 2 (middleware update)
- **Issue:** Changing `if (!association || ...)` to `if (!isImpersonating && (!association || ...))` caused TS18047 `association is possibly null` in the `else` block because TypeScript can no longer narrow `association` to non-null in the else branch
- **Fix:** Converted `else { ... }` to `else if (!isImpersonating && association && association.status === "approved") { ... }` with explicit null guard; added comment for impersonating super admin pass-through case
- **Files modified:** src/middleware.ts
- **Verification:** `pnpm type-check` shows only pre-existing gdpr.ts errors; no errors in modified files
- **Committed in:** 767ac06 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - TypeScript bug)
**Impact on plan:** Required fix for type safety in middleware impersonation bypass. No scope creep.

## Issues Encountered

- `CommandPalette` component requires `role` and `basePath` props (not documented in plan context). Read the component to determine appropriate values for super admin context.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Super admin shell header fully functional: notification drawer and command palette wired
- Impersonation system complete: cookie set → middleware reads → admin route accessible
- Ready for any remaining Phase 22 plans (22-07, 22-08)

## Self-Check: PASSED

Files verified:
- FOUND: src/app/admin/primariata/_components/super-admin-shell.tsx
- FOUND: src/actions/super-admin-write.ts (startImpersonation appended)
- FOUND: src/middleware.ts (isImpersonating logic added)
- FOUND: src/app/admin/primariata/_components/primarie-detail-drawer.tsx (handleImpersonate added)

Commits verified:
- FOUND: 27fe9b6 (Task 1)
- FOUND: 767ac06 (Task 2)

---
*Phase: 22-super-admin-module*
*Completed: 2026-03-10*
