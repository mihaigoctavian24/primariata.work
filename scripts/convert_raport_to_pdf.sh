#!/bin/bash

# Script pentru conversie Raport Markdown → PDF cu suport Mermaid
# Folosește virtual environment Python pentru dependențe

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VENV_DIR="$PROJECT_ROOT/venv"

echo "📦 Verificare virtual environment..."

# Creez venv dacă nu există
if [ ! -d "$VENV_DIR" ]; then
    echo "🔧 Creez Python virtual environment..."
    python3 -m venv "$VENV_DIR"
fi

# Activez venv
source "$VENV_DIR/bin/activate"

# Instalez/actualizez dependențe
echo "📥 Instalare dependențe Python..."
pip install -q --upgrade pip
pip install -q markdown weasyprint

# Rulez scriptul de generare PDF
echo "🚀 Generare PDF Raport în curs..."
python "$SCRIPT_DIR/generate_raport_pdf.py"

# Deactivez venv
deactivate

echo ""
echo "✅ Conversie completă!"
echo "📄 PDF disponibil în: docs/01-Prezentare/RAPORT_COMPLET_PRIMARIATA_rev2_RO.pdf"
