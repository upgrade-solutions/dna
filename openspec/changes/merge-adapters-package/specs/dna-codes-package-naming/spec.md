## MODIFIED Requirements

### Requirement: All packages in this repo carry the `dna-` prefix

Every package published from this repository SHALL be named `@dna-codes/dna-<topic>`, where `<topic>` is the package's content (`core`, `schemas`, `adapters`, `ingest`, or any of the matching templates). The unprefixed `@dna-codes/<topic>` form is reserved historical territory on npmjs.com and SHALL NOT be used for new publishes from this repo.

The per-adapter topic forms — `input-<format>`, `output-<format>`, `integration-<system>` — are also reserved historical territory and SHALL NOT be used for new publishes from this repo. Every input, output, and integration adapter ships as a subpath inside `@dna-codes/dna-adapters` (e.g. `@dna-codes/dna-adapters/output/markdown`); these subpaths are not separate npm packages and have no separate `package.json#name`.

The prefix exists so the `@dna-codes/*` scope can host both DNA-side packages (this repo) and cells-side packages (the cba repo, prefixed `@dna-codes/cells-*`) without name collision or visual ambiguity.

#### Scenario: A new input adapter does not introduce a new package name
- **WHEN** a contributor forks `packages/adapters/src/input/example/` to add a `csv` adapter
- **THEN** the adapter ships at `@dna-codes/dna-adapters/input/csv` as a subpath; no new `@dna-codes/dna-input-csv` package.json is created and no new workspace is added

#### Scenario: A package.json that drops the prefix is rejected at review
- **WHEN** a PR introduces a workspace whose `package.json#name` is `@dna-codes/<topic>` without the `dna-` prefix
- **THEN** the change is rejected; the contributor renames to `@dna-codes/dna-<topic>` before merge

#### Scenario: A reintroduced per-adapter package is rejected
- **WHEN** a PR adds a workspace with `package.json#name` matching `@dna-codes/dna-input-<x>`, `@dna-codes/dna-output-<x>`, or `@dna-codes/dna-integration-<x>`
- **THEN** the change is rejected; the contributor moves the adapter into `packages/adapters/src/<kind>/<name>/` and adds the corresponding subpath export instead. (Post-1.0 deliberate extraction of an adapter into its own package would supersede this rule via a follow-up change.)
