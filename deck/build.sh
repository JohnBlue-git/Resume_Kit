#!/usr/bin/env bash
# One deck iteration = three files in out/deck/: .pptx, .pdf, .html
#   needs: node + pptxgenjs (npm install in deck/), python3 + python-pptx/lxml deps of tohtml.py,
#          LibreOffice (soffice) for the PDF.
set -euo pipefail
DECK="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$DECK")"
OUT="$ROOT/out/deck"; B="$OUT/_build"; NAME="Yujen_Lan_Interview_Deck"
mkdir -p "$B"
node "$DECK/src/build_new.js" "$B"
python3 "$DECK/src/merge.py" "$B" "$OUT/$NAME.pptx"
if command -v soffice >/dev/null; then
  soffice --headless --convert-to pdf --outdir "$OUT" "$OUT/$NAME.pptx" >/dev/null 2>&1
  echo "pdf: $(pdfinfo "$OUT/$NAME.pdf" 2>/dev/null | awk '/^Pages/{print $2}') pages"
else
  echo "soffice not found: skipped PDF (install LibreOffice, or open the .pptx and export)"
fi
python3 "$DECK/src/tohtml.py" "$OUT/$NAME.pptx" "$OUT/$NAME.html"
echo "deck -> $OUT/$NAME.{pptx,pdf,html}"
