---
phase: 20-pixel-perfect-admin-pages-figma-alignment-for-monitorizare-utilizatori-cereri-documente-financiar-calendar
plan: "00"
subsystem: ui
tags: [css-tokens, admin, shared-components, tailwind, framer-motion, svg]

# Dependency graph
requires: []
provides:
  - "Role color CSS tokens (--role-cetatan/functionar/primar/admin) in globals.css :root and .dark blocks"
  - "src/components/admin/shared/ directory with 7 named-export components ready for phase 20 waves"
  - "GaugeSVG: new animated circular SVG gauge for Monitorizare CPU/RAM/Disk display"
  - "RoleColorBadge: role-keyed badge using Tailwind opacity classes"
  - "Migrated shared components with explicit React.ReactElement types and @/ absolute imports"
affects:
  - "20-01, 20-02, 20-03, 20-04, 20-05, 20-06 (all phase 20 waves import from shared/)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Role color tokens use --color-* Tailwind 4 CSS vars (theme-aware through oklch)"
    - "SVG stroke colors use hex literals (CSS vars cannot resolve in SVG stroke attributes)"
    - "Shared admin components live in src/components/admin/shared/ with named exports only"
    - "GaugeSVG uses motion.circle with strokeDashoffset animation + drop-shadow filter on progress arc"

key-files:
  created:
    - "src/components/admin/shared/animated-counter.tsx"
    - "src/components/admin/shared/progress-ring.tsx"
    - "src/components/admin/shared/donut-chart.tsx"
    - "src/components/admin/shared/stats-card.tsx"
    - "src/components/admin/shared/live-activity-feed.tsx"
    - "src/components/admin/shared/gauge-svg.tsx"
    - "src/components/admin/shared/role-color-badge.tsx"
  modified:
    - "src/app/globals.css"

key-decisions:
  - "Originals in src/components/admin/ not deleted — downstream waves handle cleanup to avoid breaking existing dashboard imports"
  - "GaugeSVG color prop is hex string (required), not CSS var — SVG stroke attributes cannot resolve CSS custom properties"
  - "RoleColorBadge uses Tailwind opacity classes (bg-blue-500/15) instead of CSS var tokens for better Tailwind JIT compatibility"
  - "stats-card.tsx in shared/ imports AnimatedCounter from @/components/admin/shared/animated-counter (absolute path)"

patterns-established:
  - "shared/ as single source for reusable admin components: all future admin waves import from @/components/admin/shared/"
  - "Role badge pattern: RoleKey union type + Record<RoleKey, string> class maps + fallback gray for unknown roles"

requirements-completed: [UTL-01, MON-01]

# Metrics
duration: 3min
completed: 2026-03-08
---

# Phase 20 Plan 00: Wave 0 Foundation Summary

**Role color CSS tokens + shared admin component library (7 files) enabling all phase 20 Figma-pixel-perfect rewrites**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-08T09:47:06Z
- **Completed:** 2026-03-08T09:50:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Added 4 role color CSS tokens (`--role-cetatan`, `--role-functionar`, `--role-primar`, `--role-admin`) to both `:root` and `.dark` blocks in globals.css
- Created `src/components/admin/shared/` with 7 files: 5 migrated from `src/components/admin/` + 2 new components
- GaugeSVG provides animated SVG circular gauge (hex color, label, unit, animated strokeDashoffset via Framer Motion)
- RoleColorBadge provides role-typed badge with blue/emerald/amber/violet Tailwind classes
- pnpm build passes with zero TypeScript errors after all changes

## Task Commits

Each task was committed atomically:

1. **Task 1: Add role color tokens to globals.css** - `669052a` (feat)
2. **Task 2: Create shared/ directory with migrated + new components** - `31916bd` (feat)

## Files Created/Modified
- `src/app/globals.css` - Added 4 `--role-*` CSS custom property tokens in `:root` and `.dark` blocks
- `src/components/admin/shared/animated-counter.tsx` - Migrated from admin/, explicit return type
- `src/components/admin/shared/progress-ring.tsx` - Migrated from admin/, explicit return type
- `src/components/admin/shared/donut-chart.tsx` - Migrated from admin/, explicit return type
- `src/components/admin/shared/stats-card.tsx` - Migrated, updated AnimatedCounter import to @/ absolute path
- `src/components/admin/shared/live-activity-feed.tsx` - Migrated from admin/, explicit return type
- `src/components/admin/shared/gauge-svg.tsx` - New: animated circular SVG gauge for monitoring
- `src/components/admin/shared/role-color-badge.tsx` - New: role-colored badge component

## Decisions Made
- Originals in `src/components/admin/` not deleted — downstream waves handle cleanup to avoid breaking existing dashboard imports
- `GaugeSVG.color` is a required hex string because SVG `stroke` attribute cannot resolve CSS custom properties
- `RoleColorBadge` uses Tailwind opacity utility classes (`bg-blue-500/15`) instead of `--role-*` CSS vars for reliable JIT class generation
- `stats-card.tsx` in shared/ uses absolute `@/` import for AnimatedCounter (not relative) to match project conventions

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- commitlint scope `20-00` rejected — project requires one of the predefined scopes. Used `ui` and `admin` respectively. This is expected behaviour.

## Next Phase Readiness
- All phase 20 waves (01-06) can now import from `@/components/admin/shared/`
- Role color tokens available globally via CSS cascade for any admin page component
- `pnpm build` green, zero TypeScript errors

---
*Phase: 20-pixel-perfect-admin-pages-figma-alignment-for-monitorizare-utilizatori-cereri-documente-financiar-calendar*
*Completed: 2026-03-08*
