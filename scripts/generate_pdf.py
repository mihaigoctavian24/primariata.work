#!/usr/bin/env python3
"""
Script de conversie Markdown → PDF profesional cu suport Mermaid
Pentru documentația primariaTa
"""

import markdown
import re
import subprocess
import os
import tempfile
import base64
from pathlib import Path
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration

def extract_mermaid_blocks(md_content):
    """Extrage blocurile Mermaid din Markdown și le înlocuiește cu placeholders"""
    mermaid_pattern = r'```mermaid\n(.*?)\n```'
    mermaid_blocks = []

    def replacer(match):
        mermaid_code = match.group(1)
        mermaid_blocks.append(mermaid_code)
        # Returnez placeholder care va fi înlocuit cu imagine
        return f'<!--MERMAID_PLACEHOLDER_{len(mermaid_blocks)-1}-->'

    processed_content = re.sub(mermaid_pattern, replacer, md_content, flags=re.DOTALL)
    return processed_content, mermaid_blocks

def analyze_mermaid_complexity(mermaid_code):
    """Analizează complexitatea diagramei pentru a determina dimensiunile optime"""
    lines = mermaid_code.strip().split('\n')

    # Număr de noduri și relații
    nodes = len([l for l in lines if '-->' in l or '---' in l or '-.-' in l])

    # Tip diagramă
    is_pie = 'pie' in mermaid_code.lower()
    is_sequence = 'sequenceDiagram' in mermaid_code or 'sequencediagram' in mermaid_code
    is_gantt = 'gantt' in mermaid_code
    has_subgraph = 'subgraph' in mermaid_code

    # Check pentru flow diagrams specifice (ÎNAINTE/DUPĂ)
    is_flux_comparison = 'Cetățean' in mermaid_code and ('Primărie' in mermaid_code or 'Platform Web' in mermaid_code)

    # Check pentru workflow funcționar (are Funcționar Login și Dashboard Inbox)
    is_workflow_functionar = 'Funcționar Login' in mermaid_code and 'Dashboard Inbox' in mermaid_code

    # Check pentru arhitectura completă (are CLIENT LAYER, EDGE LAYER, etc)
    is_arhitectura_completa = 'CLIENT LAYER' in mermaid_code and 'EDGE LAYER' in mermaid_code

    # Check pentru stack tehnologic (are Stack Tehnologic + FRONTEND + BACKEND)
    is_stack_tehnologic = 'Stack Tehnologic' in mermaid_code and 'FRONTEND' in mermaid_code and 'BACKEND' in mermaid_code

    # Check pentru data flow architecture (are USER_INPUT, API_LAYER, DATA_LAYER, NOTIFICATION)
    is_data_flow = 'USER_INPUT' in mermaid_code and 'API_LAYER' in mermaid_code and 'DATA_LAYER' in mermaid_code

    # Check pentru CI/CD Pipeline (are GitHub Actions, Production Pipeline, Staging Pipeline)
    is_cicd_pipeline = 'GitHub Actions' in mermaid_code and 'Production Pipeline' in mermaid_code and 'Staging Pipeline' in mermaid_code

    # DEBUG
    if is_flux_comparison:
        print(f"  🔍 DETECTAT flux comparison! Nodes: {nodes}")
    if is_workflow_functionar:
        print(f"  🔍 DETECTAT workflow funcționar! Nodes: {nodes}")
    if is_arhitectura_completa:
        print(f"  🔍 DETECTAT arhitectura completa! Nodes: {nodes}")
    if is_stack_tehnologic:
        print(f"  🔍 DETECTAT stack tehnologic! Nodes: {nodes}")
    if is_data_flow:
        print(f"  🔍 DETECTAT data flow architecture! Nodes: {nodes}")
    if is_cicd_pipeline:
        print(f"  🔍 DETECTAT CI/CD Pipeline! Nodes: {nodes}")

    # Determină dimensiuni bazate pe complexitate
    if is_cicd_pipeline:
        print(f"  📏 Returnez dimensiuni pentru CI/CD (50% mai mic): 600x400")
        return 600, 400, 'small'  # CI/CD Pipeline - 50% mai mic
    elif is_data_flow:
        print(f"  📏 Returnez dimensiuni pentru data flow (50% mai mic): 440x250")
        return 320, 120, 'small'  # Data Flow Architecture - 50% mai mic
    elif is_stack_tehnologic:
        print(f"  📏 Returnez dimensiuni pentru stack: 440x220")
        return 440, 220, 'medium'  # Stack tehnologic - 50% din dimensiunea landscape
    elif is_arhitectura_completa:
        print(f"  📏 Returnez dimensiuni pentru arhitectura: 540x300")
        return 540, 300, 'small'  # Arhitectura completă - 30% din original (70% mai mică)
    elif is_workflow_functionar:
        print(f"  📏 Returnez dimensiuni reduse cu 65%: 420x245")
        return 420, 245, 'small'  # Workflow funcționar - redus cu ~65%
    elif is_flux_comparison:
        print(f"  📏 Returnez dimensiuni mici: 350x220")
        return 350, 220, 'small'  # Flow diagrams ÎNAINTE/DUPĂ - foarte mici
    elif is_pie:
        return 800, 520, 'small'  # Pie charts - reduse cu ~20%
    elif is_gantt:
        return 1400, 600, 'large'  # Gantt charts late
    elif has_subgraph:
        # Subgraphs - medium size pentru a încăpea pe pagină cu text
        return 1200, 700, 'medium'  # Redus de la large pentru a încăpea pe pagină
    elif is_sequence:
        return 1200, 800, 'medium'
    elif nodes > 15:
        return 1400, 900, 'large'  # Multe noduri = diagramă complexă
    elif nodes > 8:
        return 1200, 700, 'medium'
    else:
        return 900, 560, 'small'  # Diagrame simple - reduse cu ~20%

def render_mermaid_to_png(mermaid_code, output_path):
    """Renderează cod Mermaid în imagine PNG folosind mermaid-cli"""
    # Analizez complexitatea pentru dimensiuni optime
    width, height, size = analyze_mermaid_complexity(mermaid_code)

    with tempfile.NamedTemporaryFile(mode='w', suffix='.mmd', delete=False, encoding='utf-8') as tmp:
        tmp.write(mermaid_code)
        tmp_path = tmp.name

    try:
        # Rulez mmdc (mermaid-cli) pentru a genera PNG
        subprocess.run([
            'mmdc',
            '-i', tmp_path,
            '-o', output_path,
            '-b', 'transparent',
            '-w', str(width),
            '-H', str(height)
        ], check=True, capture_output=True)
        return True, size
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Eroare la renderarea Mermaid: {e}")
        return False, 'unknown'
    finally:
        os.unlink(tmp_path)

def embed_mermaid_images(html_content, mermaid_blocks, temp_dir):
    """Înlocuiește placeholders cu imagini Mermaid embedded (base64)"""
    for idx, mermaid_code in enumerate(mermaid_blocks):
        png_path = os.path.join(temp_dir, f'mermaid_{idx}.png')

        success, size = render_mermaid_to_png(mermaid_code, png_path)
        if success:
            # Citesc imaginea și o convertesc în base64
            with open(png_path, 'rb') as img_file:
                img_data = base64.b64encode(img_file.read()).decode('utf-8')

            # Styling bazat pe dimensiune
            if size == 'large':
                # Diagrame mari: page break înainte, full width
                img_tag = f'''
                <div class="diagram-large">
                    <img src="data:image/png;base64,{img_data}" alt="Diagramă Arhitectură {idx+1}" />
                </div>
                '''
            elif size == 'medium':
                # Diagrame medii: centered, 90% width
                img_tag = f'''
                <div class="diagram-medium">
                    <img src="data:image/png;base64,{img_data}" alt="Diagramă {idx+1}" />
                </div>
                '''
            else:  # small
                # Diagrame mici: inline, pot fi multiple pe pagină
                img_tag = f'''
                <div class="diagram-small">
                    <img src="data:image/png;base64,{img_data}" alt="Diagramă {idx+1}" />
                </div>
                '''

            # Înlocuiesc placeholder-ul
            placeholder = f'<!--MERMAID_PLACEHOLDER_{idx}-->'
            html_content = html_content.replace(placeholder, img_tag)
            print(f"  ✓ Diagramă {idx+1}: {size}")
        else:
            # Dacă a eșuat renderarea, las un mesaj
            placeholder = f'<!--MERMAID_PLACEHOLDER_{idx}-->'
            html_content = html_content.replace(placeholder, f'<p><em>[Diagramă Mermaid #{idx+1} - eroare la renderare]</em></p>')

    return html_content

# Determină calea scriptului și calea documentului
script_dir = Path(__file__).parent
doc_path = script_dir.parent / 'docs' / '01-Prezentare' / 'DOCUMENTATIE_ARHITECTURA_COMPLETA.md'

# Citesc markdown-ul
print(f"📖 Citesc documentul: {doc_path}")
with open(doc_path, 'r', encoding='utf-8') as f:
    md_content = f.read()

# Extrag și procesez blocurile Mermaid
print("🔍 Extrag diagramele Mermaid...")
processed_md, mermaid_blocks = extract_mermaid_blocks(md_content)
print(f"✅ Găsite {len(mermaid_blocks)} diagrame Mermaid")

def add_strategic_page_breaks(md_content):
    """Adaugă page breaks strategice"""
    # Page break #1: După metadata, înainte de CUPRINS
    md_content = re.sub(
        r'(\*\*Clasificare\*\*: Academic - Proiect Universitar\n\n---)\n\n(## CUPRINS)',
        r'\1\n\n<div class="page-break"></div>\n\n\2',
        md_content
    )

    # Page break #2: După CUPRINS, înainte de PARTEA I
    # Trebuie să găsesc exact linia "---" care vine DUPĂ CUPRINS (nu după capitol 7!)
    # Caut pattern: "DEPLOYMENT" (fără ##) apoi --- apoi # PARTEA I
    md_content = re.sub(
        r'(DEPLOYMENT\n\n---)\n\n(# PARTEA I: DOCUMENTAȚIE PROBLEMĂ ȘI SOLUȚIE)',
        r'\1\n\n<div class="page-break"></div>\n\n\2',
        md_content,
        count=1  # Doar prima apariție (din CUPRINS)
    )

    # Page break înainte de PARTEA II (doar heading-ul principal #, nu cel din CUPRINS ###)
    # Caut pattern specific: newline + "# PARTEA II" (nu "### PARTEA II")
    md_content = re.sub(
        r'\n(# PARTEA II: ARHITECTURA SISTEMULUI)',
        r'\n<div class="page-break"></div>\n\n\1',
        md_content
    )

    # Page break înainte de fiecare secțiune majoră (2, 3, 5, 7)
    # Capitol 1 nu are break pentru că PARTEA I deja forțează pagină nouă
    # Capitol 4 nu are break pentru că PARTEA II deja forțează pagină nouă
    # Capitol 6 nu are break pentru a evita pagina goală între 5.5 și 6
    for section_num in ['2', '3', '5', '7']:
        pattern = f'## {section_num}. '
        if pattern in md_content:
            md_content = md_content.replace(
                pattern,
                f'<div class="section-break"></div>\n\n{pattern}'
            )

    return md_content

# Adaug page breaks strategice
print("📄 Adaug page breaks între secțiuni...")
processed_md = add_strategic_page_breaks(processed_md)

# Convertesc markdown → HTML
print("🔄 Convertesc Markdown → HTML...")
md = markdown.Markdown(extensions=[
    'tables',
    'fenced_code',
    'nl2br',
    'sane_lists'
])
html_body = md.convert(processed_md)

# Creez director temporar pentru imagini Mermaid
temp_dir = tempfile.mkdtemp()
print(f"📁 Director temporar pentru diagrame: {temp_dir}")

# Renderez diagramele Mermaid și le embed în HTML
print("🎨 Renderez diagramele Mermaid...")
html_body = embed_mermaid_images(html_body, mermaid_blocks, temp_dir)

# Centrez footer-ul final
def center_footer(html_content):
    """Detectează și centrează footer-ul final al documentului"""
    # Caută ultimele paragrafe care conțin textul footer-ului
    footer_pattern = r'(<p><strong>DOCUMENTAȚIE ȘI ARHITECTURĂ.*?</p>.*?<p>Universitatea Româno-Americană.*?</p>)'

    def replacer(match):
        footer_html = match.group(1)
        return f'<div style="text-align: center; margin-top: 40pt;">{footer_html}</div>'

    return re.sub(footer_pattern, replacer, html_content, flags=re.DOTALL)

html_body = center_footer(html_body)

# CSS styling profesional
css_style = """
@page {
    size: A4;
    margin: 2.5cm 2cm 2.5cm 2cm;

    @top-center {
        content: "primariaTa❤️_ | Documentație și Arhitectură | docs.primariata.work";
        font-size: 9pt;
        color: #666;
        font-family: Arial, sans-serif;
    }

    @bottom-center {
        content: "Pagina " counter(page) " din " counter(pages);
        font-size: 9pt;
        color: #666;
        font-family: Arial, sans-serif;
    }
}

/* Page break utilities */
.page-break {
    page-break-after: always;
    break-after: page;
}

.section-break {
    page-break-before: always;
    break-before: page;
}

body {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #2c3e50;
    text-align: justify;
    hyphens: auto;
}

h1 {
    color: #1a237e;
    font-size: 24pt;
    font-weight: bold;
    margin-top: 30pt;
    margin-bottom: 20pt;
    page-break-after: avoid;
    font-family: Arial, sans-serif;
}

h2 {
    color: #283593;
    font-size: 18pt;
    font-weight: bold;
    margin-top: 24pt;
    margin-bottom: 12pt;
    page-break-after: avoid;
    border-bottom: 2px solid #3f51b5;
    padding-bottom: 6pt;
    font-family: Arial, sans-serif;
}

h3 {
    color: #3949ab;
    font-size: 14pt;
    font-weight: bold;
    margin-top: 18pt;
    margin-bottom: 10pt;
    page-break-after: avoid;
    font-family: Arial, sans-serif;
}

h4 {
    color: #5c6bc0;
    font-size: 12pt;
    font-weight: bold;
    margin-top: 14pt;
    margin-bottom: 8pt;
    page-break-after: avoid;
    font-family: Arial, sans-serif;
}

p {
    margin-bottom: 10pt;
    text-indent: 0;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 15pt 0;
    page-break-inside: avoid;
    font-size: 10pt;
}

table th {
    background-color: #3f51b5;
    color: white;
    padding: 8pt;
    text-align: center;
    font-weight: bold;
    border: 1px solid #3f51b5;
}

table td {
    padding: 6pt 8pt;
    border: 1px solid #ddd;
    background-color: #fafafa;
    text-align: center;
}

table tr:nth-child(even) td {
    background-color: #f5f5f5;
}

code {
    background-color: #f5f5f5;
    padding: 2pt 4pt;
    border-radius: 3pt;
    font-family: 'Courier New', monospace;
    font-size: 9pt;
    color: #c7254e;
}

pre {
    background-color: #f8f9fa;
    padding: 12pt;
    border-left: 4pt solid #3f51b5;
    border-radius: 4pt;
    overflow-x: auto;
    margin: 15pt 0;
    page-break-inside: avoid;
}

pre code {
    background-color: transparent;
    padding: 0;
    color: #2c3e50;
}

blockquote {
    margin: 15pt 20pt;
    padding: 10pt 15pt;
    background-color: #e3f2fd;
    border-left: 4pt solid #2196f3;
    font-style: italic;
    page-break-inside: avoid;
}

ul, ol {
    margin: 10pt 0 10pt 20pt;
    padding-left: 15pt;
}

li {
    margin-bottom: 6pt;
}

strong {
    color: #1a237e;
    font-weight: bold;
}

em {
    color: #424242;
    font-style: italic;
}

hr {
    border: none;
    border-top: 2px solid #e0e0e0;
    margin: 20pt 0;
}

/* First page special styling */
h1:first-of-type {
    text-align: center;
    color: #1a237e;
    font-size: 28pt;
    margin-top: 60pt;
    margin-bottom: 30pt;
    border-bottom: 4px solid #3f51b5;
    padding-bottom: 20pt;
}

/* Evită page break-uri inutile */
h1, h2, h3, h4, h5, h6 {
    page-break-after: avoid;
}

table, figure, img {
    page-break-inside: avoid;
}

/* Links */
a {
    color: #1976d2;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

/* Special boxes pentru insights */
.insight-box {
    background-color: #fff3e0;
    border-left: 4pt solid #ff9800;
    padding: 12pt;
    margin: 15pt 0;
    page-break-inside: avoid;
}

/* Highlight important metrics */
.metric {
    font-weight: bold;
    color: #1976d2;
    font-size: 12pt;
}

/* Mermaid Diagrams - Styling bazat pe complexitate */
.diagram-large {
    page-break-before: always;
    page-break-inside: avoid;
    margin: 20pt 0;
    text-align: center;
}

.diagram-large img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
}

.diagram-medium {
    page-break-inside: avoid;
    margin: 15pt 0;
    text-align: center;
    display: block;
    width: 100%;
    clear: both;
}

.diagram-medium img {
    max-width: 95%;
    height: auto;
    display: block;
    margin: 0 auto;
}

.diagram-small {
    page-break-inside: avoid;
    margin: 15pt 0;
    text-align: center;
    display: block;
    width: 100%;
}

.diagram-small img {
    max-width: 70%;
    height: auto;
    display: block;
    margin: 0 auto;
}

/* CUPRINS styling */
h2:contains("CUPRINS") {
    text-align: center;
    font-size: 20pt;
    margin-top: 40pt;
    margin-bottom: 30pt;
}
"""

# Template HTML complet
html_template = f"""
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <title>primariaTa❤️_ | Documentație și Arhitectură | docs.primariata.work</title>
</head>
<body>
{html_body}
</body>
</html>
"""

# Generez PDF-ul
print("📄 Generare PDF în curs...")
font_config = FontConfiguration()

html = HTML(string=html_template, base_url='.')
css = CSS(string=css_style, font_config=font_config)

# Salvez PDF-ul în directorul docs
output_path = script_dir.parent / 'docs' / '01-Prezentare' / 'DOCUMENTATIE_ARHITECTURA_COMPLETA.pdf'
html.write_pdf(str(output_path), stylesheets=[css], font_config=font_config)

# Cleanup: Șterg directorul temporar
import shutil
shutil.rmtree(temp_dir)

print(f"✅ PDF generat cu succes: {output_path}")
print(f"📊 Document complet cu {len(mermaid_blocks)} diagrame Mermaid renderizate")
print(f"📄 Gata pentru submisie academică!")
