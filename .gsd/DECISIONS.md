## Phase 21 Decisions

**Date:** 2026-03-09

### Scope

- Add `loading.tsx` files to all admin routes for instant visual feedback.
- Move blocking Supabase data fetches (cereri, users, etc.) from `page.tsx` into child Server Components wrapped in `<Suspense>` to unblock the initial page load.
- Parallelize data queries where possible using `Promise.all`.

### Approach

- Chose: `<Link prefetch={true}>` combined with React Suspense streaming.
- Reason: Next.js App Router performs server-side auth checks (Supabase `getUser()`) on every navigation because Server Components are stateless. By using `prefetch` on hover and streaming the UI via `loading.tsx`, we get the "instant" feel without rebuilding a complex client-side auth cache. Moving data fetches to granular Suspense boundaries prevents the auth check from holding up the entire page render.

### Constraints

- Supabase `getUser()` requires a roundtrip to verify the session token against the database on every Server Component render. We cannot easily parallelize `getUser()` with subsequent user role queries because we need the `user.id` first.
