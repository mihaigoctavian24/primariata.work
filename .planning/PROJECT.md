# primariaTa.work

## What This Is

A white-label multi-tenant SaaS platform for digitizing Romanian local government (primărie) administration. Citizens submit requests (cereri), make payments (plăți), receive notifications, and access documents — all online, scoped per primărie with complete data isolation. Staff (funcționari) process cereri through a lifecycle engine with SLA tracking. Mayors (primari) approve high-level requests from role-based dashboards. The platform supports 3,000+ localități across all 41 județe, with GDPR-compliant data handling and cross-primărie notification aggregation.

## Core Value

Citizens can submit cereri and complete plăți digitally for any primărie where they're registered, with complete data isolation between primării and proper role-based access for all user types.

## Requirements

### Validated

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
- ✓ Multi-tenant data isolation via junction table + per-request RLS — v1.0
- ✓ Primărie registration approval flow (free sign-up → admin approval → access) — v1.0
- ✓ Cross-primărie notification system with context switch popup — v1.0
- ✓ /cereri/new redirects to /cereri/wizard — v1.0
- ✓ /documente page (cereri documents + public forms library) — v1.0
- ✓ /admin panel and /admin/settings routes — v1.0
- ✓ Funcționar dashboard with cereri queue and SLA filtering — v1.0
- ✓ Primar dashboard with approval queue and financial overview — v1.0
- ✓ Admin (primărie-level) dashboard with user counts and activity feed — v1.0
- ✓ Interactive Leaflet map per localitate (dark/light theme) — v1.0
- ✓ PDF receipt generation (chitanțe) with Romanian diacritics — v1.0
- ✓ Document validation on cereri submit — v1.0
- ✓ Staff notification system (new cereri + status changes) — v1.0
- ✓ Dashboard search across cereri and plăți — v1.0
- ✓ Payment gateway architecture (mock-ready for Ghișeul swap) — v1.0
- ✓ Webhook HMAC signature verification — v1.0
- ✓ Better Stack monitoring (structured logs + Web Vitals) — v1.0
- ✓ Console logging cleanup (zero console.log in production) — v1.0
- ✓ Cereri lifecycle engine with role-based status transitions — v1.0
- ✓ Audit trail (cerere_istoric) with actor, timestamp, reason — v1.0
- ✓ SLA tracking with visual indicators (green/yellow/red/paused) — v1.0
- ✓ Cookie consent banner with accept/reject — v1.0
- ✓ GDPR data export and account deletion — v1.0
- ✓ Privacy policy and terms pages — v1.0
- ✓ pgTAP RLS isolation tests — v1.0
- ✓ E2E tests: auth, cereri, payment, admin workflows — v1.0
- ✓ Unit tests: auth functions + validation schemas — v1.0
- ✓ E2E seed data infrastructure — v1.0
- ✓ Pending payment count in dashboard (real count) — v1.0

### Active

(Empty — define in next milestone via `/gsd:new-milestone`)

### Out of Scope

- Real Ghișeul.ro API credentials — mock architecture ready, swap when credentials arrive
- Real CertSign API credentials — same approach as Ghișeul
- Real-time chat between citizens and funcționari — high complexity, async cerere notes sufficient
- Video document uploads — storage/bandwidth costs
- Native mobile app — web-first, responsive handles mobile
- Multi-language support — Romanian only for v1
- Redis/Memcached caching layer — React Query sufficient for now
- Background job queue (Bull/BullMQ) — not needed at current scale
- Offline mode — real-time data isolation is core value

## Context

**Academic context:** University project for URA - Programarea Aplicațiilor Web (2025-2026). Team: Octavian Mihai (Full-Stack) & Bianca-Maria Abbasi Pazeyazd (Frontend/UI/UX).

**Current state (2026-03-05):** v1.0 MVP shipped. 90,580 LOC TypeScript across 359 files. 11 phases, 36 plans, 124 commits over 3 days. All 67 requirements satisfied. 6/6 E2E flows complete. Tech debt tracked in milestone audit (~50 items, none blocking).

**Tech stack:** Next.js 15.5.9, React 19, TypeScript 5 strict, Supabase (PostgreSQL 15 + Auth + Storage + Realtime), Tailwind CSS 4, shadcn/ui, Zustand 5, React Query 5, React Hook Form 7 + Zod 4, Framer Motion 12, Better Stack logging, Vercel (Frankfurt), Cloudflare CDN.

**Architecture:**
- Multi-tenant via `user_primarii` junction table + `set_request_context()` per-request RLS
- x-primarie-id header set by middleware, inherited by Server Actions
- Role-based access: cetatean, functionar, admin, primar, super_admin
- Cereri lifecycle: depusa → in_verificare → in_procesare → in_aprobare (primar) → aprobata/respinsa/anulata/finalizata
- Cross-primarie notifications only; all other modules strictly per-primarie scoped

**Known tech debt:** See `.planning/milestones/v1.0-MILESTONE-AUDIT.md` for full inventory.

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

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Better Stack over Sentry | Single tool for logs + uptime + errors; simpler than Sentry; native Vercel integration | ✓ Good |
| Dynamic map (Leaflet) over Spline 3D | Spline requires per-localitate 3D scenes (3,000+); Leaflet auto-works for all with dark/light themes | ✓ Good |
| Free sign-up + admin approval | Prevents abuse while keeping registration accessible; admin primărie approves, not super admin | ✓ Good |
| Context switch (no re-login) for primărie switch | Better UX; user stays authenticated, only primărie context changes via URL + cookie | ✓ Good |
| Cross-primărie notifications only | All other modules strictly scoped per primărie; notifications aggregate across all user's primării | ✓ Good |
| Mock-ready architecture for Ghișeul/CertSign | Build real integration layer but use mocks until credentials available; feature flags control mode | ✓ Good |
| Junction table (user_primarii) over JWT metadata | Per-request context via db_pre_request; supports multi-primarie with different roles per primarie | ✓ Good |
| Server Actions over API routes | x-primarie-id header only available in middleware; Server Actions inherit it, API routes don't | ✓ Good |
| Cerere lifecycle with in_aprobare gate | Primar-level approval step between in_procesare and aprobata; enforced at DB trigger level | ✓ Good |
| Embedded Roboto fonts in jsPDF | Romanian diacritics (ș, ț, ă, â, î) require font embedding; ~300KB per receipt | ✓ Good |
| pgTAP for RLS testing | Database-level isolation tests catch RLS bugs that E2E tests cannot | ✓ Good |

---

*Last updated: 2026-03-05 after v1.0 milestone*
