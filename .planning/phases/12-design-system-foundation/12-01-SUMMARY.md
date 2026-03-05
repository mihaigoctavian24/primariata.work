---
phase: 12-design-system-foundation
plan: 01
subsystem: ui
tags: [oklch, css-tokens, accent-color, zustand, framer-motion, tailwind-css-4]

requires:
  - phase: 11-e2e-seed-coverage
    provides: stable test suite and build baseline
provides:
  - oklch CSS token system with accent color engine in globals.css
  - Zustand accent color store with 10 curated presets
  - AccentColorProvider wired into app layout
  - Motion variants (fadeIn, slideIn, stagger, springTransition, defaultTransition)
  - Extended surface tokens (raised, sunken, overlay, border-subtle, border-strong)
  - Typography @layer base defaults aligned with Figma hierarchy
  - Landing page inverse-mode data-theme refactor with compatibility bridge
affects: [12-02, 13-admin-layout, 14-admin-pages, 15-settings, 16-cereri-revamp]

tech-stack:
  added: []
  patterns: [oklch-token-system, accent-hue-cascade, motion-variants-central-export, data-theme-inverse-mode]

key-files:
  created:
    - src/store/accent-color-store.ts
    - src/components/accent-color-provider.tsx
    - src/lib/motion.ts
  modified:
    - src/app/globals.css
    - src/app/layout.tsx

key-decisions:
  - "oklch token values hand-tuned to match existing visual identity while using perceptual color space"
  - "10 accent presets (added orange and indigo beyond the 8 minimum) for broader customization"
  - "Landing page inverse-mode kept as compatibility bridge with !important until JSX updated"
  - "--primary maps to var(--accent-500) for zero-migration backward compatibility"

patterns-established:
  - "oklch tokens: All colors defined as oklch() in :root/.dark, bridged via @theme inline"
  - "Accent engine: Single --accent-hue CSS variable drives 11 shade steps (50-950)"
  - "Motion system: Import variants from @/lib/motion.ts, all respect prefers-reduced-motion"
  - "Surface tokens: Use --surface-raised/sunken/overlay and --border-subtle/strong for layered surfaces"

requirements-completed: [DSF-01, DSF-02, DSF-03, DSF-04, DSF-05]

duration: 4min
completed: 2026-03-05
---

# Phase 12 Plan 01: Design System Foundation Summary

**oklch CSS token system with runtime accent color engine (10 presets), typography defaults, motion variants, and AccentColorProvider wired into app layout**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-05T01:03:54Z
- **Completed:** 2026-03-05T01:08:08Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Rewrote globals.css from hex to oklch color tokens for all semantic colors in both light and dark themes
- Built accent color engine where a single --accent-hue CSS variable generates a full 50-950 shade palette via Evil Martians oklch scale
- Created Zustand store with 10 curated accent presets and AccentColorProvider that applies preset on mount
- Exported standardized Framer Motion variants (fadeIn, slideIn, stagger, springTransition, defaultTransition) with prefers-reduced-motion support
- Added extended surface tokens and typography @layer base defaults
- Refactored landing page inverse-mode CSS to token-based data-theme approach with backward-compatible .light/.dark bridge

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite globals.css with oklch tokens, accent engine, typography, and inverse-mode refactor** - `d5b3fbf` (feat)
2. **Task 2: Create accent color store, AccentColorProvider, motion variants, and wire into layout** - `31b8346` (feat)

## Files Created/Modified

- `src/app/globals.css` - Fully rewritten with oklch tokens, accent engine, extended surfaces, typography defaults, inverse-mode refactor
- `src/store/accent-color-store.ts` - Zustand store with ACCENT_PRESETS array (10 presets) and useAccentColorStore hook
- `src/components/accent-color-provider.tsx` - Client component that applies accent preset via CSS variable on mount
- `src/lib/motion.ts` - Centralized motion variants with reduced-motion support
- `src/app/layout.tsx` - AccentColorProvider wrapping children inside ThemeProvider

## Decisions Made

- Used 10 accent presets instead of 8 (added orange hue 45 and indigo hue 275 for broader palette)
- Kept landing page .light/.dark class compatibility bridge with !important until JSX components are updated to use data-theme attributes
- Mapped --primary to var(--accent-500) for zero-migration backward compatibility with all existing shadcn components
- Chart card dark mode background converted from hex #000000 to oklch(0.145 0 0) matching --background token

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Commit scope had to use "ui" instead of "12-01" due to commitlint scope restrictions - resolved by using allowed scope

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Token system and accent engine ready for Plan 02 (shared admin components)
- All 7 shared components can reference oklch tokens and motion variants
- AccentColorProvider in layout means accent changes cascade app-wide immediately

---
*Phase: 12-design-system-foundation*
*Completed: 2026-03-05*
