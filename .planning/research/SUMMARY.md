# Project Research Summary

**Project:** primariaTa.work -- Romanian e-government digitization SaaS
**Domain:** Multi-tenant public administration platform (white-label SaaS for 3,000+ Romanian municipalities)
**Researched:** 2026-03-02
**Confidence:** HIGH

## Executive Summary

primariaTa.work is a multi-tenant SaaS platform for digitizing Romanian local government (primarie) operations. The existing codebase has a solid citizen-facing foundation -- authentication, cereri submission wizard, payments mock, real-time notifications -- built on Next.js 15, React 19, Supabase, and Tailwind/shadcn. However, the platform has a critical architectural gap: it was designed for single-primarie-per-user but must support users registered across multiple primarii. The current RLS policies filter on JWT user metadata (set at registration), which does not change when a user switches primarie context. This is the root cause of the flagged data isolation bug and must be resolved before any other work ships.

The recommended approach is to introduce a `user_primarii` junction table with a `db_pre_request` function that sets primarie context per-request from URL-derived HTTP headers, rather than from static JWT metadata. This architectural change is the foundation that unlocks registration approval workflows, per-primarie roles, context switching, and correct data isolation. Beyond the architecture fix, the biggest functional gap is staff-facing workflows: the Functionar, Primar, and Admin dashboards are stubs with placeholder content. Without staff dashboards, citizens submit cereri that nobody can process -- the pipeline stalls entirely. Five targeted stack additions (react-map-gl for maps, @logtail/next for monitoring, @pdf-lib/fontkit for Romanian-diacritic PDFs, pgTAP for RLS testing, and PostgreSQL enums/triggers for approval workflows) address specific feature gaps without disrupting the existing stack.

Key risks are: (1) multi-tenant data leakage if RLS migration is done incorrectly, (2) unverified payment webhooks enabling fraud (HMAC verification returns hardcoded `false`), (3) 488 console.log statements potentially leaking PII in production, and (4) GDPR non-compliance when real citizen data enters the system. All four are addressable with known patterns, but the RLS migration is the highest-stakes item -- it touches every table and every query. It must be built first, tested exhaustively with pgTAP, and verified before any feature work begins.

## Key Findings

### Recommended Stack

The existing stack (Next.js 15.5.9, React 19, Supabase, Tailwind 4, shadcn/ui, Zustand 5, React Query 5) is solid and requires no replacement. Five additions are needed for specific feature gaps:

**Core additions:**
- **react-map-gl 8.1.0 + mapbox-gl 3.19.0**: Replace Spline 3D iframe with interactive vector map -- scales to 3,000+ localitati, GPU-accelerated, 50K free map loads/month. MapLibre is a one-line fallback if pricing concerns arise.
- **@logtail/next 0.3.1**: Replace Sentry with Better Stack -- simpler setup, native Vercel integration, structured logging + Web Vitals. Risk: not officially documented for Next.js 15 (validated for 14).
- **@pdf-lib/fontkit 1.1.1**: Enable Romanian diacritics in PDF receipts -- required companion to already-installed pdf-lib 1.17.1. Noto Sans font covers all Romanian characters including comma-below variants.
- **pgTAP + basejump-supabase_test_helpers 0.0.6**: Database-level RLS testing -- SQL-native tests run via `supabase test db`, verify data isolation at the enforcement layer.
- **PostgreSQL enum + triggers**: Admin approval workflow state machine -- type-safe status transitions enforced at database level with automatic notifications.

**Packages to remove** (saves ~600KB): three, @react-three/fiber, @react-three/drei, maath, postprocessing, @sentry/nextjs.

### Expected Features

**Must have (table stakes -- blocking production):**
- Fix broken routes: /documente (404), /cereri/new (500), /admin/settings (404)
- Data isolation verification and RLS audit (CRITICAL -- security)
- Document page with user document listing, download, preview
- Payment receipts as PDF chitante (Romanian law requires them)
- Functionar dashboard with cereri queue and status change actions
- Admin dashboard with real user counts, staff management, cereri overview
- Cereri processing workflow (status transitions, internal notes, document requests)
- Search fix (plati endpoint 404, unified results)
- Dynamic map replacing Spline 3D
- Status enum localization (Romanian display strings)

**Should have (differentiators for v1.x):**
- Primarie registration approval flow (free signup -> admin approval -> access)
- Primar dashboard with approval queue and financial overview
- Staff notifications (internal, triggered on cerere lifecycle events)
- Deadline/SLA tracking with overdue indicators
- Context switch modal (inline primarie switching without re-login)
- Cross-primarie notification aggregation

**Defer (v2+):**
- Real Ghiseul.ro payment integration (awaiting API credentials)
- Real CertSign digital signatures (awaiting credentials)
- Participatory budgeting, appointment scheduling, complaint system
- Multi-language support, self-service form builder
- Native mobile app (mobile-responsive PWA suffices)

### Architecture Approach

The architecture pivots on replacing the single-primarie-per-user model with a junction table (`user_primarii`) that enables many-to-many user-primarie relationships with per-registration roles and approval status. The active primarie context is derived per-request from URL route parameters (`/app/[judet]/[localitate]/...`), resolved to a `primarie_id` in middleware, injected as an `x-primarie-id` HTTP header, and consumed by a `db_pre_request` PostgreSQL function that sets session variables for RLS evaluation. This is stateless (no JWT manipulation), deep-linkable, SSR-compatible, and eliminates cross-device session corruption.

**Major components:**
1. **user_primarii junction table** -- Links users to primarii with role, approval status, and permissions. Replaces `utilizatori.primarie_id` single-association model.
2. **db_pre_request (set_primarie_context)** -- PostgreSQL function that runs before every PostgREST query, extracts primarie context from request headers, validates user approval, and sets session variables for RLS.
3. **Middleware primarie resolver** -- Next.js middleware that extracts URL slugs, resolves to `primarie_id` via cached lookup, and injects `x-primarie-id` header.
4. **Updated RLS policies** -- All primarie-scoped tables use `current_user_primarie()` (reads session variable) instead of JWT metadata. Notifications remain user-scoped (not primarie-scoped) for cross-primarie aggregation.
5. **Zustand primarie store** -- Client-side state synced with URL params, providing reactive context to components.

### Critical Pitfalls

1. **Multi-tenant data leakage** -- RLS policies filter on JWT metadata that does not change when user switches primarie. Fix: migrate to per-request context via `db_pre_request` + `x-primarie-id` header. Test exhaustively with pgTAP before shipping.
2. **Unverified payment webhooks** -- `verifyWebhookSignature()` returns hardcoded `false`. Fix: implement HMAC-SHA256 with `crypto.timingSafeEqual()`, add timestamp validation, never parse JSON before verifying signature.
3. **488 console.log statements** -- Risk of PII leakage in Vercel logs and browser DevTools. Fix: migrate to Better Stack structured logging, add `compiler.removeConsole` in next.config.ts, add ESLint `no-console` rule.
4. **Database functions missing search_path** -- 22 functions (including `handle_new_user`, `current_user_role`) vulnerable to search path injection, amplified by `SECURITY DEFINER`. Fix: single migration adding `SET search_path TO 'public'` to all functions.
5. **GDPR non-compliance** -- No privacy policy, no cookie consent, no DSAR functionality. Romanian ANSPDCP has issued EUR 25,000+ fines. Fix: privacy policy page, cookie consent, data export/deletion, audit log PII review.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Security and Data Isolation
**Rationale:** Everything depends on correct data isolation. The architecture change (junction table + per-request context) is a prerequisite for registration approval, per-primarie roles, staff dashboards, and cross-primarie features. Security pitfalls (webhooks, search path, console.log) are low-effort, high-impact fixes that must ship before production.
**Delivers:** Verified multi-tenant data isolation, secure webhook handling, clean logging, hardened database functions.
**Addresses:** Data isolation verification (P0), webhook HMAC verification, console.log cleanup, database function search_path fix, leaked password protection, CSRF consistency.
**Avoids:** Pitfalls 1 (data leakage), 2 (webhook fraud), 4 (PII leakage), 6 (search path injection).
**Stack:** pgTAP + basejump test helpers for RLS verification.
**Architecture:** user_primarii junction table, db_pre_request function, updated RLS policies, data migration from utilizatori.primarie_id.

### Phase 2: Core Infrastructure and Bug Fixes
**Rationale:** Before building new features, fix the broken existing surface. Broken routes, monitoring migration, and middleware integration are infrastructure work that unblocks feature development.
**Delivers:** All routes functional, monitoring operational, middleware primarie context injection, Zustand primarie store, server client header passing.
**Addresses:** Fix broken routes (P0), Better Stack migration (replaces Sentry), middleware + client integration for primarie context.
**Uses:** @logtail/next for monitoring replacement, middleware primarie resolver from architecture research.
**Avoids:** Shipping features on broken infrastructure.

### Phase 3: Staff Workflows and Dashboards
**Rationale:** The largest functional gap. Without staff dashboards, the platform has no operational capacity -- citizens submit cereri that nobody can process. This is the "work gets done" phase. Groups naturally together because all staff features share the cereri processing workflow as a dependency.
**Delivers:** Functional Functionar dashboard (cereri queue, status transitions, document review), Admin dashboard (user management, registration approval, cereri overview), cereri processing workflow, staff notifications, registration approval flow.
**Addresses:** Functionar dashboard (P1), Admin dashboard (P1), cereri processing workflow (P1), primarie registration approval (P2), staff notifications (P2), admin settings page.
**Stack:** PostgreSQL enum + triggers for approval workflow state machine.
**Avoids:** Pitfall 5 (stub dashboards deployed as "complete").

### Phase 4: Citizen-Facing Features
**Rationale:** With staff workflows operational, citizen-facing gaps can be closed. These features complete the end-to-end flow: citizens submit cereri, upload documents, pay fees, receive receipts, and track status.
**Delivers:** Document page, payment receipt PDFs, dynamic map, search across modules, status enum localization.
**Addresses:** Document page (P1), payment receipts (P1), dynamic map (P1), search fix (P1), status localization (P1).
**Uses:** pdf-lib + @pdf-lib/fontkit for receipts, react-map-gl + mapbox-gl for map.

### Phase 5: Advanced Features and Polish
**Rationale:** Differentiator features that set primariaTa.work apart from competitors. Only build after core is solid. Includes the Primar dashboard, cross-primarie features, deadline tracking, and UX refinements.
**Delivers:** Primar dashboard with approval queue and financial reporting, cross-primarie notification aggregation, context switch modal, deadline/SLA tracking, document reuse, PDF cerere confirmations.
**Addresses:** Primar dashboard (P2), cross-primarie notifications (P2), context switch modal (P2), deadline/SLA tracking (P2), document reuse (P2), financial reporting (P2).

### Phase 6: Compliance and Accessibility
**Rationale:** Must be complete before real citizen data enters the system. GDPR compliance, accessibility audit, and test coverage are non-negotiable for a public sector application.
**Delivers:** Privacy policy page, cookie consent, DSAR implementation, WCAG 2.1 AA compliance, test coverage above 40% for critical paths.
**Addresses:** GDPR compliance, accessibility audit, test coverage improvement.
**Avoids:** Pitfall 3 (GDPR non-compliance).

### Phase Ordering Rationale

- **Phase 1 before everything:** Every feature depends on correct data isolation. Shipping features on broken RLS = data leaks. The junction table migration is the single most impactful change.
- **Phase 2 before features:** Bug fixes and infrastructure must precede feature development. Building on broken routes wastes effort.
- **Phase 3 before Phase 4:** Staff workflows unblock the entire pipeline. Without cereri processing, citizen features are dead ends. The cereri workflow is the spine of the application.
- **Phase 4 groups citizen features:** Document page, PDF receipts, map, and search are independent of each other but all depend on the infrastructure from Phases 1-2.
- **Phase 5 after core:** Differentiator features need the core to be solid. Cross-primarie notifications require verified data isolation (Phase 1) and working per-primarie notifications (Phase 3).
- **Phase 6 can partially overlap:** Privacy policy and cookie consent can ship early (Phase 2 or 3). Full DSAR and accessibility require the UI to be mostly complete.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** RLS migration is high-stakes. The pgTAP test patterns are well-documented, but the specific migration from `utilizatori.primarie_id` to `user_primarii` needs careful planning to avoid breaking existing sessions. Research the `db_pre_request` approach with Supabase's connection pooling behavior.
- **Phase 3:** Cereri processing workflow state machine design (valid transitions, role permissions per transition, audit trail schema). Research Romanian legal requirements for cerere processing deadlines and mandatory steps.
- **Phase 5:** Cross-primarie notification aggregation with Supabase Realtime has a known constraint (WebSocket cannot pass custom headers). Research the polling-vs-Realtime tradeoff for primarie-scoped data.

Phases with standard patterns (skip research-phase):
- **Phase 2:** Monitoring migration (@logtail/next) and route fixes are straightforward. Better Stack setup is well-documented.
- **Phase 4:** PDF generation (pdf-lib), map integration (react-map-gl), and search are all well-documented with high-confidence patterns from Context7.
- **Phase 6:** GDPR compliance patterns for Romanian public sector are documented in EU and Romanian legal frameworks. WCAG 2.1 AA has mature tooling (axe-core).

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified via npm/Context7. Only risk: @logtail/next not officially documented for Next.js 15 (targets 14). MapLibre fallback mitigates Mapbox pricing risk. |
| Features | HIGH | Based on EU eGovernment Benchmark 2025, Romanian competitor analysis (Regista, Avansis, CityManager, Devson), and direct codebase audit. Feature gaps are clearly identified. |
| Architecture | HIGH | Junction table + db_pre_request pattern verified via Supabase official docs and community discussions. Existing codebase analysis confirms migration path. Realtime limitation (no custom headers on WebSocket) is a known constraint with documented workarounds. |
| Pitfalls | HIGH | Based on direct codebase audit (488 console.logs counted, 22 functions without search_path confirmed), GDPR enforcement data from ANSPDCP, and webhook security best practices. All pitfalls have clear prevention strategies. |

**Overall confidence:** HIGH

### Gaps to Address

- **@logtail/next + Next.js 15 compatibility:** Not officially documented. Run both Sentry and Better Stack in parallel for 1-2 weeks during migration. If incompatible, keep Sentry.
- **db_pre_request performance under connection pooling:** The `set_primarie_context()` function runs on every request. Verify sub-millisecond execution with proper indexes on `user_primarii`. Monitor with `pg_stat_statements` after deployment.
- **Supabase Realtime + primarie-scoped data:** WebSocket subscriptions cannot use custom headers. For cereri/plati updates on staff dashboards, evaluate whether Realtime channel filters (`primarie_id=eq.<id>`) or React Query polling (refetchInterval) is more appropriate.
- **Romanian diacritic rendering in PDFs:** Noto Sans is recommended but must be tested for comma-below variants (s-comma vs s-cedilla). Incorrect rendering is a common issue with Romanian text.
- **Existing data migration:** Moving `utilizatori.primarie_id` to `user_primarii` for existing users requires careful transaction management. Existing users must be pre-approved. The `utilizatori.primarie_id` column should be retained temporarily for backward compatibility.
- **CertSign and Ghiseul.ro real integration:** Both are mocked. The interface contracts should be defined now (TypeScript interfaces) so the mock implements the exact same API surface as the real integration. This prevents surprises when credentials arrive.

## Sources

### Primary (HIGH confidence)
- Context7 `/visgl/react-map-gl` -- SSR patterns, GeoJSON, dynamic imports
- Context7 `/websites/pdf-lib_js` -- Font embedding, PDF creation, Romanian diacritics
- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) -- RLS policies, performance
- [Supabase Testing Overview](https://supabase.com/docs/guides/local-development/testing/overview) -- pgTAP setup
- [Supabase Custom Claims & RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) -- Role patterns
- [Supabase Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod) -- Security hardening
- [EU eGovernment Benchmark 2025](https://digital-strategy.ec.europa.eu/en/library/digital-decade-2025-egovernment-benchmark-2025) -- Feature expectations
- [Romania ANSPDCP Enforcement](https://www.dataprotection.ro/index.jsp?page=allnews&lang=en) -- GDPR enforcement data
- Codebase audit: `.planning/codebase/CONCERNS.md`, `DATABASE.md`, `TESTING.md` -- Direct analysis

### Secondary (MEDIUM confidence)
- [Supabase Multi-Tenant Discussion #1615](https://github.com/orgs/supabase/discussions/1615) -- Junction table + header approach validation
- [Supabase Session State Discussion #6301](https://github.com/orgs/supabase/discussions/6301) -- Confirms header-based context
- [Better Stack Next.js docs](https://betterstack.com/docs/logs/javascript/nextjs/) -- Setup guide (targets Next.js 14)
- [Webhook Security Best Practices 2025-2026](https://dev.to/digital_trubador/webhook-security-best-practices-for-production-2025-2026-384n) -- HMAC patterns
- Romanian competitor platforms: Regista.ro, Primaria-Digitala (Avansis), CityManager, Devson -- Feature benchmarking

### Tertiary (LOW confidence)
- @logtail/next Next.js 15 compatibility -- Inferred from API surface similarity, not officially documented. Needs validation.

---
*Research completed: 2026-03-02*
*Ready for roadmap: yes*
