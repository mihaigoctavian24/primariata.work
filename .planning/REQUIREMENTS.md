# Requirements: primariaTa.work

**Defined:** 2026-03-02
**Core Value:** Citizens can submit cereri and complete plati digitally for any primarie where they're registered, with complete data isolation between primarii and proper role-based access for all user types.

## v1 Requirements

Requirements for production-ready release. Each maps to roadmap phases.

### Security & Data Isolation

- [x] **SEC-01**: Multi-primarie data isolation works correctly -- user sees only data for currently selected primarie across all modules (cereri, plati, documente, dashboard)
- [x] **SEC-02**: User can be registered at multiple primarii with different roles per primarie (e.g., cetatean in one, functionar in another)
- [x] **SEC-03**: RLS policies use per-request primarie context (db_pre_request + x-primarie-id header) instead of static JWT metadata
- [x] **SEC-04**: All 22 database functions have explicit search_path set to prevent injection attacks
- [x] **SEC-05**: Payment webhook callbacks verify HMAC signature before processing (currently returns hardcoded false)
- [x] **SEC-06**: Production code has zero console.log statements; all logging goes through Better Stack structured logging
- [x] **SEC-07**: CSRF protection is consistently enforced on all state-changing routes (POST/PUT/DELETE/PATCH)

### Monitoring & Infrastructure

- [x] **MON-01**: Better Stack replaces Sentry for error tracking, structured logging, and uptime monitoring
- [x] **MON-02**: Web Vitals (LCP, FID, CLS) are reported to Better Stack via BetterStackWebVitals component
- [x] **MON-03**: All error boundaries and React Query error handlers report to Better Stack instead of Sentry
- [x] **MON-04**: Sentry packages and config files fully removed from codebase

### Bug Fixes

- [x] **FIX-01**: /cereri/new route works correctly (currently returns 500) -- either fix or redirect to /cereri/wizard
- [x] **FIX-02**: /documente route renders document page (currently 404)
- [x] **FIX-03**: /admin panel accessible for super_admin users (currently 404)
- [x] **FIX-04**: /admin/settings page renders settings interface (currently 404)
- [x] **FIX-05**: Dashboard search works across cereri and plati (plati search currently 404)
- [x] **FIX-06**: Gamification points display consistently (50 pts desktop vs 25 pts mobile)
- [x] **FIX-07**: Map widget shows correct location for selected primarie (currently shows Bucharest for all)

### Registration & Approval

- [x] **REG-01**: User can register freely on any active primarie
- [x] **REG-02**: Registration goes to pending state requiring primarie admin approval
- [x] **REG-03**: User sees status screen while awaiting approval (pending / approved / rejected with reason)
- [ ] **REG-04**: Primarie admin can approve or reject registrations with optional reason from admin dashboard
- [ ] **REG-05**: User receives email notification on approval/rejection
- [x] **REG-06**: Approved user gets full access to primarie modules; rejected user sees rejection reason

### Staff Dashboards

- [x] **DASH-01**: Functionar dashboard shows assigned cereri queue with filtering by status, type, and deadline
- [x] **DASH-02**: Functionar can change cerere status (depusa -> in verificare -> in procesare -> finalizata/respinsa)
- [x] **DASH-03**: Functionar can add internal notes/comments on cereri (visible only to staff)
- [x] **DASH-04**: Functionar can request additional documents from citizen (triggers notification)
- [x] **DASH-05**: Admin (primarie-level) dashboard shows real user counts, cereri overview by status, and basic analytics
- [x] **DASH-06**: Admin dashboard includes registration approval queue
- [x] **DASH-07**: Admin dashboard includes staff invitation management (build on existing invitation system)
- [x] **DASH-08**: Admin settings page allows primarie info editing, notification preferences
- [x] **DASH-09**: Primar dashboard shows cereri requiring approval, financial overview (revenue by period/type), staff metrics
- [x] **DASH-10**: Primar can approve/reject cereri that require primar-level approval with reason

### Cereri Processing

- [x] **CER-01**: Status transitions have validation rules (not all transitions allowed from all states)
- [x] **CER-02**: Every status change is recorded in audit trail with actor, timestamp, and reason
- [x] **CER-03**: Document validation enforced on cerere submit -- required documents must be present per cerere type
- [x] **CER-04**: Deadline/SLA tracking shows overdue indicators on cereri list and dashboard
- [x] **CER-05**: Staff and citizens receive notifications on cerere status changes
- [x] **CER-06**: Search across cereri works with filters (status, type, date range, reference number)

### Documents

- [x] **DOC-01**: /documente page lists all documents attached to user's cereri (uploaded files, generated PDFs, receipts)
- [x] **DOC-02**: /documente page includes public forms library with downloadable templates
- [x] **DOC-03**: User can preview and download documents from the documents page
- [x] **DOC-04**: Dashboard "Documente Recente" widget shows actual recent documents instead of empty state

### Payments & Receipts

- [x] **PAY-01**: PDF receipt (chitanta) generated on successful payment with Romanian diacritics
- [x] **PAY-02**: Receipts stored in Supabase Storage with signed download URLs
- [x] **PAY-03**: Pending payment count in dashboard shows real count (currently hardcoded 0)
- [x] **PAY-04**: Payment gateway architecture ready for real Ghiseul.ro swap (feature flag controls mock vs production)

### Notifications

- [x] **NOT-01**: Staff (functionar) receive in-app notifications when citizen submits new cerere
- [x] **NOT-02**: Staff receive notifications on cerere status changes requiring their action
- [x] **NOT-03**: Cross-primarie notification aggregation -- user sees notifications from all primarii where registered
- [x] **NOT-04**: Click on notification from different primarie shows confirmation popup before context switch
- [x] **NOT-05**: After context switch confirmation, user redirected to source module/page from notification

### Map & UX

- [x] **MAP-01**: Dynamic interactive map (Mapbox GL) replaces Spline 3D, centered on selected localitate
- [x] **MAP-02**: Map shows primarie location pin with correct coordinates for all localitati
- [x] **MAP-03**: Status enum values display in Romanian (e.g., "In Verificare" instead of "in_verificare")

### Compliance

- [x] **GDPR-01**: Privacy policy page accessible from footer and registration flow
- [x] **GDPR-02**: Cookie consent banner shown on first visit with accept/reject options
- [ ] **GDPR-03**: User can request data export (DSAR) from settings page
- [ ] **GDPR-04**: User can request account deletion from settings page

### Testing

- [x] **TEST-01**: Unit tests for authorization functions (requireAuth, requireRole, requireOwnership)
- [x] **TEST-02**: Unit tests for validation schemas (cereri, profile, payments, common)
- [x] **TEST-03**: pgTAP tests verify RLS data isolation across primarii (user A cannot see user B's data in different primarie)
- [x] **TEST-04**: E2E tests cover complete cerere submission flow (create -> submit -> status tracking)
- [x] **TEST-05**: E2E tests cover payment flow (initiate -> checkout -> webhook -> receipt)
- [x] **TEST-06**: E2E tests cover auth flow (register -> login -> dashboard -> logout)
- [x] **TEST-07**: E2E tests cover admin workflows (approve registration, process cerere, manage staff)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Features

- **ADV-01**: Document reuse across cereri (select from previously uploaded documents)
- **ADV-02**: PDF cerere confirmation documents with primarie branding and QR code
- **ADV-03**: Financial reporting export to PDF/Excel for primar
- **ADV-04**: Staff performance metrics (processing time, SLA compliance)
- **ADV-05**: Delegation during primar absence (auto-forward approvals)

### Integrations

- **INT-01**: Real Ghiseul.ro payment gateway integration (when credentials available)
- **INT-02**: Real CertSign digital signature integration (when credentials available)
- **INT-03**: Appointment scheduling (programari online)
- **INT-04**: Online complaint system (sesizari)

### Platform

- **PLT-01**: Multi-language support (Hungarian, German minorities)
- **PLT-02**: PWA manifest for mobile home screen install
- **PLT-03**: Self-service cerere type builder for primarie admins

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time chat (citizen <-> functionar) | High complexity, liability for unrecorded conversations, async communication via cerere notes is sufficient |
| Native mobile app | Web responsive handles 96%+ of mobile use cases (EU Benchmark); doubles effort for 2-person team |
| Video document uploads | Storage/bandwidth costs; image + PDF uploads cover all use cases |
| Background job queue (Bull/BullMQ) | Current scale doesn't justify Redis infrastructure; Edge Functions handle async ops |
| Redis caching layer | React Query client-side caching sufficient; cache invalidation in multi-tenant is risky |
| Elasticsearch full-text search | PostgreSQL full-text search sufficient for current data volume |
| GIS/geoportal integration | High complexity, low immediate value |
| Infokiosk terminal mode | Niche, high complexity |
| Participatory budgeting | Complex module, separate product |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEC-01 | Phase 1: Security Foundation | Complete |
| SEC-02 | Phase 1: Security Foundation | Complete |
| SEC-03 | Phase 1: Security Foundation | Complete |
| SEC-04 | Phase 1: Security Foundation | Complete |
| SEC-05 | Phase 1: Security Foundation | Complete |
| SEC-06 | Phase 1: Security Foundation | Complete |
| SEC-07 | Phase 1: Security Foundation | Complete |
| MON-01 | Phase 2: Infrastructure & Stabilization | Complete |
| MON-02 | Phase 2: Infrastructure & Stabilization | Complete |
| MON-03 | Phase 2: Infrastructure & Stabilization | Complete |
| MON-04 | Phase 2: Infrastructure & Stabilization | Complete |
| FIX-01 | Phase 2: Infrastructure & Stabilization | Complete |
| FIX-02 | Phase 2: Infrastructure & Stabilization | Complete |
| FIX-03 | Phase 2: Infrastructure & Stabilization | Complete |
| FIX-04 | Phase 2: Infrastructure & Stabilization | Complete |
| FIX-05 | Phase 2: Infrastructure & Stabilization | Complete |
| FIX-06 | Phase 2: Infrastructure & Stabilization | Complete |
| FIX-07 | Phase 2: Infrastructure & Stabilization | Complete |
| REG-01 | Phase 3: Registration & Approval | Complete |
| REG-02 | Phase 3: Registration & Approval | Complete |
| REG-03 | Phase 3: Registration & Approval | Complete |
| REG-04 | Phase 3: Registration & Approval | Pending |
| REG-05 | Phase 3: Registration & Approval | Pending |
| REG-06 | Phase 3: Registration & Approval | Complete |
| CER-01 | Phase 4: Cereri Processing | Complete |
| CER-02 | Phase 4: Cereri Processing | Complete |
| CER-03 | Phase 4: Cereri Processing | Complete |
| CER-04 | Phase 4: Cereri Processing | Complete |
| CER-05 | Phase 4: Cereri Processing | Complete |
| CER-06 | Phase 4: Cereri Processing | Complete |
| DASH-01 | Phase 5: Staff Dashboards | Complete |
| DASH-02 | Phase 5: Staff Dashboards | Complete |
| DASH-03 | Phase 5: Staff Dashboards | Complete |
| DASH-04 | Phase 5: Staff Dashboards | Complete |
| DASH-05 | Phase 5: Staff Dashboards | Complete |
| DASH-06 | Phase 5: Staff Dashboards | Complete |
| DASH-07 | Phase 5: Staff Dashboards | Complete |
| DASH-08 | Phase 5: Staff Dashboards | Complete |
| DASH-09 | Phase 5: Staff Dashboards | Complete |
| DASH-10 | Phase 5: Staff Dashboards | Complete |
| NOT-01 | Phase 5: Staff Dashboards | Complete |
| NOT-02 | Phase 5: Staff Dashboards | Complete |
| DOC-01 | Phase 6: Citizen Features | Complete |
| DOC-02 | Phase 6: Citizen Features | Complete |
| DOC-03 | Phase 6: Citizen Features | Complete |
| DOC-04 | Phase 6: Citizen Features | Complete |
| PAY-01 | Phase 6: Citizen Features | Complete |
| PAY-02 | Phase 6: Citizen Features | Complete |
| PAY-03 | Phase 6: Citizen Features | Complete |
| PAY-04 | Phase 6: Citizen Features | Complete |
| MAP-01 | Phase 6: Citizen Features | Complete |
| MAP-02 | Phase 6: Citizen Features | Complete |
| MAP-03 | Phase 6: Citizen Features | Complete |
| NOT-03 | Phase 7: Cross-Primarie Notifications | Complete |
| NOT-04 | Phase 7: Cross-Primarie Notifications | Complete |
| NOT-05 | Phase 7: Cross-Primarie Notifications | Complete |
| GDPR-01 | Phase 8: Compliance & Testing | Complete |
| GDPR-02 | Phase 8: Compliance & Testing | Complete |
| GDPR-03 | Phase 8: Compliance & Testing | Pending |
| GDPR-04 | Phase 8: Compliance & Testing | Pending |
| TEST-01 | Phase 8: Compliance & Testing | Complete |
| TEST-02 | Phase 8: Compliance & Testing | Complete |
| TEST-03 | Phase 8: Compliance & Testing | Complete |
| TEST-04 | Phase 8: Compliance & Testing | Complete |
| TEST-05 | Phase 8: Compliance & Testing | Complete |
| TEST-06 | Phase 8: Compliance & Testing | Complete |
| TEST-07 | Phase 8: Compliance & Testing | Complete |

**Coverage:**
- v1 requirements: 67 total
- Mapped to phases: 67
- Unmapped: 0

---
*Requirements defined: 2026-03-02*
*Last updated: 2026-03-02 after roadmap creation*
