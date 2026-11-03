"""Merge freshly generated slides (new.pptx) into the existing deck (base.pptx), reorder,
apply targeted text fixes to kept slides, and renumber every footer page number.

Both decks come from pptxgenjs with the same single master/layout, so a slide can be moved
by copying its XML, its media/chart/notes parts, and registering it in the package."""
import json, os, re, shutil, subprocess, sys, zipfile

DECK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORK = sys.argv[1] if len(sys.argv) > 1 else os.path.join(DECK, "..", "out", "deck", "_build")
BASE, NEW = os.path.join(DECK, "base.pptx"), f"{WORK}/new.pptx"
OUT = sys.argv[2] if len(sys.argv) > 2 else f"{WORK}/merged.pptx"

ORDER = (["n:title", "n:context", "n:exp", "n:projects", "n:tracks", "b:11",
          "b:12",
          "n:cover:1", "n:dc1", "n:dc2", "n:rReport", "n:rViz", "b:14", "n:r2", "n:r3", "n:r4", "n:r5", "n:rAgent", "n:r6",
          "n:cover:2", "b:20", "b:21", "b:22", "n:hgTests", "n:hgSession", "b:24", "b:25", "b:26",
          "n:cover:3", "b:28", "b:29", "b:30",
          "n:cover:4", "b:32", "b:33", "b:34",
          "n:cover:5", "b:36", "b:37", "b:38", "b:39", "b:40",
          "n:cover:6", "b:42", "b:43",
          "n:cover:7", "b:45", "b:46",
          "n:cover:8", "b:48",
          "n:cover:9", "n:p1", "n:p2", "n:p3", "b:52",
          "b:53"])

# Text fixes on kept base slides: base order index -> [(old, new)], XML-escaped, each must match once.
EDITS = {
    11: [("Happy to go deeper on any of the three lenses — or the flagship validation platform&apos;s architecture and build process.",
          "Happy to go deeper on any of the three tracks — or on the document-driven validation design: its architecture, its trade-offs, and how it was verified."),
         ("Deep dives on the flagship validation platform (architecture, evolution, AI-assisted build process), the HTTPS-Guard security stack, and a light reference slide for every other open-source project.",
          "The document-driven validation platform&apos;s deep dive (design case, evolution, scale, AI workflow, what it caught), and every self-directed project — each one labeled.")],
    12: [("Flagship platform architecture · security stack detail · a reference slide for every open-source project",
          "The work project&apos;s deep dive · every self-directed project, labeled as such")],
    14: [("APPENDIX · REDFISH PLATFORM 1/5", "APPENDIX · REDFISH PLATFORM 5/11")],
    20: [("APPENDIX · HTTPS-GUARD 1/7", "APPENDIX · HTTPS-GUARD 1/8"),
         ("8 detectors walk the event list, first verdict wins; Boost.Asio io_context drives async classification off the hot path.",
          "every submitted detection is evaluated concurrently and the lowest index wins; Boost.Asio io_context drives classification off the hot path.")],
    21: [("APPENDIX · HTTPS-GUARD 2/7", "APPENDIX · HTTPS-GUARD 2/8")],
    22: [("APPENDIX · HTTPS-GUARD 3/7", "APPENDIX · HTTPS-GUARD 3/8"),
         ("57 GoogleTest cases wired into Yocto ptest, next page.", "67 GoogleTest cases wired into Yocto ptest, next page.")],
    24: [("APPENDIX · HTTPS-GUARD 5/7", "APPENDIX · HTTPS-GUARD 6/8"), ("ASan / TSan, no GTest", "standalone, no GTest")],
    25: [("APPENDIX · HTTPS-GUARD 6/7", "APPENDIX · HTTPS-GUARD 7/8")],
    26: [("APPENDIX · HTTPS-GUARD 7/7", "APPENDIX · HTTPS-GUARD 8/8")],
    52: [("APPENDIX · HOWTOPLDM 3/3", "APPENDIX · HOWTOPLDM 4/4")],
}


def unzip(src, dst):
    shutil.rmtree(dst, ignore_errors=True)
    zipfile.ZipFile(src).extractall(dst)


def rels_of(d):
    rels = open(f"{d}/ppt/_rels/presentation.xml.rels", encoding="utf-8").read()
    out = {}
    for m in re.finditer(r"<Relationship\b[^>]*/>", rels):
        tag = m.group(0)
        out[re.search(r'Id="([^"]+)"', tag).group(1)] = re.search(r'Target="([^"]+)"', tag).group(1)
    return rels, out


def slide_order(d):
    pres = open(f"{d}/ppt/presentation.xml", encoding="utf-8").read()
    _, rmap = rels_of(d)
    rids = re.findall(r'<p:sldId [^>]*r:id="(rId\d+)"', pres)
    return [(rid, rmap[rid].split("/")[-1]) for rid in rids]


def prune(d, keep):
    """Drop base slides that are not in ORDER, then any part nothing references any more."""
    rels_p = f"{d}/ppt/_rels/presentation.xml.rels"
    rels = open(rels_p, encoding="utf-8").read()

    def drop_rel(m):
        target = re.search(r'Target="([^"]+)"', m.group(0)).group(1)
        return "" if target.startswith("slides/") and os.path.basename(target) not in keep else m.group(0)

    open(rels_p, "w", encoding="utf-8").write(re.sub(r"<Relationship\b[^>]*/>", drop_rel, rels))
    for f in os.listdir(f"{d}/ppt/slides"):
        if f.endswith(".xml") and f not in keep:
            os.remove(f"{d}/ppt/slides/{f}")
            r = f"{d}/ppt/slides/_rels/{f}.rels"
            if os.path.exists(r):
                os.remove(r)

    # repeat until stable: remove parts under ppt/{notesSlides,media,charts,embeddings} nobody points at
    while True:
        referenced = set()
        for root, _, files in os.walk(d):
            for f in files:
                if f.endswith(".rels"):
                    src_dir = os.path.dirname(root)  # folder of the part that owns this .rels
                    for t in re.findall(r'Target="([^"]+)"', open(os.path.join(root, f), encoding="utf-8").read()):
                        if not t.startswith("http"):
                            p = os.path.normpath(os.path.join(d, t.lstrip("/")) if t.startswith("/") else os.path.join(src_dir, t))
                            referenced.add(p)
        removed = []
        for sub in ("notesSlides", "media", "charts", "embeddings"):
            base = f"{d}/ppt/{sub}"
            if not os.path.isdir(base):
                continue
            for f in os.listdir(base):
                p = os.path.normpath(os.path.join(base, f))
                if os.path.isfile(p) and p not in referenced:
                    os.remove(p)
                    r = f"{base}/_rels/{f}.rels"
                    if os.path.exists(r):
                        os.remove(r)
                    removed.append(f"/ppt/{sub}/{f}")
        if not removed:
            break
        ct_p = f"{d}/[Content_Types].xml"
        ct = open(ct_p, encoding="utf-8").read()
        for part in removed:
            ct = re.sub(rf'<Override PartName="{re.escape(part)}"[^>]*/>', "", ct)
        open(ct_p, "w", encoding="utf-8").write(ct)
    ct_p = f"{d}/[Content_Types].xml"
    ct = open(ct_p, encoding="utf-8").read()
    ct = re.sub(r'<Override PartName="/ppt/slides/(slide\d+\.xml)"[^>]*/>', lambda m: m.group(0) if m.group(1) in keep else "", ct)
    open(ct_p, "w", encoding="utf-8").write(ct)


def main():
    M, N = f"{WORK}/merge_x", f"{WORK}/new_x"
    unzip(BASE, M)
    unzip(NEW, N)
    manifest = json.load(open(f"{WORK}/new_manifest.json"))
    base_order = slide_order(M)
    ct_path = f"{M}/[Content_Types].xml"
    ct = open(ct_path, encoding="utf-8").read()
    prels, _ = rels_of(M)
    new_rid = {}

    for k, key in enumerate(manifest, start=1):
        t = 200 + k
        shutil.copy(f"{N}/ppt/slides/slide{k}.xml", f"{M}/ppt/slides/slide{t}.xml")
        rels = open(f"{N}/ppt/slides/_rels/slide{k}.xml.rels", encoding="utf-8").read()

        def fix(m):
            tag = m.group(0)
            target = re.search(r'Target="([^"]+)"', tag).group(1)
            typ = re.search(r'Type="([^"]+)"', tag).group(1).split("/")[-1]
            if typ == "image":
                name = os.path.basename(target)
                shutil.copy(os.path.normpath(f"{N}/ppt/slides/{target}"), f"{M}/ppt/media/n{k}_{name}")
                return tag.replace(target, f"../media/n{k}_{name}")
            if typ == "chart":
                src = f"{N}{target}" if target.startswith("/") else os.path.normpath(f"{N}/ppt/slides/{target}")
                cname = f"chart{t}.xml"
                os.makedirs(f"{M}/ppt/charts/_rels", exist_ok=True)
                shutil.copy(src, f"{M}/ppt/charts/{cname}")
                crels = open(f"{os.path.dirname(src)}/_rels/{os.path.basename(src)}.rels", encoding="utf-8").read()
                for emb in re.findall(r'Target="\.\./embeddings/([^"]+)"', crels):
                    os.makedirs(f"{M}/ppt/embeddings", exist_ok=True)
                    shutil.copy(f"{N}/ppt/embeddings/{emb}", f"{M}/ppt/embeddings/n{k}_{emb}")
                    crels = crels.replace(f"../embeddings/{emb}", f"../embeddings/n{k}_{emb}")
                open(f"{M}/ppt/charts/_rels/{cname}.rels", "w", encoding="utf-8").write(crels)
                nonlocal_ct.append(f'<Override PartName="/ppt/charts/{cname}" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>')
                return tag.replace(target, f"../charts/{cname}")
            if typ == "notesSlide":
                ns = os.path.basename(target)
                shutil.copy(f"{N}/ppt/notesSlides/{ns}", f"{M}/ppt/notesSlides/notesSlide{t}.xml")
                nrels = open(f"{N}/ppt/notesSlides/_rels/{ns}.rels", encoding="utf-8").read()
                nrels = re.sub(r'Target="\.\./slides/slide\d+\.xml"', f'Target="../slides/slide{t}.xml"', nrels)
                open(f"{M}/ppt/notesSlides/_rels/notesSlide{t}.xml.rels", "w", encoding="utf-8").write(nrels)
                nonlocal_ct.append(f'<Override PartName="/ppt/notesSlides/notesSlide{t}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/>')
                return tag.replace(target, f"../notesSlides/notesSlide{t}.xml")
            return tag  # slideLayout: identical in both decks

        nonlocal_ct = []
        rels = re.sub(r"<Relationship\b[^>]*/>", fix, rels)
        open(f"{M}/ppt/slides/_rels/slide{t}.xml.rels", "w", encoding="utf-8").write(rels)
        nonlocal_ct.append(f'<Override PartName="/ppt/slides/slide{t}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>')
        ct = ct.replace("</Types>", "".join(nonlocal_ct) + "</Types>")
        rid = f"rIdNew{k}"
        prels = prels.replace("</Relationships>", f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{t}.xml"/></Relationships>')
        new_rid[key] = (rid, f"slide{t}.xml")

    open(ct_path, "w", encoding="utf-8").write(ct)
    open(f"{M}/ppt/_rels/presentation.xml.rels", "w", encoding="utf-8").write(prels)

    final = []
    for item in ORDER:
        kind, ref = item.split(":", 1)
        final.append(base_order[int(ref) - 1] if kind == "b" else new_rid[ref])
    assert len(set(f for _, f in final)) == len(final), "duplicate slide in ORDER"
    missing = set(manifest) - {i.split(":", 1)[1] for i in ORDER if i.startswith("n:")}
    assert not missing, f"new slides not placed: {missing}"

    pres_path = f"{M}/ppt/presentation.xml"
    pres = open(pres_path, encoding="utf-8").read()
    lst = "".join(f'<p:sldId id="{256 + i}" r:id="{rid}"/>' for i, (rid, _) in enumerate(final))
    pres = re.sub(r"<p:sldIdLst>.*?</p:sldIdLst>", f"<p:sldIdLst>{lst}</p:sldIdLst>", pres, flags=re.S)
    open(pres_path, "w", encoding="utf-8").write(pres)

    # text fixes on kept base slides
    for idx, pairs in EDITS.items():
        f = f"{M}/ppt/slides/{base_order[idx - 1][1]}"
        x = open(f, encoding="utf-8").read()
        for old, new in pairs:
            n = x.count(old)
            assert n == 1, f"base slide {idx}: expected 1 match, got {n}: {old[:60]}"
            x = x.replace(old, new)
        open(f, "w", encoding="utf-8").write(x)

    # renumber footer page numbers: digits-only text box at the bottom-right corner
    for pos, (_, fname) in enumerate(final, start=1):
        f = f"{M}/ppt/slides/{fname}"
        x = open(f, encoding="utf-8").read()
        hits = 0

        def renum(m):
            nonlocal hits
            sp = m.group(0)
            off = re.search(r'<a:off x="(\d+)" y="(\d+)"/>', sp)
            texts = re.findall(r"<a:t>([^<]*)</a:t>", sp)
            if off and int(off.group(1)) > 10_900_000 and int(off.group(2)) > 6_300_000 and len(texts) == 1 and texts[0].isdigit():
                hits += 1
                return sp.replace(f"<a:t>{texts[0]}</a:t>", f"<a:t>{pos - 1}</a:t>")
            return sp

        x = re.sub(r"<p:sp>.*?</p:sp>", renum, x, flags=re.S)
        assert hits == (0 if pos == 1 else 1), f"footer number not found once on position {pos} ({fname}): {hits}"
        open(f, "w", encoding="utf-8").write(x)

    # slide count in app.xml
    app = f"{M}/docProps/app.xml"
    if os.path.exists(app):
        a = open(app, encoding="utf-8").read()
        a = re.sub(r"<Slides>\d+</Slides>", f"<Slides>{len(final)}</Slides>", a)
        open(app, "w", encoding="utf-8").write(a)

    prune(M, {fname for _, fname in final})
    if os.path.exists(OUT):
        os.remove(OUT)
    subprocess.run(["zip", "-qXr", OUT, "."], cwd=M, check=True)
    json.dump([f for _, f in final], open(f"{WORK}/final_order.json", "w"))  # used by QA scripts
    print("merged slides:", len(final), "->", OUT)


if __name__ == "__main__":
    main()
