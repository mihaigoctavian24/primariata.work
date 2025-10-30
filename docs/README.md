# 📚 Documentație Oficială - Primăriata

**Versiune**: 1.0
**Limba**: Română (Documentație Oficială)
**Status**: În dezvoltare

---

## 🎯 Scop

Acest director conține **documentația oficială în limba română** destinată:

- 🎓 **Profesorilor** - evaluare proiect universitar
- 📋 **Comisiei** - prezentare tehnică și demonstrație
- 🏛️ **Stakeholderilor** - primării, utilizatori finali
- 📖 **Documentație publică** - pentru prezentare și promovare

---

## 📂 Structura Documentației

```
docs/
├── 01-Prezentare/              # 📄 Prezentare generală proiect
│   ├── README.md               # Overview și introducere
│   ├── Viziune-Misiune.md      # Viziunea și misiunea proiectului
│   ├── Obiective.md            # Obiective principale și secundare
│   └── Public-Tinta.md         # Utilizatori și beneficiari
│
├── 02-Cerinte/                 # 📋 Specificații și cerințe
│   ├── Cerinte-Functionale.md  # Funcționalități principale
│   ├── Cerinte-Nefunctionale.md # Performance, securitate, accesibilitate
│   ├── Cazuri-Utilizare.md     # Scenarii de utilizare detaliate
│   └── Persoane-Utilizator.md  # Persona-uri (Cetățean, Funcționar, Admin)
│
├── 03-Arhitectura/             # 🏗️ Design și arhitectură sistem
│   ├── Arhitectura-Generala.md # Diagrame și overview tehnic
│   ├── Baza-Date.md            # Schema bazei de date
│   ├── API-Endpoints.md        # Documentare API
│   ├── Securitate.md           # Măsuri de securitate
│   └── Diagrame/               # Folder pentru diagrame (.png, .svg)
│
├── 04-Implementare/            # 💻 Detalii implementare
│   ├── Tehnologii.md           # Stack tehnologic utilizat
│   ├── Configurare-Mediu.md    # Setup development environment
│   ├── Ghid-Dezvoltare.md      # Workflow și best practices
│   └── Testare.md              # Strategie de testare
│
├── 05-Utilizare/               # 📖 Ghiduri utilizator
│   ├── Ghid-Cetatean.md        # Cum folosesc cetățenii platforma
│   ├── Ghid-Functionar.md      # Cum folosesc funcționarii
│   ├── Ghid-Administrator.md   # Admin/super-admin features
│   └── FAQ.md                  # Întrebări frecvente
│
└── 06-Anexe/                   # 📎 Materiale suplimentare
    ├── Glossar.md              # Termeni și definiții
    ├── Referinte.md            # Bibliografie și surse
    ├── Contributori.md         # Echipa și contribuitori
    └── Licenta.md              # Informații licență
```

---

## 🔄 Relația cu `.docs/`

### `.docs/` (EN - Technical, gitignored)

**Scop**: Documentație tehnică detaliată pentru dezvoltatori

- 🇬🇧 **Limba**: Engleză
- 🛠️ **Public**: Dezvoltatori, DevOps, QA
- 📊 **Nivel**: Tehnic avansat (PRD, API specs, DB schemas)
- 🚫 **Git**: Ignorat (`.gitignore`)
- 📁 **Conținut**: 804KB, 19 fișiere tehnice detaliate

### `docs/` (RO - Official, committed)

**Scop**: Documentație oficială pentru prezentare și evaluare

- 🇷🇴 **Limba**: Română
- 🎓 **Public**: Profesori, comisie, stakeholderi
- 📖 **Nivel**: Comprehensibil, prezentare
- ✅ **Git**: Commitată (documentație oficială)
- 📄 **Conținut**: Prezentare, cerințe, arhitectură, ghiduri utilizare

---

## 📝 Standarde Documentație

### Format

- ✅ **Markdown** (.md) pentru ușurință în editare și versioning
- ✅ **Diagrame**: Export ca PNG/SVG în `03-Arhitectura/Diagrame/`
- ✅ **Screenshots**: Incluse în ghidurile de utilizare

### Stil

- ✅ **Limbaj formal** dar accesibil
- ✅ **Structură clară** cu headings și liste
- ✅ **Exemple concrete** și capturi de ecran
- ✅ **Emoji subtile** pentru navigare ușoară (📄, 🎯, ⚠️)

### Versioning

- ✅ Toate documentele au **Versiune** și **Dată actualizare**
- ✅ Changelog inclus pentru modificări majore
- ✅ Commituri clare: `docs(ro): actualizare Cerinte-Functionale.md`

---

## 🎯 Prioritizare Documentare

### Phase 0-1 (Săptămâni 1-6)

**Prioritate**: 🔴 CRITICAL

- [ ] `01-Prezentare/README.md` - Introducere proiect
- [ ] `01-Prezentare/Obiective.md` - Obiective clare
- [ ] `02-Cerinte/Cerinte-Functionale.md` - Ce face aplicația
- [ ] `03-Arhitectura/Arhitectura-Generala.md` - Overview tehnic

### Phase 2 (Săptămâni 7-12)

**Prioritate**: 🟡 HIGH

- [ ] `02-Cerinte/Cazuri-Utilizare.md` - Scenarii detaliate
- [ ] `03-Arhitectura/Baza-Date.md` - Schema DB
- [ ] `04-Implementare/Tehnologii.md` - Stack tehnologic

### Phase 3-5 (Săptămâni 13-24)

**Prioritate**: 🟢 MEDIUM

- [ ] `05-Utilizare/Ghid-*.md` - Ghiduri complete utilizatori
- [ ] `06-Anexe/Glossar.md` - Termeni tehnici
- [ ] Toate diagramele în `03-Arhitectura/Diagrame/`

---

## 🛠️ Cum Contribui

### 1. Creează/Editează Document

```bash
cd docs/02-Cerinte
nano Cerinte-Functionale.md
```

### 2. Folosește Template

```markdown
# Titlu Document

**Versiune**: 1.0
**Data**: 2025-01-17
**Autor**: [Nume]

---

## Scop

[Scurtă descriere a scopului documentului]

## Conținut

[Conținut principal]

---

**Referințe**:

- Link către alte documente
- Surse externe
```

### 3. Commit Changes

```bash
git add docs/
git commit -m "docs(ro): adaugă Cerinte-Functionale.md"
git push origin develop
```

---

## 📊 Status Documentare (Actualizat: 30 octombrie 2025)

| Categorie           | Status      | Completare | Prioritate | Notes                                            |
| ------------------- | ----------- | ---------- | ---------- | ------------------------------------------------ |
| **01-Prezentare**   | ✅ COMPLETE | 100% (6/6) | CRITICAL   | ✅ Toate documentele create și actualizate       |
| **02-Cerinte**      | ✅ COMPLETE | 100% (5/5) | CRITICAL   | ✅ Funcționale, nefuncționale, cazuri            |
| **03-Arhitectura**  | ✅ COMPLETE | 100% (6/6) | HIGH       | ✅ Generală, DB, API, Componente, Securitate     |
| **04-Implementare** | 🟡 PARȚIAL  | 25% (1/4)  | MEDIUM     | ✅ Stack-Tehnologic.md creat (30 oct 2025)       |
| **05-Utilizare**    | 🔴 TODO     | 0% (0/4)   | HIGH       | 🎯 M6 - Ghiduri Cetățean, Funcționar, Admin, FAQ |
| **06-Anexe**        | 🔴 TODO     | 0% (0/4)   | LOW        | 🎯 M6 - Glossar, Referințe, Contributori         |

**Progress general**: 18/25 documente (72%) | **M6 Deadline**: 29 noiembrie 2025

**Completate** (October 2025):

- ✅ **01-Prezentare**: 6 documente (Viziune, Obiective, Context, Echipa, Status)
- ✅ **02-Cerinte**: 5 documente (Funcționale, Nefuncționale, Cazuri, Persoane, User Stories)
- ✅ **03-Arhitectura**: 6 documente (Generală, DB, API, Componente, Securitate, Deployment)
- ✅ **04-Implementare**: Stack-Tehnologic.md (500+ linii, 10 secțiuni, monitoring & logging)

**În lucru** (M6 Documentation - November 2025):

- 🔴 **04-Implementare**: 3 documente rămase (Setup, Workflow, Testare)
- 🔴 **05-Utilizare**: 4 ghiduri (Cetățean, Funcționar, Admin, FAQ)
- 🔴 **06-Anexe**: 4 documente (Glossar, Referințe, Contributori, Licență)

**Target**: 100% completare pentru prezentare finală (29 noiembrie 2025)

---

## 🎓 Pentru Profesori și Comisie

### Documente Principale (Must Read)

1. **[01-Prezentare/README.md]** - Ce este Primăriata (5 min)
2. **[02-Cerinte/Cerinte-Functionale.md]** - Ce face aplicația (10 min)
3. **[03-Arhitectura/Arhitectura-Generala.md]** - Cum funcționează tehnic (15 min)

### Demo și Prezentare

- 🎥 **Video Demo**: Link către prezentare video
- 💻 **Live Demo**: https://primariata.work (când va fi live)
- 📊 **Prezentare PPT**: Link către slides

---

## 📧 Contact

**Pentru întrebări despre documentație**:

- 📧 Email to:

To: **Bianca-Maria Abbasi Pazeyazd** - [abbasipazeyazd.h.biancamaria24@stud.rau.ro](mailto:abbasipazeyazd.h.biancamaria24@stud.rau.ro)

Cc:**Octavian Mihai** - [mihai.g.octavian24@stud.rau.ro](mailto:mihai.g.octavian24@stud.rau.ro)

Subject: **Q:Docs - Primaria ta ❤️**

- 💬 GitHub Issues: Tag cu `documentation`
- 👥 Echipa: Bubu & Dudu Dev Team

---

<div align="center">

**Documentație Oficială Primăriata**

Proiect Universitar "Primaria ta ❤️" © 2025

`Made with ❤️ by Bubu & Dudu Dev Team`

</div>
