---
phase: 19-admin-pages-from-figma-monitorizare-utilizatori-cereri-documente-financiar-calendar
plan: "04"
subsystem: ui
tags: [supabase-storage, drag-and-drop, signed-url, zustand, framer-motion, admin]

# Dependency graph
requires:
  - phase: 19-00
    provides: Zustand store pattern, auth context helper, shared types foundation

provides:
  - Supabase Storage prefix-based folder navigation for cereri-documente bucket
  - HTML5 drag-and-drop upload zone with progress states
  - Signed URL preview modal (1h expiry) for image/PDF/download
  - Star/favorite persistence via Zustand localStorage store
  - Grid and list view toggle for file rendering
  - Storage usage bar (5GB estimate)

affects: [19-01, 19-02, 19-03, 19-05, 19-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Local StorageFile interface to avoid @supabase/storage-js direct import (mirrors FileObject shape)"
    - "unknown intermediate cast pattern for Supabase storage list() response to typed interface"
    - "React.JSX.Element return type (not JSX.Element or React.ReactElement) per project tsconfig"
    - "Client-side Supabase upload uses createClient from @/lib/supabase/client"
    - "Server-side storage list uses createClient from @/lib/supabase/server inside page.tsx"

key-files:
  created:
    - src/store/starred-documents-store.ts
    - src/app/app/[judet]/[localitate]/admin/documente/page.tsx
    - src/components/admin/documente/documente-skeleton.tsx
    - src/components/admin/documente/types.ts
    - src/components/admin/documente/documente-content.tsx
    - src/components/admin/documente/document-grid.tsx
    - src/components/admin/documente/document-upload-zone.tsx
    - src/components/admin/documente/document-preview-modal.tsx
  modified: []

key-decisions:
  - "Local StorageFile interface defined in types.ts rather than importing from @supabase/storage-js (package not in direct deps, only in .pnpm store)"
  - "Server page casts storage list() result via 'as unknown as StorageFile[]' to bridge Supabase internal FileObject to local interface"
  - "Task 1 files (store, page, skeleton, types) were already committed by a parallel Wave 1 agent — this plan created Task 2 client components only"
  - "pnpm build failure is pre-existing from cereri-content.tsx (plan 19-03) missing sub-components — not caused by documente work"

patterns-established:
  - "Zustand persist store: useStarredDocumentsStore(path) — same pattern as accent-color-store"
  - "Documente upload: client-side supabase.storage.from('cereri-documente').upload(path, file, { upsert: false })"
  - "Preview: supabase.storage.from('cereri-documente').createSignedUrl(path, 3600) on modal open"
  - "File icon: getFileIcon(mimetype) → { Icon, colorClass } — mimetype-based mapping to lucide icons"

requirements-completed: [DOC-01, DOC-02, DOC-03, DOC-04, DOC-05, DOC-06]

# Metrics
duration: 22min
completed: 2026-03-08
---

# Phase 19 Plan 04: Documente Admin Page Summary

**Supabase Storage document manager with drag-and-drop upload, signed URL preview modal, Zustand star persistence, and grid/list toggle over cereri-documente bucket**

## Performance

- **Duration:** 22 min
- **Started:** 2026-03-07T22:13:46Z
- **Completed:** 2026-03-08T00:35:00Z
- **Tasks:** 2
- **Files modified:** 8 (all created new)

## Accomplishments
- Document management UI over Supabase Storage cereri-documente/${primarieId}/admin/ prefix
- HTML5 drag-and-drop + click-to-select upload with progress state (idle/uploading/done/error)
- Signed URL preview modal with image inline, PDF iframe, and download fallback for other types
- Star/favorite toggle persisted via Zustand to localStorage ("starred-documents" key)
- Grid (6-column on xl) and list view toggle with Framer Motion stagger animations
- Storage usage bar showing real totalBytes vs 5GB estimate with animated fill
- Breadcrumb navigation for sub-folder paths
- Graceful empty state handling when bucket is empty or storage error occurs

## Task Commits

Each task was committed atomically:

1. **Task 1: Zustand store + page server component + skeleton** — already committed by parallel Wave 1 agent (prior to this execution)
2. **Task 2: Document grid, upload zone, preview modal, content orchestrator** - `72d6158` (feat)

## Files Created/Modified
- `src/store/starred-documents-store.ts` — Zustand persist store: starredPaths[], toggleStar(path), isStarred(path)
- `src/app/app/[judet]/[localitate]/admin/documente/page.tsx` — Auth-gated Server Component, storage list, totalBytes calc
- `src/components/admin/documente/documente-skeleton.tsx` — Layout-matched skeleton (header + usage bar + toolbar + 9-card grid)
- `src/components/admin/documente/types.ts` — Local StorageFile interface matching Supabase FileObject shape
- `src/components/admin/documente/documente-content.tsx` — Root client component orchestrating all state and sub-components
- `src/components/admin/documente/document-grid.tsx` — Grid/list renderer with star toggle, Framer Motion stagger, getFileIcon
- `src/components/admin/documente/document-upload-zone.tsx` — Drag-and-drop + click-to-select upload with client supabase
- `src/components/admin/documente/document-preview-modal.tsx` — AnimatePresence modal with signed URL fetch on open

## Decisions Made
- Defined local `StorageFile` interface in `types.ts` instead of importing from `@supabase/storage-js` — the package is only in the pnpm store as a transitive dep and can't be directly imported
- Used `as unknown as StorageFile[]` cast in page.tsx to bridge Supabase internal `FileObject` to local interface without TS errors
- Task 1 files were already committed by a parallel agent executing other Wave 1 plans — verified content matches spec, proceeded to Task 2 only

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed @supabase/storage-js direct import failure**
- **Found during:** Task 1 verification (type-check)
- **Issue:** `import type { StorageFile } from "@supabase/storage-js"` failed — package not in direct dependencies
- **Fix:** Created `src/components/admin/documente/types.ts` with local `StorageFile` interface mirroring `FileObject` shape; all components import from local types file
- **Files modified:** types.ts (created), all 4 client components updated
- **Verification:** `pnpm type-check` shows zero errors on documente files
- **Committed in:** 72d6158

**2. [Rule 1 - Bug] Fixed JSX.Element return type — must use React.JSX.Element**
- **Found during:** Task 1 verification (type-check)
- **Issue:** `JSX.Element` and `React.ReactElement` cause "Cannot find namespace 'JSX'" under project tsconfig
- **Fix:** Changed all return types to `React.JSX.Element` and added `import React from "react"` where needed
- **Files modified:** All 5 created components
- **Verification:** `pnpm type-check` zero errors on documente files

---

**Total deviations:** 2 auto-fixed (2 bugs — wrong import, wrong return type)
**Impact on plan:** Both fixes were correctness requirements. No scope creep.

## Issues Encountered
- `pnpm build` fails due to `cereri-content.tsx` (plan 19-03) importing missing sub-components (`cereri-overview-tab`, `cereri-table-tab`, `cereri-kanban-tab`, `cereri-alerts-tab`). This is pre-existing from incomplete Wave 1 parallel execution — not caused by this plan's work. Logged as deferred.
- Task 1 files were already committed by a parallel agent — detected via `git show HEAD --name-only`, verified content matches spec exactly.

## Self-Check: PASSED
- All 8 files exist on disk: CONFIRMED
- Commit 72d6158 exists: CONFIRMED
- pnpm type-check: 0 errors on documente files

## Next Phase Readiness
- Documente page is complete and ready: auth guard, storage listing, upload, preview, star persistence
- Pre-condition for build passing: plan 19-03 (Cereri Supervizare) must complete its missing sub-components
- No blockers for this plan specifically

---
*Phase: 19-admin-pages-from-figma-monitorizare-utilizatori-cereri-documente-financiar-calendar*
*Completed: 2026-03-08*
