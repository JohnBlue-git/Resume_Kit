# How to record your work

Everything a resume or the deck says comes from `content/`. You record things once, as evidence;
targets decide what to show. Three kinds of record:

| You did… | Record it in | Minimum fields |
|---|---|---|
| work at a job | `content/experience/<company>.yaml` → `bullets:` | `id`, `ownership`, `tags`, `text` |
| a side project / repo | `content/projects/<id>.yaml` | `name`, `url`, `kind`, `short`, `last_reviewed` |
| a skill | `content/skills.yaml` → a group's `items:` | `name`, `tier`, `level`, `evidence` |
| a number anywhere | `content/facts.yaml` | `value`, `source`, `as_of`, `status` |

Not sure where something goes, or only have rough notes (Chinese is fine)? Drop a file in
`content/inbox/` and let the **resume-kit-record** skill turn it into YAML (see "Skills" below).

## 1. Experience bullets

```yaml
- id: schema-refactor              # unique, kebab-case; targets and skills refer to it
  ownership: owned                 # owned | contributed | rotation
  tags: [core, performance]        # from content/tags.yaml
  text:
    default: "**Refactored API schemas**, improving runtime performance by {{ f.schema_perf_gain }}."
    bmc:     "**Refactored Redfish schemas**, improving runtime performance by {{ f.schema_perf_gain }}."
  link: https://github.com/...     # optional
```

How to write a good one:

- **Action + scope + result**: what you did, on what, and what changed (a number if you have one).
- **Bold the lead phrase** with `**…**`. Recruiters skim the bold.
- **Numbers go in facts.yaml**, never inline: `{{ f.key }}`. That's how the resume, the deck,
  and your interview answer stay the same.
- **Ownership is about you, not the project**:
  `owned` = you proposed or changed the design and you're called when it breaks;
  `contributed` = you implemented inside someone else's design;
  `rotation` = shared team work. "Led / Cut / Owned / Architected" are only allowed on `owned`.
- **Variants** (`default`, `bmc`, `security`) are the same fact worded for different readers.
  Don't put a new claim in only one variant.

## 2. Projects (your GitHub repos)

```yaml
name: GoVarlink
subtitle: D-Bus vs Varlink IPC, Compared Across Four Language Runtimes   # shown on detailed cards
url: https://github.com/JohnBlue-git/GoVarlink
kind: self-directed              # self-directed | work | coursework | oss-contribution
last_reviewed: 2026-11-03        # the date you last checked this file against the repo
tags: [ipc, go, cpp]
short: "One line, used in the project grid."
bullets:                         # used when a target lists the project as `detailed`
  - id: gv-bench
    text: "… about {{ f.gv_varlink_vs_dbus }} the throughput …"
```

Keeping projects current is mostly automatic:

```bash
python3 tools/github_sync.py      # or: make sync
```

It discovers every repo (GitHub API, your profile README, and links in content/), reads commits
and READMEs, saves `content/github/snapshot.yaml`, and writes `out/github/report.md` listing:

1. recorded projects with commits after their `last_reviewed`, with the README lines that
   contain numbers, each flagged if the number isn't in facts.yaml yet;
2. repos not recorded anywhere (add a project file, or add the repo to `exclude` in
   `content/github/config.yaml`).

It never edits your content. You (or the **resume-kit-sync** skill) read the report, update the
YAML, and bump `last_reviewed`.

## 3. Skills

```yaml
- {name: eBPF, tier: transferable, level: working, evidence: [https-guard, qemu-ebpf-sandbox]}
```

- `tier`: `company` (not portable, never printed) · `industry` (BMC ecosystem) · `transferable`.
- `level`: `conceptual` < `working` < `proficient` < `expert`. Be conservative: interviewers
  probe the top of your list. A target can hide lower levels with `min_level`.
- `evidence`: bullet or project ids that prove it. The validator rejects ids that don't exist,
  and the tailor skill uses evidence to answer "where did you use X?".

## 4. Facts

```yaml
hg_gtests:
  value: "67"
  source: HTTPS-Guard repo (GoogleTest, wired into Yocto ptest)
  as_of: 2026-11-03
  status: verified        # verified | unverified (build warns) | superseded (build refuses)
  note: anything you need to remember when asked about it
```

When a number changes, change `value`, `source`, and `as_of`. If the old number was ever
published, keep it as a new `superseded` entry so it can't be reused by accident.

## 5. After every edit

```bash
make validate     # structure: tags, ids, references (fast)
make resume       # all targets, with the claim / ownership / page / ATS checks
```

Or push to GitHub: the **Build** workflow runs the same checks and attaches the PDFs, DOCX,
and HTML to the run, so you can edit YAML in the GitHub web editor and download the result.

## Skills (for Claude)

The repo ships three skills in `.claude/skills/`. Open the repo in a Claude session (connected
folder, Claude Code, or Codespaces) and ask in plain words:

| Say | Skill | What it does |
|---|---|---|
| "record this: …", "add my new project" | resume-kit-record | turns notes or `content/inbox/` files into validated YAML, asks about ownership and numbers |
| "sync my GitHub", "what changed in my repos?" | resume-kit-sync | runs github_sync, proposes YAML/facts diffs, applies the ones you approve |
| "tailor my resume to this JD" | resume-kit-tailor | runs jd_match, picks or creates a target, builds, reports gaps |
