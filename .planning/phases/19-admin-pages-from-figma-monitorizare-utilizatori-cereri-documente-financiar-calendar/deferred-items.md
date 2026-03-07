# Phase 19 — Deferred Items

## /_not-found prerender failure

**Found during:** Plan 19-05 Task 2 verification
**Type:** Pre-existing build issue (was failing before 19-05)
**Root cause:** `NotFoundShowcase.tsx` imports `framer-motion` while the rest of the app uses `motion/react` — Next.js 15 webpack chunking conflict during static page generation for `/_not-found`.
**Impact:** Production build fails. Dev server (`pnpm dev`) works normally.
**Fix:** Replace `framer-motion` import with `motion/react` in `NotFoundShowcase.tsx`.
**Scope:** Out of scope for Plan 19-05 (pre-existing, unrelated to financiar page).

## calendar-events-store.ts type errors

**Found during:** Plan 19-05 Task 2 type-check
**Type:** Pre-existing TS type errors in plan 19-06 (calendar store)
**Root cause:** Zustand `set()` type inference for `string | undefined` vs `string` in seed events.
**Scope:** Out of scope for 19-05 (calendar is 19-06).
