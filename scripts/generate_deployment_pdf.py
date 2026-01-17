#!/usr/bin/env python3
"""
Script conversie DEPLOYMENT_PLAN.md → PDF profesional
Pentru primariata.work
"""

import markdown
from pathlib import Path
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration

# Paths
script_dir = Path(__file__).parent
project_root = script_dir.parent
input_file = project_root / 'DEPLOYMENT_PLAN.md'
output_file = project_root / 'DEPLOYMENT_PLAN.pdf'

print("📖 Citire DEPLOYMENT_PLAN.md...")
md_content = input_file.read_text(encoding='utf-8')

print("🔄 Conversie Markdown → HTML...")
html_body = markdown.markdown(
    md_content,
    extensions=[
        'markdown.extensions.tables',
        'markdown.extensions.fenced_code',
        'markdown.extensions.codehilite',
        'markdown.extensions.toc',
    ]
)

# CSS styling profesional
css_style = """
@page {
    size: A4;
    margin: 2cm 1.5cm;
    @top-center {
        content: "primariaTa❤️ - Production Deployment Plan";
        font-size: 10pt;
        color: #666;
    }
    @bottom-center {
        content: "Page " counter(page) " of " counter(pages);
        font-size: 9pt;
        color: #999;
    }
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #333;
}

h1 {
    color: #BE3144;
    font-size: 24pt;
    margin-top: 0;
    margin-bottom: 10pt;
    border-bottom: 3px solid #BE3144;
    padding-bottom: 5pt;
}

h2 {
    color: #333;
    font-size: 18pt;
    margin-top: 20pt;
    margin-bottom: 10pt;
    border-bottom: 2px solid #ddd;
    padding-bottom: 3pt;
    page-break-after: avoid;
}

h3 {
    color: #555;
    font-size: 14pt;
    margin-top: 15pt;
    margin-bottom: 8pt;
    page-break-after: avoid;
}

p {
    margin: 8pt 0;
    text-align: justify;
}

ul, ol {
    margin: 8pt 0;
    padding-left: 25pt;
}

li {
    margin: 4pt 0;
}

/* Checkboxes pentru task lists */
li:has(input[type="checkbox"]) {
    list-style: none;
    margin-left: -20pt;
}

input[type="checkbox"] {
    margin-right: 5pt;
}

code {
    background-color: #f5f5f5;
    padding: 2pt 4pt;
    border-radius: 3pt;
    font-family: 'Courier New', monospace;
    font-size: 10pt;
    color: #BE3144;
}

pre {
    background-color: #f8f8f8;
    border: 1px solid #ddd;
    border-left: 4px solid #BE3144;
    padding: 10pt;
    overflow-x: auto;
    page-break-inside: avoid;
    margin: 10pt 0;
}

pre code {
    background-color: transparent;
    padding: 0;
    color: #333;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 10pt 0;
    page-break-inside: avoid;
}

th {
    background-color: #BE3144;
    color: white;
    padding: 8pt;
    text-align: left;
    font-weight: bold;
}

td {
    padding: 8pt;
    border-bottom: 1px solid #ddd;
}

tr:nth-child(even) {
    background-color: #f9f9f9;
}

strong {
    color: #BE3144;
    font-weight: bold;
}

em {
    color: #666;
    font-style: italic;
}

hr {
    border: none;
    border-top: 2px solid #ddd;
    margin: 20pt 0;
}

/* Prevent page breaks inside important blocks */
.no-break {
    page-break-inside: avoid;
}

/* Links */
a {
    color: #BE3144;
    text-decoration: none;
}

/* Blockquotes */
blockquote {
    border-left: 4px solid #BE3144;
    padding-left: 15pt;
    margin: 10pt 0;
    color: #666;
    font-style: italic;
}
"""

# HTML template
html_template = f"""
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <title>primariaTa❤️ - Production Deployment Plan</title>
</head>
<body>
{html_body}
</body>
</html>
"""

print("📄 Generare PDF...")
font_config = FontConfiguration()

html = HTML(string=html_template, base_url='.')
css = CSS(string=css_style, font_config=font_config)

html.write_pdf(str(output_file), stylesheets=[css], font_config=font_config)

print(f"✅ PDF generat cu succes: {output_file}")
print(f"📋 Document gata pentru distribuire!")
