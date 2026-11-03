# Resume Kit

Generate tailored resumes and an interview presentation from this repository's career content. For the project architecture and component relationships, see [DESIGN.md](DESIGN.md). For how to record experience, projects, skills, and numbers, see [GUIDE.md](GUIDE.md).

## Setup

Use Python 3.10+ and Node.js 18+. Install the Python, Chromium, and deck dependencies with:

```bash
make setup
```

LibreOffice (`soffice`) is optional and is only needed to export the deck as PDF.

## Build

```bash
make resume                 # build all targets
make resume TARGET=secure   # build one target
make deck                   # build the interview deck
make qa                     # smoke-test the generated HTML deck
make ats PDF=some.pdf       # inspect a PDF's ATS-readable text
make validate               # structural checks on content/ and targets/ (also runs before every build)
make sync                   # collect GitHub repo changes -> out/github/report.md
make match JD=jd.txt        # compare a job description with content and the built resumes
```

Resume files are written to `out/resume/` as HTML, PDF, DOCX, and a `.review.md` sheet. The deck is written to `out/deck/` as PPTX and HTML; PDF is also exported when LibreOffice is installed. To build without Make:

```bash
python3 resume/build.py [target ...]
bash deck/build.sh
```

Resume builds first run `resume/validate.py` (unknown tags or flavors, duplicate ids, broken fact / evidence / project / include references) and stop on any error. They then fail when these checks find a violation:

| Check | Why |
|---|---|
| Banned claims (`policy.yaml`) | e.g. "responsible for BMC security", Secure Boot / TPM / root of trust, sanitizer runs that never happened |
| Known typos | so fixed typos never come back |
| Ownership verbs | "Led / Cut / Owned / Architected" only on bullets marked `ownership: owned` |
| Self-directed label | self-directed projects must be visibly labeled as such |
| Page limit | 2 pages |
| PDF text extraction | every word in the HTML must be readable in the PDF (catches the Pages ligature bug) |
| Unverified facts | warning, listed per target |

The `.review.md` sheet records each bullet's ownership and the source of each number. It is for interview preparation, not for sending.

## Everyday edits

- **Update a fact**: edit `content/facts.yaml`; all resumes use the updated value on the next build.
- **Add or edit experience**: update `content/experience/*.yaml`, including tags and ownership. Targets select bullets by tag; use `include` or `exclude` for target-specific choices.
- **Use audience-specific wording**: add variants under a bullet's `text` field (for example, `default`, `bmc`, or `security`). The target's `flavor` list determines which variant is selected.
- **Add a role target**: copy a file in `targets/` and update its headline, selection rules, and layout.
- **Add a project**: create `content/projects/<id>.yaml` and reference it in the target's `projects` configuration.
- **Edit the interview deck**: update the slide sources under `deck/src/` and rebuild with `make deck`.
- **Keep details out of a public repo**: copy `content/private.yaml.example` to `content/private.yaml` (git-ignored); its keys override `profile.yaml` at build time. In CI, store the same YAML in the `RESUME_PRIVATE_YAML` secret.

## Keeping content current

`make sync` (`tools/github_sync.py`) discovers your repos (GitHub API, the profile README, and links already in `content/`), reads commits and READMEs from blob-less clones cached in `.cache/github/`, saves `content/github/snapshot.yaml`, and writes `out/github/report.md`: recorded projects with commits after their `last_reviewed`, README lines with numbers not yet in `facts.yaml`, and repos not recorded anywhere. It never edits `content/`.

## CI

`.github/workflows/build.yml` validates and builds every resume target and the deck on each push, and attaches the files to the run (Actions → run → Artifacts). Weekly, and on manual dispatch, it also runs the GitHub sync and attaches the report.

## Claude skills

`.claude/skills/` contains three skills that operate on this repo; open it in a Claude session and ask in plain words:

| Skill | Ask | Does |
|---|---|---|
| `resume-kit-record` | "record this…", "process the inbox" | turns notes or `content/inbox/` files into validated YAML |
| `resume-kit-sync` | "what changed in my repos?" | runs the GitHub sync, proposes YAML and fact updates, flags deck slides with old numbers |
| `resume-kit-tailor` | "tailor my resume to this JD" | runs `jd_match`, picks or creates a target, builds it, reports gaps |
