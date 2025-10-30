# 📚 Documentation Index - Primăriata

**Ghid complet pentru navigarea documentației proiectului**

---

## 🗂️ Două Tipuri de Documentație

Proiectul Primăriata are **două seturi de documentație** cu scopuri diferite:

---

## 1. 🇷🇴 `docs/` - Documentație Oficială (Română)

**📍 Locație**: `/docs/`
**🌍 Limba**: Română
**👥 Public țintă**: Profesori, comisie evaluare, stakeholderi, utilizatori finali
**🎯 Scop**: Prezentare oficială, evaluare universitară, documentație publică

### Structură

```
docs/
├── 01-Prezentare/              → Viziune, misiune, obiective
├── 02-Cerinte/                 → Specificații funcționale/nefuncționale
├── 03-Arhitectura/             → Design sistem, diagrame
├── 04-Implementare/            → Tehnologii, ghid dezvoltare
├── 05-Utilizare/               → Ghiduri utilizatori (cetățean, funcționar, admin)
└── 06-Anexe/                   → Glossar, referințe, contribuitori
```

### Când folosești această documentație?

✅ **Pentru prezentare proiect** (profesori, comisie)
✅ **Pentru onboarding stakeholderi** (primării, utilizatori)
✅ **Pentru documentație oficială** (livrabilă, evaluare)
✅ **Pentru ghiduri utilizare** (cetățeni, funcționari)

**Link**: [docs/README.md](docs/README.md)

---

## 2. 🇬🇧 `.docs/` - Technical Documentation (English)

**📍 Locație**: `/.docs/` (gitignored)
**🌍 Limba**: Engleză
**👥 Public țintă**: Dezvoltatori, DevOps, QA Engineers
**🎯 Scop**: Implementare tehnică, development workflow

### Structură

```
.docs/
├── 01-requirements/            → PRD, business case, analysis
├── 02-technical-specs/         → DB schema, API contracts, infrastructure
├── 03-implementation/          → Roadmap Phase 0-5, task breakdown
├── 04-mock-services/           → Development mocks (certSIGN, Ghișeul.ro)
└── 05-quality/                 → Testing strategy, performance, error handling
```

**⚠️ Notă**: `.docs/` este **gitignored** - documentație working tehnică

### Când folosești această documentație?

✅ **Pentru development** (implementare features)
✅ **Pentru setup infrastructure** (Supabase, Vercel, Cloudflare)
✅ **Pentru understanding architecture** (database, API, security)
✅ **Pentru task planning** (Phase 0-5 roadmap)

**Link**: `.docs/` (local only, not committed)

---

## 🔄 Fluxul Documentației

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  .docs/ (EN - Technical)                                │
│  └─ Source of Truth pentru development                 │
│     • PRD detaliat (150KB)                              │
│     • Technical specs (180KB)                           │
│     • Implementation roadmap (47KB)                     │
│     • Quality standards (154KB)                         │
│                                                         │
│              ↓ Extract & Translate ↓                    │
│                                                         │
│  docs/ (RO - Official)                          │
│  └─ Documentație prezentare și evaluare                │
│     • Prezentare generală (accesibilă)                  │
│     • Cerințe funcționale (română)                     │
│     • Arhitectură (diagrame vizuale)                   │
│     • Ghiduri utilizare (pas cu pas)                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Proces**:

1. 📝 **Scrii** în `.docs/` (EN) - documentație tehnică work-in-progress
2. 🔄 **Extrage** concepte principale
3. 🇷🇴 **Traduci** și **simplifici** în `docs/` (RO)
4. ✅ **Commit** doar `docs/` în Git

---

## 📖 Quick Navigation

### Pentru Dezvoltatori

1. **Start aici**: [README.md](README.md) - Project overview
2. **Setup**: [GETTING_STARTED.md](GETTING_STARTED.md) - Quick start în 5 min
3. **Technical docs**: `.docs/02-technical-specs/` - Database, API, Infrastructure
4. **Roadmap**: `.docs/03-implementation/IMPLEMENTATION_ROADMAP.md` - Phase 0-5 tasks

### Pentru Profesori/Comisie

1. **Start aici**: [docs/README.md](docs/README.md) - Index documentație oficială
2. **Prezentare**: `docs/01-Prezentare/` - Viziune, obiective
3. **Cerințe**: `docs/02-Cerinte/` - Specificații funcționale
4. **Arhitectură**: `docs/03-Arhitectura/` - Design și diagrame

### Pentru Utilizatori Finali

1. **Ghid cetățean**: `docs/05-Utilizare/Ghid-Cetatean.md`
2. **Ghid funcționar**: `docs/05-Utilizare/Ghid-Functionar.md`
3. **FAQ**: `docs/05-Utilizare/FAQ.md`

---

## 🎯 Best Practices

### Când creezi documentație nouă:

#### Pentru implementare tehnică → `.docs/`

- ✅ Scrie în **engleză**
- ✅ Include detalii tehnice (code snippets, SQL, configs)
- ✅ Format Markdown cu syntax highlighting
- ✅ **Nu commit** în Git (gitignored)

**Exemplu**: `.docs/02-technical-specs/TECH_SPEC_NewFeature.md`

#### Pentru prezentare oficială → `docs/`

- ✅ Scrie în **română**
- ✅ Limbaj accesibil, explică termeni tehnici
- ✅ Include diagrame vizuale și screenshots
- ✅ **Commit** în Git (documentație oficială)

**Exemplu**: `docs/02-Cerinte/Feature-Nou.md`

---

## 📊 Status Overview (Actualizat: 30 octombrie 2025)

| Documentație             | Limba | Status      | Completare      | Git           |
| ------------------------ | ----- | ----------- | --------------- | ------------- |
| **README.md**            | 🇷🇴    | ✅ Complete | 100%            | ✅ Committed  |
| **ARCHITECTURE.md**      | 🇬🇧    | ✅ Complete | 100%            | ✅ Committed  |
| **CONTRIBUTING.md**      | 🇬🇧    | ✅ Complete | 100%            | ✅ Committed  |
| **DEVELOPMENT_GUIDE.md** | 🇬🇧    | ✅ Complete | 100%            | ✅ Committed  |
| **.docs/**               | 🇬🇧    | ✅ Complete | 100% (29 files) | ❌ Gitignored |
| **docs/**                | 🇷🇴    | 🟡 Parțial  | 50% (21 files)  | ✅ Committed  |

### Detalii docs/ (RO)

| Secțiune            | Status       | Progress         | Deadline    |
| ------------------- | ------------ | ---------------- | ----------- |
| **01-Prezentare**   | ✅ Complete  | 100% (6/6 files) | ✅ Done     |
| **02-Cerinte**      | ✅ Complete  | 100% (5/5 files) | ✅ Done     |
| **03-Arhitectura**  | ✅ Complete  | 100% (6/6 files) | ✅ Done     |
| **04-Implementare** | 🔴 Incomplet | 10% (1/4 files)  | 29 Nov 2025 |
| **05-Utilizare**    | 🔴 Incomplet | 10% (1/4 files)  | 29 Nov 2025 |
| **06-Anexe**        | 🔴 Incomplet | 10% (1/4 files)  | 29 Nov 2025 |

**Next Priority**: M6 Documentation (22 issues) - Secțiunile 04-06 până la 29 noiembrie 2025

---

## 📈 Metrici și Statistici

### Documentație Tehnică (.docs/)

- **Volum total**: 1.2MB, 29 fișiere
- **Coverage**: 100% componente majore
- **Up-to-date**: 95% match cu codebase
- **Status**: ✅ Comprehensivă și actualizată

**Highlights**:

- PRD Complete (150KB) - Specificații detaliate business
- Technical Specs - Database, API, Security, Infrastructure
- Implementation Roadmap - Phase 0-5 cu task breakdown
- Quality Standards - Testing, Performance, Error Handling
- Deployment Guides - CI/CD, Monitoring, Cloudflare

### Documentație Oficială (docs/)

- **Volum total**: 376KB, 21 fișiere, 11,626 linii
- **Completitudine**: 50% (secțiuni 01-03: 100%, secțiuni 04-06: 10%)
- **Corelație cu .docs/**: 90%
- **Status**: 🟡 În dezvoltare (M6 Documentation)

**Realizări**:

- ✅ Secțiuni 01-03 complete (Prezentare, Cerințe, Arhitectură)
- ✅ An universitar 2025-2026 actualizat
- ✅ Roluri echipă refactorizate
- ✅ Status corelat cu GitHub

**Rămase (M6 - Deadline 29 Nov 2025)**:

- 🔴 04-Implementare: 3 documente (Stack, Setup, Workflow, Testing)
- 🔴 05-Utilizare: 3 ghiduri (Cetățean, Funcționar, Admin, FAQ)
- 🔴 06-Anexe: 4 documente (Glossar, Referințe, Contributori, Licență)

### Codebase vs Documentație

| Aspect                      | Match % | Status               |
| --------------------------- | ------- | -------------------- |
| **Specs vs Implementation** | 95%     | ✅ Excellent         |
| **Database Schema**         | 100%    | ✅ Perfect           |
| **API Endpoints**           | 80%     | 🟡 Good              |
| **Components**              | 95%     | ✅ Excellent         |
| **Testing Coverage Docs**   | 60%     | 🟡 Needs improvement |

---

## 🛠️ Maintenance

### Actualizare documentație

**Când schimbi ceva tehnic** (database, API, feature):

1. ✅ Actualizează `.docs/` (technical specs)
2. ✅ Verifică dacă impactează `docs/` (oficial)
3. ✅ Actualizează `docs/` dacă e relevant pentru utilizatori

**Commit Convention**:

```bash
# Pentru documentație tehnică (dacă ar fi commitată)
git commit -m "docs(en): update database schema specs"

# Pentru documentație oficială
git commit -m "docs(ro): actualizare cerințe funcționale"
```

---

## 📧 Contact & Questions

**Întrebări despre structura documentației?**

- 💬 Creează issue cu tag `documentation`

- 📧 Email to:

To: **Bianca-Maria Abbasi Pazeyazd** - [abbasipazeyazd.h.biancamaria24@stud.rau.ro](mailto:abbasipazeyazd.h.biancamaria24@stud.rau.ro)

Cc:**Octavian Mihai** - [mihai.g.octavian24@stud.rau.ro](mailto:mihai.g.octavian24@stud.rau.ro)

Subject: **Q:Docs - Primaria ta ❤️**

- 👥 Echipa: Bubu & Dudu Dev Team

---

## 🎓 Pentru Evaluare Universitară

**Profesori și comisie de evaluare**, vă rugăm să consultați:

1. 📄 **[docs/README.md](docs/README.md)** - Index documentație oficială
2. 📋 **docs/01-Prezentare/** - Prezentare generală proiect
3. 🏗️ **docs/03-Arhitectura/** - Design și arhitectură tehnică
4. 💻 **Live Demo**: [https://primariata.work](https://primariata.work) (când va fi disponibil)

---

<div align="center">

**Documentation Index**

Navigare ușoară prin documentația Primăriata

[🇷🇴 Documentație Oficială](docs/) • [🇬🇧 Technical Docs](.docs/) • [📖 README](README.md) • [🚀 Getting Started](GETTING_STARTED.md)

`Made with ❤️ by Bubu & Dudu Dev Team`

</div>
