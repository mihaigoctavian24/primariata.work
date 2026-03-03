---
phase: 03-registration-approval
verified: 2026-03-03T14:00:00Z
status: human_needed
score: 6/6 must-haves verified
re_verification:
  previous_status: gaps_found
  previous_score: 5/6
  gaps_closed:
    - "Approved/rejected user receives email notification with correct primarie name (REG-05 fix: commit c21636e)"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Register a new account on a primarie and verify the complete pending flow"
    expected: "After registration, user is redirected to dashboard and sees PendingStatusPage with calm waiting room UI. The primarie name is displayed correctly. The Realtime subscription is live."
    why_human: "Requires a live Supabase instance with Realtime enabled on user_primarii and actual email verification flow"
  - test: "Admin approves a pending registration and verify email content"
    expected: "User receives email with subject 'Inregistrare aprobata - [ACTUAL PRIMARIE NAME]' and body using the real primarie name, not 'Primaria'"
    why_human: "Requires SendGrid configured and live email delivery to verify email content after the column-name fix"
  - test: "Status page updates in real-time when admin approves"
    expected: "User on pending status page sees toast notification 'Inregistrarea ta a fost aprobata!' and is automatically redirected to dashboard within ~1.5 seconds"
    why_human: "Requires live Supabase Realtime subscription -- cannot verify Realtime behavior with static file analysis"
  - test: "Admin sidebar link visibility"
    expected: "Admin user sees standard citizen links plus 'Inregistrari' link at the bottom pointing to /admin/registrations; citizen user does not see the Inregistrari link"
    why_human: "Requires live auth session to trigger the user_primarii role lookup in layout.tsx"
---

# Phase 3: Registration & Approval Verification Report

**Phase Goal:** Users can register on any active primarie and receive approval from that primarie's admin before accessing modules
**Verified:** 2026-03-03T14:00:00Z
**Status:** human_needed (all automated checks pass)
**Re-verification:** Yes -- after gap closure in commit c21636e

## Re-verification Summary

The single gap from the initial verification (REG-05: wrong column `denumire` vs `nume_oficial` in `admin-registration.ts`) has been fully resolved. Commit c21636e made the following changes:

- Lines 114 and 214 of `src/actions/admin-registration.ts`: `.select("denumire, ...")` corrected to `.select("nume_oficial, ...")`
- Lines 121 and 221 of `src/actions/admin-registration.ts`: `?.denumire` property access corrected to `?.nume_oficial` with matching cast type `{ nume_oficial: string }`
- `REJECTION_REASONS` constant extracted from `admin-registration.ts` into a new dedicated file `src/lib/constants/registration.ts`
- `src/components/admin/RejectRegistrationDialog.tsx` updated to import `REJECTION_REASONS` from `@/lib/constants/registration` instead of `@/actions/admin-registration`

No regressions detected across the 5 previously-passing truths.

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | New registration with location creates pending user_primarii row atomically via trigger | VERIFIED | `supabase/migrations/20260303000001_extend_handle_new_user_for_user_primarii.sql` line 152: `INSERT INTO public.user_primarii`; RegisterForm passes `judet_id` + `localitate_id` in signUp options.data; auth callback creates pending row for OAuth users via service role |
| 2 | Newly registered user sees pending status screen and cannot access primarie modules | VERIFIED | `src/app/app/[judet]/[localitate]/page.tsx` line 169: `if (!association \|\| association.status === "pending" \|\| association.status === "rejected")` gates on `PendingStatusPage`; middleware blocks protected modules for non-approved users |
| 3 | Approved user gets full dashboard access; rejected user sees rejection reason with re-apply button | VERIFIED | `PendingStatusPage` handles all states; `reapplyAtPrimarie` Server Action updates rejected row to pending |
| 4 | Admin sees pending registrations in dashboard widget and can approve or reject | VERIFIED | `PendingRegistrationsWidget` integrated in `AdminDashboard`; full queue at `/admin/registrations`; `approveRegistration` and `rejectRegistration` Server Actions in `admin-registration.ts`; `RejectRegistrationDialog` with preset reasons from `@/lib/constants/registration` |
| 5 | Admin receives in-app notification when new registration arrives | VERIFIED | `notifyAdminNewRegistration` in `admin-registration.ts` queries all admin/primar users and inserts `registration_pending` notifications; called from `registerAtPrimarie` fire-and-forget path |
| 6 | Approved/rejected user receives email notification with correct primarie name | VERIFIED | Lines 114 and 214 now use `.select("nume_oficial, ...")` (previously was `denumire`); lines 121 and 221 cast to `{ nume_oficial: string }` and access `?.nume_oficial`; confirmed against migration `20250118000001_create_extensions_and_core_tables.sql:68` where column is `nome_oficial VARCHAR(250)` |

**Score:** 6/6 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/migrations/20260303000001_extend_handle_new_user_for_user_primarii.sql` | Trigger extension with STEP 4b for user_primarii INSERT | VERIFIED | Contains INSERT INTO public.user_primarii at line 152; pending for normal, approved for invitation-based |
| `supabase/migrations/20260303000002_enable_realtime_user_primarii.sql` | REPLICA IDENTITY FULL + Realtime publication + notifications CHECK extension | VERIFIED | REPLICA IDENTITY FULL set at line 11; supabase_realtime publication updated; notifications CHECK constraint extended |
| `src/actions/registration.ts` | Server Actions: registerAtPrimarie, reapplyAtPrimarie | VERIFIED | Both exported; imports and calls notifyAdminNewRegistration fire-and-forget at line 71 |
| `src/components/auth/RegisterForm.tsx` | Passes judet_id + localitate_id in signUp options.data | VERIFIED | getLocation() called; both IDs in options.data |
| `src/app/auth/callback/route.ts` | OAuth callback creates pending user_primarii for Google users | VERIFIED | createServiceRoleClient() used; checks for existing association before inserting pending row |
| `src/hooks/use-registration-status.ts` | Realtime subscription on user_primarii | VERIFIED | postgres_changes subscription on user_primarii with user_id filter |
| `src/components/registration/PendingStatusPage.tsx` | Full-screen pending/rejected/no-association status page | VERIFIED | All three states rendered; Framer Motion entrance animation; useRegistrationStatus integrated |
| `src/components/registration/RegistrationStatusCard.tsx` | Status card component for pending/rejected states | VERIFIED | Pending: amber card; Rejected: red card with rejection reason and re-apply button |
| `src/components/registration/RegisterAtPrimarieButton.tsx` | Register button for existing users at new primarie | VERIFIED | Calls registerAtPrimarie; loading state; toast on success/error |
| `src/actions/admin-registration.ts` | approveRegistration, rejectRegistration, getPendingRegistrations, notifyAdminNewRegistration | VERIFIED | All four exported; column bug fixed; no REJECTION_REASONS export (moved to constants) |
| `src/lib/constants/registration.ts` | REJECTION_REASONS constant (new in c21636e) | VERIFIED | 5 preset reasons exported as const; imported correctly in RejectRegistrationDialog |
| `src/lib/email/types.ts` | Extended with registration_approved and registration_rejected | VERIFIED | EmailType union extended; request interfaces and EmailRequest union updated |
| `src/lib/email/sendgrid.ts` | Helper functions for registration emails | VERIFIED | sendRegistrationApprovedEmail and sendRegistrationRejectedEmail exported |
| `supabase/functions/send-email/index.ts` | Edge Function with registration email templates | VERIFIED | registration_approved and registration_rejected cases with Romanian templates |
| `src/components/admin/PendingRegistrationsWidget.tsx` | Dashboard widget with pending count and recent registrations | VERIFIED | React Query fetch; approve in-widget; RejectRegistrationDialog opens for reject |
| `src/components/admin/RegistrationQueue.tsx` | Full-page registration queue | VERIFIED | Imports getPendingRegistrations and approveRegistration; table layout; empty state |
| `src/components/admin/RejectRegistrationDialog.tsx` | Dialog with preset reasons and optional free text | VERIFIED | REJECTION_REASONS now imported from @/lib/constants/registration (fixed in c21636e); Textarea 500 char max |
| `src/app/app/[judet]/[localitate]/admin/registrations/page.tsx` | Admin registrations route | VERIFIED | Resolves primarieId from URL slugs; renders RegistrationQueue |
| `src/components/dashboard/role-dashboards/AdminDashboard.tsx` | AdminDashboard with PendingRegistrationsWidget | VERIFIED | PendingRegistrationsWidget integrated at line 142 |
| `src/components/dashboard/DashboardSidebar.tsx` | extraNavigationLinks prop for role-based nav extension | VERIFIED | extraNavigationLinks prop added and spread into navigation links |
| `src/app/app/[judet]/[localitate]/layout.tsx` | Detects admin role and passes Inregistrari sidebar link | VERIFIED | user_primarii join query for role detection; adminExtraLinks passed as extraNavigationLinks at line 137 |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `RegisterForm.tsx` | supabase auth.signUp | judet_id + localitate_id in options.data | WIRED | getLocation() called; both IDs in options.data |
| `handle_new_user trigger` | public.user_primarii | INSERT in STEP 4b | WIRED | Migration line 152: INSERT INTO public.user_primarii with CASE for invitation vs normal |
| `auth/callback/route.ts` | public.user_primarii | createServiceRoleClient INSERT | WIRED | Service role insert with pending status for OAuth users |
| `page.tsx` (dashboard) | `PendingStatusPage` | Conditional render on association status | WIRED | Line 169: `!association \|\| status === "pending" \|\| status === "rejected"` |
| `use-registration-status.ts` | supabase.channel | postgres_changes subscription on user_primarii | WIRED | .on('postgres_changes', { table: 'user_primarii', filter: `user_id=eq.${userId}` }) |
| `RegisterAtPrimarieButton.tsx` | registration.ts | registerAtPrimarie import and call | WIRED | Imported and called in handleRegister |
| `RegistrationQueue.tsx` | admin-registration.ts | approveRegistration + rejectRegistration calls | WIRED | Both imported at line 6; handleApprove and rejectTarget path present |
| `admin-registration.ts` | sendgrid.ts | sendRegistrationApprovedEmail + sendRegistrationRejectedEmail | WIRED | Both imported at line 6 and called in fire-and-forget pattern |
| `admin-registration.ts` | primarii table | `.select("nume_oficial, ...")` (fixed) | WIRED | Lines 114 and 214: correct column name; lines 121 and 221: correct property access |
| `admin-registration.ts` | notifications table | Supabase INSERT with service role | WIRED | serviceClient.from('notifications').insert() in both approveRegistration and rejectRegistration |
| `AdminDashboard.tsx` | `PendingRegistrationsWidget` | Component composition with primarieId | WIRED | PendingRegistrationsWidget rendered at line 142 with primarieId |
| `layout.tsx` | `DashboardSidebar` | extraNavigationLinks prop with Inregistrari link | WIRED | adminExtraLinks passed as extraNavigationLinks at line 137 |
| `RejectRegistrationDialog.tsx` | `@/lib/constants/registration` | REJECTION_REASONS import (c21636e) | WIRED | Line 5: import { REJECTION_REASONS } from "@/lib/constants/registration" |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| REG-01 | 03-01 | User can register freely on any active primarie | SATISFIED | Trigger STEP 4b creates pending user_primarii on registration; auth callback handles OAuth; registerAtPrimarie handles existing users at new primarie |
| REG-02 | 03-01 | Registration goes to pending state requiring admin approval | SATISFIED | Default status is 'pending' in trigger, callback, and Server Action; invitation-based gets 'approved' correctly |
| REG-03 | 03-02 | User sees status screen while awaiting approval | SATISFIED | Dashboard page gates on association status; PendingStatusPage renders for pending/rejected/no-association; Realtime subscription active for instant updates |
| REG-04 | 03-03 | Admin can approve or reject registrations with optional reason | SATISFIED | approveRegistration and rejectRegistration Server Actions functional; RejectRegistrationDialog with 5 preset reasons from constants; admin widget and queue page both wired |
| REG-05 | 03-03 | User receives email notification on approval/rejection | SATISFIED | Email sending path is wired; Edge Function has Romanian templates; column name bug fixed in c21636e (denumire -> nume_oficial); primarie name now resolves correctly at runtime |
| REG-06 | 03-02 | Approved user gets full access; rejected user sees rejection reason | SATISFIED | Approved users skip PendingStatusPage and reach normal role-based dashboard; rejected users see rejection reason from user_primarii.rejection_reason in RegistrationStatusCard |

Note: REQUIREMENTS.md still marks REG-04 and REG-05 as "Pending" in the tracking table -- this is a documentation state that should be updated to "Complete" separately.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/components/dashboard/role-dashboards/AdminDashboard.tsx` | ~32 | `TODO (M4): Expand with full admin features` | Info | Note about future expansion, not blocking Phase 3 functionality |

No blocker or warning anti-patterns remain. The previous blocker (`denumire` column name) is resolved.

---

### Human Verification Required

#### 1. Registration to Pending Status Flow

**Test:** Register a new account at an active primarie (with location selected), complete email verification, then navigate to the primarie dashboard.
**Expected:** Dashboard shows PendingStatusPage with calm waiting room UI, correct primarie name, and "Inregistrare in asteptare" status with amber card.
**Why human:** Requires live Supabase with email verification and working Realtime subscription.

#### 2. Email Content Verification (Column Name Fix)

**Test:** With SendGrid configured, have an admin approve a pending registration and check the email received by the user.
**Expected:** Email subject reads "Inregistrare aprobata - [Actual Primarie Name]" (e.g. "Inregistrare aprobata - Primaria Municipiului Cluj-Napoca") and the body contains the real primarie name from the `nume_oficial` column, not the fallback string "Primaria".
**Why human:** Requires SendGrid configured with a real API key and live email delivery to verify actual email content. Static analysis confirms the correct column is now selected; runtime behavior must be confirmed in a staging/production environment.

#### 3. Realtime Approval Status Update

**Test:** With a user on PendingStatusPage, have an admin approve the registration from a different browser session.
**Expected:** Pending user's page shows toast "Inregistrarea ta a fost aprobata!" and automatically redirects to the role-based dashboard within ~1.5 seconds without manual page refresh.
**Why human:** Requires two concurrent browser sessions and live Supabase Realtime.

#### 4. Admin Sidebar Link Visibility

**Test:** Log in as an admin user, navigate to the per-primarie dashboard. Check the sidebar. Then log in as a citizen and verify the link is absent.
**Expected:** Admin sees standard citizen links (Dashboard, Cereri, Documente, Plati, Notificari, Setari) PLUS "Inregistrari" link at the bottom pointing to `/admin/registrations`. Citizen sees only the standard 6 links.
**Why human:** Requires live auth session to trigger the user_primarii role lookup in layout.tsx.

---

### Gaps Summary

No gaps remain. All 6 must-haves are verified in the codebase.

The single gap from the initial verification (REG-05 -- wrong column name `denumire` in place of `nume_oficial` in `admin-registration.ts`) was fixed in commit c21636e. Both `.select()` calls (lines 114 and 214) and both property accesses (lines 121 and 221) now use `nume_oficial`. The fix was also accompanied by a refactor that extracts `REJECTION_REASONS` from the server action file into `src/lib/constants/registration.ts`, which is a code quality improvement (server action files should not export non-action constants).

Phase 3 goal is achieved: users can register on any active primarie and receive approval from that primarie's admin before accessing modules. The four human verification items above require a live environment but are expected to pass given the code is fully wired.

---

_Verified: 2026-03-03T14:00:00Z_
_Re-verification: Yes -- after gap closure (commit c21636e)_
_Verifier: Claude (gsd-verifier)_
