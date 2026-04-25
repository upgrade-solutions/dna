## Context

Script's only structural purpose was to bind a named Equation to a deployed compute Construct. With Equation gone (see `openspec/changes/archive/2026-04-25-remove-signal-and-equation/`), Script has no concept it implements — its required `equation` field references a primitive that doesn't exist.

## Goals / Non-Goals

**Goals:**
- Delete the schema file and prune the two registration sites
- Land in one commit; no follow-up

**Non-Goals:**
- Repurposing Script as a generic compute-script primitive — there is no caller asking for that and no example would benefit. If general-purpose script wiring is needed later, propose it with the use case attached.

## Decisions

### Delete, don't repurpose

Script's `runtime`/`handler`/`construct` fields could plausibly survive without `equation` as a generic "named compute deployment" primitive. Rejected because nothing in the repo (examples, fixtures, tests, downstream packages) uses Script in any form, so there is no pressure on the design and no way to know what the right shape would be.

## Risks / Trade-offs

- **Risk**: a downstream consumer outside this repo declares `scripts[]` in their Technical DNA. → Mitigation: none — no known external consumers; reverse-PR is one-file restore from git history.
