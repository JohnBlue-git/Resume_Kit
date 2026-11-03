#!/usr/bin/env python3
"""Build tailored resumes from content/ + targets/.

    python resume/build.py              # every target
    python resume/build.py bmc secure   # selected targets

Per target writes out/resume/<output>.html, .pdf, .docx and <output>.review.md, then runs
the checks in check.py. Exits non-zero on any check failure.
"""
import base64
import html
import re
import sys
from pathlib import Path

import yaml
from jinja2 import Environment, FileSystemLoader, StrictUndefined

ROOT = Path(__file__).resolve().parent.parent
CONTENT, TARGETS, OUT = ROOT / "content", ROOT / "targets", ROOT / "out" / "resume"
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import check  # noqa: E402
import docx_writer  # noqa: E402

LEVELS = ["conceptual", "working", "proficient", "expert"]
FACT_RE = re.compile(r"\{\{\s*f\.([a-z0-9_]+)\s*\}\}")


def load(p):
    return yaml.safe_load(Path(p).read_text(encoding="utf-8"))


class Content:
    def __init__(self):
        self.profile = load(CONTENT / "profile.yaml")
        # Optional, git-ignored overlay for details you don't want in a public repo (e.g. phone).
        private = CONTENT / "private.yaml"
        if private.exists():
            self.profile.update(load(private) or {})
        self.facts = load(CONTENT / "facts.yaml")
        self.summary = load(CONTENT / "summary.yaml")["bullets"]
        self.experience = {p.stem: load(p) for p in sorted((CONTENT / "experience").glob("*.yaml"))}
        self.projects = {p.stem: load(p) for p in sorted((CONTENT / "projects").glob("*.yaml"))}
        self.skills = load(CONTENT / "skills.yaml")["groups"]
        self.policy = load(CONTENT / "policy.yaml")


class Renderer:
    """Turns content strings into plain text and HTML, tracking which facts were used."""

    def __init__(self, facts):
        self.facts, self.used = facts, {}

    def _sub(self, s):
        def rep(m):
            key = m.group(1)
            if key not in self.facts:
                raise SystemExit(f"unknown fact '{key}' in: {s}")
            fact = self.facts[key]
            if fact.get("status") == "superseded":
                raise SystemExit(f"fact '{key}' is superseded and cannot be rendered: {s}")
            self.used[key] = fact
            return str(fact["value"])
        return FACT_RE.sub(rep, s)

    def plain(self, s):
        return self._sub(s).replace("**", "")

    def html(self, s):
        t = html.escape(self._sub(s), quote=False)
        return re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)

    def runs(self, s):
        """[(text, bold)] for the DOCX writer."""
        parts = re.split(r"(\*\*.+?\*\*)", self._sub(s))
        return [(p[2:-2], True) if p.startswith("**") else (p, False) for p in parts if p]


def pick_variant(text, flavor):
    if isinstance(text, str):
        return text
    for f in flavor:
        if f in text:
            return text[f]
    return None


def select(bullets, rule, flavor):
    tags = set(rule.get("select", []))
    inc, exc = set(rule.get("include", [])), set(rule.get("exclude", []))
    out = []
    for b in bullets:
        if b["id"] in exc:
            continue
        if b["id"] in inc or tags & set(b.get("tags", [])):
            t = pick_variant(b["text"], flavor)
            if t is not None:
                out.append((b, t))
    return out


def build_model(c, target, r):
    flavor = target["flavor"]
    m = {"profile": c.profile, "layout": target["layout"], "output": target["output"]}
    m["headline"] = r.html(" ".join(target["headline"].split()))
    m["headline_plain"] = r.plain(" ".join(target["headline"].split()))
    m["role"] = r.plain(target.get("role", ""))

    m["summary"] = [dict(id=b["id"], html=r.html(t), plain=r.plain(t), runs=r.runs(t))
                    for b, t in select(c.summary, target["summary"], flavor)]

    sk = target["skills"]
    min_level = LEVELS.index(sk.get("min_level", "conceptual"))
    m["skills"] = []
    for g in sk["groups"]:
        grp = c.skills[g]
        if grp.get("public") is False:
            raise SystemExit(f"skill group '{g}' is not public")
        items = [i["name"] for i in grp["items"] if LEVELS.index(i.get("level", "working")) >= min_level]
        m["skills"].append({"label": grp["label"], "items": items})

    m["experience"], m["bullet_meta"] = [], []
    for rule in target["experience"]:
        job = c.experience[rule["file"]]
        bl = []
        for b, t in select(job["bullets"], rule, flavor):
            bl.append(dict(id=b["id"], html=r.html(t), plain=r.plain(t), runs=r.runs(t), link=b.get("link")))
            m["bullet_meta"].append(dict(id=b["id"], ownership=b.get("ownership"), plain=r.plain(t)))
        m["experience"].append(dict(company=job["company"], title=job["title"], dates=f"{job['start']} – {job['end']}", bullets=bl))

    pj = target.get("projects", {})
    m["projects_title"] = pj.get("title", "Projects")
    m["projects_detailed"], m["projects_short"] = [], []
    for pid in pj.get("detailed", []):
        p = c.projects[pid]
        bl = [b for b in p.get("bullets", []) if not b.get("optional") or b["id"] in pj.get("include", [])]
        m["projects_detailed"].append(dict(p, kind=p["kind"], bullets=[dict(html=r.html(b["text"]), plain=r.plain(b["text"]), runs=r.runs(b["text"])) for b in bl]))
    for pid in pj.get("short", []):
        p = c.projects[pid]
        m["projects_short"].append(dict(p, short_html=r.html(p["short"]), short_plain=r.plain(p["short"])))
    return m


def font_face_css():
    css = []
    for w in (400, 700):
        for st in ("normal", "italic"):
            b64 = base64.b64encode((HERE / "assets" / "fonts" / f"arimo-latin-{w}-{st}.woff2").read_bytes()).decode()
            css.append(f"@font-face{{font-family:'Arimo';font-style:{st};font-weight:{w};src:url(data:font/woff2;base64,{b64}) format('woff2');}}")
    return "\n".join(css)


def write_pdf(html_path, pdf_path):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        pg.goto(html_path.as_uri())
        pg.wait_for_load_state("networkidle")
        pg.pdf(path=str(pdf_path), format="A4", print_background=True, prefer_css_page_size=True)
        b.close()


def review_md(m, r):
    lines = [f"# Review sheet: {m['output']}", "",
             "Not for sending. Ownership per bullet (what to say if asked \"was that you?\") and the facts this resume quotes.", "",
             "## Experience bullets", ""]
    for b in m["bullet_meta"]:
        lines.append(f"- **{b['ownership']}** · `{b['id']}`: {b['plain']}")
    lines += ["", "## Facts used", "", "| fact | value | status | source |", "|---|---|---|---|"]
    for k, f in sorted(r.used.items()):
        lines.append(f"| {k} | {f['value']} | {f['status']} | {f.get('source', '')} |")
    return "\n".join(lines) + "\n"


def main(names):
    import validate
    errors, warnings = validate.run(verbose=False)
    for w in warnings:
        print(f"  note: {w}")
    if errors:
        for e in errors:
            print(f"  ERROR: {e}")
        sys.exit("content/targets have errors; fix them first (python3 resume/validate.py)")
    c = Content()
    env = Environment(loader=FileSystemLoader(HERE / "templates"), undefined=StrictUndefined, autoescape=False)
    tpl = env.get_template("resume.html.j2")
    fonts = font_face_css()
    OUT.mkdir(parents=True, exist_ok=True)
    targets = sorted(TARGETS.glob("*.yaml")) if not names else [TARGETS / f"{n}.yaml" for n in names]
    failed = False
    for tp in targets:
        target = load(tp)
        r = Renderer(c.facts)
        m = build_model(c, target, r)
        stem = OUT / target["output"]
        html_path = stem.with_suffix(".html")
        html_path.write_text(tpl.render(m=m, fonts=fonts), encoding="utf-8")
        write_pdf(html_path, stem.with_suffix(".pdf"))
        docx_writer.write(m, stem.with_suffix(".docx"))
        stem.with_suffix(".review.md").write_text(review_md(m, r), encoding="utf-8")
        problems, warnings, pages = check.run(m, c, r.used, html_path, stem.with_suffix(".pdf"), stem.with_suffix(".docx"))
        status = "FAIL" if problems else "ok"
        print(f"[{status}] {tp.stem:<14} -> {target['output']}.{{html,pdf,docx}}  pages={pages}")
        for w in warnings:
            print(f"    warn: {w}")
        for p in problems:
            print(f"    FAIL: {p}")
        failed |= bool(problems)
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main(sys.argv[1:])
