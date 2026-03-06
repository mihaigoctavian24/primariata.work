---
phase: 16-accent-color-propagation-polish
plan: 02
subsystem: ui
tags: [avatar, upload, supabase-storage, framer-motion, accent-color]

requires:
  - phase: 15-admin-settings
    provides: "Settings tabs (profile, primarie) with forms and accent color support"
  - phase: 13-layout-shell
    provides: "SidebarUserCard and TopBarActions shell components"
provides:
  - "ClickableAvatar shared component with click-to-upload, hover overlay, accent gradient fallback"
  - "Avatar upload in profile-tab, primarie-tab, sidebar, and top bar"
  - "updatePrimarieLogo server action for logo persistence"
affects: [admin, ui]

tech-stack:
  added: []
  patterns:
    - "ClickableAvatar reusable pattern: click-to-upload with Supabase Storage + hover overlay"
    - "Accent gradient fallback: linear-gradient(135deg, var(--accent-400), var(--accent-600))"

key-files:
  created:
    - src/components/shared/ClickableAvatar.tsx
  modified:
    - src/components/admin/settings/profile-tab.tsx
    - src/components/admin/settings/primarie-tab.tsx
    - src/components/admin/settings/admin-settings-tabs.tsx
    - src/components/shell/sidebar/SidebarUserCard.tsx
    - src/components/shell/top-bar/TopBarActions.tsx
    - src/actions/admin-settings.ts

key-decisions:
  - "ClickableAvatar uses rounded-2xl (not rounded-full) to match Figma settings card style"
  - "TopBarActions avatar is standalone (no dropdown), so direct click-to-upload was used"
  - "Sidebar and top bar update local state immediately + router.refresh for server sync"

patterns-established:
  - "ClickableAvatar: reusable upload component with size variants (sm/md/lg), accent gradient fallback, Camera hover overlay"

requirements-completed: [SC-4]

duration: 6min
completed: 2026-03-06
---

# Phase 16 Plan 02: ClickableAvatar Upload Summary

**Reusable ClickableAvatar component with accent gradient fallback, integrated in profile tab, primarie tab, sidebar, and top bar for click-to-upload avatar/logo functionality**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-06T12:10:05Z
- **Completed:** 2026-03-06T12:16:29Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Created ClickableAvatar shared component with 3 size variants, accent gradient fallback, Camera hover overlay, Supabase Storage upload, loading/error states
- Integrated avatar upload in Profile tab (user photo) and Primarie tab (logo) with server-side persistence
- Replaced static avatars in sidebar user card and top bar with clickable upload versions
- Added avatar_url and logo_url to settings data pipeline (server action, type interfaces, props)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ClickableAvatar shared component** - `325863e` (feat)
2. **Task 2: Integrate ClickableAvatar in settings, sidebar, and top bar** - `57930a7` (feat)

## Files Created/Modified
- `src/components/shared/ClickableAvatar.tsx` - Reusable click-to-upload avatar with hover overlay, accent gradient fallback, 3 sizes
- `src/components/admin/settings/profile-tab.tsx` - Replaced static avatar with ClickableAvatar for user photo upload
- `src/components/admin/settings/primarie-tab.tsx` - Added ClickableAvatar for primarie logo upload
- `src/components/admin/settings/admin-settings-tabs.tsx` - Added avatar_url and logo_url to SettingsPageData interface
- `src/components/shell/sidebar/SidebarUserCard.tsx` - Replaced static Avatar with ClickableAvatar
- `src/components/shell/top-bar/TopBarActions.tsx` - Replaced static Avatar with ClickableAvatar
- `src/actions/admin-settings.ts` - Added avatar_url/logo_url to data pipeline, updatePrimarieLogo action

## Decisions Made
- ClickableAvatar uses rounded-2xl to match the existing Figma settings card style (not rounded-full)
- TopBarActions avatar is standalone (no DropdownMenuTrigger), so direct click-to-upload was used instead of a menu item
- Sidebar and top bar optimistically update local state on upload success, then call router.refresh() for server sync
- Reused existing avatarUploadSchema from profile validations for file validation consistency

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added avatar_url/logo_url to settings data pipeline**
- **Found during:** Task 2 (Integration)
- **Issue:** Settings page data interface and server action did not include avatar_url or logo_url fields
- **Fix:** Added fields to SettingsPageData types in both actions file and admin-settings-tabs, updated getSettingsPageData query to include logo_url, added authUser metadata extraction for avatar_url
- **Files modified:** src/actions/admin-settings.ts, src/components/admin/settings/admin-settings-tabs.tsx
- **Verification:** pnpm type-check passes
- **Committed in:** 57930a7 (Task 2 commit)

**2. [Rule 2 - Missing Critical] Created updatePrimarieLogo server action**
- **Found during:** Task 2 (Primarie tab integration)
- **Issue:** No server action existed to persist the primarie logo_url after upload
- **Fix:** Created updatePrimarieLogo server action updating primarii.logo_url column
- **Files modified:** src/actions/admin-settings.ts
- **Verification:** pnpm type-check passes
- **Committed in:** 57930a7 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 missing critical)
**Impact on plan:** Both auto-fixes necessary for data flow completeness. No scope creep.

## Issues Encountered
- Build trace collection error (ENOENT for route.js.nft.json) is pre-existing and unrelated to changes -- compilation itself succeeded with all 81 pages generated

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- ClickableAvatar component ready for reuse in any future location
- Avatar/logo upload fully functional with Supabase Storage user-avatars bucket
- All settings tabs, sidebar, and top bar have working upload capability

---
*Phase: 16-accent-color-propagation-polish*
*Completed: 2026-03-06*
