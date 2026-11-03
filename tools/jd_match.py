#!/usr/bin/env python3
"""Compare a job description with your content and built resumes.

    python tools/jd_match.py jd.txt              # all built targets in out/resume/
    python tools/jd_match.py jd.txt --target bmc

For every known term found in the JD (skill names in content/skills.yaml + content/keywords.yaml):
  - is there evidence in content/ (which bullet / project)?
  - does each built resume actually show it?
Then ranks targets by coverage. Build first (make resume) so out/resume/*.html exists.
Writes out/jd/<jd-name>.md and prints it.
"""
import argparse
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
C = ROOT / "content"


def load(p):
    return yaml.safe_load(Path(p).read_text(encoding="utf-8"))


class _T(HTMLParser):
    def __init__(self):
        super().__init__(); self.out, self.skip = [], 0
    def handle_starttag(self, t, a): self.skip += t in ("style", "script", "title")
    def handle_endtag(self, t): self.skip -= t in ("style", "script", "title")
    def handle_data(self, d):
        if not self.skip: self.out.append(d)


def html_text(p):
    t = _T(); t.feed(p.read_text(encoding="utf-8")); return " ".join(" ".join(t.out).split())


def pat(term):
    # short terms ("Go", "C", "CI") are matched case-sensitively so the verb "go" doesn't count
    flags = 0 if len(term) <= 3 else re.I
    return re.compile(r"(?<![\w+#])" + re.escape(term) + r"(?![\w+#])", flags)


def vocabulary():
    terms = {str(k): {str(k)} | {str(s) for s in syn or []} for k, syn in (load(C / "keywords.yaml") or {}).items()}
    lower = {a.lower(): k for k, al in terms.items() for a in al}
    for g in load(C / "skills.yaml")["groups"].values():
        if g.get("public") is False:
            continue
        for it in g["items"]:
            parts = {p.strip() for p in re.split(r"\s*/\s*|\s+&\s+", it["name"]) if len(p.strip()) > 1}
            home = next((lower[p.lower()] for p in parts if p.lower() in lower), None)
            terms.setdefault(home or it["name"], set()).update(parts | ({it["name"]} if not home else set()))
    return terms


def evidence_index():
    """id -> plain text, for every bullet and project."""
    idx = {}
    for b in load(C / "summary.yaml")["bullets"]:
        idx[b["id"]] = " ".join(b["text"].values()) if isinstance(b["text"], dict) else b["text"]
    for p in (C / "experience").glob("*.yaml"):
        for b in load(p)["bullets"]:
            idx[b["id"]] = " ".join(b["text"].values()) if isinstance(b["text"], dict) else b["text"]
    for p in (C / "projects").glob("*.yaml"):
        y = load(p)
        idx[p.stem] = " ".join([y.get("name", ""), y.get("subtitle", ""), y.get("short", "")] + [b["text"] for b in y.get("bullets", [])])
    return idx


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("jd")
    ap.add_argument("--target", nargs="*")
    a = ap.parse_args()
    jd = Path(a.jd).read_text(encoding="utf-8")
    terms, idx = vocabulary(), evidence_index()
    targets = {}
    for tp in sorted((ROOT / "targets").glob("*.yaml")):
        if a.target and tp.stem not in a.target:
            continue
        h = ROOT / "out" / "resume" / f"{load(tp)['output']}.html"
        if h.exists():
            targets[tp.stem] = html_text(h)
    if not targets:
        sys.exit("no built resumes found; run `make resume` first")

    rows, score = [], {t: 0 for t in targets}
    for name, aliases in sorted(terms.items(), key=lambda x: x[0].lower()):
        hits = [s for s in aliases if pat(s).search(jd)]
        if not hits:
            continue
        ev = [i for i, txt in idx.items() if any(pat(s).search(txt) for s in aliases)]
        shown = {t: any(pat(s).search(txt) for s in aliases) for t, txt in targets.items()}
        for t, ok in shown.items():
            score[t] += ok
        rows.append((name, hits, ev, shown))

    L = [f"# JD match: {Path(a.jd).name}", "", f"{len(rows)} known terms found in the JD.", "",
         "| term (JD wording) | evidence in content | " + " | ".join(targets) + " |",
         "|---|---|" + "---|" * len(targets)]
    for name, hits, ev, shown in rows:
        e = ", ".join(ev[:4]) + (" …" if len(ev) > 4 else "") if ev else "**none: gap**"
        L.append(f"| {name} ({', '.join(sorted(set(hits)))[:40]}) | {e} | " + " | ".join("✓" if shown[t] else "·" for t in targets) + " |")
    L += ["", "## Target coverage", ""]
    for t, s in sorted(score.items(), key=lambda x: -x[1]):
        L.append(f"- **{t}**: {s}/{len(rows)} JD terms visible")
    gaps = [n for n, _, ev, _ in rows if not ev]
    hidden = [n for n, _, ev, sh in rows if ev and not any(sh.values())]
    L += ["", "## Next steps", "",
          (f"- Real gaps (no evidence anywhere): {', '.join(gaps)}. Don't claim these; prepare an honest answer." if gaps
           else "- No known JD term is missing evidence."),
          f"- Evidence exists but no resume shows it: {', '.join(hidden) or 'none'}. Candidates for a tailored target.",
          "- Terms the tool doesn't know are not listed: read the JD for those and add them to content/keywords.yaml."]
    out = ROOT / "out" / "jd" / (Path(a.jd).stem + ".md")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(L) + "\n", encoding="utf-8")
    print("\n".join(L))


if __name__ == "__main__":
    main()
