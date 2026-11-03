#!/usr/bin/env python3
"""Show what an applicant-tracking system reads from any PDF resume.

    python tools/ats_check.py some_resume.pdf [keyword ...]

Reports the page count, ligature glyphs that leak into the extracted text (Pages exports
"fi"/"fl" as single glyphs without a Unicode mapping, so "Redfish" is read as "Red?sh" or
"Red sh"), and whether each keyword survives extraction exactly."""
import re
import sys

from pdfminer.high_level import extract_pages, extract_text

DEFAULT_KEYWORDS = ["Redfish", "OpenBMC", "workflow", "firmware", "profiling", "efficiency", "identified"]
LIGATURES = re.compile("[ﬀ-ﬆ]")


def main():
    pdf, kws = sys.argv[1], sys.argv[2:] or DEFAULT_KEYWORDS
    text = extract_text(pdf)
    pages = sum(1 for _ in extract_pages(pdf))
    ligs = LIGATURES.findall(text)
    bad = sorted({m.group(0) for m in re.finditer(r"\w*[ﬀ-ﬆ]\w*", text)})
    print(f"{pdf}\n  pages: {pages}, words: {len(text.split())}")
    print(f"  ligature glyphs in text: {len(ligs)}" + (f"  e.g. {', '.join(bad[:8])}" if bad else ""))
    for k in kws:
        found = re.search(r"\b" + re.escape(k) + r"\b", text, re.I)
        print(("  ok   " if found else "  LOST ") + k)
    sys.exit(1 if ligs else 0)


if __name__ == "__main__":
    main()
