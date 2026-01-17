# Scripts - primariaTa

Scripturi utilitare pentru proiect.

## Conversie Markdown → PDF

### Cerințe Sistem

**macOS**:

```bash
# Instalare dependențe sistem (necesare o singură dată)
brew install cairo pango gdk-pixbuf libffi glib gobject-introspection
npm install -g @mermaid-js/mermaid-cli
```

**Linux (Ubuntu/Debian)**:

```bash
sudo apt-get install libcairo2-dev libpango1.0-dev libgdk-pixbuf2.0-dev libffi-dev libgirepository1.0-dev
npm install -g @mermaid-js/mermaid-cli
```

### Utilizare

**Documentație Arhitectură**:

```bash
./scripts/convert_to_pdf.sh
```

**Raport Cercetare de Piață**:

```bash
./scripts/convert_raport_to_pdf.sh
```

**Metodă manuală** (cu virtual environment):

```bash
# Prima dată - creează venv și instalează dependențe
python3 -m venv venv
source venv/bin/activate
pip install markdown weasyprint

# Generare PDF
python scripts/generate_pdf.py

# Deactivare venv
deactivate
```

### Output

PDF-urile generate se vor găsi în:

```
docs/01-Prezentare/DOCUMENTATIE_ARHITECTURA_COMPLETA.pdf
docs/01-Prezentare/RAPORT_COMPLET_PRIMARIATA_rev2_RO.pdf
```

### Caracteristici

- ✅ Conversie Markdown → HTML → PDF
- ✅ Renderare automată diagrame Mermaid (16 diagrame)
- ✅ Styling profesional (headings, tables, code blocks)
- ✅ Paginare automată cu header/footer
- ✅ Font configuration pentru caracter românești
- ✅ Imagini Mermaid embedded (base64) - nu necesită fișiere externe

### Troubleshooting

**Eroare: `cannot load library 'libgobject-2.0-0'`**

```bash
# macOS
export PKG_CONFIG_PATH="/opt/homebrew/lib/pkgconfig"
export DYLD_LIBRARY_PATH="/opt/homebrew/lib:$DYLD_LIBRARY_PATH"

# Apoi rulează scriptul din nou
```

**Eroare: `mmdc: command not found`**

```bash
npm install -g @mermaid-js/mermaid-cli
```

**Eroare: `ModuleNotFoundError: No module named 'markdown'`**

```bash
# Folosește virtual environment (vezi "Metodă manuală" mai sus)
# SAU
pip3 install markdown weasyprint
```

## Scripturi Disponibile

### `generate_pdf.py`

Python script pentru conversie Documentație Arhitectură Markdown → PDF cu suport complet Mermaid.

**Document sursă**: `DOCUMENTATIE_ARHITECTURA_COMPLETA.md`
**Output**: `DOCUMENTATIE_ARHITECTURA_COMPLETA.pdf`
**Diagrame**: 17 diagrame Mermaid

**Funcționalități**:

- Extrage blocuri Mermaid din Markdown
- Renderează diagrame cu dimensiuni adaptive bazate pe complexitate
- Convertește PNG-urile în base64 și le embed în HTML
- Aplică CSS styling profesional cu tabele centrate
- Generează PDF final cu WeasyPrint

### `convert_to_pdf.sh`

Wrapper Bash pentru `generate_pdf.py` - gestionează automat virtual environment.

**Utilizare**:

```bash
./scripts/convert_to_pdf.sh
```

### `generate_raport_pdf.py`

Python script pentru conversie Raport Cercetare de Piață Markdown → PDF cu suport complet Mermaid.

**Document sursă**: `RAPORT_COMPLET_PRIMARIATA_rev2_RO.md`
**Output**: `RAPORT_COMPLET_PRIMARIATA_rev2_RO.pdf`
**Diagrame**: 9 diagrame Mermaid

**Funcționalități**:

- Page breaks strategice între capitole (1-12)
- Tabele centrate pentru date statistice
- Footer centrat cu branding Bubu & Dudu Dev Team
- Header personalizat: "Raport Cercetare de Piață"

### `convert_raport_to_pdf.sh`

Wrapper Bash pentru `generate_raport_pdf.py` - gestionează automat virtual environment.

**Utilizare**:

```bash
./scripts/convert_raport_to_pdf.sh
```

## Dezvoltare Viitoare

Posibile îmbunătățiri:

- [ ] Argument CLI pentru specificarea documentului sursă
- [ ] Generare PDF pentru toate documentele din `docs/`
- [ ] Watermark opțional pentru draft vs. final
- [ ] Export multi-format (PDF + DOCX + HTML standalone)
- [ ] Customizare CSS prin fișier de configurare extern
