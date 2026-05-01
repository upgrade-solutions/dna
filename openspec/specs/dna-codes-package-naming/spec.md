# dna-codes-package-naming Specification

## Purpose

Defines the naming convention for npm packages published from the `dna-codes` GitHub organization. The `@dna-codes/*` scope hosts two distinct halves — DNA-side packages (this repo, prefixed `dna-`) and cells-side packages (the cba repo, prefixed `cells-`). The prefix removes ambiguity at zero ongoing cost and gives the org a coherent, symmetric shape.

## Requirements

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

### Requirement: Internal cross-package import specifiers track the prefix

Every cross-package `import` / `require` / `package.json#dependencies` reference inside this repo SHALL use the prefixed name. There SHALL be no occurrences of `@dna-codes/<topic>` (without `dna-`) in `packages/*/src/**`, `packages/*/test/**`, `packages/*/README.md`, `packages/*/AGENTS.md`, or any `package.json#dependencies` / `devDependencies` block.

#### Scenario: Grep finds zero unprefixed references
- **WHEN** running `grep -r "@dna-codes/" packages/ | grep -v "dna-" | grep -v "@dna-codes/$" | grep -v "@dna-codes/<"`
- **THEN** the result is empty (the only allowed surviving forms are the bare scope reference `@dna-codes/` and template placeholders like `@dna-codes/<your-format>`)

### Requirement: Workspace directory names do not need to track the prefix

Directory names under `packages/` (e.g. `packages/core/`, `packages/input-text/`) MAY remain without the `dna-` prefix. The directory name is internal; only `package.json#name` is the public surface. Renaming directories to add the prefix is explicitly NOT required and is discouraged as churn.

#### Scenario: Directory and package name diverge
- **WHEN** `packages/core/package.json` declares `"name": "@dna-codes/dna-core"`
- **THEN** the workspace resolves correctly via the `workspaces` array in the root `package.json`, and consumers install via the prefixed name regardless of the on-disk directory name
