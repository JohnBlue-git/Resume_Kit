# Legacy Resume Comparison Snapshot

This note preserves the comparison context for the former `archive/v2/` resumes. It is a
summary of known target relationships, not a copy of the old resume content. The old Pages
sources and PDFs are not inputs to the current build; Git history retains the removed files.

| Legacy PDF | Current target | Preserved comparison |
|---|---|---|
| `Resume_BMC_v2.pdf` | `targets/bmc.yaml` | The current BMC target is documented as the successor to the v2 BMC resume. |
| `Resume_Secure_v2.pdf` | `targets/secure.yaml` | The current target was trimmed from three pages to two, drops delivery/collaboration bullets, and adds the auth/TLS bullet from the interview deck experience slide. |
| `Resume_SW_v2.pdf` | `targets/sw.yaml` | The current general backend/systems target is documented as the successor to the v2 software resume. |

Current resume content is maintained in `content/` and selected by `targets/`; generated
outputs are rebuilt under `out/resume/`. See [Project Design](DESIGN.md) for the current
pipeline.
