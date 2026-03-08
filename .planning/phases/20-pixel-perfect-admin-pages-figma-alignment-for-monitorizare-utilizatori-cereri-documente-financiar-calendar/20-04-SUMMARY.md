---
phase: 20-pixel-perfect-admin-pages-figma-alignment-for-monitorizare-utilizatori-cereri-documente-financiar-calendar
plan: "04"
subsystem: ui
tags: [supabase-storage, framer-motion, drag-and-drop, file-management, admin]

# Dependency graph
requires:
  - phase: 20-03
    provides: Financiar admin page pattern — client coordinator + server auth-only page
provides:
  - Documente admin page with Figma-accurate file management UI
  - Folder navigation with breadcrumb
  - Grid/list toggle file display with star/download/delete actions
  - Drag-and-drop upload zone (supabase.storage "documents" bucket)
  - File preview modal with signed URL (3600s expiry)
  - Storage usage bar (100 MB quota)
  - Animated skeleton for page loading state
affects:
  - phase 20-05 (Calendar — may reference same patterns)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Client-side Storage fetch in useEffect (not server-side pre-fetch in page.tsx)
    - DocumentUploadZone as transparent wrapper (no visual chrome) around DocumentGrid
    - StorageFile cast via "as unknown as StorageFile[]" to bridge supabase FileObject type mismatch
    - File type detection by extension (not mimetype) for Supabase Storage filenames
    - Tailwind CSS token classes for icon colors (not inline hex) — Phase 20 standard

key-files:
  created:
    - src/components/admin/documente/documente-skeleton.tsx
    - src/components/admin/documente/document-upload-zone.tsx
    - src/components/admin/documente/document-preview-modal.tsx
    - src/components/admin/documente/document-grid.tsx
    - src/components/admin/documente/documente-content.tsx
  modified:
    - src/app/app/[judet]/[localitate]/admin/documente/page.tsx

key-decisions:
  - "Supabase storage.list() returns FileObject[] (metadata: Record<string,any>); cast via as unknown as StorageFile[] to preserve local interface"
  - "DocumentUploadZone is a transparent wrapper div (no own visual) — ring-2 ring-violet-400/50 on dragover is the only visual signal"
  - "File type detection uses extension (not mimetype) because Storage.list() may not populate mimetype until after download"
  - "Storage bucket name is 'documents' (not 'cereri-documente' used in Phase 19 — matches plan spec)"
  - "page.tsx simplified to auth-only Server Component; all Storage ops client-side in DocumenteContent"

patterns-established:
  - "Client-only Storage page: Server Component does auth + primarieId extraction only; Client Component handles all Storage list/upload/delete"
  - "Folder detection: StorageFile with metadata === null and no dot in name treated as folder (Supabase virtual prefix behavior)"
  - "useRef for file input passed down to upload zone so parent button can trigger click without exposing zone internals"

requirements-completed: [DOC-01, DOC-02, DOC-03, DOC-04, DOC-05, DOC-06]

# Metrics
duration: 8min
completed: 2026-03-08
---

# Phase 20 Plan 04: Documente Admin Page Summary

**Pixel-perfect Figma rewrite of Documente admin page: folder navigation, grid/list toggle, client-side Supabase Storage upload/list/delete, signed URL preview modal, and 100 MB storage bar**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-08T10:41:40Z
- **Completed:** 2026-03-08T10:49:02Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Fully rewrote all 5 Phase 19 documente components to match Figma spec and plan requirements
- DocumenteContent now fetches files client-side via useEffect (not server-side), enabling real-time refresh after upload
- DocumentUploadZone is a transparent drag-drop wrapper — ring highlight on dragover, hidden file input for click-to-upload
- DocumentGrid renders FOLDERE + FISIERE sections with hover-reveal star/download/delete actions, both grid and list layouts
- DocumentPreviewModal generates signed URL on open; supports image inline, PDF iframe, download for other types
- page.tsx simplified to auth-only Server Component — no Storage prefetch, cleaner pattern aligned with other Phase 20 pages

## Task Commits

Each task was committed atomically:

1. **Task 1 + Task 2: Full documente rewrite** - `9f72780` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/components/admin/documente/documente-skeleton.tsx` - Animated pulse skeleton with header/storage-bar/toolbar/folder+file sections
- `src/components/admin/documente/document-upload-zone.tsx` - Transparent drag-drop wrapper; uploads FileList to "documents" bucket
- `src/components/admin/documente/document-preview-modal.tsx` - Signed URL preview modal with image/PDF/download fallback
- `src/components/admin/documente/document-grid.tsx` - FOLDERE + FISIERE sections; grid/list toggle; Tailwind CSS token classes for icons
- `src/components/admin/documente/documente-content.tsx` - Client coordinator: useEffect Storage fetch, folder nav, search, delete
- `src/app/app/[judet]/[localitate]/admin/documente/page.tsx` - Simplified auth-only Server Component

## Decisions Made

- **Storage bucket**: "documents" (not "cereri-documente" from Phase 19) — matches plan spec
- **Type cast**: Supabase `storage.list()` returns `FileObject[]` with `metadata: Record<string,any>`; cast via `as unknown as StorageFile[]` to bridge with local strongly-typed interface
- **Upload zone as wrapper**: No visual chrome on the upload zone itself — parent passes `fileInputRef` so "Incarca" button in header triggers the file input without coupling
- **File type by extension**: Extension-based detection (not mimetype) because Storage.list() doesn't populate mimetype reliably before file download
- **Folder detection**: Items with `metadata === null` and no dot in name treated as virtual folders (Supabase Storage behavior)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript type mismatch: FileObject vs StorageFile**
- **Found during:** Task 2 (build verification)
- **Issue:** `supabase.storage.list()` returns `FileObject[]` where `metadata: Record<string,any>`, incompatible with local `StorageFile.metadata` shape
- **Fix:** Cast result via `as unknown as StorageFile[]` (same pattern as Phase 19 page.tsx used)
- **Files modified:** `src/components/admin/documente/documente-content.tsx`
- **Verification:** `pnpm build` passes with zero TypeScript errors
- **Committed in:** 9f72780 (task commit)

---

**Total deviations:** 1 auto-fixed (type mismatch)
**Impact on plan:** Necessary type bridge for Supabase Storage SDK incompatibility. No scope creep.

## Issues Encountered

- Build failed on first attempt because `page.tsx` referenced the deleted Phase 19 `documente-content.tsx` — resolved by completing Task 2 first before running build verification

## User Setup Required

None — Supabase Storage "documents" bucket must exist in the Supabase project (out of scope for this plan; storage bucket setup is a DB/infra concern).

## Next Phase Readiness

- Documente page complete — ready for Phase 20-05 (Calendar)
- All Figma-aligned admin pages complete: Monitorizare, Utilizatori, Cereri, Documente, Financiar

---
*Phase: 20-pixel-perfect-admin-pages-figma-alignment*
*Completed: 2026-03-08*
