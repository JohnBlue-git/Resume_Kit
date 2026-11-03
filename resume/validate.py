#!/usr/bin/env python3
"""Structural checks on content/ and targets/ (runs before every build; also `make validate`).

Errors stop the build: unknown tags/flavors/kinds, duplicate ids, broken references
(fact, evidence, include/exclude, project, skill group, experience file), missing fields.
Warnings are things to look at: unused facts or projects, bullets no target selects,
projects whose repo changed after `last_reviewed` (needs content/github/snapshot.yaml).
"""
import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
CONTENT, TARGETS = ROOT / "content", ROOT / "targets"
FACT_RE = re.compile(r"\{\{\s*f\.([A-Za-z0-9_]+)\s*\}\}")
URL_RE = re.compile(r"github\.com/[A-Za-z0-9_.-]+/([A-Za-z0-9_.-]+)")


def load(p):
    return yaml.safe_load(Path(p).read_text(encoding="utf-8"))


def texts(t):
    return [t] if isinstance(t, str) else list((t or {}).values())


def run(verbose=True):
    E, W = [], []
    voc = load(CONTENT / "tags.yaml")
    btags, ptags, flavors = set(voc["bullet_tags"]), set(voc["project_tags"]), set(voc["flavors"])
    facts = load(CONTENT / "facts.yaml")
    profile = load(CONTENT / "profile.yaml")
    summary = load(CONTENT / "summary.yaml")["bullets"]
    exp = {p.stem: load(p) for p in sorted((CONTENT / "experience").glob("*.yaml"))}
    projects = {p.stem: load(p) for p in sorted((CONTENT / "projects").glob("*.yaml"))}
    skills = load(CONTENT / "skills.yaml")["groups"]
    used_facts, ids = set(), {}

    for k in ("name", "email", "location", "links", "education"):
        if not profile.get(k):
            E.append(f"profile.yaml: missing '{k}'")

    for k, f in facts.items():
        if not isinstance(f, dict) or "value" not in f:
            E.append(f"facts.yaml: '{k}' needs a value")
            continue
        if f.get("status") not in voc["fact_status"]:
            E.append(f"facts.yaml: '{k}' status must be one of {voc['fact_status']}")
        if not f.get("source"):
            W.append(f"facts.yaml: '{k}' has no source")

    def bullet(where, b, need_owner):
        bid = b.get("id")
        if not bid:
            E.append(f"{where}: bullet without id")
            return
        if bid in ids:
            E.append(f"{where}: duplicate id '{bid}' (also in {ids[bid]})")
        ids[bid] = where
        if "text" not in b:
            E.append(f"{where}/{bid}: missing text")
        if isinstance(b.get("text"), dict) and set(b["text"]) - flavors:
            E.append(f"{where}/{bid}: unknown flavor {sorted(set(b['text']) - flavors)} (allowed {sorted(flavors)})")
        for t in set(b.get("tags", [])) - btags:
            E.append(f"{where}/{bid}: unknown tag '{t}' (add it to content/tags.yaml)")
        if need_owner and b.get("ownership") not in voc["ownership"]:
            E.append(f"{where}/{bid}: ownership must be one of {voc['ownership']}")
        for s in texts(b.get("text")):
            for key in FACT_RE.findall(s):
                used_facts.add(key)
                if key not in facts:
                    E.append(f"{where}/{bid}: unknown fact '{key}'")

    for b in summary:
        bullet("summary.yaml", b, False)
    for name, job in exp.items():
        for k in ("company", "title", "start", "end", "bullets"):
            if k not in job:
                E.append(f"experience/{name}.yaml: missing '{k}'")
        for b in job.get("bullets", []):
            bullet(f"experience/{name}.yaml", b, True)
    for pid, p in projects.items():
        for k in ("name", "url", "kind", "short"):
            if not p.get(k):
                E.append(f"projects/{pid}.yaml: missing '{k}'")
        if p.get("kind") not in voc["project_kinds"]:
            E.append(f"projects/{pid}.yaml: kind must be one of {voc['project_kinds']}")
        for t in set(p.get("tags", [])) - ptags:
            E.append(f"projects/{pid}.yaml: unknown tag '{t}' (add it to content/tags.yaml)")
        for b in p.get("bullets", []):
            if not b.get("id") or not b.get("text"):
                E.append(f"projects/{pid}.yaml: bullet needs id and text")
                continue
            if b["id"] in ids:
                E.append(f"projects/{pid}.yaml: duplicate id '{b['id']}' (also in {ids[b['id']]})")
            ids[b["id"]] = f"projects/{pid}.yaml"
            used_facts.update(FACT_RE.findall(b["text"]))
        for key in FACT_RE.findall(p.get("short", "")):
            used_facts.add(key)

    known_evidence = set(ids) | set(projects)
    for g, grp in skills.items():
        for it in grp.get("items", []):
            if it.get("tier") not in voc["skill_tiers"]:
                E.append(f"skills.yaml/{g}/{it.get('name')}: tier must be one of {voc['skill_tiers']}")
            if grp.get("public", True) and it.get("level") not in voc["skill_levels"]:
                E.append(f"skills.yaml/{g}/{it.get('name')}: level must be one of {voc['skill_levels']}")
            for ev in it.get("evidence", []):
                if ev not in known_evidence:
                    E.append(f"skills.yaml/{g}/{it['name']}: evidence '{ev}' is not a bullet or project id")

    selected, used_projects = set(), set()
    for tp in sorted(TARGETS.glob("*.yaml")):
        t, w = load(tp), f"targets/{tp.name}"
        for k in ("output", "flavor", "headline", "layout", "summary", "skills", "experience"):
            if k not in t:
                E.append(f"{w}: missing '{k}'")
        if set(t.get("flavor", [])) - flavors:
            E.append(f"{w}: unknown flavor {sorted(set(t['flavor']) - flavors)}")
        for s in set(t.get("layout", [])) - set(voc["layout_sections"]):
            E.append(f"{w}: unknown layout section '{s}'")
        for key in FACT_RE.findall(t.get("headline", "")):
            used_facts.add(key)
            if key not in facts:
                E.append(f"{w}: unknown fact '{key}' in headline")
        for tag in set(t.get("summary", {}).get("select", [])) - btags:
            E.append(f"{w}: summary selects unknown tag '{tag}'")
        for g in t.get("skills", {}).get("groups", []):
            if g not in skills:
                E.append(f"{w}: unknown skill group '{g}'")
            elif skills[g].get("public") is False:
                E.append(f"{w}: skill group '{g}' is not public")
        st = set(t.get("summary", {}).get("select", []))
        selected |= {b["id"] for b in summary if st & set(b.get("tags", []))}
        for rule in t.get("experience", []):
            job = exp.get(rule.get("file"))
            if not job:
                E.append(f"{w}: experience file '{rule.get('file')}' not found")
                continue
            jids = {b["id"] for b in job["bullets"]}
            for tag in set(rule.get("select", [])) - btags:
                E.append(f"{w}: experience selects unknown tag '{tag}'")
            for i in rule.get("include", []) + rule.get("exclude", []):
                if i not in jids:
                    E.append(f"{w}: include/exclude id '{i}' not in experience/{rule['file']}.yaml")
            sel = set(rule.get("select", []))
            selected |= {b["id"] for b in job["bullets"]
                         if b["id"] not in rule.get("exclude", []) and (b["id"] in rule.get("include", []) or sel & set(b.get("tags", [])))}
        pj = t.get("projects", {}) or {}
        for pid in pj.get("detailed", []) + pj.get("short", []):
            if pid not in projects:
                E.append(f"{w}: unknown project '{pid}'")
            used_projects.add(pid)
        for pid in pj.get("detailed", []):
            if pid in projects and not projects[pid].get("bullets"):
                E.append(f"{w}: project '{pid}' is listed as detailed but has no bullets")

    for k, f in facts.items():
        if k not in used_facts and isinstance(f, dict) and f.get("status") != "superseded":
            W.append(f"fact '{k}' is not used by any bullet or headline")
    for pid in sorted(set(projects) - used_projects):
        W.append(f"project '{pid}' is not used by any target")
    never = [b["id"] for job in exp.values() for b in job["bullets"] if b["id"] not in selected]
    if never:
        W.append(f"experience bullets no target selects: {', '.join(never)}")

    snap_p = CONTENT / "github" / "snapshot.yaml"
    if snap_p.exists():
        snap = (load(snap_p) or {}).get("repos", {})
        for pid, p in projects.items():
            m = URL_RE.search(p.get("url", ""))
            r = snap.get(m.group(1)) if m else None
            if r and p.get("last_reviewed") and r["last_commit"] > str(p["last_reviewed"]):
                W.append(f"project '{pid}': repo changed {r['last_commit']}, last_reviewed {p['last_reviewed']} (run tools/github_sync.py)")
            elif r and not p.get("last_reviewed"):
                W.append(f"project '{pid}': no last_reviewed date")

    if verbose:
        for x in E:
            print("  ERROR:", x)
        for x in W:
            print("  warn: ", x)
        print(f"validate: {len(E)} errors, {len(W)} warnings")
    return E, W


if __name__ == "__main__":
    errors, _ = run()
    sys.exit(1 if errors else 0)
