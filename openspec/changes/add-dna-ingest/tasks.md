## 1. Merge utility in `@dna-codes/dna-core`

- [x] 1.1 Add `Conflict` and `Provenance` TypeScript types to `packages/core/src/types/` (or the existing types module) and re-export from the package entry
- [x] 1.2 Implement `merge(dnas, opts?)` in `packages/core/src/merge/` covering identity-by-name unification across all Operational primitive types (Resource, Person, Role, Group, Membership, Operation, Trigger, Rule, Task, Process)
- [x] 1.3 Implement list-shaped union-by-name with recursive merge for nested children (`attributes[]`, `actions[]`, `roles[]`, etc.)
- [x] 1.4 Implement scalar conflict detection with the v1 recommendation policy (source-count → recency → string-length → stable order); each conflict carries `path`, `values[]`, and `recommendation: { value, reason }`
- [x] 1.5 Implement cross-reference resolution (Operation.target, Membership.{person,role,group}, Trigger.operation, Task.{actor,operation}, Step.task, Rule.operation) against the merged noun set; emit unresolved refs as conflict warnings without dropping the referencing primitive
- [x] 1.6 Build the provenance map keyed by dotted primitive path (`resources.Loan`, `resources.Loan.attributes.amount`, etc.); accept per-DNA source metadata via a sidecar parameter on `merge()`
- [x] 1.7 Confirm merged DNA validates against `@dna-codes/dna-schemas` Operational schema with no inline `_provenance`/`_source` fields; add a regression test for this
- [x] 1.8 Unit tests covering each spec scenario in `specs/dna-merge/spec.md` (identity, union, conflict + recommendation, cross-ref resolution, provenance, empty input, pure-function determinism)
- [x] 1.9 Document `merge()` in `packages/core/docs/` and add a usage section to `packages/core/README.md`
- [x] 1.10 Bump `@dna-codes/dna-core` minor version

## 2. `@dna-codes/dna-ingest` package skeleton

- [x] 2.1 Scaffold `packages/ingest/` with `package.json` (name `@dna-codes/dna-ingest`, `@dna-codes` scope, GitHub Packages registry config matching siblings), `tsconfig.json`, `src/`, `README.md`, `AGENTS.md`
- [x] 2.2 Add `@dna-codes/dna-core` as the only `@dna-codes/*` runtime dependency; verify `package.json` declares zero `@dna-codes/dna-input-*` and zero `@dna-codes/dna-integration-*` dependencies (peer or runtime)
- [x] 2.3 Wire the package into the workspace root (`package.json` workspaces), confirm it builds via `npm run build --workspaces`

## 3. `dna-ingest` types and contracts

- [x] 3.1 Define and export `Integration` interface (`fetch(uri) → Promise<{ contents, mimeType, source: { uri, loadedAt } }>`)
- [x] 3.2 Define and export `InputAdapter` interface matching the shape produced by existing `input-text`/`input-transcript`/`input-image` (single-doc → DNA, accepts `llm` options)
- [x] 3.3 Define and export `IngestOptions` (`sources`, `integrations`, `inputs`, `llm: { model, temperature, seed }`, `concurrency?`) and `IngestResult` (`dna`, `conflicts`, `errors`, `provenance`)

## 4. `dna-ingest` orchestrator implementation

- [x] 4.1 Implement built-in fs fetcher and export it as `fileIntegration()`; handle `file://` URIs and bare filesystem paths; infer MIME type from file extension
- [x] 4.2 Implement URI-scheme dispatch: `file://` and bare paths → built-in fetcher; other schemes → `integrations[scheme]`; unknown scheme → non-fatal `errors[]` entry with `stage: 'fetch'`
- [x] 4.3 Implement MIME-glob dispatch with `*` segment wildcards; specific keys (`text/markdown`) preferred over wildcards (`text/*`); unmatched MIME → non-fatal `errors[]` entry with `stage: 'extract'`
- [x] 4.4 Implement bounded-concurrency runner (default 4, configurable via `IngestOptions.concurrency`); reject `concurrency < 1` synchronously
- [x] 4.5 For each source: fetch → extract via input adapter (passing `llm` options through verbatim) → tag the resulting DNA chunk with its source `{ uri, loadedAt }`
- [x] 4.6 Collect all per-source DNA chunks and call `dna-core` `merge()` with the source metadata; assemble the final `IngestResult`
- [x] 4.7 Catch and record fetch failures (`stage: 'fetch'`) and extraction failures (`stage: 'extract'`) in `errors[]`; never let one source abort the run

## 5. `dna-ingest` tests

- [x] 5.1 Unit tests for URI-scheme dispatch (file://, bare path, unknown scheme)
- [x] 5.2 Unit tests for MIME-glob dispatch (exact match, wildcard match, specific-over-wildcard preference, unmatched MIME)
- [x] 5.3 Unit tests for concurrency (default = 4 in flight, `concurrency: 1` is serial, `concurrency: 0` rejects)
- [x] 5.4 Unit tests for `Integration` and `InputAdapter` contracts (a minimal fake satisfies them; the orchestrator drives them)
- [x] 5.5 End-to-end test using the stub `dna-integration-google-drive` (with mock map) plus a fake `inputText`-shaped adapter; verify `dna`, `conflicts`, `errors`, `provenance` shape and content
- [x] 5.6 Test that a failed source surfaces in `errors[]` and the run continues (per spec scenario)
- [x] 5.7 Test that LLM options pass through verbatim to every adapter invocation
- [x] 5.8 Test that `package.json` declares no `@dna-codes/dna-input-*` or `@dna-codes/dna-integration-*` dependency

## 6. `dna-ingest` documentation

- [x] 6.1 Write `packages/ingest/README.md` covering: purpose, install, the DI shape (`integrations` + `inputs`), `Integration` contract for future reader packages, `IngestOptions`/`IngestResult` reference, determinism caveats per the probabilistic-package convention
- [x] 6.2 Write `packages/ingest/AGENTS.md` with fork/extension instructions consistent with sibling packages

## 7. `@dna-codes/dna-integration-google-drive` stub

- [x] 7.1 Scaffold `packages/integration-google-drive/` (`package.json` under `@dna-codes` scope, `tsconfig.json`, `src/`, `README.md`, `AGENTS.md`)
- [x] 7.2 Add `@dna-codes/dna-ingest` as a peer/runtime dependency to access the `Integration` interface
- [x] 7.3 Implement the default factory: accepts `{ mock?: Record<uri, { contents, mimeType }> }`; returns an object satisfying `Integration`
- [x] 7.4 Implement `fetch(uri)`: if `mock[uri]` exists, return `{ contents, mimeType, source: { uri, loadedAt: new Date().toISOString() } }`; otherwise throw `NotImplementedError` with a message naming Google Drive and pointing the caller to the `mock` parameter
- [x] 7.5 Unit tests for each spec scenario (mocked fetch returns contents, `loadedAt` is fetch-time, unmocked fetch throws `NotImplementedError`, `name === 'NotImplementedError'`)
- [x] 7.6 Write `README.md` clearly labeling the package as a stub and stating that real Drive auth ships in a follow-up change

## 8. README updates

- [x] 8.1 Extend the pipeline diagram in the root `README.md` to show fan-in: `dna-ingest` as a container box around the per-source `integration-* → input-* → partial DNA` flow, with `merge()` from `dna-core` as the fan-in point feeding the existing `DNA → output-* → integration-*` right half
- [x] 8.2 Add `@dna-codes/dna-ingest` to the Packages section under a new "Orchestrators" subsection (or extend an existing category — pick whatever reads cleanest in context)
- [x] 8.3 Add `@dna-codes/dna-integration-google-drive` to the Integrations table marked as a stub (🚧 or similar marker matching the legend)
- [x] 8.4 Add a short note documenting the `Integration` contract so future `integration-*` authors know what to implement to participate in `dna-ingest`

## 9. Release

- [ ] 9.1 Bump versions: `dna-core` minor (added `merge`), `dna-ingest` 0.1.0, `dna-integration-google-drive` 0.1.0
- [ ] 9.2 Tag the release (`vX.Y.0`) and push the tag; verify the existing `publish.yml` workflow publishes all three workspaces to GitHub Packages
- [ ] 9.3 Smoke-test install from a fresh consumer project: `npm install @dna-codes/dna-ingest @dna-codes/dna-integration-google-drive @dna-codes/dna-core` and run a tiny end-to-end ingest with the stub
