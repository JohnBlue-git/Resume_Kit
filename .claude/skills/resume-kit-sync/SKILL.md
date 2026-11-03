---
name: resume-kit-sync
description: Check the user's GitHub repos for recent changes with tools/github_sync.py, propose updates to Resume_Kit project files and facts from the evidence, apply the approved ones, and rebuild.
---

# Sync Resume_Kit with GitHub

Use when the user asks "what changed in my repos?", "sync my GitHub", "update the resume from
my repos", or before an interview.

Follow the shared steps at the end of this file.

## Steps

1. **Collect**: `python3 tools/github_sync.py` (add `--days N` if the user gives a window).
   If the GitHub API is unreachable it falls back to the profile README and content links;
   mention that new repos missing from the profile README may be missed.
2. **Read** `out/github/report.md`. For each repo in section 1 (recorded, with new work):
   - read the recent commit subjects and the README sections they touch
     (`git -C .cache/github/<repo>.git show HEAD:README.md`, or a shallow clone);
   - compare with `content/projects/<id>.yaml` (or the experience bullet that links it) and the
     facts it uses.
3. **Propose changes** as a short list per repo, each with its evidence (commit or README line):
   - new or corrected bullets / `short` line;
   - facts: new `value`, `source`, `as_of`; keep replaced published numbers as `superseded`;
   - always: `last_reviewed: <today>`.
   For section 2 (unrecorded repos), recommend at most 3 that would strengthen a target
   (recent activity, tests/CI signals, relevant tags) and suggest `exclude` for clear noise.
4. **Confirm** with the user (AskUserQuestion when available). Apply only what was approved.
5. **Deck check**: the deck does not read content/ yet. For every fact whose value changed,
   `grep -rn "<old value>" deck/src/` and list the slides that still show the old number; offer
   to update them (then `bash deck/build.sh`).
6. **Validate, build, commit** (`content: sync from GitHub <date>`), including
   `content/github/snapshot.yaml`. Report: repos reviewed, facts changed, deck slides flagged.

## Shared steps (repo, setup, rules, delivery)

## Find the repo
Use the first that applies:
1. The current working directory, if it contains `content/tags.yaml` and `resume/build.py`.
2. A folder the user connected that contains those files.
3. Otherwise clone it: `git clone https://github.com/JohnBlue-git/Resume_Kit.git` into the workspace.

## Set up (once per environment)
`pip install -r requirements.txt` (add `--break-system-packages` if pip refuses),
`python3 -m playwright install chromium` only if Chromium is missing, `cd deck && npm install`
only if the deck is needed.

## Rules that always apply
- `content/` is the source of truth. Edit YAML only; never edit `out/`.
- Never invent a number. Every number goes in `content/facts.yaml` with `source` and `as_of`;
  if the user can't give a source, use `status: unverified`.
- Respect `content/policy.yaml` (banned claims, ownership verbs) and the ownership definitions
  in `content/experience/insyde.yaml`. If a request would break them, say so and offer wording
  that is true.
- Self-directed work stays labeled self-directed. Company-internal details (`tier: company`)
  never reach a public file.
- After edits: `python3 resume/validate.py`, then `python3 resume/build.py`; both must pass.
- Show the user a short diff summary before committing. Commit with a clear message.

## Deliver
- If the repo is the user's working copy (cwd or connected folder): commit; the user pushes.
- If you cloned it: commit, then hand over `git format-patch origin/main` (or a zip of the repo
  including `.git`) and tell the user to apply/push it.
- Built files are in `out/resume/` (and `out/deck/`); send the ones the user asked for.
