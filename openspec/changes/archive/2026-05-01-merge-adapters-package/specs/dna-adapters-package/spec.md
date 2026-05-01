## ADDED Requirements

### Requirement: A single workspace package hosts every input, output, and integration adapter

The repository SHALL host all input, output, and integration adapters in one workspace package named `@dna-codes/dna-adapters`, located at `packages/adapters/`. There SHALL NOT be standalone `packages/input-*`, `packages/output-*`, or `packages/integration-*` workspaces. Adapters SHALL be organized into `src/input/<name>/`, `src/output/<name>/`, and `src/integration/<name>/` subfolders, each folder being a self-contained adapter unit.

#### Scenario: Workspace listing contains adapters but no per-kind packages
- **WHEN** the root `package.json#workspaces` array is inspected
- **THEN** it includes `packages/adapters` and contains no entry matching `packages/input-*`, `packages/output-*`, or `packages/integration-*`

#### Scenario: Each adapter has its own folder under the appropriate kind
- **WHEN** a contributor adds a new output renderer named `svg`
- **THEN** the adapter lives at `packages/adapters/src/output/svg/` with its own `index.ts`, types, tests, and README — not under `packages/output-svg/`

### Requirement: Subpath exports are the only public entry point

`@dna-codes/dna-adapters/package.json#exports` SHALL declare one subpath per adapter under `./input/<name>`, `./output/<name>`, or `./integration/<name>`. The map SHALL also expose `./package.json`. The map SHALL NOT declare a root entry (`"."`); consumers are required to import each adapter by its subpath.

#### Scenario: Importing an adapter by its subpath works
- **WHEN** a consumer writes `import { renderMarkdown } from '@dna-codes/dna-adapters/output/markdown'`
- **THEN** Node and TypeScript resolve the import to `dist/output/markdown/index.{js,d.ts}` and the named export is available

#### Scenario: Importing the package root fails
- **WHEN** a consumer writes `import * as adapters from '@dna-codes/dna-adapters'`
- **THEN** Node throws `ERR_PACKAGE_PATH_NOT_EXPORTED` because no root entry is declared

#### Scenario: A new adapter without a corresponding exports entry is unreachable
- **WHEN** a contributor adds `src/output/svg/index.ts` but does not add `./output/svg` to the `exports` map
- **THEN** the publish-readiness test fails because the documented adapter is not importable from outside the package

### Requirement: Each adapter is self-contained and free of cross-adapter coupling

A **library file** under `packages/adapters/src/<kind>/<name>/` SHALL only import from: its own folder, `@dna-codes/dna-core`, `@dna-codes/dna-schemas`, `@dna-codes/dna-ingest`, external dependencies declared in `packages/adapters/package.json`, or Node built-ins. It SHALL NOT import from any sibling adapter folder by relative path, nor by the package's own subpath self-reference. Library files are every `.ts` file under an adapter folder EXCEPT `cli.ts` and `cli.test.ts`.

The package SHALL NOT contain shared `src/util/`, `src/shared/`, or similar package-level helper directories.

**CLI carve-out for integrations**: a `cli.ts` (or `cli.test.ts`) under `packages/adapters/src/integration/<name>/` MAY import sibling input/output adapters — but only via the package's published subpath form (`import from '@dna-codes/dna-adapters/input/<name>'`), never via relative paths into a sibling folder. Input and output adapters' `cli.ts` files (if any) SHALL NOT use this carve-out — only integrations may.

#### Scenario: A library import from a sibling adapter is rejected
- **WHEN** code in `src/output/markdown/util.ts` adds `import { foo } from '../../input/json'`
- **THEN** the package's import-isolation test fails and the change is blocked

#### Scenario: A `src/util/` directory does not exist
- **WHEN** the package directory tree is listed
- **THEN** there is no `packages/adapters/src/util/`, `packages/adapters/src/shared/`, or any other cross-adapter helper directory

#### Scenario: Two adapters duplicating a small helper is the accepted pattern
- **WHEN** both `src/output/markdown/` and `src/output/html/` need a `slugify` helper
- **THEN** each defines its own copy inside its folder, rather than extracting a shared module that would couple them

#### Scenario: An integration's CLI MAY compose with input and output siblings via published subpaths
- **WHEN** `src/integration/jira/cli.ts` imports `parseText` from `@dna-codes/dna-adapters/input/text` and `renderMany` from `@dna-codes/dna-adapters/output/text`
- **THEN** the import-isolation test accepts these imports because they use the package's published subpath form and the file is a CLI file under an integration adapter

#### Scenario: An integration's library file (non-CLI) cannot use the carve-out
- **WHEN** `src/integration/jira/client.ts` adds `import { parse } from '@dna-codes/dna-adapters/input/text'`
- **THEN** the import-isolation test fails because the carve-out applies only to `cli.ts`/`cli.test.ts` files

#### Scenario: An input adapter's CLI cannot use the carve-out
- **WHEN** a hypothetical `src/input/json/cli.ts` adds `import from '@dna-codes/dna-adapters/output/markdown'`
- **THEN** the import-isolation test fails because the carve-out applies only to integration adapters

#### Scenario: Even integration CLIs MUST use published-subpath form, not relative paths
- **WHEN** `src/integration/jira/cli.ts` adds `import { parse } from '../../input/text'`
- **THEN** the import-isolation test fails — the carve-out requires the published-subpath form so post-extraction the import path is unchanged

### Requirement: Every adapter folder is mechanically extractable into its own package

The structure of each `src/<kind>/<name>/` folder SHALL preserve the property that lifting it back into a standalone published package requires only file moves and a new `package.json` — no code edits to source files or tests. Specifically: tests, types, helpers, README, and (where present) AGENTS.md SHALL all live inside the adapter folder; no required content for the adapter SHALL live elsewhere in the package.

#### Scenario: An adapter folder is self-describing
- **WHEN** any adapter folder under `src/<kind>/<name>/` is inspected
- **THEN** it contains its own `index.ts`, `index.test.ts`, `README.md`, types/helpers used only by that adapter, and (for templates) an `AGENTS.md`

#### Scenario: Extraction dry run succeeds without code edits
- **WHEN** the project performs an extraction dry-run by copying any single adapter folder out, adding a minimal `package.json` declaring its `dna-core` dependency, and running its own tests
- **THEN** the adapter builds and its tests pass with no changes to its source files

### Requirement: One package, one version, one publish

The merged package SHALL have a single version line in `packages/adapters/package.json#version`. A change to any single adapter SHALL bump that one version (per the existing pre-1.0 minor-bump rule for breaking changes, patch otherwise). The publish workflow SHALL produce exactly one tarball for `@dna-codes/dna-adapters` per release.

#### Scenario: A fix scoped to one adapter still bumps the package
- **WHEN** a patch fixes only `src/output/markdown/`
- **THEN** `@dna-codes/dna-adapters` increments its patch version once, and every other adapter in the package ships at that same version

#### Scenario: Publish produces one artifact for all adapters
- **WHEN** the tag-driven publish workflow runs against the merged repo
- **THEN** exactly one `npm publish` call is issued for `@dna-codes/dna-adapters` covering every input/output/integration adapter

### Requirement: The Jira CLI binary remains available via the merged package

The merged package SHALL declare a `bin` entry exposing the Jira integration's CLI as `dna-integration-jira`, loaded from `bin/integration-jira.js` and dispatching into the compiled `dist/integration/jira/cli.js`. The binary SHALL retain the behavior shipped by the prior `@dna-codes/dna-integration-jira` package; only its package home and bin name change.

#### Scenario: Installing the package exposes the Jira CLI
- **WHEN** a consumer runs `npm install @dna-codes/dna-adapters` and then `npx dna-integration-jira --help`
- **THEN** the CLI runs and prints its help text

### Requirement: `@dna-codes/dna-ingest` remains separate and depends on no adapters

`@dna-codes/dna-ingest` SHALL remain its own workspace and its own published package. It SHALL NOT declare `@dna-codes/dna-adapters` (or any specific adapter subpath) as a runtime or peer dependency in `packages/ingest/package.json`. Adapters are injected by the caller at runtime, exactly as today.

#### Scenario: Ingest's package.json contains no adapter dependency
- **WHEN** `packages/ingest/package.json` is inspected
- **THEN** its `dependencies` and `peerDependencies` blocks contain no entry referencing `@dna-codes/dna-adapters` or any `@dna-codes/dna-{input,output,integration}-*` name

#### Scenario: The ingest package-deps test enforces the boundary
- **WHEN** the `packages/ingest/src/package-deps.test.ts` test runs
- **THEN** it asserts that ingest depends on no `@dna-codes/dna-adapters` subpath import and on no `@dna-codes/dna-{input,output,integration}-*` package
