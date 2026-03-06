---
phase: 16-accent-color-propagation-polish
plan: 03
subsystem: auth
tags: [supabase, middleware, admin-login, role-check, user_primarii, react-hook-form, zod]

requires:
  - phase: 13-layout-shell
    provides: admin route enforcement (SEC-01, SEC-02) in middleware
  - phase: 15-admin-settings
    provides: AuthLayout, AuthHeader, AnimatedCard components

provides:
  - Dedicated admin login page at /admin/login with email+password auth
  - AdminLoginForm component with user_primarii role check
  - Role-aware OAuth callback redirecting admin users to admin dashboard
  - Middleware admin route isolation (staff blocked from citizen routes)
  - Password reset return path for admin flow
  - Landing page staff login links (hero + footer)

affects: [admin, auth, landing]

tech-stack:
  added: []
  patterns:
    - "user_primarii role check pattern for staff authentication"
    - "return=admin query param for password reset flow routing"
    - "Admin route isolation in middleware (reverse of SEC-01)"

key-files:
  created:
    - src/components/auth/AdminLoginForm.tsx
    - src/app/admin/login/admin-login-content.tsx
  modified:
    - src/app/admin/login/page.tsx
    - src/app/auth/callback/route.ts
    - src/middleware.ts
    - src/components/auth/ResetPasswordForm.tsx
    - src/components/auth/UpdatePasswordForm.tsx
    - src/components/landing/HeroSection.tsx
    - src/components/ui/footer.tsx

key-decisions:
  - "Removed admin_primarie from role list -- not in DB type union"
  - "Deleted /admin/auth/callback (old OAuth callback) since admin uses email+password only"
  - "Admin route isolation: staff users on citizen routes redirect to admin dashboard"
  - "Password reset uses return=admin query param chain through reset and update forms"

patterns-established:
  - "AdminLoginForm: email+password -> signInWithPassword -> user_primarii role check -> auto-redirect"
  - "Admin route isolation: middleware checks staff role and blocks citizen route access"

requirements-completed: [SC-5, SC-6]

duration: 4min
completed: 2026-03-06
---

# Phase 16 Plan 03: Admin Login & Routing Summary

**Dedicated admin login page with email+password auth, user_primarii role check, middleware route isolation, and landing page staff login links**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-06T12:10:41Z
- **Completed:** 2026-03-06T12:15:08Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- AdminLoginForm component with email+password auth, user_primarii staff role validation, non-staff signOut with redirect
- Admin login page with AuthLayout split-screen hero (Shield icon, professional copy)
- Role-aware OAuth callback: admin users via Google OAuth redirect to admin dashboard
- Middleware admin route isolation: staff blocked from citizen routes, redirected to admin dashboard
- Password reset flow preserves admin context via return=admin query parameter chain
- Landing page staff login link in hero (step 1) and footer (Suport section)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create AdminLoginForm component and admin login page** - `8462867` (feat)
2. **Task 2: Fix admin routing, add landing page links, update password reset return path** - `a811d5a` (feat)

## Files Created/Modified
- `src/components/auth/AdminLoginForm.tsx` - Email+password form with user_primarii role check and auto-redirect
- `src/app/admin/login/admin-login-content.tsx` - Client component with AuthLayout hero for admin login
- `src/app/admin/login/page.tsx` - Server component page with AuthHeader and Suspense wrapper
- `src/app/auth/callback/route.ts` - Added role-aware redirect for admin users after OAuth
- `src/middleware.ts` - Admin route isolation blocking staff from citizen routes
- `src/components/auth/ResetPasswordForm.tsx` - return=admin query param handling for back link
- `src/components/auth/UpdatePasswordForm.tsx` - return=admin query param handling for post-reset redirect
- `src/components/landing/HeroSection.tsx` - Staff login link in hero step 1
- `src/components/ui/footer.tsx` - Staff login link in Suport section
- `src/app/admin/auth/callback/route.ts` - Deleted (old OAuth callback no longer needed)

## Decisions Made
- Removed `admin_primarie` from role list as it does not exist in the database type union
- Deleted old /admin/auth/callback route since admin login now uses email+password exclusively
- Expanded middleware admin role check from just "admin" to all staff roles (admin, functionar, primar, super_admin)
- Used return=admin query param chain through reset -> update password forms for clean flow

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed admin_primarie from role arrays**
- **Found during:** Task 2 (type-check verification)
- **Issue:** Plan specified "admin_primarie" as a valid role but it does not exist in the database type union
- **Fix:** Removed admin_primarie from ADMIN_ROLES in AdminLoginForm, auth callback, and middleware
- **Files modified:** src/components/auth/AdminLoginForm.tsx, src/app/auth/callback/route.ts, src/middleware.ts
- **Verification:** pnpm type-check passes for these files (pre-existing errors in admin-settings.ts remain)
- **Committed in:** a811d5a (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor role list adjustment for type safety. No scope creep.

## Issues Encountered
- Pre-existing TypeScript errors in admin-settings.ts and settings page.tsx (avatar_url, logo_url properties) are unrelated to this plan's changes

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Admin login page ready for visual testing
- Middleware route isolation active for all staff roles
- Landing page links point to /admin/login
- Password reset flow supports admin return path

---
*Phase: 16-accent-color-propagation-polish*
*Completed: 2026-03-06*
