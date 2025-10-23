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
Documentatie/
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

### `Documentatie/` (RO - Official, committed)

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
cd Documentatie/02-Cerinte
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
git add Documentatie/
git commit -m "docs(ro): adaugă Cerinte-Functionale.md"
git push origin develop
```

---

## 📊 Status Documentare

| Categorie       | Status  | Completare | Prioritate | Notes                                 |
| --------------- | ------- | ---------- | ---------- | ------------------------------------- |
| 01-Prezentare   | 🔴 TODO | 0%         | CRITICAL   | Phase 1                               |
| 02-Cerinte      | 🔴 TODO | 0%         | CRITICAL   | Phase 1                               |
| 03-Arhitectura  | 🔴 TODO | 0%         | HIGH       | Phase 1-2                             |
| 04-Implementare | ✅ DONE | 100%       | MEDIUM     | ✅ Phase 0 Complete (EN docs in root) |
| 05-Utilizare    | 🔴 TODO | 0%         | MEDIUM     | Phase 2-3                             |
| 06-Anexe        | 🔴 TODO | 0%         | LOW        | Phase 3-5                             |

**Phase 0**: ✅ **COMPLETE** - Developer documentation created (CONTRIBUTING.md, ARCHITECTURE.md, DEVELOPMENT_GUIDE.md)
**Target**: 80% completare pentru prezentare finală (Săptămâna 20-22)

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
