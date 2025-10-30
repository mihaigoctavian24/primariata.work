# 📖 05 - Ghiduri Utilizare

**Versiune**: 1.0
**Data actualizare**: 30 octombrie 2025 (An universitar 2025-2026)
**Status**: În dezvoltare (prioritate M6 - Documentation)

---

## 📋 Cuprins

Această secțiune conține ghiduri practice pentru utilizatorii platformei **primariaTa❤️\_** - cetățeni, funcționari, și administratori.

---

## 👥 Ghiduri Disponibile

### 1. 👤 Ghid Cetățean (`Ghid-Cetatean.md`)

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

### 2. 🏛️ Ghid Funcționar (`Ghid-Functionar.md`)

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

### 3. 👨‍💼 Ghid Administrator (`Ghid-Administrator.md`)

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

### 4. ❓ FAQ General (`FAQ.md`)

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
- ✅ Export date (CSV, JSON, XLSX, PDF)

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

**Status**: 0/4 documente (0%)

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
