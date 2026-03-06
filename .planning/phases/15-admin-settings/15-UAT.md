---
status: diagnosed
phase: 15-admin-settings
source: 15-01-SUMMARY.md, 15-02-SUMMARY.md
started: 2026-03-06T08:30:00Z
updated: 2026-03-06T08:40:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Settings Page Load
expected: Navigate to /app/[judet]/[localitate]/admin/settings. Page loads with skeleton, then shows "Setari" heading with subtitle and 5 vertical tabs. Profil tab active by default.
result: pass

### 2. Tab Switching Speed
expected: Clicking between tabs switches instantly with smooth fade/slide animation. layoutId tab indicator slides smoothly. No loading delay.
result: issue
reported: "Tab switching works but user reports it feels slow when loading between tabs. AnimatePresence mode='wait' causes visible delay because each tab unmounts/remounts. The exit animation blocks the enter animation, creating perceived lag."
severity: minor

### 3. Visual Match - Overall Layout
expected: Settings page matches Figma reference: dark card background for content, rounded inputs with subtle borders, gradient save buttons (pink-to-purple), tab indicator with gradient background, Settings icon in heading.
result: issue
reported: "Multiple visual mismatches vs Figma reference: (1) No Settings gear icon before 'Setari' heading - Figma has it, (2) Save buttons are solid pink instead of gradient pink-to-purple with icon, (3) Tab indicator uses accent color tint instead of gradient purple/pink tint from Figma, (4) Content area card has no visible border/background contrast in current vs Figma's subtle card, (5) Profile inputs lack inline icons (User, Mail, Phone, Building2) that Figma shows inside each input field"
severity: major

### 4. Profile Tab - Form Fields
expected: Profile tab shows: avatar with gradient background + camera hover overlay, fields with icons inside inputs, read-only institution field, gradient save button.
result: issue
reported: "Profile tab structural differences vs Figma: (1) Avatar is pink/red gradient instead of purple gradient, no camera hover overlay for avatar change, (2) Figma has single 'Nume complet' field in 2-col grid (Nume complet + Email row, Telefon + Institutie row). Current has Prenume/Nume as separate fields - different layout, (3) Input fields are plain without inline icons - Figma has User/Mail/Phone/Building2 icons inside each input, (4) Save button says 'Salveaza Profil' in plain pink vs Figma's gradient 'Salveaza' with Save icon"
severity: major

### 5. Primarie Config Tab
expected: Shows primarie config fields with toggles and gradient save button.
result: issue
reported: "Primarie tab has different field structure vs Figma: (1) Figma shows Nume Primarie, Judet, Localitate, CUI in 2x2 grid + 2 toggles (Aprobare Automata, Mod Mentenanta). Current shows Email, Telefon, Adresa, Program Lucru, CUI + 4 toggles (Mentenanta, Aprobare, Notificari Inregistrari, Notificari Cereri), (2) Current has no inline icons in inputs - Figma has Building2/MapPin/Database icons, (3) Toggle style differs - Figma uses custom animated spring toggles, current uses shadcn Switch, (4) No heading subtitle in current (Figma doesn't have one either for this tab, but the card/content styling differs)"
severity: major

### 6. Notifications Tab - Channel Matrix
expected: Shows notification channels with master toggles and sub-categories. Disabling master toggle disables sub-categories.
result: pass

### 7. Security Tab - Password Change
expected: Shows 2FA status and password change form with 3 fields.
result: pass

### 8. Appearance Tab - Accent Color Picker
expected: Shows preset color circles, instant preview, theme toggle, language placeholder.
result: issue
reported: "Appearance tab has differences vs Figma: (1) Figma shows 7 color circles without labels in a single row. Current shows 10 circles WITH labels in a 5x2 grid - much larger visual footprint, (2) Figma does NOT have a theme toggle or language section in Aspect tab. Current adds Tema (dark/light switch) and Limba (Coming soon) sections that don't exist in Figma, (3) Figma color circles are smaller and inline. Current circles are large with text labels below"
severity: minor

### 9. URL Tab Persistence
expected: Tab selection persists in URL (?tab=xxx) and survives page refresh.
result: pass

### 10. Mobile Responsive Tabs
expected: On mobile (<1024px), tabs display as horizontal scrollable strip with content stacked below.
result: pass

## Summary

total: 10
passed: 5
issues: 5
pending: 0
skipped: 0

## Gaps

- truth: "Tab switching should feel instant with no perceived delay"
  status: failed
  reason: "User reported: Tab switching works but feels slow. AnimatePresence mode='wait' causes visible delay because exit animation blocks enter animation."
  severity: minor
  test: 2
  root_cause: "AnimatePresence mode='wait' in admin-settings-tabs.tsx:133 blocks new tab render until exit animation finishes (200ms exit + 200ms enter = 400ms perceived lag)"
  artifacts:
    - path: "src/components/admin/settings/admin-settings-tabs.tsx"
      issue: "AnimatePresence mode='wait' creates sequential exit->enter delay"
  missing:
    - "Change to mode='popLayout' or remove exit animation and use crossfade instead"

- truth: "Settings page visual treatment should closely match Figma reference"
  status: failed
  reason: "User reported: No Settings icon in heading, solid pink save buttons instead of gradient, no card border/background contrast, no inline icons in inputs, tab indicator color differs"
  severity: major
  test: 3
  root_cause: "Settings page (page.tsx) and tab layout (admin-settings-tabs.tsx) were built with shadcn defaults instead of matching Figma SetariPage.tsx reference design. Missing: Settings icon in h1, gradient button styling, Figma-style card border, input icons."
  artifacts:
    - path: "src/app/app/[judet]/[localitate]/admin/settings/page.tsx"
      issue: "Heading missing Settings icon, no gradient treatment"
    - path: "src/components/admin/settings/admin-settings-tabs.tsx"
      issue: "Tab indicator uses accent tint instead of Figma gradient purple/pink"
  missing:
    - "Add Settings icon before heading text"
    - "Use gradient pink-to-purple button style with Save icon across all tabs"
    - "Add subtle card background rgba(255,255,255,0.025) with border rgba(255,255,255,0.05)"

- truth: "Profile tab should match Figma layout with avatar overlay, inline icons, gradient button"
  status: failed
  reason: "User reported: Pink avatar instead of purple gradient, no camera overlay, separate Prenume/Nume instead of single 'Nume complet', plain inputs without inline icons, plain pink button"
  severity: major
  test: 4
  root_cause: "profile-tab.tsx was built with separate Prenume/Nume fields and plain shadcn Input components. Figma reference has: purple gradient avatar with Camera hover, single Nume complet field, 2x2 grid (Nume+Email, Telefon+Institutie), each input with inline icon, gradient Save button with Save icon."
  artifacts:
    - path: "src/components/admin/settings/profile-tab.tsx"
      issue: "Layout differs from Figma (separate Prenume/Nume, no input icons, no camera overlay)"
  missing:
    - "Rewrite profile form to match Figma 2x2 grid: Nume complet + Email, Telefon + Institutie (readonly)"
    - "Add inline icons inside inputs (User, Mail, Phone, Building2)"
    - "Purple gradient avatar with Camera hover overlay"
    - "Gradient save button with Save icon"

- truth: "Primarie tab should match Figma field layout and styling"
  status: failed
  reason: "User reported: Different fields (Email/Telefon/Adresa/Program vs Nume/Judet/Localitate/CUI), no inline icons, shadcn Switch instead of custom toggles, 4 toggles instead of 2"
  severity: major
  test: 5
  root_cause: "primarie-tab.tsx was built with operational fields (email, telefon, adresa, program_lucru) + 4 config toggles. Figma reference shows simpler layout: Nume Primarie, Judet, Localitate, CUI in 2x2 grid + only 2 toggles (Aprobare Automata, Mod Mentenanta) with icons. Current has extra fields from the data model that aren't in the Figma design. Need to keep the extra fields for functionality but reorganize to match Figma visual hierarchy."
  artifacts:
    - path: "src/components/admin/settings/primarie-tab.tsx"
      issue: "Field layout and toggle count don't match Figma reference"
  missing:
    - "Reorganize into 2 sections: Figma-matching top grid (Nume, Judet, Localitate, CUI) with icons + bottom section for operational fields (Email, Telefon, Adresa, Program)"
    - "Add inline icons (Building2, MapPin, MapPin, Database)"
    - "Use animated toggle style matching Figma"

- truth: "Appearance tab should match Figma color picker layout"
  status: failed
  reason: "User reported: 10 colors with labels in grid vs Figma's 7 circles in a row without labels, extra Tema and Limba sections not in Figma"
  severity: minor
  test: 8
  root_cause: "appearance-tab.tsx has 10 presets with labels in a 5x2 grid, plus extra Tema and Limba sections. Figma has 7 colors in a single inline row without labels. The extra sections (Tema/Limba) are fine as additions beyond Figma scope. The color picker layout just needs visual adjustment."
  artifacts:
    - path: "src/components/admin/settings/appearance-tab.tsx"
      issue: "Color circles layout doesn't match Figma (too many, has labels, grid vs inline row)"
  missing:
    - "Display color circles in a single flex row (or wrapping row) without labels below"
    - "Keep 10 presets but make circles smaller and inline like Figma"
    - "Keep Tema and Limba sections (they're useful additions)"
