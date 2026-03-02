# Feature Research

**Domain:** Romanian e-government / primarie digitization platform (multi-tenant SaaS)
**Researched:** 2026-03-02
**Confidence:** HIGH (based on competitor analysis, EU eGovernment Benchmark 2025, and Romanian market platforms)

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or unusable.

#### Citizen-Facing (Cetatean)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Document page (/documente)** | Every Romanian ePortal (Iasi, Craiova, Regista, Primaria.info.ro) has a documents section. Citizens need to see their uploaded docs, download cereri attachments, and access public forms library. Currently 404 -- the most visible broken feature. | MEDIUM | Needs: doc list from cereri, public forms library, download/preview. DB tables exist (documente_cereri). Dashboard "Documente Recente" widget already tries to render this. |
| **Working cereri submission (/cereri/new fix)** | Core value proposition. /cereri/new returns 500 while /cereri/wizard works. Dashboard "Cerere Noua" quick action links to broken route. | LOW | Either fix the API or redirect /cereri/new to /cereri/wizard. Inconsistent entry points confuse users. |
| **Payment receipts (chitante PDF)** | Romanian law requires payment receipts. Ghiseul.ro issues receipts for every transaction. All competitor platforms generate PDF chitante. Currently returns placeholder URL. | MEDIUM | Use pdf-lib (already in deps) to generate receipt PDFs. Store in Supabase Storage. Return signed download URLs. Triggered on payment webhook success. |
| **Request status tracking with notifications** | Every Romanian ePortal provides real-time status updates via email/SMS. Platform already has notifications working, but staff-side notifications for new cereri are stubbed. Citizens expect email when status changes. | MEDIUM | Email notifications via SendGrid exist but aren't triggered on all status changes. SMS via Twilio has rate limiting. Wire up all cerere lifecycle events. |
| **Admin settings page (/admin/settings)** | Admin sidebar links to it, returns 404. Basic expectation: platform configuration, notification preferences, primarie branding. | MEDIUM | Create the route. Include: primarie info editing, notification templates, staff management settings, integration configuration. |
| **Funcionar dashboard (clerk workspace)** | Core workflow tool. Romanian platforms (Regista, CityManager, Devson) all provide clerk dashboards showing assigned cereri queue, processing tools, deadline tracking. Currently a stub with placeholder text. | HIGH | Needs: assigned cereri queue, status change actions (approve/reject/request-info), document review inline, deadline/SLA tracking, department filtering. This is the "work gets done" interface. |
| **Admin dashboard (primarie-level)** | Primarie admins need user management, staff overview, cereri statistics, and configuration. Currently stub with hardcoded zeros. | HIGH | Needs: real user counts from DB, registration approval queue, staff invitation management (exists but not in dashboard), cereri overview by status, basic analytics. |
| **Search across modules** | EU eGovernment Benchmark 2025: 98% of portals have search. Dashboard search currently fails (plati endpoint 404). Regista, Primaria.info.ro all have cross-module search. | MEDIUM | Fix /api/dashboard/search/plati endpoint. Add search to cereri, documente, notificari. Unified search results with type badges. |
| **Location-scoped data isolation** | Multi-tenant core requirement. PROJECT.md flags this as critical bug. User in multiple primarii must only see data for currently selected primarie. RLS policies exist but need verification. | HIGH | Verify RLS policies filter correctly by judet_id + localitate_id. Test with multi-primarie user. Fix metadata propagation on context switch. |
| **Mobile responsive admin views** | EU Benchmark 2025: 96.1% of eGovernment services have mobile responsive interface. Current citizen views are mobile-ready; admin dashboards need verification. | LOW | Existing responsive design patterns should apply. Test admin pages on mobile viewports. |
| **Error handling and feedback** | Users need clear error messages in Romanian, not raw enum values ("in_verificare" instead of "In verificare"). Status badges, error alerts, form validation messages. | LOW | Localization map for all enum values. Structured error responses. Already have Zod validation; need consistent error display. |
| **Dynamic location map** | Current Spline 3D map shows wrong location (Bucharest instead of Alba Iulia). 3D approach doesn't scale to 3,000+ localitati. Every competitor has a real map. | MEDIUM | Replace Spline with Leaflet/Mapbox. Auto-center on selected localitate coordinates. Show primarie location pin. Leaflet is free and lighter. |

#### Staff-Facing (Functionar + Primar)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Cereri processing workflow** | Core admin function. Regista, CityManager, Devson all provide: view cerere details, change status (depusa -> in_verificare -> in_procesare -> finalizata/respinsa), add notes, request additional documents. | HIGH | Needs: status transition API with validation, internal notes/comments on cereri, document request flow (notify citizen to upload), audit trail of who changed what and when. |
| **Staff notifications (internal)** | CONCERNS.md flags this as missing. When citizen submits cerere, assigned functionar needs notification. When primar needs to approve, notification. Currently only citizen-facing notifications exist. | MEDIUM | Extend notificari table with staff-targeted notifications. Add notification triggers on cerere submit, status change, document upload. Wire to email/in-app. |
| **Primar approval queue** | PrimarDashboard stub shows "Cereri care Necesita Aprobare" placeholder. Certain cerere types (autorizatie de constructie) require primar signature/approval. | HIGH | Needs: approval workflow with configurable rules per cerere type, approve/reject with reason, digital signature integration (CertSign mock), delegation during absence. |
| **Financial reporting** | PrimarDashboard stub shows "Situatie Financiara" with hardcoded values. Primari need to see payment collections by period, outstanding debts, revenue by cerere type. | MEDIUM | Query plati table with aggregations. Group by month, cerere type, status. Export to PDF/Excel (export utilities already exist in src/lib/export/). |
| **Staff performance metrics** | PrimarDashboard stub shows placeholder. Average processing time, cereri completed per functionar, SLA compliance rate. | MEDIUM | Calculate from cereri timestamps (created_at, updated_at, status changes). Need audit_log entries for accurate tracking. Display as charts (Recharts already available). |
| **Deadline/SLA tracking** | E2E snapshot shows cerere B-SE-2026-00001 is 1 month overdue with no alert. Romanian law mandates response deadlines (30 days for most cereri). | MEDIUM | Calculate deadline from cerere type config (already has termen_estimat). Show overdue indicators on cereri list and dashboard. Alert staff approaching deadlines. |

#### Platform-Level (Admin + Super Admin)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Primarie registration approval** | PROJECT.md specifies: free sign-up -> admin approval -> access. Prevents abuse. Currently no approval flow exists. | HIGH | Needs: registration_requests table, approval UI in admin dashboard, email notification on approve/reject, pending status screen for citizen while awaiting approval. |
| **User management with role assignment** | Admin dashboard stub has "Gestionare Utilizatori" button linking to /admin/users. Staff invitation system exists. Need complete CRUD for users within primarie scope. | MEDIUM | Extend existing admin/users page. Show users by role, filter by status. Deactivate/reactivate users. Change roles (within allowed hierarchy). View user activity. |
| **Audit logging** | Database has audit_log table. Critical for government accountability. Every action (cerere status change, payment, user role change) must be logged with actor, timestamp, details. | MEDIUM | Table exists. Need to consistently write to it from all mutations. Display in admin dashboard as activity feed. |

### Differentiators (Competitive Advantage)

Features that set primariaTa.work apart from existing Romanian e-government platforms.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **White-label multi-primarie platform** | Most Romanian solutions (Regista, CityManager, Avansis) are per-primarie installations. primariaTa.work serves 3,000+ localitati from one deployment. This is the core architectural advantage. | Already built | RLS-based multi-tenancy, location-scoped routing. Needs verification and hardening but architecture exists. |
| **Cross-primarie notifications** | PROJECT.md specifies: notifications aggregate across all user's primarii. No competitor does this. A citizen registered at multiple primarii sees all notifications in one place with context-switch popup. | HIGH | Needs: cross-primarie notification aggregation, context switch confirmation dialog, redirect to source module after switch. Notificari already work per-primarie; need to query across all user's registrations. |
| **Real-time updates (Supabase Realtime)** | Most Romanian platforms poll or refresh. primariaTa.work has live notification updates via Supabase subscriptions. Status badge counts update instantly. | Already built | Working for notifications. Extend to cereri status changes visible in real-time on functionar dashboard. |
| **AI-powered survey analysis** | OpenAI GPT-4o-mini integration for analyzing citizen survey responses. No Romanian municipal platform has AI analytics. Demographic analysis, cohort comparison, insight generation. | Already built | Admin survey dashboard with AI analysis is fully functional. Differentiator for primarii evaluating the platform. |
| **Progressive citizen experience** | Gamification (levels, points), personalized dashboard, weather widget, calendar integration, help center FAQ. Goes beyond basic service delivery. | Partially built | Gamification has bugs (50pts vs 25pts inconsistency). Calendar shows no events. Help center works. Need to fix and polish. |
| **Multi-step cereri wizard** | 4-step guided process (type -> details -> documents -> review) with draft saving. Competitor platforms have flat forms. This reduces citizen errors and abandonments. | Already built | Steps 1-2 verified working. Steps 3-4 (documents, review) need E2E verification. Draft save functionality untested. |
| **Inline location context switching** | User can switch between primarii without re-login. Currently redirects to landing page (poor UX). If implemented as inline modal, this becomes a differentiator. | MEDIUM | Replace full-page redirect with modal picker. Preserve session. Update Zustand store + cookie. Reload data for new context. |
| **Document reuse across cereri** | Primaria.info.ro highlights this: documents uploaded for one cerere can be reused for another. Reduces citizen effort significantly. | MEDIUM | Need document library per user. When creating new cerere, show "reuse from previous" option. Link existing documents to new cerere without re-upload. |
| **PDF document generation** | Generate official cerere confirmation documents, not just receipts. A filled cerere as a downloadable PDF with primarie branding and reference number. | MEDIUM | Use pdf-lib. Template per cerere type. Include QR code for verification. Generate on cerere finalizare. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for this project.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Real-time chat (citizen <-> functionar)** | "Direct communication speeds resolution." | Requires always-online staff, creates liability for unrecorded conversations, high maintenance for realtime infra, legal implications for public records. PROJECT.md explicitly marks as out of scope. | Internal notes on cereri + email notifications. Structured communication through cerere status updates and document requests. Traceable, auditable, async. |
| **Native mobile app** | "Everyone uses mobile apps." | Doubles development effort for 2-person team. Web responsive handles 96%+ of mobile use cases (EU Benchmark). App store maintenance overhead. | Mobile-responsive PWA. Already have responsive design working. Add PWA manifest for home screen install if needed. |
| **Video document uploads** | "Some documents are easier to capture as video." | Storage costs explode. Processing/transcoding needed. Bandwidth issues in rural Romania. Most documents are paper -> scan/photo. | Image uploads with quality guidance. PDF upload for scanned documents. Camera capture on mobile for photos. |
| **Multi-language support** | "Romania has minorities (Hungarian, German, etc.)." | Significant translation effort for entire UI. Legal requirements are Romanian-first. Adds complexity to every text element. | Romanian-only for v1. Structure code for future i18n (use constants, not inline strings). Add language support in v2 if demand proven. |
| **Custom cereri type builder** | "Let each primarie define their own cerere types." | Schema validation becomes dynamic and untestable. Security surface area explodes with user-defined forms. Admin UX for form building is its own product. | Predefined cerere type catalog that covers 90% of use cases. Add new types via code/config, not UI builder. Each type has validated schema. |
| **Background job queue (Bull/BullMQ)** | "Queue long-running operations." | Infrastructure complexity. Redis dependency. Monitoring overhead. Current scale (5 primarii, <100 users) doesn't justify. | Supabase Edge Functions for async operations. Webhook-based processing. React Query for deferred client operations. Revisit at 1,000+ primarii. |
| **Redis caching layer** | "Cache database queries for speed." | Infrastructure cost and complexity. Cache invalidation bugs in multi-tenant systems are notoriously hard. Current scale doesn't need it. | React Query client-side caching (already configured). Supabase connection pooling. Next.js ISR for public pages. PostgreSQL query optimization. |
| **Full-text search engine (Elasticsearch)** | "Better search across all modules." | Massive infrastructure. Data sync complexity. Overkill for current data volume. | PostgreSQL full-text search (already have idx_utilizatori_search). Supabase built-in text search. Add tsvector columns to cereri and documente tables. |

## Feature Dependencies

```
[Cereri Processing Workflow]
    |-- requires --> [Functionar Dashboard]
    |-- requires --> [Staff Notifications]
    |-- enhances --> [Deadline/SLA Tracking]
    |-- enhances --> [Financial Reporting]

[Primar Approval Queue]
    |-- requires --> [Cereri Processing Workflow]
    |-- requires --> [Primar Dashboard]
    |-- enhances --> [Digital Signatures (CertSign)]

[Document Page (/documente)]
    |-- requires --> [Fix: working route, no 404]
    |-- enhances --> [Document Reuse Across Cereri]
    |-- enhances --> [Dashboard "Documente Recente" widget]

[Payment Receipts (PDF)]
    |-- requires --> [PDF Generation Library (pdf-lib)]
    |-- requires --> [Supabase Storage signed URLs]
    |-- enhances --> [Plati list "download" action]

[Primarie Registration Approval]
    |-- requires --> [Admin Dashboard]
    |-- requires --> [Registration Requests Table]
    |-- enhances --> [User Management]

[Cross-Primarie Notifications]
    |-- requires --> [Working per-primarie notifications] (exists)
    |-- requires --> [Context Switch Modal]
    |-- requires --> [Multi-primarie user registration] (not yet built)

[Context Switch Modal]
    |-- requires --> [Location Store (Zustand)] (exists)
    |-- enhances --> [Cross-Primarie Notifications]
    |-- replaces --> [Current redirect-to-landing UX]

[Search Across Modules]
    |-- requires --> [Fix /api/dashboard/search/plati]
    |-- enhances --> [Dashboard search box]
    |-- enhances --> [Cereri list, Documente list]

[Staff Notifications]
    |-- requires --> [Notification triggers on status changes]
    |-- enhances --> [Functionar Dashboard]
    |-- enhances --> [Admin Dashboard]

[Audit Logging]
    |-- requires --> [audit_log table] (exists)
    |-- enhances --> [Admin Dashboard activity feed]
    |-- enhances --> [Cereri Processing Workflow]

[Data Isolation Fix]
    |-- requires --> [RLS policy audit and fix]
    |-- blocks --> [Multi-primarie user registration]
    |-- blocks --> [Cross-Primarie Notifications]
```

### Dependency Notes

- **Cereri Processing Workflow requires Functionar Dashboard:** Clerks need a workspace to process cereri. Building workflow without a dashboard to display it is useless.
- **Primar Approval Queue requires Cereri Processing Workflow:** Approval is one step in the processing pipeline. Can't approve without the broader status transition system.
- **Cross-Primarie Notifications requires Data Isolation Fix:** Must verify data isolation works correctly before aggregating across primarii. Wrong isolation = data leaks.
- **Registration Approval requires Admin Dashboard:** Admins need a UI to review and approve/reject registration requests. Without the dashboard, there's nowhere to manage approvals.
- **Document Page enhances Document Reuse:** You need a document library before you can offer document reuse in new cereri.

## MVP Definition

### Launch With (v1 - Production Ready)

Minimum viable for a primarie to actually use this platform.

- [x] Authentication (email + Google OAuth) -- existing
- [x] Cereri submission wizard -- existing
- [x] Cereri list with filtering -- existing
- [x] Payment mock flow -- existing
- [x] Notifications with realtime -- existing
- [x] Cetafean dashboard -- existing
- [ ] **Fix broken routes** (/documente 404, /cereri/new 500, /admin/settings 404) -- LOW effort, HIGH impact
- [ ] **Document page** (list user's documents from cereri, download, preview) -- MEDIUM effort
- [ ] **Payment receipts (PDF chitante)** -- MEDIUM effort
- [ ] **Functionar dashboard** (assigned cereri queue, status change actions) -- HIGH effort
- [ ] **Admin dashboard** (real user counts, staff management, cereri overview) -- HIGH effort
- [ ] **Search fix** (fix plati search endpoint, unified results) -- LOW effort
- [ ] **Data isolation verification** (RLS audit, multi-tenant correctness) -- HIGH effort, CRITICAL
- [ ] **Dynamic map** (replace Spline with Leaflet) -- MEDIUM effort
- [ ] **Status enum localization** (Romanian display strings) -- LOW effort
- [ ] **Cereri processing workflow** (status transitions, notes, document requests) -- HIGH effort

### Add After Validation (v1.x)

Features to add once core is working and first primarii are onboarded.

- [ ] **Primar dashboard** (approval queue, financial overview, staff metrics) -- HIGH effort, add when primari onboard
- [ ] **Primarie registration approval flow** -- HIGH effort, add when open registration begins
- [ ] **Staff notifications** (internal notifications for funcffionari) -- MEDIUM effort, add when staff actively using platform
- [ ] **Deadline/SLA tracking** (overdue indicators, approaching deadline alerts) -- MEDIUM effort, add when cereri processing is live
- [ ] **Cross-primarie notifications** -- HIGH effort, add when users register at multiple primarii
- [ ] **Context switch modal** (inline primarie switching) -- MEDIUM effort, add with cross-primarie notifications
- [ ] **Document reuse across cereri** -- MEDIUM effort, add after document page is stable
- [ ] **PDF cerere confirmation documents** -- MEDIUM effort, add after receipt generation works
- [ ] **Financial reporting for primar** -- MEDIUM effort, add with primar dashboard
- [ ] **Webhook signature verification (HMAC)** -- MEDIUM effort, add before real Ghiseul integration

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Digital signatures (CertSign real integration)** -- wait for API credentials
- [ ] **Real Ghiseul.ro payment integration** -- wait for API credentials
- [ ] **Participatory budgeting module** -- common in Romanian ePortals (Iasi), but complex
- [ ] **Appointment scheduling** (programari online) -- Regista offers this; moderate complexity
- [ ] **Online complaint system** (sesizari online) -- separate from cereri; needs own workflow
- [ ] **Public document publication** (monitorul oficial local) -- Regista feature; niche
- [ ] **GIS/geoportal integration** -- Devson offers this; high complexity, low immediate value
- [ ] **Chatbot for citizen guidance** -- Cluj-Napoca has "ANTONIA"; requires NLP/training data
- [ ] **Infokiosk terminal mode** -- physical kiosk interface; niche, high complexity
- [ ] **Multi-language support** -- defer to v2 if minority demand proven
- [ ] **Self-service form builder** -- admin creates custom cerere types; product-in-a-product

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Fix broken routes (/documente, /cereri/new, /admin/settings) | HIGH | LOW | **P0** |
| Data isolation verification (RLS audit) | HIGH | HIGH | **P0** |
| Document page (/documente) | HIGH | MEDIUM | **P1** |
| Functionar dashboard (cereri queue) | HIGH | HIGH | **P1** |
| Cereri processing workflow (status transitions) | HIGH | HIGH | **P1** |
| Payment receipts (PDF chitante) | HIGH | MEDIUM | **P1** |
| Admin dashboard (real data, user management) | HIGH | HIGH | **P1** |
| Search fix (plati endpoint, unified results) | MEDIUM | LOW | **P1** |
| Dynamic map (Leaflet) | MEDIUM | MEDIUM | **P1** |
| Status enum localization | MEDIUM | LOW | **P1** |
| Staff notifications | HIGH | MEDIUM | **P2** |
| Primar dashboard | HIGH | HIGH | **P2** |
| Deadline/SLA tracking | MEDIUM | MEDIUM | **P2** |
| Primarie registration approval | HIGH | HIGH | **P2** |
| Context switch modal | MEDIUM | MEDIUM | **P2** |
| Cross-primarie notifications | MEDIUM | HIGH | **P2** |
| Document reuse across cereri | MEDIUM | MEDIUM | **P2** |
| PDF cerere confirmations | MEDIUM | MEDIUM | **P2** |
| Financial reporting | MEDIUM | MEDIUM | **P2** |
| Webhook HMAC verification | HIGH | MEDIUM | **P2** |
| Audit log display | MEDIUM | LOW | **P2** |
| Staff performance metrics | LOW | MEDIUM | **P3** |
| Appointment scheduling | LOW | HIGH | **P3** |
| Participatory budgeting | LOW | HIGH | **P3** |
| Complaint system (sesizari) | LOW | HIGH | **P3** |

**Priority key:**
- P0: Fix immediately -- blocking production readiness
- P1: Must have for production launch
- P2: Should have, add in v1.x iterations
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Regista.ro | Primaria-Digitala (Avansis) | CityManager | Devson/Cluj | primariaTa.work |
|---------|------------|---------------------------|-------------|-------------|-----------------|
| Online cereri submission | Yes (forms per type) | Yes (web portal) | Yes | Yes | Yes (4-step wizard) |
| Status tracking | Yes (registration code) | Yes (email notifications) | Yes | Yes | Yes (timeline view) |
| Payment gateway | Yes (Ghiseul integration) | Yes (integrated) | Unknown | Unknown | Mock (Ghiseul-ready) |
| Document management | Yes (DMS + archiving) | Yes (forms library) | Yes | Yes (full DMS) | Missing (404) |
| Digital signatures | Yes (eSemnatura) | Unknown | Unknown | Yes | Mock (CertSign-ready) |
| Staff workflow | Yes (registratura + routing) | Yes (automated) | Yes (petitions, contracts) | Yes (wiki + comms) | Stub (placeholder) |
| Clerk dashboard | Yes (department view) | Yes (task management) | Yes (unified management) | Yes (statistics) | Stub (placeholder) |
| Mobile responsive | Yes | Yes | Unknown | Yes | Yes |
| Multi-primarie SaaS | No (per-install) | No (per-install) | No (per-install) | No (per-install) | **Yes (unique)** |
| Real-time updates | No (refresh) | No (email) | No | No | **Yes (Supabase Realtime)** |
| AI analytics | No | No | No | No | **Yes (GPT-4o-mini)** |
| Cross-primarie notifications | No | No | No | No | Planned (unique) |
| Complaint system (sesizari) | Yes | No | Yes | Yes (ANTONIA chatbot) | No (out of scope v1) |
| Appointment scheduling | Yes | No | No | No | No (out of scope v1) |
| Public gazette | Yes | No | No | No | No (out of scope v1) |
| Infokiosk | No | No | No | Yes | No (out of scope) |
| GIS/geoportal | No | No | No | Yes | No (out of scope) |

### Key Competitive Insight

primariaTa.work's multi-tenant SaaS architecture is genuinely unique in the Romanian market. All competitors (Regista, Avansis, CityManager, Devson) are per-primarie installations requiring separate deployment, configuration, and maintenance per municipality. The white-label approach with RLS-based tenant isolation serves 3,000+ localitati from one codebase -- a fundamentally different value proposition.

The gap is in operational features: staff workflows and document management are table stakes that competitors have and primariaTa.work currently stubs. The priority is clear -- close the operational gap while preserving the architectural advantage.

## Sources

- [Devson Transilvania - Digitalizare Primarie 2025](https://devson.ro/digitalizare-primarie/) -- Romanian municipal digitization platform with DMS, chatbot, ERP modules
- [Primaria.Info.Ro - Formulare online, registratura si management documente](https://primaria.info.ro/) -- Online forms, registry, document management solution
- [Primaria Digitala (Avansis) - Solutii electronice pentru primarii](https://primaria-digitala.ro/) -- 12-module platform serving 400+ institutions
- [Regista.ro - Registratura, management documente](https://regista.ro/) -- Registry, document management, sesizari online, e-signatures
- [ePortal Primaria Iasi](https://eportal.primaria-iasi.ro/) -- Municipal ePortal with sesizari, participatory budgeting, DocManager integration
- [CityManager - Software primarie, smart city](https://citymanager.online/) -- SmartCity Solutions platform
- [Curs de Guvernare - Digitalizarea primariilor din Romania](https://cursdeguvernare.ro/digitalizarea-primariilor-din-romania-exemple-aplicatii-platforme.html) -- Overview of platforms and adoption
- [EU eGovernment Benchmark 2025](https://digital-strategy.ec.europa.eu/en/library/digital-decade-2025-egovernment-benchmark-2025) -- EU assessment of 100 public services across 9 life events
- [Capgemini eGovernment Benchmark 2025 Insight Report](https://www.capgemini.com/wp-content/uploads/2025/06/eGovernmentBenchmark-2025-Insight-Report.pdf) -- 96.1% mobile responsive, 98% FAQ, 60% live support
- [Romania 2025 Digital Decade Country Report](https://digital-strategy.ec.europa.eu/en/factpages/romania-2025-digital-decade-country-report) -- Romania's digitization progress
- [OECD Digital Government Review of Romania](https://www.oecd.org/content/dam/oecd/en/publications/reports/2023/12/digital-government-review-of-romania_4dee897c/68361e0d-en.pdf) -- Comprehensive government digitization assessment
- [GovPilot - Municipal Clerks Software](https://www.govpilot.com/municipal-clerks-software) -- US municipal clerk workflow automation reference
- [Ghiseul.ro - Sistemul National Electronic de Plata Online](https://www.ghiseul.ro/ghiseul/public/credentiale) -- Romanian national online payment system

---
*Feature research for: Romanian e-government / primarie digitization platform*
*Researched: 2026-03-02*
