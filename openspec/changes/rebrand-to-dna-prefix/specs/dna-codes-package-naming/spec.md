## ADDED Requirements

### Requirement: All packages in this repo carry the `dna-` prefix

Every package published from this repository SHALL be named `@dna-codes/dna-<topic>`, where `<topic>` is the package's content (`core`, `schemas`, `input-<format>`, `output-<format>`, `integration-<system>`, or any of the matching templates). The unprefixed `@dna-codes/<topic>` form is reserved historical territory on npmjs.com and SHALL NOT be used for new publishes from this repo.

The prefix exists so the `@dna-codes/*` scope can host both DNA-side packages (this repo) and cells-side packages (the cba repo, prefixed `@dna-codes/cells-*`) without name collision or visual ambiguity.

#### Scenario: A new input adapter inherits the prefix
- **WHEN** a contributor forks `packages/input-example` to add a `csv` adapter
- **THEN** the resulting package's `package.json#name` is `@dna-codes/dna-input-csv`, not `@dna-codes/input-csv`

#### Scenario: A package.json that drops the prefix is rejected at review
- **WHEN** a PR introduces a workspace whose `package.json#name` is `@dna-codes/<topic>` without the `dna-` prefix
- **THEN** the change is rejected; the contributor renames to `@dna-codes/dna-<topic>` before merge

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
