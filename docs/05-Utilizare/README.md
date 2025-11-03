# 📖 05 - Ghiduri Utilizare

**Versiune**: 1.0
**Data actualizare**: 30 octombrie 2025 (An universitar 2025-2026)
**Status**: În dezvoltare (prioritate M6 - Documentation)

---

## 📋 Cuprins

Această secțiune conține ghiduri practice pentru utilizatorii platformei **primariaTa❤️\_** - cetățeni, funcționari, și administratori.

---

## 👥 Ghiduri Disponibile

### 1. 📊 Research Dashboard - Ghid Utilizare (`Research-Dashboard.md`)

**Status**: ✅ COMPLET (creat 2 noiembrie 2025)

**Public țintă**: Administratori și funcționari cu rol de **admin** sau **super_admin** care:

- Analizează răspunsurile la chestionare
- Generează insight-uri AI pentru cercetare
- Exportă rapoarte și date
- Monitorizează real-time răspunsurile cetățenilor

**Conținut disponibil:**

#### A. Prezentare Generală
- ✅ Ce este Research Dashboard?
- ✅ Cerințe acces (rol admin/super_admin)
- ✅ Navigare la dashboard (`/admin/survey/research`)
- ✅ Status real-time connection
- ✅ Data validity badges

#### B. Taburi Dashboard (7 taburi complete)
1. **Prezentare Generală**: Summary statistics, AI key findings, sentiment gauge
2. **Insight-uri AI**: Theme cloud, feature priority matrix, AI recommendations
3. **Insight-uri Holistice**: Cross-question analysis, executive summary
4. **Analiză pe Întrebări**: Detailed per-question analysis (Citizens + Officials)
5. **Corelări**: Statistical correlations (Pearson), significance testing
6. **Cohorte**: Age/Location/Usage cohort analysis și comparisons
7. **Demografice**: County distribution, top 10 localities
8. **Export**: PDF, Excel, CSV, JSON exports

#### C. Funcționalități Avansate
- ✅ Real-time Updates: Auto-refresh la răspunsuri noi (2s debouncing)
- ✅ Export Multi-Format:
  - PDF Executive Report (stakeholder presentations)
  - Excel Raw Data (5 worksheets, complete analysis)
  - CSV Simple Export (UTF-8 BOM compatibility)
  - JSON Structured Data (API integrations)
- ✅ Correlation Analysis: Pearson coefficients, p-values, AI interpretations
- ✅ Cohort Analysis: Age, Location, Usage segments with comparisons

#### D. Troubleshooting
- ✅ Missing AI insights (auto-trigger analysis)
- ✅ Empty charts (data validation)
- ✅ Export failures (network/size issues)
- ✅ Real-time updates not working (WebSocket troubleshooting)
- ✅ Slow page load (performance optimization)

#### E. Best Practices
- ✅ Data interpretation (sample size validation)
- ✅ Export usage (format selection guide)
- ✅ Decision-making (ROI prioritization)
- ✅ Keyboard shortcuts

**Link**: [Research-Dashboard.md](./Research-Dashboard.md) (11 secțiuni, 650+ linii)

**Documentație tehnică**: Vezi [docs/04-Implementare/Research-Analysis.md](../04-Implementare/Research-Analysis.md)

**API Reference**: Vezi `.docs/02-technical-specs/research-analysis-api.md`

---

### 2. 👤 Ghid Cetățean (`Ghid-Cetatean.md`)

**Status**: În pregătire (issue #119 - HIGH priority)

**Public țintă**: Cetățeni care folosesc platforma pentru:

- Depunere cereri administrative (stare civilă, urbanism, taxe)
- Tracking status cereri
- Descărcare documente
- Comunicare cu funcționarii primăriei

**Conținut planificat:**

#### A. Introducere

- Ce este primariaTa.work?
- Beneficii utilizare platformă vs fizic
- Cerințe sistem (browser, internet, semnătură digitală)

#### B. Primul Pas: Înregistrare

1. **Creeare cont nou**
   - Înregistrare cu email + parolă
   - SAU: Sign in cu Google (one-click)
   - Verificare email (link confirmare)

2. **Selectare locație**
   - Alegere județ din dropdown
   - Alegere localitate (comună/oraș)
   - Salvare preferințe

3. **Completare profil**
   - Date personale (nume, CNP, adresă)
   - Documente identitate (CI/BI upload)
   - Avatar profil (optional)

#### C. Depunere Cereri (M2 - în dezvoltare)

1. **Tipuri cereri disponibile**
   - Certificate stare civilă (naștere, căsătorie, deces)
   - Certificate urbanism
   - Autorizații construcție
   - Plată taxe și impozite

2. **Proces depunere cerere**
   - Click "Cerere Nouă"
   - Selectare tip cerere
   - Completare formular multi-step
   - Upload documente necesare
   - Semnare digitală (certSIGN) - optional
   - Plată taxe (Ghișeul.ro)
   - Confirmare și submit

3. **Tracking cerere**
   - Dashboard "Cererile Mele"
   - Status în timp real: Draft → Submitted → In Review → Approved/Rejected
   - Notificări email + in-app
   - Descărcare documente aprobate

#### D. Întrebări Frecvente (FAQ)

- Cum resetez parola?
- Ce browsere sunt suportate?
- Cât durează procesarea unei cereri?
- Cum contactez primăria dacă am probleme?

---

### 3. 🏛️ Ghid Funcționar (`Ghid-Functionar.md`)

**Status**: În pregătire (issue #120 - HIGH priority)

**Public țintă**: Funcționari publici din primării care:

- Procesează cereri cetățeni
- Gestionează workflow aprobări
- Comunică cu cetățenii
- Generează rapoarte

**Conținut planificat:**

#### A. Acces și Autentificare

- Login cu cont funcționar (acces restricționat)
- Role și permisiuni (funcționar vs admin)
- Autentificare cu 2FA (securitate)

#### B. Dashboard Funcționar

1. **Overview cereri**
   - Cereri noi (pending review)
   - Cereri în procesare (assigned to me)
   - Cereri finalizate (approved/rejected)
   - Statistici zilnice/lunare

2. **Procesare cerere**
   - Deschidere detalii cerere
   - Verificare documente depuse
   - Request documente suplimentare (dacă lipsesc)
   - Aprobare sau respingere (cu motivație)
   - Generare document final (certificat, autorizație)
   - Notificare cetățean

3. **Comunicare cu cetățenii**
   - Messaging system integrat
   - Request clarificări
   - Send status updates

#### C. Generare Rapoarte (M4 - în dezvoltare)

- Rapoarte statistice (număr cereri, timpi procesare)
- Export date (CSV, PDF)
- Analytics (cele mai frecvente cereri, performanță)

---

### 4. 👨‍💼 Ghid Administrator (`Ghid-Administrator.md`)

**Status**: În pregătire (issue #121 - LOW priority)

**Public țintă**: Administratori primărie și super-admini platform care:

- Gestionează utilizatori și permisiuni
- Configurează tipuri cereri
- Monitorizează performanță sistem
- Gestionează setări primărie

**Conținut planificat:**

#### A. Dashboard Admin

1. **Statistici generale**
   - Total utilizatori (cetățeni + funcționari)
   - Total cereri (pending, approved, rejected)
   - Performance metrics (avg processing time)
   - Revenue (taxe colectate online)

2. **User Management**
   - Lista utilizatori (cu filtre și search)
   - Adăugare/editare/ștergere funcționari
   - Gestionare role și permisiuni
   - Suspendare/reactivare conturi

3. **Configurare Cereri**
   - Tipuri cereri disponibile per primărie
   - Workflow-uri aprobări (single vs multiple approvers)
   - Taxe asociate (prețuri, metode plată)
   - Documente necesare per tip cerere

#### B. Setări Primărie

- Personalizare logo și branding
- Date contact (telefon, email, program)
- Gestionare funcționari (assign department)
- Integrări (certSIGN, Ghișeul.ro)

#### C. Rapoarte și Analytics (M4)

- Dashboard analytics complet
- Export rapoarte lunare/trimestriale
- Transparență decisională (date publice)

---

### 5. ❓ FAQ General (`FAQ.md`)

**Status**: În pregătire (issue #122 - MEDIUM priority)

**Conținut planificat:**

#### Întrebări Generale

- Ce este primariaTa.work?
- Cine poate folosi platforma?
- Este sigură platforma?
- Costă ceva utilizarea?

#### Întrebări Tehnice

- Ce browsere sunt suportate?
- Funcționează pe mobil?
- Cum resetez parola?
- Cum contactez support-ul?

#### Întrebări Cereri

- Cât durează procesarea?
- Pot anula o cerere după depunere?
- Cum plătesc taxele online?
- Ce documente trebuie să upload?

#### Întrebări Securitate

- Cum sunt protejate datele mele?
- Ce este GDPR și cum vă conformați?
- Pot șterge contul meu?
- Cine are acces la datele mele?

---

## 📸 Screenshots și Video Tutorials

### Screenshots Planificate

- [ ] Homepage și înregistrare
- [ ] Dashboard cetățean
- [ ] Formular depunere cerere (multi-step)
- [ ] Dashboard funcționar
- [ ] Dashboard admin

### Video Tutorials (Optional - M6)

- [ ] Video demo utilizare cetățean (5 min)
- [ ] Video demo utilizare funcționar (10 min)
- [ ] Video prezentare platformă (3 min)

---

## 🚀 Features Documentate per Milestone

### M1: Landing & Auth (47.6% complete)

- ✅ Înregistrare email + Google OAuth
- ✅ Selectare locație (județ + localitate)
- 🔄 Password reset (în dezvoltare)
- 🔄 User profile (în dezvoltare)

### M7: Survey Platform (100% complete) ✅

- ✅ Chestionar multi-step (5 pași, 25+ întrebări)
- ✅ Dashboard admin cu analytics
- ✅ Research Analysis Dashboard (AI insights, 7 taburi)
- ✅ Export date (CSV, JSON, XLSX, PDF)
- ✅ Real-time updates (Supabase Realtime)

### M2: Cereri Module (0% - planned)

- ⏳ Depunere cereri (multi-step form)
- ⏳ Document upload
- ⏳ Tracking status
- ⏳ Notificări email

### M3: Integrations (0% - planned)

- ⏳ Semnătură digitală (certSIGN)
- ⏳ Plată taxe online (Ghișeul.ro)

---

## 📋 Checklist Documentație Utilizare (M6)

**Status**: 1/5 documente (20%)

- [x] **Research Dashboard** (✅ COMPLET - 2 Nov 2025)
  - [x] Secțiunea Overview + Features
  - [x] Walkthrough 7 taburi complete
  - [x] Export functionality (4 formats)
  - [x] Real-time updates documentation
  - [x] Troubleshooting guide
  - [x] Best practices
  - [x] Keyboard shortcuts

- [ ] **Ghid Cetățean** (#119 - HIGH)
  - [ ] Secțiunea Înregistrare
  - [ ] Secțiunea Depunere Cereri
  - [ ] Secțiunea Tracking
  - [ ] Screenshots (10+)

- [ ] **Ghid Funcționar** (#120 - HIGH)
  - [ ] Secțiunea Dashboard
  - [ ] Secțiunea Procesare Cereri
  - [ ] Secțiunea Rapoarte
  - [ ] Screenshots (15+)

- [ ] **Ghid Administrator** (#121 - LOW)
  - [ ] Secțiunea User Management
  - [ ] Secțiunea Configurare
  - [ ] Secțiunea Analytics
  - [ ] Screenshots (10+)

- [ ] **FAQ** (#122 - MEDIUM)
  - [ ] 30+ întrebări și răspunsuri
  - [ ] Organizare pe categorii
  - [ ] Search functionality

---

## 🎯 Prioritizare Documentare

**Deadline M6**: 29 noiembrie 2025

**Săptămâna 1 (1-7 Nov)**:

- Ghid Cetățean (focus pe features existente M1+M7)

**Săptămâna 2 (8-14 Nov)**:

- Ghid Funcționar (dashboard admin existent din M7)

**Săptămâna 3 (15-21 Nov)**:

- FAQ + Screenshots

**Săptămâna 4 (22-29 Nov)**:

- Ghid Administrator + review final

---

## 📖 Navigare

**Înapoi**: [← 04-Implementare](../04-Implementare/README.md) | **Urmează**: [06-Anexe →](../06-Anexe/README.md) | **Index**: [📚 Documentație](../README.md)

---

_Ghidurile practice vor fi actualizate pe măsură ce features sunt implementate (corelat cu milestones M1-M5)_

**Ultima actualizare**: 30 octombrie 2025 - planificare M6 Documentation
