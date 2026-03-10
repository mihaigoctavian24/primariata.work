---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: Design Revamp
status: completed
stopped_at: Completed 22-07-PLAN.md
last_updated: "2026-03-10T00:53:32.876Z"
last_activity: 2026-03-09 -- Completed Phase 21 Wave 1
progress:
  total_phases: 9
  completed_phases: 7
  total_plans: 43
  completed_plans: 42
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-05)

**Core value:** Citizens can submit cereri and complete plati digitally for any primarie where they're registered, with complete data isolation between primarii and proper role-based access for all user types.
**Current focus:** v2.0 Design Revamp -- Phase 16 (Accent Color Propagation & Polish) in progress

## Current Position

Phase: 21 of 21 (Admin Navigation Performance Optimization) -- eighth of 8 v2.0 phases
Plan: 1 of 1 in current phase (1 complete)
Status: Phase 21 COMPLETE — all plans executed
Last activity: 2026-03-09 -- Completed Phase 21 Wave 1

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 36 (v1.0)
- v2.0 plans completed: 8
- Total execution time: carried from v1.0

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 12-17 | 9/13 | 31min | 3.4min |
| Phase 13 P03 | 5min | 2 tasks | 6 files |
| Phase 14 P01 | 5min | 2 tasks | 29 files |
| Phase 14 P02 | 2min | 2 tasks | 9 files |
| Phase 15 P01 | 3min | 2 tasks | 6 files |
| Phase 15 P02 | 4min | 2 tasks | 7 files |
| Phase 15 P03 | 5min | 6 tasks | 8 files |
| Phase 16 P03 | 4min | 2 tasks | 9 files |
| Phase 16 P02 | 6min | 2 tasks | 7 files |
| Phase 19 P00 | 4 | 2 tasks | 7 files |
| Phase 19 P02 | 4 | 2 tasks | 7 files |
| Phase 19 P01 | 7 | 2 tasks | 6 files |
| Phase 19 P06 | 10 | 2 tasks | 7 files |
| Phase 19 P04 | 22 | 2 tasks | 8 files |
| Phase 19 P03 | 35 | 2 tasks | 9 files |
| Phase 19 P05 | 13min | 2 tasks | 10 files |
| Phase 20 P00 | 3 | 2 tasks | 8 files |
| Phase 20 P01 | 9 | 2 tasks | 8 files |
| Phase 20 P02 | 8 | 2 tasks | 9 files |
| Phase 20 P03 | 7 | 2 tasks | 7 files |
| Phase 20 P04 | 8 | 2 tasks | 6 files |
| Phase 20 P05 | 12 | 2 tasks | 6 files |
| Phase 20 P06 | 10 | 2 tasks | 6 files |
| Phase 20 P07 | 2 | 2 tasks | 3 files |
| Phase 22 P01 | 2 | 5 tasks | 2 files |
| Phase 22 P02 | 1 | 5 tasks | 3 files |
| Phase 22-super-admin-module P03 | 2 | 2 tasks | 1 files |
| Phase 22-super-admin-module P04 | 6 | 2 tasks | 9 files |
| Phase 22-super-admin-module P05 | 8 | 2 tasks | 8 files |
| Phase 22-super-admin-module P06 | 3 | 2 tasks | 4 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v2.0]: Figma Make export is visual reference only -- mandatory substitution pass for React Router, hardcoded colors, MUI
- [v2.0]: Admin role enforcement in middleware before any UI ships
- [v2.0]: Click-to-move kanban (no drag-and-drop @dnd-kit for academic milestone)
- [v2.0]: Calendar events Zustand-only (no DB table for academic milestone)
- [v2.0]: Better Stack monitoring mock-first, real API swap later
- [12-01]: oklch token values hand-tuned to match existing visual identity
- [12-01]: --primary maps to var(--accent-500) for zero-migration compat
- [12-01]: 10 accent presets (crimson, blue, emerald, amber, violet, teal, rose, slate, orange, indigo)
- [12-02]: AnimatedCounter uses pure rAF + IntersectionObserver (no motion/react dependency)
- [12-02]: Recharts wrappers use CSS custom property references for dynamic accent coloring
- [12-02]: Color variant pattern: colorVariantMap objects mapping to Tailwind token classes
- [13-01]: Cookie-based sidebar collapse persistence for server-side reading (no hydration mismatch)
- [13-01]: Provider wrapper pattern: server layout reads cookie -> client Providers -> ShellLayout
- [13-01]: Admin role enforcement: only approved admin role in user_primarii grants /admin/* access
- [13-02]: Used utilizatori table (not profiles) with nume/prenume fields for admin user search
- [13-02]: Cereri search uses numar_inregistrare + join to tipuri_cereri for type name display
- [13-02]: Notification category mapping: cerere_*/status_updated/deadline -> cereri, payment_due -> payments
- [13-04]: Custom motion.div drawer replaces shadcn Sheet to eliminate Radix Dialog a11y requirements
- [13-04]: 30s polling fallback for unread badge when realtime subscription fails
- [13-04]: sr-only DialogTitle in CommandDialog instead of @radix-ui/react-visually-hidden package
- [Phase 13]: usePathname() in CitizenProviders to detect admin sub-path and switch sidebar config dynamically
- [Phase 13]: Admin role enforcement uses existing association.rol (no extra DB query for /app/*/admin/*)
- [14-01]: user_primarii table for role counts (not utilizatori.primarie_id) -- many-to-many with status tracking
- [14-01]: health_checks queried as 'never' type cast until DB types regenerated
- [14-01]: pg_cron setup as commented SQL instructions (Vault secrets are env-specific)
- [Phase 14]: All dashboard sections share same React Query queryKey with select() extractors
- [15-01]: getAuthContext helper extracts user+primarie ID to reduce Server Action boilerplate
- [15-01]: Email changes trigger Supabase Auth confirmation flow, not immediate utilizatori update
- [15-01]: verify_user_password uses SECURITY DEFINER with crypt() for safe password comparison
- [15-01]: Maintenance mode uses cookie-based check (x-maintenance-mode) in middleware
- [15-02]: Server Component page fetches all settings data, passes to single client tab layout
- [15-02]: AnimatePresence mode="wait" for tab content transitions, layoutId for tab indicator
- [15-02]: Accent color instant preview via Zustand setPreset, separate DB save action
- [15-02]: Per-tab independent RHF forms with zodResolver for independent save
- [15-03]: popLayout AnimatePresence mode for instant tab switching (~100ms)
- [15-03]: Shared settings-ui.tsx with InputWithIcon/GradientSaveButton/AnimatedToggle for Figma tokens
- [15-03]: Collapsible contact section in primarie tab to keep Figma-matching main area clean
- [16-03]: AdminLoginForm uses user_primarii role check (not utilizatori.rol) for staff auth
- [16-03]: Middleware admin route isolation: staff on citizen routes redirected to admin dashboard
- [16-03]: Password reset return=admin query param chain through reset and update forms
- [16-01]: CSS var gradients use oklch hue-shift +30deg for dynamic accent pairing
- [16-01]: Chart palettes replaced purple/pink with neutral cyan/orange/slate to avoid accent collision
- [16-01]: StatisticsCards uses color-mix() for CSS-variable-compatible opacity backgrounds
- [16-01]: system-health/admin-alerts hex-alpha-concat colors kept (pattern incompatible with CSS vars)
- [16-02]: ClickableAvatar uses rounded-2xl to match Figma settings card style
- [16-02]: TopBarActions avatar is standalone, so direct click-to-upload (no dropdown conflict)
- [16-02]: Sidebar/top bar update local state immediately + router.refresh for server sync
- [Phase 19]: getAuthContext returns typed AuthContext (not any) using Awaited<ReturnType<typeof createClient>> for full type safety
- [Phase 19]: aggregateByMonth groups by YYYY-MM key to correctly handle multi-year payment data
- [Phase 19]: pnpm types:generate skipped -- migration must be applied to live DB first; Wave 1 plans should run it after DB apply
- [Phase 19]: page Server Component uses createClient directly (not getAuthContext — only Server Actions use getAuthContext)
- [Phase 19]: Service role client used in admin-users.ts Server Actions to bypass RLS for user management
- [Phase 19-01]: CHART_COLORS.primary[] is an array indexed by position (0=blue,1=cyan,2=emerald,3=amber,4=orange,5=slate) not named keys as plan context implied
- [Phase 19-01]: ServiceHealth.iconName is a string key (not LucideIcon) to allow Server Component serialization through Suspense boundary
- [Phase 19-01]: Inline StatCard in monitorizare-content (not shared StatsCard) because AnimatedCounter only accepts integer targets; monitorizare has decimal %% values
- [Phase 19]: Zod 4: use z.string().refine() for numeric date validation in RHF modals (z.coerce breaks resolver typing)
- [Phase 19]: Calendar event color: store Tailwind bg-* class name strings, not hex — enables CSS-variable-compatible theming
- [Phase 19]: Local StorageFile interface in types.ts avoids @supabase/storage-js direct import (not a direct dep)
- [Phase 19]: Documente upload uses client-side supabase.storage; preview uses createSignedUrl(path, 3600) on modal open
- [Phase 19]: cereri-status.ts shared lib: status mapping constants separate from 'use server' file for Next.js boundary compliance
- [Phase 19]: CerereRow as plain interface (not extending DB Row) to handle Wave 0 migration columns not yet in generated types
- [Phase 19]: Click-to-move Kanban (no dnd-kit) confirmed as pattern for cereri supervizare
- [Phase 19]: Recharts SVG strokes use semantic hex palette (blue-500/cyan-500/amber-500) — CSS vars can't be used in SVG stroke attributes
- [Phase 19]: Category progress bars use graceful mock fallback (Stare Civilă/Urbanism/Social) for fresh deployments with no plati data
- [Phase 19]: DB_TO_UI_STATUS constants extracted to @/lib/cereri-status.ts — non-async exports cannot live in use-server files in Next.js 15
- [Phase 20]: GaugeSVG color prop is hex string (required) — SVG stroke attribute cannot resolve CSS custom properties
- [Phase 20]: shared/ as single source for admin components; originals in admin/ not deleted until downstream waves clean up
- [Phase 20]: RoleColorBadge uses Tailwind opacity classes (bg-blue-500/15) not CSS var tokens for JIT compatibility
- [Phase 20]: user_primarii.rol requires explicit cast to literal union when updating via service role client
- [Phase 20]: inactiv status maps to rejected in user_primarii — no inactive status in DB enum
- [Phase 20]: Phase 20: actions.ts co-location pattern — Server Actions in component folder, not global actions/
- [Phase 20]: Co-located actions.ts in cereri-supervizare/ returning { error?: string } (not ActionResult)
- [Phase 20]: confetti triggered in cereri-content coordinator (not kanban tab) so it fires for all approve paths
- [Phase 20]: Click-to-move Kanban dialog uses fixed inset-0 overlay with Framer Motion spring animation
- [Phase 20]: aggregateByMonthFull returns colectat+esuat shape for AreaChart (not target)
- [Phase 20]: txFilter state lifted to FinanciarContent coordinator — KpiCards + TransactionList share it
- [Phase 20]: colectatGrad20/esuatGrad20 unique SVG gradient IDs to prevent Recharts defs conflicts
- [Phase 20]: Supabase storage.list() returns FileObject[] — cast via as unknown as StorageFile[] to bridge type mismatch
- [Phase 20]: DocumentUploadZone is transparent wrapper (no visual chrome); fileInputRef passed from parent for Incarca button trigger
- [Phase 20]: Documente page.tsx simplified to auth-only Server Component; all Storage ops client-side in DocumenteContent
- [Phase 20]: Calendar event date stored as ISO string YYYY-MM-DD (not day/month/year ints) for simpler comparison and filtering
- [Phase 20]: DOT_COLOR_MAP hex lookup used only for CSS border/background style props; Tailwind bg-* class string is canonical stored value
- [Phase 20]: Phase 20: MonitorizareContent takes no props — setInterval + mock data self-contained in Client Component (no Server Component data pass)
- [Phase 20]: Phase 20: AnimatedCounter NOT used for decimal gauge values — GaugeSVG renders Math.round() directly
- [Phase 20]: Phase 20: mon20 SVG gradient ID prefix prevents Recharts defs conflicts across admin page charts
- [Phase 20]: AdminModal uses z-[100] JIT value (not CSS var) for predictable layering; AdminErrorBoundary must be class component for React error boundary API; semantic color tokens reference Tailwind color vars for theme-independent values
- [Phase 22]: SaDashboardContent takes no props — all mock data inlined at module level, matching pattern of sa-analytics-content, sa-audit-content, etc.
- [Phase 22]: Sidebar routes corrected: admins->admini, settings->setari to match Figma-aligned page implementations
- [Phase 22]: Legacy pages use Next.js redirect() with explicit :never return type for type safety
- [Phase 22-super-admin-module]: judete.cod used for county abbreviation in super-admin queries (not abreviere — column does not exist in DB schema)
- [Phase 22-super-admin-module]: audit_log.utilizator_nome used directly for actorName in getAuditLog (avoids extra join to utilizatori)
- [Phase 22-super-admin-module]: Server actions interfaces exported from super-admin-stats.ts for type-safe client imports
- [Phase 22-super-admin-module]: Mapping functions in content components bridge server types to local types, keeping grid/table sub-components untouched
- [Phase 22-super-admin-module]: z.string().refine() for integer parsing in Zod 4 — z.coerce.number invalid_type_error does not exist in Zod 4 API
- [Phase 22-super-admin-module]: primarii.slug required in Insert — auto-generated from numeOficial with Romanian diacritic normalization
- [Phase 22-super-admin-module]: writeAuditLog uses as unknown as Json cast for detalii — Record<string,unknown> incompatible with Supabase Json type
- [Phase 22-super-admin-module]: CommandPalette in SuperAdminShell uses role='admin' basePath='/admin/primariata' — super_admin not in getCommandsForRole, admin commands appropriate
- [Phase 22-super-admin-module]: Middleware else-if restructured for TypeScript null narrowing: else if (\!isImpersonating && association && ...) replaces plain else to avoid TS18047 when isImpersonating is true with null association
- [Phase 22-super-admin-module]: sa_impersonation cookie (httpOnly, 2h TTL) set by startImpersonation server action; middleware reads JSON and sets isImpersonating flag to bypass user_primarii association checks
- [Phase 22-super-admin-module]: Brand emerald/cyan colors (#10b981, #06b6d4) kept as semantic hex in super admin module — they are brand identity not generic surface colors; mapping to CSS accent would wrongly yield theme override
- [Phase 22-super-admin-module]: var(--popover) used for modal/drawer backgrounds; var(--muted) for inner form field surfaces — matches semantic intent of Phase 12 tokens

### Pending Todos

6 pending todos:
- Butoane responsive la accent color (ui)
- Propagare accent color peste tot elementele din app (ui)
- Aliniere vizuala cu Figma design system (ui)
- ~~Avatar editabil in configurare primarie (ui)~~ -- DONE (16-02)
- Admin routing fix - redirect si izolare rute (auth)
- Locality selection - 3 user scenarios (ui)

### Roadmap Evolution

- Phase 16 inserted: Accent Color Propagation & Polish (old 16→17, old 17→18)
- Phase 19 added: Admin pages from Figma: monitorizare, utilizatori, cereri, documente, financiar, calendar
- Phase 21 added: Admin Navigation Performance Optimization

### Blockers/Concerns

- Phase 17 (Monitorizare): Better Stack Telemetry API account tier unconfirmed -- mock-first mandatory
- Phase 16 (Cereri): Verify cereri table schema for prioritate/note_admin/escaladata columns before migration
- Phase 17 (Calendar): DB table vs Zustand-only decision confirmed as Zustand-only for now

## Session Continuity

Last session: 2026-03-10T00:53:25.672Z
Stopped at: Completed 22-07-PLAN.md
Resume file: None
