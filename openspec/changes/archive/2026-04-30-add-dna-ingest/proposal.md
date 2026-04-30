## Why

The pipeline today is single-source: one document goes into one `input-*` adapter and produces one DNA. Real organizations describe themselves across many documents — SOPs in Drive, meeting notes in Notion, policy PDFs on a shared filesystem — and there is currently no first-class way to fan those into a single DNA strand. Vector/RAG was considered and rejected upstream because DNA extraction is a *full-traversal* task (every Role, Resource, and Rule must surface), not a retrieval task; semantic search would systematically miss rarely-mentioned primitives. The right shape is an orchestrator that fetches each source through an `integration-*`, dispatches it to the correct `input-*` by MIME type, and merges the per-doc DNA chunks into one — with a typed merge utility in `dna-core` that produces explicit conflicts (each carrying a recommendation) instead of silently last-writer-wins'ing fields.

## What Changes

- **NEW** `@dna-codes/dna-ingest` package (folder `packages/ingest`): orchestrator with a single `ingest()` entry point. Probabilistic (depends on injected LLM-backed `input-*` adapters).
- **NEW** `Integration` interface published from `dna-ingest`: `fetch(uri) → { contents, mimeType, source }`. Becomes the contract every reader-side `integration-*` implements to participate in ingest. PDF/Office text extraction is the integration's job, not the orchestrator's.
- **NEW** Two-stage dispatch in `dna-ingest`: URI scheme → integration; MIME type → `input-*` adapter. Both maps injected by the caller — orchestrator imports zero `integration-*` or `input-*` packages.
- **NEW** Built-in `file://` and bare-path fetcher inside `dna-ingest` (uses Node `fs`); no integration needed for local files.
- **NEW** `merge()` exported from `@dna-codes/dna-core`: pure, deterministic, no I/O. Takes `OperationalDNA[]`, returns `{ dna, conflicts[] }`. Identity by `name` within type; unions `attributes[]`/`actions[]`; resolves cross-references against the merged noun set; surfaces unresolved refs as warnings rather than dropping silently.
- **NEW** `Conflict` type with `recommendation: { value, reason }` per entry, alongside the competing values and their sources.
- **NEW** `@dna-codes/dna-integration-google-drive` stub package (folder `packages/integration-google-drive`): implements `Integration`, returns from an in-memory mock map, throws a clear "not implemented" for real Drive fetches. Validates the contract end-to-end. Real Drive auth + API ships in a separate change.
- **NEW** Provenance tracking: per-doc chunks tagged with `{ uri, loadedAt }`; merge carries provenance through so conflicts cite specific docs.
- **NEW** Determinism contract: explicit `model`, `temperature`, `seed` in `ingest()` LLM options; non-determinism documented honestly per the existing probabilistic-package convention.
- **NEW** Non-fatal error handling: fetch/parse failures collected in `errors[]` alongside the (partial) DNA result.
- README updated: pipeline diagram extended to show fan-in; `dna-ingest` added to Packages; `dna-integration-google-drive` added to Integrations table marked as stub.

**Out of scope** (deferred to follow-up changes): real Google Drive API + OAuth, Product/Technical layer extraction, vector/RAG retrieval, a `dna-cli ingest` command, caching of fetched contents or extracted DNA chunks.

## Capabilities

### New Capabilities
- `dna-ingest`: orchestration of multi-source DNA extraction — URI dispatch to integrations, MIME dispatch to input adapters, fan-in via merge, error/conflict/provenance reporting. Defines the `Integration` contract.
- `dna-merge`: pure merge of multiple Operational DNA documents into one, with typed `Conflict` reporting (each conflict includes a `recommendation`) and cross-reference resolution against the merged noun set. Lives in `@dna-codes/dna-core`.
- `integration-google-drive`: stub package contract — implements `Integration`, serves an in-memory mock, throws on real fetches with a clear migration message. Exists to validate the contract and unblock downstream consumers.

### Modified Capabilities
<!-- None. The merge utility is a new capability rather than a modification to an existing one because no current capability covers DNA-document composition. -->

## Impact

- **New packages**: `packages/ingest` (`@dna-codes/dna-ingest`), `packages/integration-google-drive` (`@dna-codes/dna-integration-google-drive`). Both published to GitHub Packages under the existing `@dna-codes` scope and tag-driven release flow.
- **`@dna-codes/dna-core`**: gains exported `merge()` function and supporting `Conflict`/`Provenance` types. Backwards-compatible — pure addition. Minor version bump.
- **`@dna-codes/dna-schemas`**: no schema changes (merge produces standard Operational DNA validated by existing schemas).
- **Existing `input-*` packages** (`input-text`, `input-json`, `input-openapi`): no source changes; verified to satisfy the `InputAdapter` shape `dna-ingest` expects (single doc → DNA). May need a thin type-level adapter declaration if signatures don't already match.
- **Existing `integration-*` packages** (`integration-jira`, `integration-example`): no required changes for this proposal. They may opt into the new `Integration` contract in a later change to participate in `dna-ingest`.
- **Dev/CI**: new package builds, publish workflow already covers `--workspaces`, no workflow changes needed.
- **README**: pipeline diagram + Packages section + Integrations table updated.
