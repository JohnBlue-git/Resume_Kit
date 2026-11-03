#!/usr/bin/env python3
"""Collect what changed in my GitHub repos, so content/ can be updated from evidence.

    python tools/github_sync.py                 # discover repos, update snapshot, write report
    python tools/github_sync.py --days 60       # "recent" window for the report (default 120)
    python tools/github_sync.py --only HTTPS-Guard HowToPLDM

Never edits content/ itself. It writes two files:
  content/github/snapshot.yaml   machine-generated record of every repo (commit this; its diff
                                 is the history of what changed)
  out/github/report.md           what needs a human (or a Claude skill) to look at

Repo discovery, merged:
  1. GitHub REST API  GET /users/<user>/repos  (uses $GITHUB_TOKEN if set; works locally,
     in Codespaces and in GitHub Actions)
  2. links in the profile README (<user>/<user> repo), the fallback when the API is unreachable
  3. every GitHub URL already in content/ (projects, experience links)
  4. content/github/config.yaml  include / exclude lists
Data per repo comes from a blob-less git clone cached in .cache/github/ (fast; no API needed).
"""
import argparse
import datetime as dt
import json
import os
import re
import subprocess
import sys
import urllib.request
from collections import Counter
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
CACHE = ROOT / ".cache" / "github"
SNAP = CONTENT / "github" / "snapshot.yaml"
REPORT = ROOT / "out" / "github" / "report.md"

URL_RE = re.compile(r"github\.com/([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+?)(?:\.git)?(?=[/\"'\s)#?]|$)")
CLAIM_RE = re.compile(
    r"(\d[\d,]*(?:\.\d+)?\s*(?:%|×|x\b|ms\b|µs\b|us\b|ns\b|KiB\b|MiB\b)|\b[1-9][\d,]*\+?\s+(?:tests?|test cases?|cases|checks|"
    r"schemas?|platforms?|detect(?:ors?|ions?)|rules?|request variants?|variants?|sequences?|steps?|benchmarks?|"
    r"endpoints?|resources?|scenarios?)\b)", re.I)
NOISE = re.compile(r"[│├└─┌┐]|0x[0-9a-f]+|\bHTTP/\d|\bTLS ?v?1\.\d|\d+\.x\b|^#+ ?\d", re.I)
EXT_LANG = {".c": "C", ".h": "C/C++", ".cpp": "C++", ".cc": "C++", ".hpp": "C++", ".py": "Python", ".go": "Go",
            ".js": "JavaScript", ".ts": "TypeScript", ".sh": "Shell", ".bb": "BitBake", ".bbappend": "BitBake",
            ".rs": "Rust", ".java": "Java", ".yaml": "YAML", ".yml": "YAML", ".md": "Markdown"}


def sh(*args, cwd=None, check=True):
    r = subprocess.run(args, cwd=cwd, capture_output=True, text=True)
    if check and r.returncode:
        raise RuntimeError(f"{' '.join(args)}: {r.stderr.strip()[:200]}")
    return r.stdout


def load_yaml(p, default=None):
    return yaml.safe_load(p.read_text(encoding="utf-8")) if p.exists() else default


# ---------------------------------------------------------------- discovery
def from_api(user):
    req = urllib.request.Request(f"https://api.github.com/users/{user}/repos?per_page=100&type=owner&sort=pushed",
                                 headers={"Accept": "application/vnd.github+json", "User-Agent": "resume-kit-sync"})
    tok = os.environ.get("GITHUB_TOKEN")
    if tok:
        req.add_header("Authorization", f"Bearer {tok}")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.load(r)
        return {d["name"]: {"description": d.get("description") or "", "fork": d.get("fork", False),
                            "archived": d.get("archived", False), "topics": d.get("topics", []),
                            "stars": d.get("stargazers_count", 0), "language": d.get("language")}
                for d in data if isinstance(d, dict)}, None
    except Exception as e:  # offline, proxy, rate limit: fall back to git-only discovery
        return {}, f"GitHub API not reachable ({e.__class__.__name__}); used profile README + content links"


def from_profile_readme(user):
    d = CACHE / f"{user}.git"
    try:
        fetch(user, user, d)
        readme = sh("git", "show", "HEAD:README.md", cwd=d)
    except Exception:
        return set()
    return {repo for owner, repo in URL_RE.findall(readme) if owner == user and repo != user}


def from_content(user):
    found = set()
    for p in CONTENT.rglob("*.yaml"):
        if "github" in p.parts:
            continue
        for owner, repo in URL_RE.findall(p.read_text(encoding="utf-8")):
            if owner == user:
                found.add(repo)
    return found


# ---------------------------------------------------------------- per-repo data
def fetch(user, name, d):
    url = f"https://github.com/{user}/{name}.git"
    if d.exists():
        sh("git", "fetch", "-q", "--prune", "origin", "+refs/heads/*:refs/heads/*", cwd=d)
    else:
        d.parent.mkdir(parents=True, exist_ok=True)
        sh("git", "-c", "credential.helper=", "clone", "-q", "--bare", "--filter=blob:none", url, str(d))


def readme_info(d):
    names = [n for n in sh("git", "ls-tree", "--name-only", "HEAD", cwd=d).split() if n.lower().startswith("readme")]
    if not names:
        return {}, ""
    text = sh("git", "show", f"HEAD:{names[0]}", cwd=d, check=False)
    lines = text.splitlines()
    title = next((l.lstrip("# ").strip() for l in lines if l.startswith("# ")), "")
    para = []
    for l in lines:
        s = l.strip()
        if not s:
            if para:
                break
            continue
        if s.startswith(("#", "<", "!", "[!", "|", "```", "---")) or s.startswith("[") and "](" in s and s.endswith(")"):
            continue
        para.append(s)
    heads = [l.lstrip("#").strip() for l in lines if l.startswith("## ")][:15]
    return {"title": title, "summary": " ".join(para)[:400], "headings": heads}, text


def claims(text):
    out = []
    for l in text.splitlines():
        s = " ".join(l.strip().strip("|*-> ").split())
        if 8 < len(s) < 220 and CLAIM_RE.search(NOISE.sub(" ", s)) and not s.startswith(("http", "<img", "```")):
            out.append(s)
    seen, uniq = set(), []
    for s in out:
        if s not in seen:
            seen.add(s)
            uniq.append(s)
    return uniq[:20]


def repo_info(user, name, since):
    d = CACHE / f"{name}.git"
    fetch(user, name, d)
    log = sh("git", "log", "--format=%H%x09%cI%x09%s", "HEAD", cwd=d).splitlines()
    rows = [l.split("\t", 2) for l in log if l.count("\t") >= 2]
    files = sh("git", "ls-tree", "-r", "--name-only", "HEAD", cwd=d).splitlines()
    exts = Counter(EXT_LANG[Path(f).suffix.lower()] for f in files if Path(f).suffix.lower() in EXT_LANG)
    langs = [k for k, _ in exts.most_common() if k not in ("Markdown", "YAML")][:4]
    low = [f.lower() for f in files]
    signals = sorted({
        *(["tests"] if any(re.search(r"(^|/)(tests?|gtest|unittest)s?(/|_)|_test\.|test_", f) for f in low) else []),
        *(["ci"] if any(f.startswith(".github/workflows/") for f in low) else []),
        *(["cmake"] if "cmakelists.txt" in {Path(f).name for f in low} else []),
        *(["meson"] if "meson.build" in {Path(f).name for f in low} else []),
        *(["go-module"] if "go.mod" in low else []),
        *(["docker"] if any(Path(f).name.startswith("dockerfile") for f in low) else []),
        *(["yocto"] if any(f.endswith((".bb", ".bbappend")) for f in low) else []),
        *(["ebpf"] if any(f.endswith(".bpf.c") for f in low) else []),
        *(["images"] if any(f.endswith((".png", ".svg", ".gif")) for f in low) else []),
    })
    info, text = readme_info(d)
    recent = [{"date": r[1][:10], "subject": r[2][:120]} for r in rows if r[1][:10] >= since]
    return {
        "head": rows[0][0][:12] if rows else "",
        "first_commit": rows[-1][1][:10] if rows else "",
        "last_commit": rows[0][1][:10] if rows else "",
        "commits": len(rows),
        "files": len(files),
        "languages": langs,
        "signals": signals,
        "readme": info,
        "claims": claims(text),
        "recent_commits": recent[:15],
        "recent_commit_count": len(recent),
    }


# ---------------------------------------------------------------- report
def recorded_projects(user):
    """repo name -> (content file, yaml) for every repo linked from content/ (projects first)."""
    out = {}
    files = sorted((CONTENT / "projects").glob("*.yaml")) + sorted((CONTENT / "experience").glob("*.yaml"))
    for p in files:
        y = load_yaml(p, {})
        for owner, repo in URL_RE.findall(p.read_text(encoding="utf-8")):
            if owner == user and repo not in out:
                out[repo] = (str(p.relative_to(CONTENT)), y)
    return out


def write_report(user, snap, prev, since, notes):
    proj = recorded_projects(user)
    facts = load_yaml(CONTENT / "facts.yaml", {})
    fact_values = {str(f.get("value")).strip("~+% ") for f in facts.values() if isinstance(f, dict)}
    L = [f"# GitHub sync report: {user}", "", f"Generated {snap['generated_at']} · window since {since}", ""]
    L += [f"> {n}" for n in notes] + ([""] if notes else [])

    changed = []
    for name, r in snap["repos"].items():
        old = (prev.get("repos") or {}).get(name, {})
        pid, py = proj.get(name, (None, {}))
        reviewed = str(py.get("last_reviewed", "")) if py else ""
        stale = bool(reviewed) and r["last_commit"] > reviewed
        moved = old.get("head") and old.get("head") != r["head"]
        is_project = bool(pid) and pid.startswith("projects/")
        if pid and ((stale or moved or not reviewed) if is_project else (moved or not old)):
            changed.append((name, pid, reviewed, r, old))

    L += ["## 1. Recorded projects with new work", "",
          "Update the project YAML (and facts.yaml numbers), then set `last_reviewed` to today.", ""]
    if not changed:
        L.append("Nothing new since each project's `last_reviewed`.")
    for name, pid, reviewed, r, old in sorted(changed, key=lambda x: x[3]["last_commit"], reverse=True):
        L.append(f"### {name}  →  content/{pid}")
        L.append(f"- last commit {r['last_commit']} · last_reviewed {reviewed or 'never'} · {r['recent_commit_count']} commits since {since}")
        for c in r["recent_commits"][:8]:
            L.append(f"  - {c['date']} {c['subject']}")
        only_new = bool(old) and bool(reviewed)
        new_claims = [c for c in r["claims"] if c not in old.get("claims", [])] if only_new else r["claims"]
        if new_claims:
            L.append("- numbers in the README" + (" (new since last snapshot)" if only_new else "") + ":")
            for c in new_claims[:8]:
                nums = re.findall(r"\d[\d,.]*", c)
                flag = "" if any(n.strip(",.") in fact_values for n in nums) else "  ← not in facts.yaml"
                L.append(f"  - {c}{flag}")
        L.append("")

    unrec = {n: r for n, r in snap["repos"].items() if n not in proj and not r.get("ignored")}
    L += ["## 2. Repos not recorded in content/projects", "",
          "Candidates for a new project file, or add them to `exclude` in content/github/config.yaml.", "",
          "| repo | last commit | commits | languages | signals | README title |", "|---|---|---|---|---|---|"]
    for n, r in sorted(unrec.items(), key=lambda x: x[1]["last_commit"], reverse=True):
        L.append(f"| {n} | {r['last_commit']} | {r['commits']} | {', '.join(r['languages'])} | {', '.join(r['signals'])} | {r['readme'].get('title', '')[:60]} |")

    gone = sorted(set(prev.get("repos", {})) - set(snap["repos"]))
    if gone:
        L += ["", "## 3. Repos that disappeared since the last snapshot", ""] + [f"- {g}" for g in gone]
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text("\n".join(L) + "\n", encoding="utf-8")
    return len(changed), len(unrec)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=120)
    ap.add_argument("--only", nargs="*")
    a = ap.parse_args()
    cfg = load_yaml(CONTENT / "github" / "config.yaml", {}) or {}
    user = cfg.get("user", "JohnBlue-git")
    since = (dt.date.today() - dt.timedelta(days=a.days)).isoformat()

    api, note = from_api(user)
    names = set(api) | from_profile_readme(user) | from_content(user) | set(cfg.get("include", []))
    names -= set(cfg.get("exclude", [])) | {user}
    if a.only:
        names &= set(a.only)
    notes = [note] if note else []

    prev = load_yaml(SNAP, {}) or {}
    snap = {"generated_at": dt.datetime.now().strftime("%Y-%m-%d %H:%M"), "user": user,
            "repos": dict((prev.get("repos") or {})) if a.only else {}}
    for n in sorted(names, key=str.lower):
        try:
            r = repo_info(user, n, since)
        except Exception as e:
            notes.append(f"skipped {n}: {e}")
            continue
        if n in api:
            r = {**api[n], **r}
        snap["repos"][n] = r
        print(f"  {n:<32} last {r['last_commit']}  +{r['recent_commit_count']} recent  {', '.join(r['languages'])}")
    if snap["repos"] == (prev.get("repos") or {}) and prev.get("generated_at"):
        snap["generated_at"] = prev["generated_at"]  # nothing changed: keep the file byte-identical
    SNAP.parent.mkdir(parents=True, exist_ok=True)
    SNAP.write_text("# Generated by tools/github_sync.py. Do not edit; edit content/projects instead.\n"
                    + yaml.safe_dump(snap, sort_keys=False, allow_unicode=True, width=120), encoding="utf-8")
    n_changed, n_unrec = write_report(user, snap, prev, since, notes)
    print(f"\n{len(snap['repos'])} repos -> {SNAP.relative_to(ROOT)}")
    print(f"report -> {REPORT.relative_to(ROOT)}: {n_changed} recorded projects with new work, {n_unrec} unrecorded repos")
    for n in notes:
        print("note:", n)


if __name__ == "__main__":
    sys.exit(main())
