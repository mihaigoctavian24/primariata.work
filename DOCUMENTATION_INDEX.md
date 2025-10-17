# 📚 Documentation Index - Primăriata

**Ghid complet pentru navigarea documentației proiectului**

---

## 🗂️ Două Tipuri de Documentație

Proiectul Primăriata are **două seturi de documentație** cu scopuri diferite:

---

## 1. 🇷🇴 `Documentatie/` - Documentație Oficială (Română)

**📍 Locație**: `/Documentatie/`
**🌍 Limba**: Română
**👥 Public țintă**: Profesori, comisie evaluare, stakeholderi, utilizatori finali
**🎯 Scop**: Prezentare oficială, evaluare universitară, documentație publică

### Structură

```
Documentatie/
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

**Link**: [Documentatie/README.md](Documentatie/README.md)

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
│  Documentatie/ (RO - Official)                          │
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
3. 🇷🇴 **Traduci** și **simplifici** în `Documentatie/` (RO)
4. ✅ **Commit** doar `Documentatie/` în Git

---

## 📖 Quick Navigation

### Pentru Dezvoltatori
1. **Start aici**: [README.md](README.md) - Project overview
2. **Setup**: [GETTING_STARTED.md](GETTING_STARTED.md) - Quick start în 5 min
3. **Technical docs**: `.docs/02-technical-specs/` - Database, API, Infrastructure
4. **Roadmap**: `.docs/03-implementation/IMPLEMENTATION_ROADMAP.md` - Phase 0-5 tasks

### Pentru Profesori/Comisie
1. **Start aici**: [Documentatie/README.md](Documentatie/README.md) - Index documentație oficială
2. **Prezentare**: `Documentatie/01-Prezentare/` - Viziune, obiective
3. **Cerințe**: `Documentatie/02-Cerinte/` - Specificații funcționale
4. **Arhitectură**: `Documentatie/03-Arhitectura/` - Design și diagrame

### Pentru Utilizatori Finali
1. **Ghid cetățean**: `Documentatie/05-Utilizare/Ghid-Cetatean.md`
2. **Ghid funcționar**: `Documentatie/05-Utilizare/Ghid-Functionar.md`
3. **FAQ**: `Documentatie/05-Utilizare/FAQ.md`

---

## 🎯 Best Practices

### Când creezi documentație nouă:

#### Pentru implementare tehnică → `.docs/`
- ✅ Scrie în **engleză**
- ✅ Include detalii tehnice (code snippets, SQL, configs)
- ✅ Format Markdown cu syntax highlighting
- ✅ **Nu commit** în Git (gitignored)

**Exemplu**: `.docs/02-technical-specs/TECH_SPEC_NewFeature.md`

#### Pentru prezentare oficială → `Documentatie/`
- ✅ Scrie în **română**
- ✅ Limbaj accesibil, explică termeni tehnici
- ✅ Include diagrame vizuale și screenshots
- ✅ **Commit** în Git (documentație oficială)

**Exemplu**: `Documentatie/02-Cerinte/Feature-Nou.md`

---

## 📊 Status Overview

| Documentație | Limba | Status | Completare | Git |
|--------------|-------|--------|------------|-----|
| **README.md** | 🇷🇴 | ✅ Complete | 100% | ✅ Committed |
| **GETTING_STARTED.md** | 🇷🇴 | ✅ Complete | 100% | ✅ Committed |
| **.docs/** | 🇬🇧 | ✅ Complete | 100% (804KB) | ❌ Gitignored |
| **Documentatie/** | 🇷🇴 | 🔴 TODO | 5% | ✅ Will commit |

**Next Priority**: Documentare `Documentatie/01-Prezentare/` și `02-Cerinte/`

---

## 🛠️ Maintenance

### Actualizare documentație

**Când schimbi ceva tehnic** (database, API, feature):
1. ✅ Actualizează `.docs/` (technical specs)
2. ✅ Verifică dacă impactează `Documentatie/` (oficial)
3. ✅ Actualizează `Documentatie/` dacă e relevant pentru utilizatori

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

1. 📄 **[Documentatie/README.md](Documentatie/README.md)** - Index documentație oficială
2. 📋 **Documentatie/01-Prezentare/** - Prezentare generală proiect
3. 🏗️ **Documentatie/03-Arhitectura/** - Design și arhitectură tehnică
4. 💻 **Live Demo**: [https://primariata.work](https://primariata.work) (când va fi disponibil)

---

<div align="center">

**Documentation Index**

Navigare ușoară prin documentația Primăriata

[🇷🇴 Documentație Oficială](Documentatie/) • [🇬🇧 Technical Docs](.docs/) • [📖 README](README.md) • [🚀 Getting Started](GETTING_STARTED.md)

`Made with ❤️ by Bubu & Dudu Dev Team`

</div>
