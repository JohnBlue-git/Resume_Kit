---
name: resume-kit-tailor
description: Tailor a Resume_Kit resume to a specific job description - measure keyword coverage with tools/jd_match.py, pick or create a target, build PDF/DOCX/HTML, and report honest gaps and talking points.
---

# Tailor a resume to a job description

Use when the user pastes or attaches a JD, or says "tailor my resume for <company/role>".

Follow the shared steps at the end of this file.

## Steps

1. **Save the JD** to `out/jd/<company>-<role>.txt` (out/ is git-ignored, so the JD stays private).
2. **Build and match**: `python3 resume/build.py` then
   `python3 tools/jd_match.py out/jd/<file>.txt`. Read the JD yourself as well: list important
   requirements the tool doesn't know (frameworks, domains, soft requirements) and check them
   against content/ by hand; add recurring ones to `content/keywords.yaml`.
3. **Decide**:
   - If an existing target covers the JD well, use it as is.
   - Otherwise create `targets/<company>.yaml` by copying the closest target and changing only:
     `role`, `headline`, `summary.select`, experience `select/include/exclude`, `projects`,
     `skills.groups`, `layout` order. Put the JD's strongest matches first.
   - The headline and every bullet must stay within existing evidence and `policy.yaml`. Never
     add a claim just because the JD asks for it.
4. **Build** the target: `python3 resume/build.py <target>`; fix page-limit or policy failures by
   reselecting content, not by shrinking type.
5. **Report** to the user (short):
   - coverage before/after (from jd_match), which target was used;
   - real gaps (no evidence): one honest talking point each, e.g. adjacent experience;
   - "evidence exists but hidden" items you surfaced;
   - the review sheet `out/resume/<output>.review.md` for ownership and numbers to rehearse.
6. **Deliver** the PDF (and DOCX if the portal needs Word). Commit the new target file only if
   the user wants to keep it (`targets: add <company>`).

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
