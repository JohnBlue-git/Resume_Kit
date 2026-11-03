---
name: resume-kit-record
description: Record new work, projects, skills, or numbers into the Resume_Kit repo's content YAML (from chat notes or content/inbox files), validate, and rebuild the resumes.
---

# Record work into Resume_Kit

Use when the user says things like "record this", "add my new project", "I did X at work",
"process the inbox", or pastes notes (any language) about their work.

Follow the shared steps at the end of this file, and read the repo's `GUIDE.md`.

## Steps

1. **Collect input**: the user's message, plus any files in `content/inbox/` (skip `README.md`
   and `done/`). Read `content/tags.yaml` for the allowed vocabulary.
2. **Classify each item** as one of:
   - experience bullet → `content/experience/<company>.yaml`
   - project → `content/projects/<id>.yaml` (if it is a repo, read its README first:
     `git clone --depth 1 https://github.com/JohnBlue-git/<repo>.git` into a scratch dir)
   - skill → `content/skills.yaml` (with `evidence` ids that exist)
   - number → `content/facts.yaml`
   - not resume material → say so and leave it.
3. **Draft the YAML**, following GUIDE.md: action + scope + result, bold lead phrase, numbers as
   `{{ f.key }}`, `tags` from tags.yaml only, `default` text plus `bmc`/`security` variants only
   when the framing really differs. If something duplicates an existing bullet, propose editing
   that bullet instead of adding a new one.
4. **Ask only what you can't infer**, in one AskUserQuestion round if available:
   - ownership (owned / contributed / rotation), with the definitions;
   - the source of each number, and whether it is verified;
   - for a new project: which targets should show it (detailed or short).
5. **Apply** the approved YAML. If a target should show it, add it to that target's
   `projects` or make sure its tags match the target's `select`.
6. **Validate and build**: `python3 resume/validate.py && python3 resume/build.py`. If the page
   limit fails, propose which existing bullet to drop or which target to exclude it from; don't
   shrink fonts.
7. **Finish**: move processed inbox files to `content/inbox/done/`, commit
   (`content: record <short summary>`), and tell the user in 2–3 lines what was added, which
   targets changed, and any warnings (unverified facts).

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
