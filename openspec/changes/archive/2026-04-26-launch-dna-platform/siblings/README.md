# Sibling proposals

This folder holds OpenSpec change proposals that belong in **other repositories**, kept here for visibility while the cross-repo coordination is being designed.

The `launch-dna-platform` initiative spans three repos. Each repo owns one slice:

| Repo                          | Slice                                                                                    |
|-------------------------------|------------------------------------------------------------------------------------------|
| `dna` (this repo)             | `@dna-codes/output-openapi` — the contract layer between DNA's product layer and CBA.    |
| `cell-based-architecture`     | New `astro` ui-cell adapter, `lambda` compute target on api-cell, terraform-aws lambda extension. |
| `dna-platform` (new repo)     | The platform itself: DNA documents, four cells, auth, billing, content.                  |

## How to use these

Each subdirectory below is a complete, self-contained OpenSpec change ready to be copied to its destination repo:

```
siblings/
├── cell-based-architecture/
│   ├── proposal.md          ← cp -r → cell-based-architecture/openspec/changes/launch-dna-platform/
│   ├── design.md
│   └── tasks.md
└── dna-platform/
    ├── proposal.md          ← cp -r → dna-platform/openspec/changes/launch-dna-platform/
    ├── design.md
    └── tasks.md
```

Once the destination repo accepts the change, the corresponding folder under `siblings/` here can be removed (or kept as an archive marker — your call).

## Why this layout

OpenSpec changes are scoped per repository. A single change cannot live in three repos. By keeping copy-pasteable proposal sets in `siblings/`, we get:

- A single source of truth (this folder) while the architecture is in flux.
- Independently authorable, validatable changes per repo once the architecture stabilizes.
- A clear "you copy this to that repo" workflow with no ambiguity about ownership.

## Cross-references between proposals

Each sibling proposal references the other two by relative path so that, while the proposals live here together, the cross-cutting context is one click away. After copying to destination repos, those references become broken links — replace them with URLs to the corresponding proposals once each repo's GitHub URL is known.

Suggested replacements after split:

```
siblings/dna-platform/proposal.md   →  https://github.com/dna-codes/dna-platform/blob/main/openspec/changes/launch-dna-platform/proposal.md
siblings/cell-based-architecture/   →  https://github.com/upgrade-solutions/cell-based-architecture/blob/main/openspec/changes/launch-dna-platform/proposal.md
(this repo's proposal)              →  https://github.com/dna-codes/dna/blob/main/openspec/changes/launch-dna-platform/proposal.md
```
