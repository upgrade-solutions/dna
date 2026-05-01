## Why

Pre-1.0, every change touching multiple adapter packages forces a coordinated version bump across `dna-input-*`, `dna-output-*`, and `dna-integration-*` — a tax that buys nothing while the API is still moving. The adapters share a render/parse contract and a release cadence anyway; treating them as separate npm packages is bookkeeping for a boundary that isn't real yet. Collapsing them into one package with subpath exports keeps a single version line and a single release, while preserving each adapter as a self-contained unit so we can extract any one back into its own package post-1.0 without rewriting it.

## What Changes

- **BREAKING** Introduce `@dna-codes/dna-adapters` as a single workspace package containing every input, output, and integration adapter under `src/input/`, `src/output/`, and `src/integration/` subfolders.
- Each adapter remains self-contained: its own subfolder, its own subpath export (e.g. `@dna-codes/dna-adapters/output/svg`), no cross-adapter imports, no shared internals beyond `@dna-codes/dna-core`. This is the extraction contract — every adapter must remain mechanically liftable back into its own package.
- **BREAKING** Delete the existing per-adapter workspaces from `packages/`: `input-json`, `input-openapi`, `input-text`, `input-example`, `output-markdown`, `output-html`, `output-mermaid`, `output-openapi`, `output-text`, `output-example`, `integration-jira`, `integration-google-drive`, `integration-example`. The corresponding npm packages are already deprecated; no redirect shims are added.
- Update `@dna-codes/dna-ingest` and any internal consumers to import adapters via subpaths on `@dna-codes/dna-adapters`.
- Update `dna-codes-package-naming` so `adapters` is the canonical topic for the merged package and the `input-<format>` / `output-<format>` / `integration-<system>` per-adapter topic forms are retired (those names now live as subpaths inside `dna-adapters`, not as standalone packages).
- Bump the merged package to `0.6.0` to match `@dna-codes/dna-core` and signal the breaking distribution change to any pre-deprecation consumers still pinned.
- Update `README.md`, `AGENTS.md`, and per-adapter docs to describe the new package + subpath surface.

## Capabilities

### New Capabilities
- `dna-adapters-package`: defines the structure, subpath-export contract, isolation rules, and extraction-readiness requirements for the unified `@dna-codes/dna-adapters` package.

### Modified Capabilities
- `dna-codes-package-naming`: the canonical topic list shifts — `adapters` replaces `input-<format>`, `output-<format>`, and `integration-<system>` as the published topic; those forms remain reserved historical territory only.

## Impact

- **Affected paths**: every `packages/{input,output,integration}-*/` directory (deleted and re-homed under a new `packages/adapters/`), root `package.json#workspaces`, `packages/ingest/**` (import paths + tests), `README.md` (pipeline diagram + package tables), `AGENTS.md`, `openspec/specs/dna-codes-package-naming/spec.md`.
- **Backwards compatibility**: hard break for consumers. The deprecated per-adapter npm packages stay deprecated and frozen; consumers move to `@dna-codes/dna-adapters` + subpath imports.
- **Risk profile**: low–medium. Mechanical move with two real risks: (1) accidentally letting adapters share internals during the merge, which would compromise future extraction, and (2) `dna-ingest` injection wiring breaking if subpath exports aren't declared correctly. Both are caught by tests.
- **Future extraction**: the design must keep each adapter folder runnable in isolation (no shared utils, no barrel re-exports across siblings, every adapter declares its own narrow set of `dna-core` imports). When we extract `output-svg` post-1.0, the move is `git mv packages/adapters/src/output/svg packages/output-svg/src/` plus a new `package.json` — no code rewrite.
