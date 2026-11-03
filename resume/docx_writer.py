"""Word version of the same resume model, for portals that only accept .docx.
Plain single-column layout: real headings, real bullets, no tables or text boxes (ATS-safe)."""
from docx import Document
from docx.enum.text import WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Mm, Pt, RGBColor

FONT = "Arial"
MUTED = RGBColor(0x44, 0x44, 0x44)


def _font(run, size=None, bold=None, italic=None, color=None):
    run.font.name = FONT
    run._element.get_or_add_rPr().get_or_add_rFonts().set(qn("w:eastAsia"), FONT)
    if size: run.font.size = Pt(size)
    if bold is not None: run.bold = bold
    if italic is not None: run.italic = italic
    if color is not None: run.font.color.rgb = color
    return run


def _para(doc, runs=(), size=10.5, space_after=1, style=None):
    p = doc.add_paragraph(style=style)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.space_before = Pt(0)
    for text, bold in runs:
        _font(p.add_run(text), size, bold)
    return p


def _shade(p, hex_fill):
    pPr = p._p.get_or_add_pPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear"); shd.set(qn("w:color"), "auto"); shd.set(qn("w:fill"), hex_fill)
    pPr.append(shd)


def _heading(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True
    r = _font(p.add_run(text), 13, True)
    r.underline = True
    return p


def _bullet(doc, runs, extra=None):
    p = _para(doc, runs, style="List Bullet")
    p.paragraph_format.left_indent = Mm(5)
    if extra:
        p.add_run().add_break()
        _font(p.add_run(extra), 10, False, color=MUTED)
    return p


def write(m, path):
    doc = Document()
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Mm(210), Mm(297)
    sec.left_margin = sec.right_margin = Mm(15)
    sec.top_margin = sec.bottom_margin = Mm(13)
    normal = doc.styles["Normal"]
    normal.font.name, normal.font.size = FONT, Pt(10.5)

    pr = m["profile"]
    _para(doc, [(pr["name"], True)], size=21, space_after=3)
    if m.get("role"):
        _font(_para(doc, space_after=3).add_run(m["role"]), 11, True, color=RGBColor(0x00, 0x89, 0x7E))
    _para(doc, [(f"{pr['location']}  |  {pr['email']}  |  {pr['phone']}", False)], size=10)
    _para(doc, [("  |  ".join(f"{l['label']}: {l['url']}" for l in pr["links"]), False)], size=10, space_after=5)
    hp = _para(doc, [(m["headline_plain"], True)], space_after=4)
    _shade(hp, "D9DDE3")

    for s in m["layout"]:
        if s == "summary":
            _heading(doc, "Summary")
            for b in m["summary"]:
                _bullet(doc, b["runs"])
        elif s == "skills":
            _heading(doc, "Technical Skills")
            for g in m["skills"]:
                _para(doc, [(g["label"] + ": ", True), (" | ".join(g["items"]), False)], space_after=2)
        elif s == "experience":
            _heading(doc, "Experience")
            for job in m["experience"]:
                p = _para(doc, [(f"{job['company']} | {job['title']}", True)], size=11, space_after=1)
                p.paragraph_format.tab_stops.add_tab_stop(Mm(180), WD_TAB_ALIGNMENT.RIGHT)
                p.paragraph_format.keep_with_next = True
                _font(p.add_run("\t" + job["dates"]), 10.5, False, True)
                for b in job["bullets"]:
                    _bullet(doc, b["runs"], f"GitHub: {b['link']}" if b.get("link") else None)
        elif s == "education":
            _heading(doc, "Education")
            for e in pr["education"]:
                _para(doc, [(e["school"], True)], size=11)
                for d in e["degrees"]:
                    _para(doc, [(f"{d['degree']} ({d['year']}, GPA {d['gpa']})", False)])
        elif s == "projects":
            _heading(doc, m["projects_title"])
            for p in m["projects_detailed"]:
                _para(doc, [(p["name"], True)], size=11).paragraph_format.keep_with_next = True
                _font(_para(doc).add_run(p["subtitle"]), 10.5, color=MUTED)
                _font(_para(doc).add_run("GitHub: " + p["url"]), 10, color=MUTED)
                for b in p["bullets"]:
                    _bullet(doc, b["runs"])
            for p in m["projects_short"]:
                _para(doc, [(p["name"], True)], size=11).paragraph_format.keep_with_next = True
                _para(doc, [(p["short_plain"], False)])
                _font(_para(doc, space_after=4).add_run("GitHub: " + p["url"]), 10, color=MUTED)
    doc.core_properties.author = pr["name"]
    doc.core_properties.title = f"{pr['name']} – Resume"
    doc.save(str(path))
