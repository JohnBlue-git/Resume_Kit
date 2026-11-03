"""Checks run on every built resume. Returns (problems, warnings, pages)."""
import re
from html.parser import HTMLParser

from docx import Document
from pdfminer.high_level import extract_pages, extract_text


class _Text(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts, self.skip = [], 0

    def handle_starttag(self, tag, attrs):
        if tag in ("style", "script", "title"):
            self.skip += 1

    def handle_endtag(self, tag):
        if tag in ("style", "script", "title"):
            self.skip -= 1

    def handle_data(self, d):
        if not self.skip:
            self.parts.append(d)


def html_text(path):
    p = _Text()
    p.feed(path.read_text(encoding="utf-8"))
    return " ".join(" ".join(p.parts).split())


def words(s):
    return {w.lower() for w in re.findall(r"[A-Za-z]{3,}", s)}


def run(m, c, used_facts, html_path, pdf_path, docx_path):
    pol = c.policy
    problems, warnings = [], []
    text = html_text(html_path)
    docx_text = " ".join(p.text for p in Document(str(docx_path)).paragraphs)

    # 1. banned claims and known typos, in both HTML and DOCX
    for label, t in (("html", text), ("docx", docx_text)):
        for rule in pol["banned"]:
            for hit in re.finditer(rule["pattern"], t, re.I):
                problems.append(f"{label}: banned claim '{hit.group(0)}' ({rule['why']})")
        for typo in pol["typos"]:
            if re.search(rf"\b{re.escape(typo)}\b", t, re.I):
                problems.append(f"{label}: known typo '{typo}'")

    # 2. ownership verbs only on owned bullets
    verbs = set(pol["ownership_verbs"])
    for b in m["bullet_meta"]:
        first = b["plain"].split()[0]
        if first in verbs and b["ownership"] != "owned":
            problems.append(f"bullet '{b['id']}' starts with '{first}' but ownership is {b['ownership']}")

    # 3. self-directed projects are labeled
    label = pol["self_directed_label"].lower()
    sd = [p for p in c.projects.values() if p["kind"] == "self-directed"]
    if "projects" in m["layout"] and (m["projects_detailed"] or m["projects_short"]):
        if label not in m["projects_title"].lower():
            problems.append(f"projects section title must contain '{pol['self_directed_label']}'")
    for s in [m["headline_plain"]] + [b["plain"] for b in m["summary"]]:
        for p in sd:
            if p["name"] in s and label not in s.lower():
                problems.append(f"'{p['name']}' mentioned without the '{pol['self_directed_label']}' label: {s[:70]}...")

    # 4. PDF: page limit and text extraction (what an ATS sees)
    pages = sum(1 for _ in extract_pages(str(pdf_path)))
    if pages > pol["max_pages"]:
        problems.append(f"{pages} pages, limit is {pol['max_pages']}")
    pdf_text = extract_text(str(pdf_path))
    missing = sorted(words(text) - words(pdf_text))
    if missing:
        problems.append(f"words lost in PDF text extraction: {', '.join(missing[:12])}")
    for kw in pol["ats_keywords"]:
        if re.search(rf"\b{kw}\b", text, re.I) and not re.search(rf"\b{kw}\b", pdf_text, re.I):
            problems.append(f"ATS keyword '{kw}' not extractable from PDF")

    # 5. facts that still need confirming
    for k, f in sorted(used_facts.items()):
        if f.get("status") == "unverified":
            warnings.append(f"fact '{k}' = {f['value']} is unverified ({f.get('source', '')})")
    return problems, warnings, pages
