## Context

Today, every adapter ships as its own workspace and its own published npm package: 4 input adapters (`json`, `openapi`, `text`, `example`), 5 output adapters (`markdown`, `html`, `mermaid`, `openapi`, `text`, plus `example`), and 3 integrations (`jira`, `google-drive`, `example`). They share no runtime dependencies beyond `@dna-codes/dna-core`, conform to a small render/parse/fetch contract, and move on a single de-facto release cadence — but every minor bump in `dna-core`'s API forces 12 separate version bumps and 12 separate publishes. This is mechanical churn that buys no isolation pre-1.0.

`@dna-codes/dna-ingest` stays separate (see proposal): it owns the `Integration` port, imports zero adapters, and is consumed alongside — not inside — the adapter set.

The previous per-adapter packages on npmjs.com are already deprecated, so no redirect shims, no stub re-export packages, and no consumer-facing migration window are required.

## Goals / Non-Goals

**Goals:**
- One workspace, one version, one publish per release for every input/output/integration adapter.
- Each adapter is an isolated, self-contained unit on disk and at the module-resolution layer — no cross-adapter imports, no shared internals beyond `@dna-codes/dna-core`.
- Subpath exports (`@dna-codes/dna-adapters/input/json`, `…/output/markdown`, `…/integration/jira`) so consumers import only what they use and tree-shaking remains effective.
- Mechanical extractability: lifting any single adapter back into its own published package post-1.0 is `git mv` + a new `package.json` with no code rewrite.
- `dna-ingest` and its tests continue to work via dependency injection against the new subpath modules.

**Non-Goals:**
- Folding `dna-ingest` into the merged package (proposal-level decision; not revisited here).
- Formalizing `InputAdapter` / `OutputAdapter` ports as published TS interfaces — separate change.
- Publishing redirect/stub packages on npm under the old names — they are already deprecated.
- Renaming the public exported function names of any adapter (`render`, `parseDna`, `Integration` impls keep their current shapes).
- Touching `@dna-codes/dna-core` or `@dna-codes/dna-schemas`.

## Decisions

### 1. One package, subpath exports per adapter

`@dna-codes/dna-adapters` declares an explicit `exports` map enumerating every adapter at its subpath:

```json
"exports": {
  "./package.json": "./package.json",
  "./input/json":         { "types": "./dist/input/json/index.d.ts",         "default": "./dist/input/json/index.js" },
  "./input/openapi":      { "types": "./dist/input/openapi/index.d.ts",      "default": "./dist/input/openapi/index.js" },
  "./input/text":         { "types": "./dist/input/text/index.d.ts",         "default": "./dist/input/text/index.js" },
  "./input/example":      { "types": "./dist/input/example/index.d.ts",      "default": "./dist/input/example/index.js" },
  "./output/markdown":    { "types": "./dist/output/markdown/index.d.ts",    "default": "./dist/output/markdown/index.js" },
  "./output/html":        { "types": "./dist/output/html/index.d.ts",        "default": "./dist/output/html/index.js" },
  "./output/mermaid":     { "types": "./dist/output/mermaid/index.d.ts",     "default": "./dist/output/mermaid/index.js" },
  "./output/openapi":     { "types": "./dist/output/openapi/index.d.ts",     "default": "./dist/output/openapi/index.js" },
  "./output/text":        { "types": "./dist/output/text/index.d.ts",        "default": "./dist/output/text/index.js" },
  "./output/example":     { "types": "./dist/output/example/index.d.ts",     "default": "./dist/output/example/index.js" },
  "./integration/jira":           { "types": "./dist/integration/jira/index.d.ts",           "default": "./dist/integration/jira/index.js" },
  "./integration/google-drive":   { "types": "./dist/integration/google-drive/index.d.ts",   "default": "./dist/integration/google-drive/index.js" },
  "./integration/example":        { "types": "./dist/integration/example/index.d.ts",        "default": "./dist/integration/example/index.js" }
}
```

**No root export** (`"."` is intentionally absent). Consumers MUST import via a subpath; this prevents accidental "import everything" patterns that would defeat tree-shaking and subtly couple adapters.

**Rationale**: subpath exports give consumers per-adapter granularity (the ergonomic property of separate packages) while keeping a single version line. Omitting the root entry forecloses the easy mistake of `import { renderMarkdown, parseJson } from '@dna-codes/dna-adapters'` — every import names the adapter explicitly, mirroring the future extracted-package shape.

**Alternative considered**: a barrel `./index.ts` that re-exports every adapter. Rejected — it would let internals leak between adapters via auto-import tooling, and it would be a tree-shaking footgun.

### 2. Folder layout enforces the extraction contract

```
packages/adapters/
├─ package.json
├─ tsconfig.json
├─ README.md
├─ AGENTS.md
└─ src/
   ├─ input/
   │  ├─ json/         { index.ts, types.ts, index.test.ts, README.md }
   │  ├─ openapi/      { … }
   │  ├─ text/         { … }
   │  └─ example/      { …, AGENTS.md }
   ├─ output/
   │  ├─ markdown/     { index.ts, types.ts, util.ts, sections/, index.test.ts, README.md }
   │  ├─ html/         { … }
   │  ├─ mermaid/      { … }
   │  ├─ openapi/      { … }
   │  ├─ text/         { … }
   │  └─ example/      { …, AGENTS.md }
   └─ integration/
      ├─ jira/         { index.ts, client.ts, mapping.ts, adf.ts, types.ts, cli.ts, index.test.ts, README.md, AGENTS.md, bin/ }
      ├─ google-drive/ { …, README.md }
      └─ example/      { …, README.md, AGENTS.md }
```

Each adapter folder is a closed unit: it owns its own `index.ts`, types, helpers, tests, and per-adapter README. Per-adapter `AGENTS.md` files (currently only on the templates) move into their adapter folders unchanged.

**Rationale**: this is the same shape the adapter has today as a standalone package, minus the `package.json` and `tsconfig.json`. Extraction is mechanical.

### 3. Isolation rules (the extraction contract, made enforceable)

The following rules are mandatory; they are what keeps adapters extractable:

1. **No cross-adapter imports in library code.** A non-CLI file under `src/input/json/**` MUST NOT import from `src/output/**`, `src/integration/**`, or any sibling input adapter (`src/input/openapi/**`, etc.). The only allowed import paths in library files are: (a) within its own folder, (b) `@dna-codes/dna-core`, (c) `@dna-codes/dna-schemas`, (d) `@dna-codes/dna-ingest`, (e) external dependencies declared in the merged `package.json`, (f) Node built-ins. **Library files** are every `.ts` file under an adapter folder *except* `cli.ts` and `cli.test.ts`.
2. **CLI files in integration adapters MAY compose with input/output siblings.** Because integrations are pure I/O (per the `integration-port-contract` capability) but typically ship a worked-example CLI that wires the pipeline, `src/integration/<name>/cli.ts` and `src/integration/<name>/cli.test.ts` MAY import sibling adapters — but ONLY via the package's own published subpaths (e.g. `import from '@dna-codes/dna-adapters/input/text'`), never via relative paths into `../../input/text`. The published-subpath form is identical pre- and post-extraction: when an integration is later lifted into its own package, its CLI's imports continue to resolve against `@dna-codes/dna-adapters/...` (or eventually against the standalone extracted package) with **zero source-file changes**.
3. **No shared `src/util/` or `src/shared/`.** If two adapters appear to need the same helper, duplicate it. A 30-line helper duplicated across two adapters is cheaper than a shared module that blocks extraction.
4. **Each adapter owns its narrow set of `dna-core` imports.** Adapters MAY import different builders/types from `dna-core`; they MUST NOT import from each other to get them.
5. **Tests live with the adapter.** Each `src/<kind>/<name>/*.test.ts` runs against only its own folder; no fixtures shared across adapters at the package level.

A `package-deps.test.ts` at `packages/adapters/src/` walks every `src/{input,output,integration}/<name>/**/*.ts`, parses imports, and asserts:
  - Library files reference no sibling adapter folder by relative or self-reference path.
  - CLI files reference sibling adapters only via `@dna-codes/dna-adapters/<kind>/<name>` form (no relative `../../<kind>/<name>` paths).
  - Input and output adapters NEVER reference any sibling adapter (CLI carve-out applies only to integrations).

This makes the contract enforceable in CI.

**Rationale**: without enforcement, "self-contained" decays into "uses a shared util" within two PRs, and the extraction promise becomes a lie.

### 4. Single version line, bumped to 0.6.0

The merged package starts at `0.6.0` to match `@dna-codes/dna-core` and signal the breaking distribution change to anyone still pinned to a deprecated `@dna-codes/dna-{input,output,integration}-*` package. Going forward, every adapter change bumps `@dna-codes/dna-adapters` once.

**Rationale**: pre-1.0, the cost of unnecessary minor bumps is real (every release re-exposes the publish workflow to flake) and the benefit of per-adapter version lines is hypothetical until consumers complain.

### 5. `@dna-codes/dna-integration-jira` private flag is preserved at the subpath level (not the package)

The current `dna-integration-jira` package is `"private": true` because it ships hardcoded behavior tied to a specific Jira instance shape. The merged `dna-adapters` package CANNOT be private (other integrations in it are public). The Jira adapter remains importable as `@dna-codes/dna-adapters/integration/jira` — the privacy was protective, not a hard constraint, and the published package is still public.

**Rationale**: the Jira adapter is already in the public source tree on GitHub; keeping its workspace private was preventing publish, not access. After the merge, it ships publicly as part of the bundle, and we accept that minor exposure increase. If we later decide it must remain unpublished, the right move is to extract it (the whole point of this design) rather than make the entire merged package private.

**Alternative considered**: ship `dna-adapters` minus Jira and keep `dna-integration-jira` as its own private workspace. Rejected — it splits the merge along an arbitrary line and contradicts the simplification goal. Better to extract Jira properly later if needed.

### 6. CLI binary placement

`integration-jira` currently ships a `bin/integration-jira.js` shell. Subpath exports cannot expose binaries; only the package's top-level `package.json#bin` does. The merged package declares:

```json
"bin": {
  "dna-integration-jira": "./bin/integration-jira.js"
}
```

The bin script lives at `packages/adapters/bin/integration-jira.js` and is a thin loader for `dist/integration/jira/cli.js` — same as today.

**Rationale**: bin names are global on a user's machine; namespacing with `dna-` reduces collision risk and matches the package naming convention. The single-bin approach is acceptable while only Jira ships a CLI; if other integrations grow CLIs, each gets its own bin entry.

### 7. `dna-ingest` migration

`packages/ingest/`'s tests today wire fake adapters via DI; they don't import real adapter packages. The only real-package import to update is `packages/ingest/src/package-deps.test.ts`, which currently asserts `dna-ingest` does NOT depend on adapter packages — that assertion stays correct, just gets updated to check against the new package name (`@dna-codes/dna-adapters`).

The README's pipeline diagram and `Integration` contract example continue to refer to "integration adapter" / "input adapter" as concepts; only the import path changes (`@dna-codes/dna-adapters/integration/google-drive` instead of `@dna-codes/dna-integration-google-drive`).

## Risks / Trade-offs

- **[Risk] Adapters silently start sharing internals during the merge.** → Mitigation: the import-isolation test from Decision 3 runs in CI and blocks the PR. We add it before moving any adapter code.
- **[Risk] Subpath exports configured incorrectly cause "Module not found" at consumer install time.** → Mitigation: a smoke test imports every documented subpath (`@dna-codes/dna-adapters/input/json` etc.) and asserts the expected named export exists. Runs as part of the merged package's test suite.
- **[Risk] `tsc` build output paths drift from what the `exports` map declares.** → Mitigation: `tsconfig.json` uses `"rootDir": "src"` + `"outDir": "dist"`; `tsc` mirrors the folder layout 1:1, so `src/input/json/index.ts` → `dist/input/json/index.js` deterministically.
- **[Risk] Extracting an adapter later requires more than `git mv` because hidden coupling crept in.** → Mitigation: every PR that touches `packages/adapters/` runs the isolation test. As a forcing function, we extract `output-example` (the simplest renderer) as a dry-run exercise within this change to prove the path works end-to-end, then immediately revert that extraction — keeping the proven recipe in the change archive but not in the live tree.
- **[Trade-off] Larger install footprint for consumers who only want one adapter.** → Accepted. `dna-input-text` pulls LLM SDKs; consumers who only want `dna-output-markdown` previously avoided that weight. Subpath exports mean the runtime cost is zero (only the imported subpath is loaded), but `node_modules` size grows. If this becomes a real complaint, the extraction recipe is ready.
- **[Trade-off] Single version line means a Jira-only fix bumps every adapter's "version".** → Accepted explicitly; this is the problem we're solving.

## Migration Plan

1. Create the new `packages/adapters/` workspace with the layout from Decision 2 and the `exports` map from Decision 1, but no adapter code yet — just the skeleton, the build config, and the isolation test.
2. Move adapter folders one kind at a time (input → output → integration), running the full test suite after each kind. Each move is `git mv packages/<kind>-<name>/src/* packages/adapters/src/<kind>/<name>/`, keeping per-adapter README and (where present) AGENTS.md.
3. Delete the old per-adapter workspaces from `packages/` and remove them from root `package.json#workspaces`.
4. Update `packages/ingest/src/package-deps.test.ts` to assert ingest does not depend on `@dna-codes/dna-adapters`.
5. Update `README.md` (pipeline diagram, package tables, install snippets), root `AGENTS.md`, and any docs in `docs/` referencing the old package names.
6. Bump `dna-adapters` to `0.6.0` and run the publish workflow on the next tag.

**Rollback**: pre-publish, `git revert` the merge commit. Post-publish, `npm deprecate @dna-codes/dna-adapters@0.6.0 "rolled back"` and re-publish corrected per-adapter packages from a git tag — but this is a non-event because the deprecated old packages still exist on npm at their last good versions.

## Open Questions

- Do we want `output-example` and `input-example` to live in the same package as production adapters, or move templates to a separate `@dna-codes/dna-adapter-templates` package? Default for now: keep them in `dna-adapters` under `*/example` subpaths; revisit if the example folders grow non-trivially.
- Is `bin/integration-jira.js` worth keeping at all once Jira is importable as a library? Out of scope here; the bin migrates as-is.
