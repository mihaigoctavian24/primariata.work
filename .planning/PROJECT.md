# primariaTa.work

## What This Is

A white-label multi-tenant SaaS platform for digitizing Romanian local government (primărie) administration. Citizens submit requests (cereri), make payments (plăți), receive notifications, and access documents — all online, scoped per primărie. Staff (funcționari) and mayors (primari) manage workflows from role-based dashboards. The platform supports 3,000+ localități across all 41 județe.

## Core Value

Citizens can submit cereri and complete plăți digitally for any primărie where they're registered, with complete data isolation between primării and proper role-based access for all user types.

## Requirements

### Validated

<!-- Shipped and confirmed working (from E2E snapshot 2026-03-02) -->

- ✓ Landing page with location selection (județ + localitate wheel picker) — existing
- ✓ Authentication: email/password login + Google OAuth — existing
- ✓ Registration with location binding — existing
- ✓ Password reset flow (email link) — existing
- ✓ Staff invitation system (admin invites funcționar/primar) — existing
- ✓ Middleware session management + route protection — existing
- ✓ Cereri list with pagination, filtering, status badges — existing
- ✓ Cereri wizard (multi-step form with validation) — existing
- ✓ Cereri detail view with timeline and status tracking — existing
- ✓ Plăți list with mock Ghișeul checkout flow — existing
- ✓ Notificări with Supabase Realtime subscriptions — existing
- ✓ User profile page — existing
- ✓ Settings page — existing
- ✓ Cetățean dashboard with stats, charts, quick actions — existing
- ✓ Admin survey research dashboard with AI analysis (OpenAI GPT-4o-mini) — existing
- ✓ Super admin panel (global admin, primării management) — existing
- ✓ Mobile responsive design — existing
- ✓ Security hardening: RLS, Zod validation, DOMPurify sanitization, CSRF, CSP headers — existing
- ✓ Email notifications via SendGrid (Edge Function) — existing
- ✓ SMS notifications via Twilio (with rate limiting) — existing
- ✓ Weather widget per localitate — existing
- ✓ Dark mode support — existing

### Active

<!-- Current scope — production-ready milestone -->

- [ ] Fix and verify multi-tenant data isolation per primărie (BUG — critical)
- [ ] Implement primărie registration approval flow (free sign-up → admin approval → access)
- [ ] Cross-primărie notification system with context switch popup
- [ ] Fix broken /cereri/new route (currently 0/10)
- [ ] Implement /documente page (cereri documents + public forms library)
- [ ] Fix /admin panel 404
- [ ] Fix /admin/settings 404
- [ ] Implement Funcționar dashboard (currently stub)
- [ ] Implement Primar dashboard (currently stub)
- [ ] Implement Admin (primărie-level) dashboard (currently stub)
- [ ] Replace Spline 3D map with dynamic Mapbox/Leaflet map per localitate
- [ ] Implement PDF receipt generation (chitanțe) — currently placeholder
- [ ] Implement document validation on cereri submit — currently stubbed
- [ ] Implement staff notification system (internal notifications for funcționari)
- [ ] Fix dashboard search functionality (plati search returns 404)
- [ ] Production-ready payment gateway architecture (mock-ready for real Ghișeul swap)
- [ ] Webhook signature verification (HMAC) for payment callbacks
- [ ] Replace Sentry with Better Stack monitoring (logs + uptime + error tracking)
- [ ] Type safety cleanup: replace `any` with `unknown`, proper type guards
- [ ] Error handling improvement: structured errors, type narrowing in catch blocks
- [ ] Console logging cleanup for production (remove 488+ console.log instances)
- [ ] Full test coverage: unit tests for critical paths + E2E for user flows
- [ ] Production-ready CertSign integration architecture (mock-ready for real swap)
- [ ] React Query prefetch implementation (currently placeholder queryFn)
- [ ] Pending payment count in dashboard (currently hardcoded 0)
- [ ] Fix gamification points inconsistency (50 pts desktop vs 25 pts mobile)

### Out of Scope

<!-- Explicit boundaries -->

- Real Ghișeul.ro API credentials — build integration layer, swap when credentials arrive
- Real CertSign API credentials — same approach as Ghișeul
- Real-time chat between citizens and funcționari — high complexity, not core
- Video document uploads — storage/bandwidth costs
- Native mobile app — web-first, responsive handles mobile
- Multi-language support — Romanian only for v1
- Redis/Memcached caching layer — React Query sufficient for now
- Background job queue (Bull/BullMQ) — not needed at current scale

## Context

**Academic context:** University project for URA - Programarea Aplicațiilor Web (2025-2026). Team: Octavian Mihai (Full-Stack) & Bianca-Maria Abbasi Pazeyazd (Frontend/UI/UX).

**Current state (2026-03-02):** Application is ~70% functional (7/10 from E2E audit). Core flows work (auth, cereri, plăți mock, notifications). Major gaps: broken routes, stub admin dashboards, missing document features, incomplete monitoring.

**Critical bug identified:** Data isolation per primărie may not be enforced correctly. A user active in multiple primării should only see data for the currently selected primărie. RLS policies filter on `judet_id + localitate_id` from user metadata but this needs verification and potential fix.

**Multi-primărie model:**

- A user can register on multiple active primării
- Each primărie registration requires admin (primărie-level) approval
- While awaiting approval, user sees status screen (pending/approved/rejected with reason)
- All modules (cereri, plăți, documente, dashboard) show data ONLY for selected primărie
- Exception: Notificări are cross-primărie
- Switching primărie from notification: confirm popup → context switch (no re-login) → redirect to source module

**Existing codebase map:** `.planning/codebase/` contains 10 analysis documents (ARCHITECTURE, CONCERNS, CONVENTIONS, DATABASE, E2E_SNAPSHOT, INTEGRATIONS, ISSUES_HISTORY, STACK, STRUCTURE, TESTING) with 24 E2E screenshots.

**Monitoring migration:** Replacing Sentry (`@sentry/nextjs`) with Better Stack (`@logtail/next`). Better Stack source token already configured in `.env.local`. Sentry config files to be removed.

## Constraints

- **Tech stack**: Next.js 15 + React 19 + Supabase + TypeScript 5 strict — no changes
- **Hosting**: Vercel (Frankfurt) + Cloudflare CDN — no changes
- **Package manager**: pnpm — no changes
- **Database**: Supabase PostgreSQL 15 with RLS — no changes
- **Auth**: Supabase Auth (JWT) with Google OAuth — no changes
- **External APIs**: Ghișeul.ro (payments), CertSign (signatures), SendGrid (email), Twilio (SMS), OpenAI (AI analysis), WeatherAPI — mock-ready architecture for those without credentials
- **Accessibility**: WCAG 2.1 AA compliance target
- **Language**: Romanian UI throughout

## Key Decisions

| Decision                                         | Rationale                                                                                          | Outcome   |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------- | --------- |
| Better Stack over Sentry                         | Single tool for logs + uptime + errors; simpler than Sentry; native Vercel integration             | — Pending |
| Dynamic map (Mapbox/Leaflet) over Spline 3D      | Spline requires per-localitate 3D scenes (3,000+); dynamic map auto-works for all                  | — Pending |
| Free sign-up + admin approval                    | Prevents abuse while keeping registration accessible; admin primărie approves, not super admin     | — Pending |
| Context switch (no re-login) for primărie switch | Better UX; user stays authenticated, only primărie context changes                                 | — Pending |
| Cross-primărie notifications only                | All other modules strictly scoped per primărie; notifications aggregate across all user's primării | — Pending |
| Mock-ready architecture for Ghișeul/CertSign     | Build real integration layer but use mocks until credentials available; feature flags control mode | — Pending |

---

_Last updated: 2026-03-02 after initialization_
