"""Convert the merged deck (pptxgenjs-style OOXML) into one self-contained interactive HTML presentation.

Static fidelity: every text box, shape, line/arrow, table, picture and the bar chart is placed absolutely
on a 1280x720 stage (1 px = 9525 EMU), so the HTML matches the PPTX/PDF of the same iteration.
Interactivity layered on top (see FRAGMENTS / runtime JS): step-by-step builds, p.N links, cover-chip
links, table of contents, speaker notes, screenshot lightbox, print-to-PDF.
"""
import base64, hashlib, html, json, re, sys
from pptx import Presentation

SRC, OUT = sys.argv[1], sys.argv[2]  # merged .pptx in, .html out
A = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
P = "{http://schemas.openxmlformats.org/presentationml/2006/main}"
C = "{http://schemas.openxmlformats.org/drawingml/2006/chart}"
EMU_PX = 9525.0
_MID = 0
IN = 914400.0
FONTS = {
    "Cambria": "Cambria, Caladea, Georgia, serif",
    "Calibri": "Calibri, Carlito, 'Segoe UI', Arial, sans-serif",
    "Courier New": "'Courier New', 'Liberation Mono', Consolas, monospace",
}

# ---------------------------------------------------------------- build steps (inches)
# Steps are matched by a substring of the slide's title. Each step is a list of rects
# (x0, y0, x1, y1); an element whose centre falls in a rect appears at that step.
# "rows": body rows of the slide's first table become extra steps, inserted at position given.
def cols(xs, y0, y1):
    return [[(a, y0, b, y1)] for a, b in xs]

FRAGMENTS = {
    "BMC, Redfish — and Where My Work Sits": {
        "steps": cols([(0.5, 4.6), (4.6, 8.7), (8.7, 12.9)], 1.5, 4.95)
        + [[(0.5, 5.0, 2.6, 6.2)]] + [[(0.6 + i * 2.062 - 0.25, 5.35, 0.6 + i * 2.062 + 1.82, 6.2)] for i in range(1, 6)]
        + [[(0.5, 6.2, 12.9, 6.65)]],
    },
    "Problem & Architecture": {
        "steps": [[(6.05, y - 0.36, 9.8, y + 0.82)] for y in (1.62, 2.75, 3.88, 5.01)]
        + [[(9.8, 2.2, 12.9, 5.6)]] + [[(0.5, 6.1, 12.9, 6.95)]],
    },
    "Trade-offs & Results": {"rows": 0, "steps": [[(0.5, 6.0, 12.9, 6.98)]]},
    "What a Run Looks Like": {"steps": [[(7.1, 1.45, 12.9, 3.0)], [(7.1, 3.0, 12.9, 4.75)], [(7.1, 4.75, 12.9, 6.2)]]},
    "TLS 1.2 Handshake": {
        "steps": [[(0.5, y - 0.34, 12.9, y + 0.3)] for y in (1.90, 2.50, 3.10, 3.70, 4.30, 4.90)]
        + [[(0.5, 5.15, 12.9, 6.02)], [(0.5, 6.05, 12.9, 6.55)], [(0.5, 6.58, 12.9, 7.02)]],
    },
    "Gated AI-Pair Workflow": {
        "steps": [[(1.65 + i * 2.246 - 0.15, 1.5, 1.65 + i * 2.246 + 2.096, 5.76)] for i in range(5)] + [[(0.5, 5.8, 12.9, 6.95)]],
    },
    "What the Agent Reads": {"steps": [[(0.5, 1.45, 4.92, 5.7)], [(4.92, 2.5, 8.45, 4.7)], [(8.45, 1.45, 12.9, 5.7)], [(0.5, 5.78, 12.9, 6.95)]]},
    "What the Process Caught": {"rows": 0, "steps": [[(0.5, 5.45, 12.9, 5.88), (0.5, 5.88, 3.5, 6.6)], [(3.5, 5.88, 6.6, 6.6)], [(6.6, 5.88, 9.7, 6.6)], [(9.7, 5.88, 12.9, 6.6)]]},
    "Kernel-Side Session Binding": {
        "steps": [[(0.5, 1.55, 3.5, 2.6)], [(3.5, 1.55, 6.25, 2.6)], [(6.25, 1.55, 9.5, 2.6)], [(9.5, 1.55, 12.9, 2.6)],
                  [(0.5, 2.6, 12.9, 3.95)]] + cols([(0.5, 4.6), (4.6, 8.7), (8.7, 12.9)], 4.0, 5.75) + [[(0.5, 5.78, 12.9, 6.5)]],
    },
    "Known Limitations": {"rows": 0, "steps": []},
    "Seven Layers, Two Very Different Shapes": {
        "steps": [[(0.5, 1.86 + 0.57 * i, 12.9, 1.86 + 0.57 * (i + 1))] for i in range(7)] + [[(0.5, 6.0, 12.9, 6.98)]],
    },
    "Work vs. Self-Directed": {"steps": [[(0.5, 4.9, 4.95, 6.85)]]},
}


def px(v):
    return round(int(v) / EMU_PX, 2)


def color_of(el):
    """Return css color from an element that may contain a:solidFill / a:srgbClr (+alpha)."""
    if el is None:
        return None
    sf = el if el.tag == A + "solidFill" else el.find(A + "solidFill")
    if sf is None:
        return None
    c = sf.find(A + "srgbClr")
    if c is None:
        return None
    val = c.get("val")
    al = c.find(A + "alpha")
    if al is not None:
        a = int(al.get("val")) / 100000
        r, g, b = int(val[0:2], 16), int(val[2:4], 16), int(val[4:6], 16)
        return f"rgba({r},{g},{b},{a:.2f})"
    return "#" + val


def esc(t):
    return html.escape(t, quote=False)


def run_css(rpr, default_sz=18):
    css = []
    sz = default_sz
    if rpr is not None:
        if rpr.get("sz"):
            sz = int(rpr.get("sz")) / 100
        if rpr.get("b") == "1":
            css.append("font-weight:700")
        if rpr.get("i") == "1":
            css.append("font-style:italic")
        if rpr.get("u") and rpr.get("u") != "none":
            css.append("text-decoration:underline")
        if rpr.get("spc"):
            css.append(f"letter-spacing:{int(rpr.get('spc')) / 100 * 96 / 72:.2f}px")
        col = color_of(rpr)
        if col:
            css.append(f"color:{col}")
        lat = rpr.find(A + "latin")
        if lat is not None:
            css.append(f"font-family:{FONTS.get(lat.get('typeface'), repr(lat.get('typeface')))}")
    css.append(f"font-size:{sz * 96 / 72:.2f}px")
    return ";".join(css), sz


def para_html(p):
    pprs = p.findall(A + "pPr")
    first = pprs[0] if pprs else None
    algn, lnspc, aft, bef, mar, ind, bu, bucol = "l", None, 0, 0, 0, 0, None, None
    for pp in pprs:
        if pp.get("algn"):
            algn = pp.get("algn")
        ls = pp.find(A + "lnSpc/" + A + "spcPct")
        if ls is not None:
            lnspc = int(ls.get("val")) / 100000
        sa = pp.find(A + "spcAft/" + A + "spcPts")
        if sa is not None:
            aft = int(sa.get("val")) / 100
        sb = pp.find(A + "spcBef/" + A + "spcPts")
        if sb is not None:
            bef = int(sb.get("val")) / 100
    if first is not None:
        mar = int(first.get("marL", "0"))
        ind = int(first.get("indent", "0"))
        bc = first.find(A + "buChar")
        if bc is not None:
            bu = bc.get("char")
            bucol = color_of(first.find(A + "buClr"))
    parts, maxsz, first_css = [], 0, None
    for ch in p:
        if ch.tag == A + "r":
            css, sz = run_css(ch.find(A + "rPr"))
            maxsz = max(maxsz, sz)
            first_css = first_css or css
            t = ch.find(A + "t")
            parts.append(f'<span style="{css}">{esc(t.text or "")}</span>')
        elif ch.tag == A + "br":
            parts.append("<br>")
        elif ch.tag == A + "fld":
            css, sz = run_css(ch.find(A + "rPr"))
            t = ch.find(A + "t")
            parts.append(f'<span style="{css}">{esc(t.text or "")}</span>')
    if not maxsz:
        epr = p.find(A + "endParaRPr")
        maxsz = int(epr.get("sz")) / 100 if epr is not None and epr.get("sz") else 12
    lh = (lnspc or 1.0) * 1.2
    al = {"l": "left", "ctr": "center", "r": "right", "just": "justify"}.get(algn, "left")
    style = [f"text-align:{al}", f"line-height:{lh:.3f}", f"margin:{bef * 4 / 3:.1f}px 0 {aft * 4 / 3:.1f}px 0", f"font-size:{maxsz * 4 / 3:.2f}px"]
    inner = "".join(parts) or "&nbsp;"
    if bu:
        hang = abs(ind) / EMU_PX
        style.append(f"padding-left:{mar / EMU_PX:.1f}px;text-indent:-{hang:.1f}px")
        bst = (first_css or "") + (f";color:{bucol}" if bucol else "")
        inner = f'<span class="bu" style="{bst};display:inline-block;width:{hang:.1f}px;text-indent:0">{esc(bu)}</span>' + inner
    return f'<p style="{";".join(style)}">{inner}</p>'


def text_html(txbody, w, h, rot=None):
    bp = txbody.find(A + "bodyPr")
    ins = {k: int(bp.get(k, d)) / EMU_PX for k, d in (("lIns", 91440), ("tIns", 45720), ("rIns", 91440), ("bIns", 45720))} if bp is not None else {"lIns": 9.6, "tIns": 4.8, "rIns": 9.6, "bIns": 4.8}
    anchor = bp.get("anchor", "t") if bp is not None else "t"
    jc = {"t": "flex-start", "ctr": "center", "b": "flex-end"}.get(anchor, "flex-start")
    paras = txbody.findall(A + "p")
    body = "".join(para_html(p) for p in paras)
    if not any(p.find(A + "r") is not None for p in paras):
        return ""
    return (f'<div class="tx" style="padding:{ins["tIns"]:.1f}px {ins["rIns"]:.1f}px {ins["bIns"]:.1f}px {ins["lIns"]:.1f}px;'
            f'justify-content:{jc}">{body}</div>')


class Images:
    def __init__(self):
        self.css, self.seen = [], {}

    def cls(self, blob, ctype):
        hsh = hashlib.sha1(blob).hexdigest()[:10]
        if hsh not in self.seen:
            self.seen[hsh] = True
            self.css.append(f".im-{hsh}{{background-image:url(data:{ctype};base64,{base64.b64encode(blob).decode()})}}")
        return f"im-{hsh}"


def geom(sh):
    x = sh._element
    xfrm = x.find(".//" + A + "xfrm")
    if xfrm is None:
        xfrm = x.find(".//" + P + "xfrm")
    off, ext = xfrm.find(A + "off"), xfrm.find(A + "ext")
    return (int(off.get("x")), int(off.get("y")), int(ext.get("cx")), int(ext.get("cy")),
            xfrm.get("flipH") == "1", xfrm.get("flipV") == "1", int(xfrm.get("rot", "0")) / 60000)


def line_svg(x, y, w, h, fh, fv, ln):
    col = color_of(ln) or "#3E5C76"
    sw = max(int(ln.get("w", "12700")) / EMU_PX, 0.75)
    pad = 8
    X, Y, W, H = px(x) - pad, px(y) - pad, px(w) + 2 * pad, px(h) + 2 * pad
    x1, y1, x2, y2 = pad, pad, W - pad, H - pad
    if fh:
        x1, x2 = x2, x1
    if fv:
        y1, y2 = y2, y1
    dash = ' stroke-dasharray="6 4"' if ln.find(A + "prstDash") is not None and ln.find(A + "prstDash").get("val") not in (None, "solid") else ""
    global _MID
    _MID += 1
    mid = f"{_MID}"
    head = ln.find(A + "tailEnd") is not None and ln.find(A + "tailEnd").get("type") not in (None, "none")
    tail = ln.find(A + "headEnd") is not None and ln.find(A + "headEnd").get("type") not in (None, "none")
    me = f' marker-end="url(#ar-{mid})"' if head else ""
    ms = f' marker-start="url(#ars-{mid})"' if tail else ""
    defs = (f'<defs><marker id="ar-{mid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="{col}"/></marker>'
            f'<marker id="ars-{mid}" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="{col}"/></marker></defs>')
    return (f'<svg class="el" style="left:{X}px;top:{Y}px;width:{W}px;height:{H}px" viewBox="0 0 {W} {H}">{defs}'
            f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{col}" stroke-width="{sw:.2f}"{dash}{me}{ms}/></svg>')


def shape_html(sh, images):
    el = sh._element
    tag = el.tag
    x, y, w, h, fh, fv, rot = geom(sh)
    box = f"left:{px(x)}px;top:{px(y)}px;width:{px(w)}px;height:{px(h)}px"
    rot_css = f";transform:rotate({rot}deg)" if rot else ""
    if tag == P + "pic":
        descr = el.find(".//" + P + "cNvPr").get("descr", "")
        cls = images.cls(sh.image.blob, sh.image.content_type)
        big = w / IN > 1.6
        return f'<div class="el pic {cls}{" zoom" if big else ""}" style="{box}{rot_css}" title="{"Click to enlarge" if big else ""}" data-alt="{html.escape(descr)}"></div>'
    if tag == P + "graphicFrame":
        if sh.has_table:
            return table_html(el, x, y, w)
        if sh.has_chart:
            return chart_html(sh, box)
        return ""
    sppr = el.find(P + "spPr")
    pg = sppr.find(A + "prstGeom") if sppr is not None else None
    prst = pg.get("prst") if pg is not None else "rect"
    ln = sppr.find(A + "ln") if sppr is not None else None
    if prst == "line":
        return line_svg(x, y, w, h, fh, fv, ln if ln is not None else el)
    fill = color_of(sppr) if sppr is not None and sppr.find(A + "noFill") is None else None
    css = [box]
    if fill:
        css.append(f"background:{fill}")
    if ln is not None and ln.find(A + "solidFill") is not None and ln.find(A + "noFill") is None:
        lw = max(int(ln.get("w", "12700")) / EMU_PX, 0.75)
        dash = "dashed" if ln.find(A + "prstDash") is not None and ln.find(A + "prstDash").get("val") not in ("solid",) else "solid"
        css.append(f"border:{lw:.2f}px {dash} {color_of(ln)};box-sizing:border-box")
    if prst == "roundRect":
        gd = pg.find(".//" + A + "gd")
        adj = int(gd.get("fmla").split()[1]) if gd is not None else 16667
        css.append(f"border-radius:{min(px(w), px(h)) * adj / 100000:.1f}px")
    elif prst == "ellipse":
        css.append("border-radius:50%")
    if sppr is not None and sppr.find(".//" + A + "outerShdw") is not None:
        css.append("box-shadow:0 2px 7px rgba(15,36,64,.14)")
    if rot:
        css.append(f"transform:rotate({rot}deg)")
    inner = ""
    tb = el.find(P + "txBody")
    if tb is not None:
        inner = text_html(tb, w, h)
    if prst == "parallelogram":
        off = min(px(w), px(h)) * 0.25
        bc = color_of(ln) if ln is not None else "none"
        return (f'<svg class="el" style="{box}" viewBox="0 0 {px(w)} {px(h)}"><polygon points="{off},0 {px(w)},0 {px(w) - off},{px(h)} 0,{px(h)}" '
                f'fill="{fill or "none"}" stroke="{bc}" stroke-width="1"/></svg>')
    if not fill and "border" not in "".join(css) and not inner:
        return ""
    return f'<div class="el{" tb" if inner else ""}" style="{";".join(css)}">{inner}</div>'


def cell_border(tcpr, side):
    l = tcpr.find(A + "ln" + side) if tcpr is not None else None
    if l is None or l.find(A + "solidFill") is None:
        return ""
    return f"border-{ {'L': 'left', 'R': 'right', 'T': 'top', 'B': 'bottom'}[side] }:{max(int(l.get('w', '9525')) / EMU_PX, 0.75):.2f}px solid {color_of(l)};"


def table_html(gf, x, y, w):
    tbl = gf.find(".//" + A + "tbl")
    cols = [int(g.get("w")) / EMU_PX for g in tbl.find(A + "tblGrid")]
    out = [f'<table class="el tbl" style="left:{px(x)}px;top:{px(y)}px;width:{sum(cols):.1f}px"><colgroup>']
    out += [f'<col style="width:{c:.1f}px">' for c in cols] + ["</colgroup>"]
    for ri, tr in enumerate(tbl.findall(A + "tr")):
        out.append(f'<tr class="{"hd" if ri == 0 else "rw"}" style="height:{int(tr.get("h")) / EMU_PX:.1f}px">')
        for tc in tr.findall(A + "tc"):
            if tc.get("hMerge") == "1" or tc.get("vMerge") == "1":
                continue
            tcpr = tc.find(A + "tcPr")
            m = {k: int(tcpr.get(k, d)) / EMU_PX for k, d in (("marL", 91440), ("marR", 91440), ("marT", 45720), ("marB", 45720))} if tcpr is not None else {"marL": 9.6, "marR": 9.6, "marT": 4.8, "marB": 4.8}
            va = {"t": "top", "ctr": "middle", "b": "bottom"}.get(tcpr.get("anchor", "t") if tcpr is not None else "t", "top")
            bg = color_of(tcpr) if tcpr is not None else None
            span = f' colspan="{tc.get("gridSpan")}"' if tc.get("gridSpan") else ""
            style = (f"padding:{m['marT']:.1f}px {m['marR']:.1f}px {m['marB']:.1f}px {m['marL']:.1f}px;vertical-align:{va};"
                     + (f"background:{bg};" if bg else "") + "".join(cell_border(tcpr, s) for s in "LRTB"))
            body = "".join(para_html(p) for p in tc.find(A + "txBody").findall(A + "p"))
            out.append(f'<td{span} style="{style}">{body}</td>')
        out.append("</tr>")
    out.append("</table>")
    return "".join(out)


def chart_html(sh, box):
    cs = sh.chart._chartSpace
    title = "".join(t.text or "" for t in cs.iter(A + "t"))
    ser = cs.find(".//" + C + "ser")
    cats = [p.find(C + "v").text for p in ser.find(C + "cat").iter(C + "pt")]
    vals = [float(p.find(C + "v").text) for p in ser.find(C + "val").iter(C + "pt")]
    col = color_of(ser.find(C + "spPr")) or "#00897E"
    mx = max(vals) or 1
    rows = "".join(
        f'<div class="cr"><span class="cl">{esc(c)}</span><span class="cb"><i style="width:{v / mx * 100:.1f}%;background:{col}"></i><b>{v:g}</b></span></div>'
        for c, v in zip(cats, vals))
    return f'<div class="el chart" style="{box}"><div class="ct">{esc(title)}</div><div class="crs">{rows}</div></div>'


def slide_meta(slide):
    texts = []
    for sh in slide.shapes:
        if sh.has_text_frame and sh.text_frame.text.strip():
            sz = max((r.font.size.pt for p in sh.text_frame.paragraphs for r in p.runs if r.font.size), default=0)
            texts.append((sz, sh.top, sh.text_frame.text.strip()))
    top = [t for t in texts if t[1] < IN * 1.5 and not t[2].isupper()]
    pool = top or texts
    pool.sort(key=lambda t: (-t[0], t[1]))
    title = pool[0][2] if pool else ""
    kick = next((t for _, top, t in sorted(texts, key=lambda t: t[1]) if top < IN * 0.6 and t.isupper()), "")
    return title.replace("\n", " "), kick


def main():
    prs = Presentation(SRC)
    images = Images()
    slides_html, meta = [], []
    for si, slide in enumerate(prs.slides):
        bg = "#FFFFFF"
        bgel = slide._element.find(".//" + P + "bg")
        if bgel is not None and color_of(bgel.find(".//" + A + "solidFill")):
            bg = color_of(bgel.find(".//" + A + "solidFill"))
        title, kick = slide_meta(slide)
        cfg = next((v for k, v in FRAGMENTS.items() if k in title), None)
        parts = []
        for sh in slide.shapes:
            h_ = shape_html(sh, images)
            if not h_:
                continue
            x, y, w, h, *_ = geom(sh)
            cx, cy = (x + w / 2) / IN, (y + h / 2) / IN
            frag = None
            if cfg:
                for k, rects in enumerate(cfg["steps"]):
                    if any(a <= cx <= c and b <= cy <= d for a, b, c, d in rects):
                        frag = k + 1
                        break
            if frag:
                h_ = h_.replace('class="el', f'data-f="{frag}" class="el', 1)
            parts.append(h_)
        body = "".join(parts)
        nfr = len(cfg["steps"]) if cfg else 0
        if cfg and "rows" in cfg:
            # table body rows become steps 1..R; shift rect steps after them
            m = re.search(r'<table class="el tbl".*?</table>', body, re.S)
            if m:
                tbl = m.group(0)
                nrows = tbl.count('<tr class="rw"')
                body = re.sub(r'data-f="(\d+)"', lambda mm: f'data-f="{int(mm.group(1)) + nrows}"', body)
                k = iter(range(1, nrows + 1))
                tbl2 = re.sub(r'<tr class="rw"', lambda mm: f'<tr data-f="{next(k)}" class="rw"', tbl)
                body = body.replace(tbl, tbl2)
                nfr += nrows
        # page links: "p.12–18" / "p.8" → jump to that footer page (slide index = page number, 0-based)
        def link(mm):
            return f'<a class="go" data-go="{mm.group(1)}">{mm.group(0)}</a>'
        body = re.sub(r"(?<![\w/])p\.(\d{1,2})(?:–\d{1,2})?", link, body)
        notes = ""
        if slide.has_notes_slide:
            notes = slide.notes_slide.notes_text_frame.text.strip()
        is_cover = bool(re.search(r"PROJECT\s+\d\s+OF\s+9", " ".join(sh.text_frame.text for sh in slide.shapes if sh.has_text_frame)))
        slides_html.append(f'<section class="slide" data-n="{si}" data-frags="{nfr}"{" data-cover=1" if is_cover else ""} style="background:{bg}">{body}</section>')
        meta.append({"title": title, "kick": kick, "notes": notes, "cover": is_cover})
    tpl = open(__file__.replace("tohtml.py", "deck_template.html"), encoding="utf-8").read()
    out = (tpl.replace("/*IMAGES*/", "\n".join(images.css))
              .replace("<!--SLIDES-->", "\n".join(slides_html))
              .replace("/*META*/[]", json.dumps(meta, ensure_ascii=False)))
    open(OUT, "w", encoding="utf-8").write(out)
    print("html slides:", len(slides_html), "->", OUT, f"({len(out) / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
