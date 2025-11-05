# 📖 User Stories

Povești de utilizare pentru platforma **primariaTa❤️\_**, organizate pe roluri și prioritate.

## Format User Story

Toate user stories urmează formatul standard:

**Ca [rol], vreau să [acțiune], pentru a [beneficiu]**

- **Rol**: Cine folosește funcționalitatea
- **Acțiune**: Ce vrea să facă
- **Beneficiu**: De ce vrea să facă acest lucru

---

## 👥 Cetățean (10 User Stories)

### US-01: Completare Chestionar Ușoară

**Ca cetățean**, vreau să completez un chestionar despre digitalizarea primăriei în **mai puțin de 5 minute**, pentru a **oferi feedback rapid fără timp pierdut**.

| Atribut           | Valoare              |
| ----------------- | -------------------- |
| **Prioritate**    | ⭐ Critică           |
| **Efort estimat** | -                    |
| **Status**        | ✅ Implementat       |
| **Epic**          | Platformă Chestionar |

**Criterii de Acceptare**:

- ✅ Chestionarul are maxim 10 întrebări pentru cetățeni
- ✅ Progresul este afișat vizual (bară 0-100%)
- ✅ Fiecare pas durează sub 1 minut
- ✅ Timpul total mediu: 3-5 minute

**Validare**:

```
GIVEN cetățean pe landing page
WHEN click "Începe chestionarul"
THEN form se deschide la Pas 1
AND progres bar arată 0%
AND form are 5 pași vizibili
```

---

### US-02: Selectare Locație Rapidă

**Ca cetățean**, vreau să selectez **județul și localitatea** din liste comprehensive, pentru a **identifica corect zona mea fără erori de scriere**.

| Atribut           | Valoare        |
| ----------------- | -------------- |
| **Prioritate**    | ⭐ Critică     |
| **Efort estimat** | -              |
| **Status**        | ✅ Implementat |
| **Epic**          | Sistem Locații |

**Criterii de Acceptare**:

- ✅ Dropdown județ cu toate cele 42 județe + București
- ✅ Căutare fuzzy în localități (13,851 locații)
- ✅ Selecția persistă între sesiuni (localStorage)
- ✅ UI intuitivă (wheel picker + combobox)

**Validare**:

```
GIVEN cetățean la Pas 1 (Date Personale)
WHEN deschide dropdown județ
THEN vede toate județele alfabetic
WHEN selectează "Cluj"
THEN combobox localități afișează doar localități din Cluj
WHEN caută "napoca"
THEN vede "Cluj-Napoca" în rezultate
```

---

### US-03: Vizualizare Progres

**Ca cetățean**, vreau să văd **cât din chestionar am completat**, pentru a **ști cât mai am de completat și să mă motivez să finalizez**.

| Atribut        | Valoare        |
| -------------- | -------------- |
| **Prioritate** | 🟡 Înaltă      |
| **Status**     | ✅ Implementat |
| **Epic**       | UX Chestionar  |

**Criterii de Acceptare**:

- ✅ Progress bar vizibil în top (0-100%)
- ✅ Procentaj exact afișat (ex: 60%)
- ✅ Culoare gradient (roșu → verde)
- ✅ Animație smooth la progres

**Validare**:

```
GIVEN cetățean la Pas 3 din 5
THEN progress bar arată 60%
AND culoare este verde/galben
WHEN trece la Pas 4
THEN progress bar animat până la 80%
```

---

### US-04: Salvare Automată Progres

**Ca cetățean**, vreau ca **progresul meu să fie salvat automat**, pentru a **nu pierde datele dacă închid accidental browser-ul**.

| Atribut        | Valoare          |
| -------------- | ---------------- |
| **Prioritate** | 🟡 Înaltă        |
| **Status**     | ✅ Implementat   |
| **Epic**       | Persistență Date |

**Criterii de Acceptare**:

- ✅ Datele se salvează în localStorage după fiecare modificare
- ✅ La revenire, chestionarul restaurează progresul
- ✅ Banner "Ai un chestionar incomplet. Continuă?"
- ✅ Persistență până la 7 zile

**Validare**:

```
GIVEN cetățean completează Pas 1 și Pas 2
WHEN închide tab-ul
AND revine după 1 oră
THEN vede banner "Continuă chestionarul?"
WHEN click "Da"
THEN form deschis la Pas 3
AND datele din Pas 1-2 sunt completate
```

---

### US-05: Validare în Timp Real

**Ca cetățean**, vreau să văd **imediat dacă am introdus date greșite**, pentru a **le corecta rapid fără să aștept până la submit**.

| Atribut        | Valoare        |
| -------------- | -------------- |
| **Prioritate** | 🟡 Înaltă      |
| **Status**     | ✅ Implementat |
| **Epic**       | Validare Date  |

**Criterii de Acceptare**:

- ✅ Erori afișate sub câmpuri imediat după blur
- ✅ Email invalid arată eroare "Email invalid"
- ✅ Character counter pentru text lung
- ✅ Erori în limba română

**Validare**:

```
GIVEN cetățean introduce email "test@invalid"
WHEN click pe alt câmp (blur)
THEN eroare "Email invalid" apare sub câmp
AND border câmp devine roșu
WHEN corectează la "test@valid.com"
THEN eroare dispare
AND border revine la normal
```

---

### US-06: Review Înainte de Submit

**Ca cetățean**, vreau să **revizuiesc toate răspunsurile mele** înainte de trimitere, pentru a **mă asigura că toate sunt corecte**.

| Atribut        | Valoare        |
| -------------- | -------------- |
| **Prioritate** | 🟡 Înaltă      |
| **Status**     | ✅ Implementat |
| **Epic**       | Review Flow    |

**Criterii de Acceptare**:

- ✅ Pas 4 afișează sumar toate răspunsurile
- ✅ Răspunsuri grupate pe secțiuni
- ✅ Butoane "Editează" pentru fiecare secțiune
- ✅ GDPR consent obligatoriu

**Validare**:

```
GIVEN cetățean la Pas 4 (Review)
THEN vede toate răspunsurile (Pas 1-3)
WHEN click "Editează" la Date Personale
THEN revine la Pas 1
WHEN corectează email
AND revine la Review
THEN vede email-ul actualizat
```

---

### US-07: Confirmare Completare

**Ca cetățean**, vreau să primesc **confirmare vizuală că chestionarul a fost trimis**, pentru a **fi sigur că răspunsurile mele au fost înregistrate**.

| Atribut        | Valoare         |
| -------------- | --------------- |
| **Prioritate** | 🟡 Înaltă       |
| **Status**     | ✅ Implementat  |
| **Epic**       | Completion Flow |

**Criterii de Acceptare**:

- ✅ Pas 5 (Completion) afișează mesaj "Mulțumim!"
- ✅ ID respondent unic afișat
- ✅ Opțiuni: "Vezi rezultate" / "Acasă"
- ✅ Design celebrator (confetti animation - optional)

**Validare**:

```
GIVEN cetățean trimite chestionarul cu succes
THEN vede Pas 5 (Completion)
AND mesaj "Mulțumim pentru participare!"
AND ID respondent: "RESP-2024-001234"
AND butoane "Vezi rezultate" și "Înapoi acasă"
```

---

### US-08: Experiență Mobile Optimizată

**Ca cetățean pe mobil**, vreau ca **chestionarul să funcționeze perfect pe telefon**, pentru a **putea completa de oriunde, oricând**.

| Atribut        | Valoare        |
| -------------- | -------------- |
| **Prioritate** | ⭐ Critică     |
| **Status**     | ✅ Implementat |
| **Epic**       | Mobile UX      |

**Criterii de Acceptare**:

- ✅ Layout responsive pe toate device-urile (320px+)
- ✅ Butoane mari (min 44x44px) pentru touch
- ✅ Font size min 16px (no zoom iOS)
- ✅ Scroll smooth fără flickering

**Validare**:

```
GIVEN cetățean pe iPhone SE (375px width)
THEN form se afișează corect fără horizontal scroll
AND butoane sunt ușor de apăsat
AND text este lizibil fără zoom
WHEN selectează județ din wheel picker
THEN picker funcționează smooth cu swipe
```

---

### US-09: Accesibilitate Screen Reader

**Ca cetățean cu deficiențe de vedere**, vreau ca **screen reader-ul să citească corect chestionarul**, pentru a **putea completa independent**.

| Atribut        | Valoare        |
| -------------- | -------------- |
| **Prioritate** | 🟢 Medie       |
| **Status**     | ✅ Implementat |
| **Epic**       | Accesibilitate |

**Criterii de Acceptare**:

- ✅ Toate câmpurile au label-uri asociate
- ✅ ARIA labels pentru icons și butoane
- ✅ Erori anunțate de screen reader
- ✅ Focus indicator vizibil

**Validare**:

```
GIVEN cetățean folosește NVDA/JAWS
WHEN navigă cu Tab prin form
THEN screen reader citește label-ul fiecărui câmp
AND anunță erorile de validare
AND descrie starea progress bar
```

---

### US-10: Dark Mode

**Ca cetățean**, vreau să **activez dark mode**, pentru a **reduce oboseala ochilor la completare seara**.

| Atribut        | Valoare        |
| -------------- | -------------- |
| **Prioritate** | 🟢 Medie       |
| **Status**     | ✅ Implementat |
| **Epic**       | Theme System   |

**Criterii de Acceptare**:

- ✅ Toggle dark mode în header
- ✅ Toate componentele suportă dark mode
- ✅ Contrast WCAG AA în ambele teme
- ✅ Preferință salvată în localStorage

**Validare**:

```
GIVEN cetățean pe landing page
WHEN click pe icon soare/lună
THEN tema se schimbă instant
AND preferința este salvată
WHEN reîncarcă pagina
THEN tema preferată este aplicată automat
```

---

## 🏛️ Funcționar (5 User Stories)

### US-11: Chestionar Specializat

**Ca funcționar public**, vreau să completez un **chestionar adaptat nevoilor departamentului meu**, pentru a **oferi feedback relevant despre procesele interne**.

| Atribut        | Valoare        |
| -------------- | -------------- |
| **Prioritate** | ⭐ Critică     |
| **Status**     | ✅ Implementat |
| **Epic**       | Survey Logic   |

**Criterii de Acceptare**:

- ✅ La Pas 2, selecție "Funcționar"
- ✅ Pas 3 afișează 12 întrebări specifice funcționari
- ✅ Întrebări focus pe: departament, fluxuri manuale, digitalizare

**Validare**:

```
GIVEN funcționar la Pas 2
WHEN selectează "Funcționar"
AND click "Următorul"
THEN Pas 3 afișează întrebările pentru funcționari
AND prima întrebare: "În ce departament activați?"
AND total 12 întrebări (nu 10 ca la cetățeni)
```

---

### US-12: Identificare Departament

**Ca funcționar**, vreau să **specificu departamentul meu**, pentru a **ajuta la segmentarea feedback-ului pe departamente**.

| Atribut        | Valoare         |
| -------------- | --------------- |
| **Prioritate** | 🟡 Înaltă       |
| **Status**     | ✅ Implementat  |
| **Epic**       | Date Collection |

**Criterii de Acceptare**:

- ✅ Întrebare dedicată: "În ce departament activați?"
- ✅ Tip întrebare: short_text (text scurt)
- ✅ Validare: max 200 caractere

**Validare**:

```
GIVEN funcționar la Q1
THEN vede întrebare "În ce departament activați?"
WHEN introduce "Registratura generală"
THEN răspunsul este acceptat
WHEN introduce text > 200 caractere
THEN eroare "Maxim 200 caractere"
```

---

### US-13: Feedback Fluxuri Manuale

**Ca funcționar**, vreau să **raportez problemele cu procesele manuale**, pentru a **contribui la îmbunătățirea eficienței**.

| Atribut        | Valoare             |
| -------------- | ------------------- |
| **Prioritate** | 🟡 Înaltă           |
| **Status**     | ✅ Implementat      |
| **Epic**       | Process Improvement |

**Criterii de Acceptare**:

- ✅ Întrebare: "Ce dificultăți întâmpinați în gestionarea documentelor?"
- ✅ Tip: text lung (textarea)
- ✅ Optional (not required)

**Validare**:

```
GIVEN funcționar la Q4
THEN vede întrebare despre dificultăți documente
WHEN introduce text detaliat (500 caractere)
THEN răspunsul este salvat
WHEN lasă câmpul gol
THEN poate continua (opțional)
```

---

### US-14: Evaluare Pregătire Digitalizare

**Ca funcționar**, vreau să **evaluez gradul de pregătire** al instituției pentru digitalizare, pentru a **identifica necesarul de training**.

| Atribut        | Valoare              |
| -------------- | -------------------- |
| **Prioritate** | 🟡 Înaltă            |
| **Status**     | ✅ Implementat       |
| **Epic**       | Readiness Assessment |

**Criterii de Acceptare**:

- ✅ Întrebare: "Cât de pregătită este instituția pentru digitalizare?" (1-5)
- ✅ Tip: rating (stars)
- ✅ Obligatoriu

**Validare**:

```
GIVEN funcționar la Q10
THEN vede întrebare cu 5 stele
WHEN click pe 3 stele
THEN rating = 3 salvat
WHEN încearcă să continue fără rating
THEN eroare "Câmp obligatoriu"
```

---

### US-15: Disponibilitate Training

**Ca funcționar**, vreau să **exprim disponibilitatea pentru training**, pentru a **participa la programele de instruire**.

| Atribut        | Valoare           |
| -------------- | ----------------- |
| **Prioritate** | 🟢 Medie          |
| **Status**     | ✅ Implementat    |
| **Epic**       | Training Planning |

**Criterii de Acceptare**:

- ✅ Întrebare: "Ați fi dispus să participați la training?"
- ✅ Opțiuni: "Da" / "Poate" / "Nu"
- ✅ Tip: single_choice

**Validare**:

```
GIVEN funcționar la Q11
THEN vede întrebare despre training
WHEN selectează "Da"
THEN răspuns salvat
AND poate continua la Q12
```

---

## 👨‍💼 Administrator (10 User Stories)

### US-16: Dashboard Metrics Real-Time

**Ca administrator**, vreau să văd **metrici actualizate în timp real**, pentru a **monitoriza progresul campaniei fără refresh manual**.

| Atribut        | Valoare         |
| -------------- | --------------- |
| **Prioritate** | ⭐ Critică      |
| **Status**     | ✅ Implementat  |
| **Epic**       | Dashboard Admin |

**Criterii de Acceptare**:

- ✅ Polling la 5 secunde pentru metrici noi
- ✅ Update fără full page refresh
- ✅ Indicatori trend (↑↓→)
- ✅ Sparkline charts (7 zile)

**Validare**:

```
GIVEN administrator pe dashboard
WHEN apare răspuns nou în DB
THEN după max 5 secunde, counter se actualizează
AND indicator trend se recalculează
AND sparkline chart include noul data point
AND NO full page refresh
```

---

### US-17: Filtrare Respondenti

**Ca administrator**, vreau să **filtrez respondentii** după tip, județ și status, pentru a **analiza segmente specifice**.

| Atribut        | Valoare        |
| -------------- | -------------- |
| **Prioritate** | 🟡 Înaltă      |
| **Status**     | ✅ Implementat |
| **Epic**       | Data Analysis  |

**Criterii de Acceptare**:

- ✅ Dropdown filtre: Tip (cetățean/funcționar)
- ✅ Dropdown filtre: Județ (toate județele)
- ✅ Dropdown filtre: Status (completat/incomplet)
- ✅ Filtre combinate (AND logic)

**Validare**:

```
GIVEN administrator pe dashboard
WHEN selectează filtru Tip = "Cetățean"
THEN tabel afișează doar cetățeni
WHEN adaugă filtru Județ = "Cluj"
THEN tabel afișează doar cetățeni din Cluj
AND counter total actualizat
```

---

### US-18: Căutare Respondent

**Ca administrator**, vreau să **caut respondent după nume sau email**, pentru a **găsi rapid un răspuns specific**.

| Atribut        | Valoare              |
| -------------- | -------------------- |
| **Prioritate** | 🟡 Înaltă            |
| **Status**     | ✅ Implementat       |
| **Epic**       | Search Functionality |

**Criterii de Acceptare**:

- ✅ Search box cu debounce 300ms
- ✅ Căutare în: nume, prenume, email
- ✅ Case-insensitive
- ✅ Highlighting rezultate (optional)

**Validare**:

```
GIVEN administrator pe dashboard
WHEN introduce "ion" în search
THEN tabel afișează respondenti cu "ion" în nume/email
EXAMPLE: "Ion Popescu", "ionel@test.ro"
WHEN șterge search
THEN tabel revine la toate datele
```

---

### US-19: Vizualizare Răspunsuri Individuale

**Ca administrator**, vreau să **văd toate răspunsurile unui respondent**, pentru a **analiza feedback-ul detaliat**.

| Atribut        | Valoare        |
| -------------- | -------------- |
| **Prioritate** | ⭐ Critică     |
| **Status**     | ✅ Implementat |
| **Epic**       | Data Viewing   |

**Criterii de Acceptare**:

- ✅ Button "👁️ Vizualizare" per respondent
- ✅ Modal/Dialog cu toate răspunsurile
- ✅ Răspunsuri formatate (Q1-Q10/Q12)
- ✅ Butoane: Închide, Export

**Validare**:

```
GIVEN administrator pe dashboard
WHEN click "Vizualizare" pe respondent ID=123
THEN deschide dialog
AND afișează 10 întrebări + răspunsuri
AND răspunsuri formatate (single choice = text, rating = 3/5)
WHEN click "Închide"
THEN dialog se închide
```

---

### US-20: Export CSV cu Filtre

**Ca administrator**, vreau să **export doar datele filtrate** în CSV, pentru a **analiza segmente în Excel**.

| Atribut        | Valoare              |
| -------------- | -------------------- |
| **Prioritate** | ⭐ Critică           |
| **Status**     | ✅ Implementat       |
| **Epic**       | Export Functionality |

**Criterii de Acceptare**:

- ✅ Checkbox "Aplică filtre curente"
- ✅ Export respectă filtrele active
- ✅ CSV valid (UTF-8 BOM)
- ✅ Headers incluse

**Validare**:

```
GIVEN administrator cu filtru Județ = "Cluj"
WHEN click "Export Date"
AND selectează format "CSV"
AND bifează "Aplică filtre curente"
THEN CSV exportat conține doar respondenti din Cluj
AND headers sunt incluse
AND encoding UTF-8 BOM (diacritice corecte)
```

---

### US-21: Export Excel Multi-Sheet

**Ca administrator**, vreau să **export date în Excel cu sheet-uri multiple**, pentru a **avea date și statistici în același fișier**.

| Atribut        | Valoare         |
| -------------- | --------------- |
| **Prioritate** | 🟡 Înaltă       |
| **Status**     | ✅ Implementat  |
| **Epic**       | Advanced Export |

**Criterii de Acceptare**:

- ✅ Format: .xlsx (Excel)
- ✅ Sheet 1: "Date" (toate răspunsurile)
- ✅ Sheet 2: "Statistici" (metrici agregate)
- ✅ Styling: headers bold, borders

**Validare**:

```
GIVEN administrator click "Export Date"
WHEN selectează "Excel (.xlsx)"
AND bifează "Include statistici"
THEN fișier .xlsx generat
AND conține 2 sheets: "Date", "Statistici"
AND Sheet 1 = 150 rows (respondenti)
AND Sheet 2 = metrici (total, breakdown, top locations)
```

---

### US-22: Ștergere Respondent (GDPR)

**Ca administrator**, vreau să **ștergu permanent un respondent**, pentru a **respecta dreptul la ștergere (GDPR)**.

| Atribut        | Valoare         |
| -------------- | --------------- |
| **Prioritate** | ⭐ Critică      |
| **Status**     | ✅ Implementat  |
| **Epic**       | GDPR Compliance |

**Criterii de Acceptare**:

- ✅ Button "🗑️ Ștergere" per respondent
- ✅ Dialog confirmare: "Sigur? Ireversibil!"
- ✅ Ștergere respondent + toate răspunsurile
- ✅ Toast notificare: "Șters cu succes"

**Validare**:

```
GIVEN administrator pe dashboard
WHEN click "Ștergere" pe respondent ID=456
THEN deschide dialog confirmare
WHEN click "Da, șterge"
THEN DELETE FROM survey_responses WHERE respondent_id=456
AND DELETE FROM survey_respondents WHERE id=456
AND toast "Respondent șters cu succes"
AND tabel refresh (count -1)
```

---

### US-23: Sortare Coloane Tabel

**Ca administrator**, vreau să **sortez tabelul după orice coloană**, pentru a **găsi rapid extremele (ex: cele mai vechi/noi răspunsuri)**.

| Atribut        | Valoare        |
| -------------- | -------------- |
| **Prioritate** | 🟢 Medie       |
| **Status**     | ✅ Implementat |
| **Epic**       | Table Features |

**Criterii de Acceptare**:

- ✅ Click pe header activează sortare
- ✅ Indicator ASC/DESC (săgeți ↑↓)
- ✅ Sortabile: Nume, Email, Data, Status
- ✅ Default sort: Data DESC (cele mai noi)

**Validare**:

```
GIVEN administrator pe dashboard
WHEN click pe header "Data Creare"
THEN tabel sortează ASC (cele mai vechi)
AND săgeată ↑ apare
WHEN click din nou pe "Data Creare"
THEN tabel sortează DESC (cele mai noi)
AND săgeată ↓ apare
```

---

### US-24: Paginare Eficientă

**Ca administrator**, vreau să **naviguez prin pagini** de 10 respondenti, pentru a **explora toate datele fără lag**.

| Atribut        | Valoare           |
| -------------- | ----------------- |
| **Prioritate** | 🟡 Înaltă         |
| **Status**     | ✅ Implementat    |
| **Epic**       | Table Performance |

**Criterii de Acceptare**:

- ✅ Paginare: 10 items/pagină
- ✅ Butoane: Previous, Next, First, Last
- ✅ Afișare: "Pagina 5 din 15"
- ✅ URL params: `?page=5` (shareable)

**Validare**:

```
GIVEN administrator pe pagina 1 (items 1-10)
WHEN click "Next"
THEN URL devine ?page=2
AND tabel afișează items 11-20
AND Previous button devine activ
WHEN click pe "Last"
THEN sare la ultima pagină (15)
```

---

### US-25: Grafice Interactive cu Click

**Ca administrator**, vreau să **click pe elemente din grafice** pentru a filtra tabelul, pentru a **explora rapid datele vizuale**.

| Atribut        | Valoare            |
| -------------- | ------------------ |
| **Prioritate** | 🟢 Medie           |
| **Status**     | ✅ Implementat     |
| **Epic**       | Interactive Charts |

**Criterii de Acceptare**:

- ✅ Click pe județ în bar chart → filtrează tabel
- ✅ Click pe tip în pie chart → filtrează tabel
- ✅ Indicator vizual: highlight element clicked
- ✅ Clear filter button

**Validare**:

```
GIVEN administrator pe dashboard
WHEN click pe "Cluj" în bar chart (top locations)
THEN filtru Județ = "Cluj" aplicat automat
AND tabel afișează doar respondenti din Cluj
AND "Cluj" bar highlighted în grafic
WHEN click "Clear filters"
THEN toate filtrele resetate
AND grafic revine la normal
```

---

## Rezumat User Stories

### Statistici Generale

| Categorie         | Count  | Implementate | Procent  |
| ----------------- | ------ | ------------ | -------- |
| **Cetățean**      | 10     | 10           | 100%     |
| **Funcționar**    | 5      | 5            | 100%     |
| **Administrator** | 10     | 10           | 100%     |
| **TOTAL**         | **25** | **25**       | **100%** |

### Distribuție pe Prioritate

| Prioritate     | Count | Procent |
| -------------- | ----- | ------- |
| ⭐ **Critică** | 12    | 48%     |
| 🟡 **Înaltă**  | 9     | 36%     |
| 🟢 **Medie**   | 4     | 16%     |

### Distribuție pe Epic

| Epic                     | User Stories               | Status |
| ------------------------ | -------------------------- | ------ |
| **Platformă Chestionar** | US-01, US-04, US-06, US-11 | ✅     |
| **Sistem Locații**       | US-02                      | ✅     |
| **UX Chestionar**        | US-03, US-05, US-07        | ✅     |
| **Accesibilitate**       | US-08, US-09, US-10        | ✅     |
| **Dashboard Admin**      | US-16, US-17, US-18, US-24 | ✅     |
| **Export Functionality** | US-20, US-21               | ✅     |
| **Data Management**      | US-19, US-22, US-23, US-25 | ✅     |
| **Feedback Funcționari** | US-12, US-13, US-14, US-15 | ✅     |

---

## Matrice Acoperire Funcționalități

| Funcționalitate             | User Stories                                           |
| --------------------------- | ------------------------------------------------------ |
| **Completare Chestionar**   | US-01, US-02, US-03, US-04, US-05, US-06, US-07, US-11 |
| **Mobile & Accesibilitate** | US-08, US-09, US-10                                    |
| **Dashboard Monitoring**    | US-16, US-17, US-18                                    |
| **Data Analysis**           | US-19, US-23, US-24, US-25                             |
| **Export & GDPR**           | US-20, US-21, US-22                                    |
| **Feedback Funcționari**    | US-11, US-12, US-13, US-14, US-15                      |

---

## Mapare User Stories → Cerințe Funcționale

| User Story | Cerințe Funcționale                  |
| ---------- | ------------------------------------ |
| US-01      | CF-SURVEY-001 (Multi-step form)      |
| US-02      | CF-LOC-001 (Selecție locații)        |
| US-03      | CF-SURVEY-001.1 (Progress indicator) |
| US-04      | CF-SURVEY-001.3 (Salvare progres)    |
| US-05      | CF-SURVEY-003 (Validare real-time)   |
| US-06      | CF-SURVEY-001.5 (Review step)        |
| US-07      | CF-SURVEY-001 (Completion step)      |
| US-08      | CF-UI-002 (Responsive design)        |
| US-09      | CNF-ACCESS-003 (Screen reader)       |
| US-10      | CF-UI-002.3 (Dark mode)              |
| US-11      | CF-SURVEY-001 (Survey logic)         |
| US-12-15   | CF-SURVEY-002 (Tipuri întrebări)     |
| US-16      | CF-ADMIN-001 (Metrics real-time)     |
| US-17-18   | CF-ADMIN-003 (Filtrare + căutare)    |
| US-19      | CF-ADMIN-003.6 (Dialog răspunsuri)   |
| US-20-21   | CF-ADMIN-004 (Export date)           |
| US-22      | CF-ADMIN-003.5 (Ștergere)            |
| US-23-24   | CF-ADMIN-003 (Sortare + paginare)    |
| US-25      | CF-ADMIN-002 (Grafice interactive)   |

---

## Template User Story (pentru viitor)

````markdown
### US-XX: [Titlu Scurt]

**Ca [rol]**, vreau să [acțiune], pentru a [beneficiu].

| Atribut           | Valoare         |
| ----------------- | --------------- |
| **Prioritate**    | ⭐/🟡/🟢        |
| **Efort estimat** | S/M/L/XL        |
| **Status**        | ⏳/✅/❌        |
| **Epic**          | [Epic Name]     |
| **Sprint**        | [Sprint Number] |

**Criterii de Acceptare**:

- [ ] Criteriu 1
- [ ] Criteriu 2
- [ ] Criteriu 3

**Validare**:

```gherkin
GIVEN [context]
WHEN [action]
THEN [result]
AND [additional result]
```
````

**Dependențe**:

- US-XX (blocker)
- US-YY (related)

**Note Tehnice**:

- [Considerații tehnice]

```

---

## Referințe

- [Cerințe Funcționale](./Cerinte-Functionale.md)
- [Cazuri de Utilizare](./Cazuri-de-Utilizare.md)
- [Agile User Stories](https://www.mountaingoatsoftware.com/agile/user-stories)
- [INVEST Criteria](https://en.wikipedia.org/wiki/INVEST_(mnemonic))
- [Gherkin Syntax](https://cucumber.io/docs/gherkin/)

**Ultima actualizare**: Octombrie 2024
```
