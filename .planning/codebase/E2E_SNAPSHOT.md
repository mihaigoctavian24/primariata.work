# E2E Functionality Snapshot - primariaTa.work

**Tested on:** 2026-03-02
**Tester:** Claude Code (Playwright MCP)
**User:** Octavian MIHAI (octmihai@gmail.com) — Super Admin role
**Base URL:** https://www.primariata.work/app/alba/alba-iulia-ab
**Browser:** Chromium (Playwright)
**Viewport:** 1440x900 (desktop), 375x812 (mobile)

---

## Summary Scorecard

| Section                                 | Status                 | Score |
| --------------------------------------- | ---------------------- | ----- |
| 1. Dashboard                            | Working (minor issues) | 8/10  |
| 2. Cererile Mele (list)                 | Working                | 9/10  |
| 2b. Cerere Nouă (/cereri/new route)     | BROKEN                 | 0/10  |
| 2c. Cerere Nouă (/cereri/wizard)        | Working                | 9/10  |
| 2d. Cerere Detail View                  | Working                | 9/10  |
| 3. Documente                            | BROKEN (404)           | 0/10  |
| 4. Plăți & Taxe                         | Working                | 9/10  |
| 5. Notificări                           | Working                | 9/10  |
| 6. Setări                               | Working                | 9/10  |
| 7. Location Change                      | Partial                | 5/10  |
| 8. User Menu                            | Partial (visual bug)   | 7/10  |
| 9. Admin Panel (/admin)                 | BROKEN (404)           | 0/10  |
| 9b. Admin Panel (/admin/login redirect) | Working                | 8/10  |
| 9c. Admin Survey Dashboard              | Working                | 9/10  |
| 9d. Admin Global (/admin/primariata)    | Working                | 9/10  |
| 9e. Admin Settings (/admin/settings)    | BROKEN (404)           | 0/10  |
| 10. Survey Landing                      | Working                | 9/10  |
| 10b. Survey Start                       | Working                | 9/10  |
| 11. Search Functionality                | Partial                | 5/10  |
| 12. Mobile Responsiveness               | Working                | 9/10  |

**Overall Application Score: 7/10 — Mostly functional with critical broken sections**

---

## Section 1: Dashboard

**URL:** https://www.primariata.work/app/alba/alba-iulia-ab
**Status:** WORKING (with minor issues)
**Screenshot:** `01-dashboard-full.png`, `02-dashboard-search.png`, `23-dashboard-scrolled.png`

### What Works

- Page loads successfully with user logged in as Octavian MIHAI
- Sidebar navigation visible with all 6 links (Dashboard, Cererile Mele, Documente, Plăți & Taxe, Notificări, Setări)
- Notification banner renders: "Bună ziua Octavian, astăzi 2 martie 2026 aveți următoarea notificare: 1 medie" (later shows "1 urgent" after notification mark-read)
- Left panel map widget (Spline/Hana 3D map) renders with location pin
- Cereri Active widget: Shows B-SE-2026-00001, "În Verificare", 40% progres, with "Aproape de termen limită" warning
- "Arată toate (10)" button visible on Cereri Active
- Statistici Financiare section renders with donut chart:
  - Total: 32 cereri
  - Certificat de Căsătorie 41% (13 cereri)
  - Certificat Fiscal 34% (11 cereri)
  - Certificat de Naștere 13% (4 cereri)
  - Autorizație de Construcție 9% (3 cereri)
  - Permis de Parcare Rezidențială 3% (1 cerere)
- Statistici counter cards: Total Cereri 32, În Procesare 0, Finalizate 0, Total Plăți 250 RON
- Evoluție Plăți chart: Total An Curent 250 RON, Luna Curentă 0 RON, În Așteptare 2 plăți
- Acțiuni Rapide: "Cerere Nouă" and "Plătește Taxe" buttons present
- Următorii Pași: 3 recommended actions (upload docs for B-SE-2025-00026, unnamed cerere, B-SE-2025-00017)
- Centru Ajutor widget: 4 FAQ items visible (searchable)
- Calendar widget: Shows current month (March 2026, days 2-31), "Niciun eveniment programat"
- Documente Recente widget: "Niciun document recent" empty state
- Nivel/gamification widget: "Nivel 1, Începător, 50 pts" (visible on desktop), 25 pts on mobile — inconsistency
- Weather: 8°C, Alba
- Theme toggle button works
- Notification bell with badge (shows count 2 initially, 1 after marking one read)
- User avatar loads from Google profile photo

### What Partially Works

- Search box: Typing "cerere" triggers an API call to `/api/dashboard/search/plati?q=cerere` which returns 404, and displays "Niciun rezultat" — the cereri search endpoint fails but UI handles it gracefully
- Notification banner: Shows "1 medie" initially but after returning from notificari page updates to "1 urgent" — count/priority display seems to depend on session state

### Console Errors

- `[ERROR] Failed to load resource: the server responded with a status of 404 () @ https://www.primariata.work/app/alba/alba-iulia-ab/documente?_rsc=1iooo` — This error fires on every page load due to prefetch of the /documente route which doesn't exist. This is a persistent error across ALL pages.
- `[ERROR] Failed to load resource: /api/dashboard/search/plati?q=cerere` — Search API endpoint for plati returns 404

### UX Issues

- "Documente Recente" widget is empty despite user having documents attached to cereri
- Gamification points inconsistency: 50 pts on desktop, 25 pts on mobile (same user, same session)
- The map widget shows a Bucharest street (Primăria Sectorului 1, Strada Comana) instead of Alba Iulia — map pin is incorrect for this primărie

---

## Section 2: Cererile Mele

### 2a. Request List

**URL:** https://www.primariata.work/app/alba/alba-iulia-ab/cereri
**Status:** WORKING
**Screenshot:** `04-cereri-list.png`

#### What Works

- Page loads with full data table
- 29 cereri total, 3 pages, 10 per page
- Table columns: Număr Cerere, Tip Cerere, Status, Data Depunere, Termen Estimat, Acțiuni
- Sortable columns (click headers)
- Status badges: "În verificare" (red), "Finalizată" (green), "Respinsă" (orange), "Anulată" (gray), "Depusă" (blue)
- First page shows: B-SE-2026-00001 through B-SE-2025-00021
- Action buttons: "Vezi detalii" (eye icon), "Descarcă documente" (download icon), "Anulează cerere" (X icon, only for cancellable statuses)
- Filter bar: search box, status dropdown, period picker, sort dropdown
- View toggle: Tabel / Card modes available
- Pagination: 3 pages, Anterioara/Următoarea navigation
- Checkboxes for multi-select (disabled for finalized/cancelled cereri)
- "Cerere Nouă" button in top right (links to /cereri/wizard)

#### Console Errors

- `[ERROR] Failed to load resource: 404 @ /app/alba/alba-iulia-ab/documente?_rsc=` — Same persistent /documente prefetch error

### 2b. Cerere Nouă via /cereri/new route

**URL:** https://www.primariata.work/app/alba/alba-iulia-ab/cereri/new
**Status:** BROKEN — Critical Bug
**Screenshot:** `03-cereri-new-error.png`

#### What Fails

- Shows alert: "Eroare la încărcarea cererii" with a red error alert
- Only "Înapoi" button rendered — entire wizard fails to load
- Console errors:
  - `[ERROR] Failed to load resource: 500 @ https://www.primariata.work/api/cereri/new` — API returns 500 Internal Server Error
  - `[ERROR] Failed to load resource: 404 @ https://www.primariata.work/api/cereri/new/documents` — Documents endpoint returns 404
  - `[ERROR] Failed to fetch documents` — Client error from wizard component
- The "Cerere Nouă" quick action on the dashboard links to this broken route (`/cereri/new`)

### 2c. Cerere Nouă via /cereri/wizard route

**URL:** https://www.primariata.work/app/alba/alba-iulia-ab/cereri/wizard
**Status:** WORKING
**Screenshot:** `06-cereri-wizard-loading.png`, `07-wizard-step2-details.png`

#### What Works

- Step 1 — Type Selection: Loads all 5 cerere types:
  - Certificat de Naștere (Cod: CERT_NASTERE) — Stare Civilă, 15 RON, 10 zile
  - Certificat de Căsătorie (Cod: CERT_CASATORIE) — Stare Civilă, 15 RON, 10 zile
  - Autorizație de Construcție (Cod: AUTORIZATIE_CONSTRUCTIE) — Urbanism, 100 RON, 30 zile
  - Certificat Fiscal (Cod: CERTIFICAT_FISCAL) — Taxe și Impozite, Gratuită, 5 zile
  - Permis de Parcare Rezidențială (Cod: PERMIS_PARCARE) — Poliție Locală, 50 RON, 15 zile
- Search within type selection works
- Clicking a type (e.g., Certificat de Naștere) advances to Step 2
- Step 2 — Details Form: Shows dynamic form specific to the cerere type
  - For Certificat de Naștere: fields for Numele copilului*, Prenumele copilului*, Data nașterii*, Numele mamei*, Numele tatălui\*, Spitalul unde s-a născut (optional)
  - Observații suplimentare textarea (optional, 1000 char limit)
  - Navigation: Înapoi, Salvează draft, Continuă
- Progress bar shows step progression (1/4, 2/4, etc.)
- Step indicators: 1 Tip cerere, 2 Detalii, 3 Documente, 4 Revizuire

#### Not Tested (stopped at Step 2)

- Step 3 — Document upload
- Step 4 — Review & Submit
- Draft save functionality
- Actual submission

### 2d. Cerere Detail View

**URL:** https://www.primariata.work/app/alba/alba-iulia-ab/cereri/8469d493-2f1a-43df-9d6d-da7d936acaca
**Status:** WORKING
**Screenshot:** `05-cerere-detail.png`

#### What Works

- Shows B-SE-2026-00001 detail: Autorizație de Construcție, in_verificare status
- Status timeline: "Cerere depusă" (04 ian 2026, 13:22) active → "În procesare" → "Finalizată"
- Termen estimat: 03 februarie 2026 (note: this is past the current date — overdue by ~1 month)
- Detalii cerere card: tip lucrare, adresa lucrare, numar cadastral, descriere lucrare, suprafata construita
- Documente section: RAPORT_COMPLET_PRIMARIATA_Rev2.pdf (2.41 MB, Anexă) with download/delete actions
- "Descarcă tot" button for bulk download
- "Înapoi la lista de cereri" navigation

#### UX Issues

- Status badge shows raw enum value "in_verificare" instead of localized "În verificare"

---

## Section 3: Documente

**URL:** https://www.primariata.work/app/alba/alba-iulia-ab/documente
**Status:** BROKEN — Critical Bug (404)
**Screenshot:** `08-documente-404.png`

### What Fails

- Page returns HTTP 404 — the route does not exist in Next.js App Router
- Shows custom 404 page: "Oooppss ... pagina nu a fost găsită :("
- Console error: `[ERROR] Failed to load resource: 404 @ https://www.primariata.work/app/alba/alba-iulia-ab/documente`
- The Documente link in the sidebar navigates to this 404
- Every other page generates a 404 console error for this route due to Next.js RSC prefetching

### Impact

- Critical: The "Documente" section in the sidebar is completely non-functional
- The "Documente Recente" widget on the dashboard shows empty state possibly as a consequence
- Every page load generates a console error due to sidebar prefetching this broken route

---

## Section 4: Plăți & Taxe

**URL:** https://www.primariata.work/app/alba/alba-iulia-ab/plati
**Status:** WORKING
**Screenshot:** `09-plati-list.png`

### What Works

- Page loads with payment history table
- 5 payment records displayed:
  1. B-SE-2025-00030, 50 RON, Plătit, —, 04 ian 2026, 14:59
  2. B-SE-2026-00001, 100 RON, Plătit, —, 04 ian 2026, 14:38
  3. B-SE-2026-00001, 100 RON, Plătit, Card, 04 ian 2026, 14:16
  4. B-SE-2026-00001, 100 RON, În așteptare, —, 04 ian 2026, 14:11
  5. B-SE-2026-00001, 100 RON, În așteptare, —, 04 ian 2026, 13:26
- Status badges: "Plătit" (green), "În așteptare" (yellow)
- Action buttons: view (eye icon), download for paid items
- Filter bar: search, status dropdown, period picker, sort
- View toggle: Tabel / Card
- Table columns: Cerere, Sumă, Status, Metodă, Data Plată, Acțiuni
- Total: 250 RON paid (matches dashboard stat)

### Console Errors

- Same persistent `/documente` 404 prefetch error

### UX Issues

- No "pay now" action for "În așteptare" payments visible in the table — user can't initiate a new payment from this list

---

## Section 5: Notificări

**URL:** https://www.primariata.work/app/alba/alba-iulia-ab/notificari
**Status:** WORKING
**Screenshots:** `10-notificari.png`, `11-notificari-marked-read.png`

### What Works

- Page loads with notification list
- Initial state: 2 unread notifications
- Notifications:
  1. "Lipsește document pentru cererea #2026-002" — Prioritate Medie, with "Încarcă document" CTA and "Marchează citit" button
  2. "Plată urgentă taxă impozit" — Urgent, "Plătește acum" CTA and "Marchează citit" button
- Tabs: Toate, Urgente, Arhivă
- Filters: search, tip, prioritate, status dropdowns
- "Marchează toate ca citite" button (enabled when there are unread)
- Marking individual notification as read works instantly: badge count updates from 2→1 in sidebar, header bell, and page heading
- "Dismiss notification" (X) button on each notification
- Supabase Realtime subscription active: `[LOG] Realtime subscription status: SUBSCRIBED`
- Notification badge in header bell and sidebar both update correctly

### Console Errors

- Same persistent `/documente` 404 prefetch error

### UX Issues

- "Marchează toate ca citite" button was disabled on initial load, enabled after snapshot refresh — this may be a timing/hydration issue

---

## Section 6: Setări

**URL:** https://www.primariata.work/app/alba/alba-iulia-ab/setari
**Status:** WORKING
**Screenshots:** `12-setari-dashboard.png`, `13-setari-profil.png`

### What Works

- 5 settings tabs: Dashboard, Profil, Notificări, Securitate, Aspect

#### Dashboard Tab (default)

- "Preferințe Dashboard" section
- "Widget vreme" toggle — currently ON (checked)
- "Mod compact" toggle — currently OFF
- "Salvează preferințe" button

#### Profil Tab

- "Informații profil" section
- Nume complet: "Octavian MIHAI" (editable)
- Email: "octmihai@gmail.com" (disabled — "Email-ul nu poate fi modificat după creare")
- Telefon: "+40 745 163 828" (editable)
- "Salvează modificări" button

### Not Tested

- Notificări preferences tab content
- Securitate tab content (password change?)
- Aspect tab content (theme preferences?)
- Actual saving of profile/preferences (did not submit forms)

### Console Errors

- Same persistent `/documente` 404 prefetch error

---

## Section 7: Location Change

**Status:** PARTIAL
**Screenshot:** `14-location-picker.png`

### Behavior Observed

- Header location button: "Alba Iulia Ab, Jud. Alba" — clicking it navigates back to dashboard (does not open any picker inline)
- Dashboard "Schimbă locația" button: Navigates to the landing page (`/`) — the Spline landing page with the primariaTa hero section and "Continuă" button
- There is NO inline location picker modal — the location change flow requires going through the landing page flow again
- The setting page also has a "Schimbă locația" link that redirects to the landing page

### UX Issues

- The UX is disruptive: changing location requires going through the full landing experience again
- No way to return to current location easily after clicking "Schimbă locația"

---

## Section 8: User Menu

**URL:** Dashboard
**Status:** WORKING (with visual bug)
**Screenshot:** `15-user-menu.png`

### What Works

- Clicking the user avatar/button opens a dropdown menu
- Menu content (from accessibility tree):
  - User info section: "Octavian MIHAI", "octmihai@gmail.com"
  - Separator
  - "Profilul Meu" menu item
  - "Setări" menu item
  - Separator
  - "Deconectare" (logout) menu item

### Visual Bug

- The dropdown renders but appears visually clipped/positioned off-screen to the right — only the bottom portion with email and "Deconectare" is visible in the screenshot
- The "Profilul Meu" and "Setări" items are in the accessibility tree but not visible in the screenshot
- This appears to be a CSS overflow/positioning issue with the dropdown

---

## Section 9: Admin Panel

### 9a. /admin (direct URL)

**URL:** https://www.primariata.work/admin
**Status:** BROKEN — 404
**Screenshot:** `16-admin-404.png`

- Returns 404 custom page
- No redirect to `/admin/login` or `/admin/primariata`

### 9b. /admin/login (redirect)

**URL:** https://www.primariata.work/admin/login
**Status:** WORKING
**Screenshot:** `19-admin-login-redirect.png`

- Navigating to `/admin/login` auto-redirects to `/admin/survey` (since user is already authenticated as Super Admin)
- Admin sidebar shows: Global Admin, Survey Platform, Echipă (Vechi), Setări Admin
- Shows "Panel, Jud. Admin" location in header

### 9c. Admin Survey Dashboard

**URL:** https://www.primariata.work/admin/survey
**Status:** WORKING
**Screenshot:** `19-admin-login-redirect.png`

- Full dashboard loaded: "Dashboard Chestionare"
- User profile card: Octavian MIHAI, octmihai@gmail.com, Super Admin badge
- "Analiză Cercetare AI" CTA for advanced analysis
- LIVE indicator with "Ultima actualizare: Niciodată"
- Charts:
  - Distribuție Tip Respondent: Cetățeni 89%, Funcționari 11% (pie chart)
  - Top 10 Localități bar chart (data visible: Brașov, Sector 4 București, Mada Hunedoara, Vaslui Vaslui, etc.)
- Sort/filter controls: sort by Număr răspunsuri, Afișează top 10
- "Reimprospătare" and "Setări" buttons

### 9d. Admin Global Dashboard

**URL:** https://www.primariata.work/admin/primariata
**Status:** WORKING
**Screenshot:** `20-admin-global.png`

- "Dashboard Global Admin" with admin shield icon
- Stats: Total Primării 5, Administratori 2, Funcționari 2, Cetățeni 9
- Quick access cards: Administrare Primării, Administrare Admins, Setări Platformă, Dashboard Chestionare

### 9e. Admin Primării List

**URL:** https://www.primariata.work/admin/primariata/primarii
**Status:** WORKING
**Screenshot:** `24-admin-primarii.png`

- Lists 5 primării: Abrud (Jud. Alba), Arad (Jud. Arad), Cluj-Napoca (Jud. Cluj), Buftea (Jud. Ilfov), Sector 1 (Jud. București)
- All marked "Activ"
- "Adaugă Primărie (în curând)" — button disabled (feature not yet implemented)
- "Vezi Detalii" buttons — disabled (feature not yet implemented)

### 9f. Admin Settings (/admin/settings)

**URL:** https://www.primariata.work/admin/settings
**Status:** BROKEN — 404

- Returns 404 custom page
- This route appears in the admin sidebar navigation but doesn't exist
- Console error: `[ERROR] Failed to load resource: 404 @ /admin/settings`
- Same error fires on every admin page load due to Next.js RSC prefetching

---

## Section 10: Survey System

### 10a. Survey Landing

**URL:** https://www.primariata.work/survey
**Status:** WORKING
**Screenshot:** `17-survey-landing.png`

- Title: "Ajută-ne să construim primariaTa"
- Hero text (partially obscured by dark theme rendering)
- Stats: ~5 min, 10-12 întrebări, 100% Anonim
- "Începe chestionarul" and "Înapoi la pagina principală" buttons
- "De ce este important?" section with 4 benefit cards
- "Cum funcționează?" section with 4 steps
- "Ești gata să începi?" CTA section
- Footer: GDPR disclaimer, GitHub link
- Top right: theme toggle, "Admin" button linking to /admin/login
- No console errors

### 10b. Survey Start

**URL:** https://www.primariata.work/survey/start
**Status:** WORKING
**Screenshot:** `18-survey-start.png`

- Step 1 of 5 (20% progress bar)
- "Date personale" form:
  - Prenume\* (required)
  - Nume\* (required)
  - Email (optional) with hint text
  - Categorie de vârstă (optional select)
  - Județ\* (loading, then select)
  - Localitate\* (disabled until județ selected)
  - GDPR consent checkbox with "Politica de Confidențialitate și Protecția Datelor" link
  - GDPR rights section: contactează gdpr@primariata.work
- Navigation: Înapoi, Continuă buttons
- No console errors on this page

---

## Section 11: Console Errors & Network Failures

### Persistent Error (ALL pages)

**Error:** `Failed to load resource: the server responded with a status of 404 () @ https://www.primariata.work/app/alba/alba-iulia-ab/documente?_rsc=`

- **Root cause:** The `/documente` page doesn't exist (404) but the Next.js sidebar link causes RSC (React Server Component) prefetching on every navigation
- **Impact:** Console is polluted with this error on every page load
- **Frequency:** Every single page in the /app/alba/alba-iulia-ab/\* path

### Page-Specific Errors

| Page               | Error                                  | HTTP Code      |
| ------------------ | -------------------------------------- | -------------- |
| Dashboard (search) | `/api/dashboard/search/plati?q=cerere` | 404            |
| /cereri/new        | `/api/cereri/new`                      | 500            |
| /cereri/new        | `/api/cereri/new/documents`            | 404            |
| /documente         | `/app/alba/alba-iulia-ab/documente`    | 404            |
| /admin             | `/admin`                               | 404            |
| /admin/settings    | `/admin/settings`                      | 404            |
| Admin pages        | `/admin/settings?_rsc=`                | 404 (prefetch) |

---

## Section 12: Responsive Testing

**Mobile Viewport:** 375x812 (iPhone equivalent)
**Screenshots:** `21-mobile-dashboard.png`, `22-mobile-menu-open.png`

### What Works on Mobile

- Sidebar is hidden on mobile — replaced by hamburger menu ("Toggle menu" button)
- Hamburger menu opens a full-screen overlay sidebar showing all navigation links with notification badge
- Header adapts: shows hamburger + location pin icon + theme toggle + notification bell + user avatar
- Dashboard content stacks vertically on mobile
- Notification banner renders
- Map widget renders (Spline/Hana)
- Cereri Active widget adapts to mobile layout
- Statistici Financiare data accessible (chart may be smaller)
- All navigation links work on mobile

### Mobile UX Issues

- The location pin in header is smaller than location text on desktop — hard to know it's clickable
- "Schimbă locația" text may be cut off in header on very narrow screens
- Gamification points discrepancy: Shows "25 pts" on mobile vs "50 pts" on desktop (same session)

---

## Critical Bugs Found

### Bug 1: /documente page is 404

**Severity:** CRITICAL
**URL:** /app/alba/alba-iulia-ab/documente
**Behavior:** Returns 404. The entire Documente section is missing from the app.
**Impact:** Sidebar link is dead. Every page load generates a console 404 error.
**Likely Cause:** The Next.js App Router page file for `src/app/app/[judet]/[localitate]/documente/page.tsx` either doesn't exist or throws an error at build/runtime.

### Bug 2: /cereri/new returns 500

**Severity:** CRITICAL
**URL:** /app/alba/alba-iulia-ab/cereri/new
**Behavior:** API endpoint `POST /api/cereri/new` returns 500 Internal Server Error. The page shows "Eroare la încărcarea cererii" alert.
**Impact:** The "Cerere Nouă" quick action on the Dashboard links to this broken route.
**Note:** The /cereri/wizard route works fine — suggesting a routing mismatch.

### Bug 3: /admin and /admin/settings are 404

**Severity:** HIGH
**URL:** /admin, /admin/settings
**Behavior:** Both return 404.
**Impact:** The admin sidebar links to "Setări Admin" don't work.

### Bug 4: Search API for plăți returns 404

**Severity:** MEDIUM
**URL:** /api/dashboard/search/plati
**Behavior:** The dashboard search box makes requests to this non-existent endpoint.
**Impact:** Search returns no results for any query; partial functionality only (cereri may work, plăți always fail).

### Bug 5: Status badge shows raw enum value

**Severity:** LOW
**Location:** Cerere detail page header badge
**Behavior:** Shows "in_verificare" (raw database enum value) instead of "În verificare" (localized string).

### Bug 6: User menu dropdown visual clipping

**Severity:** LOW
**Location:** Header user avatar dropdown
**Behavior:** Dropdown appears partially off-screen; "Profilul Meu" and "Setări" items not visible visually (but accessible via keyboard/AT).

### Bug 7: Wrong map location in dashboard

**Severity:** MEDIUM
**Location:** Dashboard Spline/map widget
**Behavior:** Map shows Bucharest location (Primăria Sectorului 1, Strada Comana) instead of Alba Iulia. The 3D map is not tenant-aware.

### Bug 8: Gamification points inconsistency

**Severity:** LOW
**Location:** Dashboard gamification widget
**Behavior:** Shows "50 pts" on desktop and "25 pts" on mobile in the same session. Possibly a rendering/state issue.

### Bug 9: Cerere deadline overdue, no special indicator

**Severity:** MEDIUM
**Location:** Cerere B-SE-2026-00001 detail
**Behavior:** Termen estimat is "03 februarie 2026" (nearly 1 month overdue as of 2026-03-02) but the status still shows "In Verificare" with no overdue alert on the detail page. Dashboard does show a warning on the card.

### Bug 10: "Documente Recente" widget always empty

**Severity:** MEDIUM
**Location:** Dashboard left panel
**Behavior:** Shows "Niciun document recent / Documentele încărcate vor apărea aici" even though the user has documents attached to cereri (e.g., RAPORT_COMPLET_PRIMARIATA_Rev2.pdf on B-SE-2026-00001). Widget may be fetching from a broken /documente endpoint.

---

## UX Issues Found

1. **Location change flow is disruptive** — "Schimbă locația" exits the app entirely to the landing page, breaking the user's context
2. **Sidebar "Documente" link leads to 404** — Users clicking it get a jarring 404 error page outside the app shell
3. **Dashboard quick action "Cerere Nouă" links to broken /cereri/new** — Should link to /cereri/wizard instead
4. **User menu dropdown partially hidden** — Poor positioning on the right edge of the screen
5. **Missing "pay now" action in payments list** — "În așteptare" payments have no way to initiate payment from the list
6. **Notification banner collapsed state** — The banner starts expanded on fresh load but the expand/collapse chevron behavior needs testing
7. **Admin "Setări Admin" link leads to 404** — Admin sidebar navigation item is dead
8. **Admin "Adaugă Primărie" and "Vezi Detalii"** buttons are disabled without clear explanation to the user
9. **Survey page hero section partially obscured** — Dark overlay makes hero text hard to read
10. **/admin direct URL returns 404** — Should redirect to /admin/login or /admin/survey

---

## Screenshots Index

All screenshots are stored at `/Users/thor/Documents/GitHub/primariata.work/`:

| File                            | Description                                                         |
| ------------------------------- | ------------------------------------------------------------------- |
| `01-dashboard-full.png`         | Dashboard full view on load                                         |
| `02-dashboard-search.png`       | Dashboard search box with "cerere" typed, showing "Niciun rezultat" |
| `03-cereri-new-error.png`       | /cereri/new showing "Eroare la încărcarea cererii"                  |
| `04-cereri-list.png`            | Cererile Mele full list with 29 cereri, table view                  |
| `05-cerere-detail.png`          | B-SE-2026-00001 detail page with status timeline                    |
| `06-cereri-wizard-loading.png`  | /cereri/wizard Step 1 — type selection loaded                       |
| `07-wizard-step2-details.png`   | /cereri/wizard Step 2 — Certificat de Naștere form                  |
| `08-documente-404.png`          | /documente showing custom 404 page                                  |
| `09-plati-list.png`             | Plăți & Taxe list with 5 payment records                            |
| `10-notificari.png`             | Notificări page with 2 unread notifications                         |
| `11-notificari-marked-read.png` | After marking first notification as read (1 remaining)              |
| `12-setari-dashboard.png`       | Setări — Dashboard preferences tab                                  |
| `13-setari-profil.png`          | Setări — Profil tab with user data                                  |
| `14-location-picker.png`        | Location change — redirects to landing page                         |
| `15-user-menu.png`              | User menu dropdown (visually clipped)                               |
| `16-admin-404.png`              | /admin returning 404                                                |
| `17-survey-landing.png`         | Survey landing page                                                 |
| `18-survey-start.png`           | Survey Step 1 — Date personale form                                 |
| `19-admin-login-redirect.png`   | /admin/login redirecting to /admin/survey                           |
| `20-admin-global.png`           | /admin/primariata Global Admin dashboard                            |
| `21-mobile-dashboard.png`       | Dashboard in 375x812 mobile viewport                                |
| `22-mobile-menu-open.png`       | Mobile hamburger menu open                                          |
| `23-dashboard-scrolled.png`     | Dashboard scrolled showing widgets and notification banner          |
| `24-admin-primarii.png`         | Admin primarii list with 5 entries                                  |

---

## Feature Completeness Assessment

### Fully Implemented & Working

- Authentication (Google OAuth via Supabase)
- Dashboard with all major widgets
- Cereri list with filtering, sorting, pagination
- Cerere detail view
- Cerere wizard (4-step flow, at least Steps 1-2 verified)
- Plăți list
- Notificări with real-time Supabase subscription
- Mark notification as read (real-time badge update)
- Setări — profile & dashboard preferences UI
- User menu (functional, visual bug)
- Admin — Survey Dashboard analytics
- Admin — Global Admin dashboard
- Admin — Primarii list
- Survey landing page
- Survey wizard Step 1 (date personale)
- Mobile responsive layout with hamburger menu
- Dark theme (light mode toggle available but not tested fully)
- Weather widget (8°C, Alba)
- Sidebar with notification badge
- Gamification widget
- Sidebar collapse (Toggle sidebar button)

### Partially Implemented

- Dashboard search (cereri results appear to work, plăți endpoint 404)
- Location change (functional but UX is poor — redirects to landing)
- Cerere wizard Steps 3-4 (not tested)
- Setări — Notificări, Securitate, Aspect tabs (not verified)
- Admin — Admins list (/admin/primariata/admins — not tested)

### Not Implemented / Broken

- Documente page (404)
- /cereri/new route (500 error — should use /cereri/wizard)
- /admin direct URL (404)
- /admin/settings (404)
- Admin "Adaugă Primărie" feature (disabled)
- Admin "Setări Admin" link (dead)
- Pay now action from payments list

---

## Recommendations (Priority Order)

### P0 — Fix Immediately

1. Create or fix `/app/alba/alba-iulia-ab/documente` page — currently 404, all users hitting dead link
2. Fix `/api/cereri/new` 500 error — or redirect Dashboard "Cerere Nouă" to `/cereri/wizard`
3. Create `/admin/settings` page or remove the sidebar link

### P1 — Fix Soon

4. Fix User menu dropdown CSS positioning (overflow/z-index issue)
5. Fix status badge to show localized string ("În verificare") not raw enum ("in_verificare")
6. Fix map widget to show correct location (Alba Iulia, not Bucharest)
7. Fix "Documente Recente" widget to actually load documents

### P2 — UX Improvements

8. Improve location change UX — consider inline modal picker instead of full redirect
9. Add "pay now" action for pending payments in the payments list
10. Fix gamification points inconsistency between mobile and desktop
11. Add /admin redirect to /admin/login or /admin/survey
12. Suppress RSC prefetch error for /documente (fix the page or add a placeholder)

---

_Document generated by automated E2E testing with Playwright MCP on 2026-03-02_
